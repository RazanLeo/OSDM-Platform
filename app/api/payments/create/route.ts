import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { moyasarService } from '@/lib/payment/moyasar'
import { paytabsService } from '@/lib/payment/paytabs'
import { paypalService } from '@/lib/payment/paypal'

const createPaymentSchema = z.object({
  orderId: z.string().cuid(),
  paymentMethod: z.enum(['moyasar', 'paytabs', 'paypal']),
  paymentType: z.enum(['creditcard', 'mada', 'applepay', 'stcpay']).optional(),
  returnUrl: z.string().url().optional(),
})

// POST - إنشاء دفعة جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // جلب الطلب
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        buyer: true,
        seller: true,
        product: true,
        service: true,
        project: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من أن المستخدم هو المشتري
    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية للدفع لهذا الطلب' },
        { status: 403 }
      )
    }

    // التحقق من عدم وجود دفعة ناجحة سابقاً
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        orderId: order.id,
        status: 'COMPLETED',
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'تم الدفع لهذا الطلب بالفعل' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const returnUrl = validatedData.returnUrl || `${baseUrl}/ar/orders/${order.id}`
    const callbackUrl = `${baseUrl}/api/payments/callback`

    let paymentResponse: any
    let paymentGateway: string = validatedData.paymentMethod

    // إنشاء الدفعة حسب البوابة المختارة
    if (validatedData.paymentMethod === 'moyasar') {
      // Moyasar
      paymentResponse = await moyasarService.createPayment({
        amount: Math.round(order.amount * 100), // تحويل إلى هللة
        currency: 'SAR',
        description: `${order.orderType} - Order #${order.id}`,
        callback_url: callbackUrl,
        source: {
          type: validatedData.paymentType || 'creditcard',
        },
        metadata: {
          orderId: order.id,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
      })
    } else if (validatedData.paymentMethod === 'paytabs') {
      // PayTabs
      paymentResponse = await paytabsService.createPaymentPage({
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: order.id,
        cart_currency: 'SAR',
        cart_amount: order.amount,
        cart_description: `${order.orderType} - Order #${order.id}`,
        paypage_lang: 'ar',
        customer_details: {
          name: order.buyer.fullName,
          email: order.buyer.email || '',
          phone: order.buyer.phone || '',
          country: 'SA',
        },
        return_url: returnUrl,
        callback: callbackUrl,
        hide_shipping: true,
        user_defined: {
          orderId: order.id,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
      })
    } else if (validatedData.paymentMethod === 'paypal') {
      // PayPal
      paymentResponse = await paypalService.createOrder({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.id,
            amount: {
              currency_code: 'USD', // PayPal يفضل USD
              value: (order.amount / 3.75).toFixed(2), // تحويل تقريبي من SAR إلى USD
            },
            description: `${order.orderType} - Order #${order.id}`,
            custom_id: order.id,
          },
        ],
        application_context: {
          brand_name: 'OSDM Platform',
          locale: 'ar-SA',
          return_url: returnUrl,
          cancel_url: `${baseUrl}/ar/orders/${order.id}?status=cancelled`,
        },
      })
    }

    // إنشاء سجل المعاملة
    const transaction = await prisma.transaction.create({
      data: {
        orderId: order.id,
        buyerId: order.buyerId,
        amount: order.amount,
        currency: 'SAR',
        paymentGateway,
        gatewayTransactionId:
          paymentResponse.id || paymentResponse.tran_ref || paymentResponse.payment_id,
        status: 'PENDING',
        metadata: paymentResponse,
      },
    })

    // تحديث حالة الطلب
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
    })

    // استخراج رابط الدفع
    let paymentUrl: string | undefined

    if (validatedData.paymentMethod === 'moyasar') {
      // Moyasar يحتاج إلى رابط خاص
      paymentUrl = `https://moyasar.com/invoice/${paymentResponse.id}`
    } else if (validatedData.paymentMethod === 'paytabs') {
      paymentUrl = paymentResponse.redirect_url
    } else if (validatedData.paymentMethod === 'paypal') {
      const approveLink = paymentResponse.links?.find((link: any) => link.rel === 'approve')
      paymentUrl = approveLink?.href
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الدفعة بنجاح',
      data: {
        transactionId: transaction.id,
        paymentUrl,
        paymentGateway,
        gatewayTransactionId: transaction.gatewayTransactionId,
      },
    })
  } catch (error: any) {
    console.error('Error creating payment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'فشل في إنشاء الدفعة',
      },
      { status: 500 }
    )
  }
}
