import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { moyasarService } from '@/lib/payment/moyasar'
import { paytabsService } from '@/lib/payment/paytabs'
import { paypalService } from '@/lib/payment/paypal'

// POST - Callback من بوابات الدفع
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Payment callback received:', body)

    let transactionId: string | undefined
    let gatewayTransactionId: string | undefined
    let status: 'COMPLETED' | 'FAILED' = 'FAILED'
    let paymentGateway: string | undefined

    // تحديد البوابة والحالة
    if (body.id && body.status) {
      // Moyasar
      paymentGateway = 'moyasar'
      gatewayTransactionId = body.id
      status = body.status === 'paid' ? 'COMPLETED' : 'FAILED'

      // التحقق من الدفعة
      const moyasarPayment = await moyasarService.getPayment(body.id)
      if (moyasarPayment.status !== 'paid') {
        status = 'FAILED'
      }

      transactionId = body.metadata?.orderId
    } else if (body.tran_ref) {
      // PayTabs
      paymentGateway = 'paytabs'
      gatewayTransactionId = body.tran_ref
      status = body.payment_result?.response_status === 'A' ? 'COMPLETED' : 'FAILED'

      // التحقق من الدفعة
      const paytabsPayment = await paytabsService.verifyPayment(body.tran_ref)
      if (paytabsPayment.payment_result?.response_status !== 'A') {
        status = 'FAILED'
      }

      transactionId = body.cart_id
    } else if (body.resource?.id) {
      // PayPal
      paymentGateway = 'paypal'
      gatewayTransactionId = body.resource.id
      status = body.resource.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED'

      transactionId = body.resource?.purchase_units?.[0]?.reference_id
    }

    if (!transactionId || !gatewayTransactionId) {
      console.error('Invalid callback data:', body)
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }

    // البحث عن المعاملة في قاعدة البيانات
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: transactionId },
          { gatewayTransactionId },
          { orderId: transactionId }, // في حالة PayTabs يرسل cart_id
        ],
      },
      include: {
        order: {
          include: {
            buyer: true,
            seller: true,
          },
        },
      },
    })

    if (!transaction) {
      console.error('Transaction not found:', transactionId, gatewayTransactionId)
      return NextResponse.json(
        { success: false, error: 'المعاملة غير موجودة' },
        { status: 404 }
      )
    }

    // تحديث المعاملة
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        failedReason: status === 'FAILED' ? 'Payment failed' : undefined,
        metadata: body,
      },
    })

    if (status === 'COMPLETED') {
      // تحديث الطلب
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'IN_PROGRESS',
          paidAt: new Date(),
        },
      })

      // إنشاء إشعار للمشتري
      await prisma.notification.create({
        data: {
          userId: transaction.order.buyerId,
          type: 'PAYMENT_SUCCESS',
          title: 'تم الدفع بنجاح',
          message: `تم الدفع بنجاح لطلبك بمبلغ ${transaction.amount} ريال`,
          relatedId: transaction.orderId,
        },
      })

      // إنشاع إشعار للبائع
      await prisma.notification.create({
        data: {
          userId: transaction.order.sellerId,
          type: 'NEW_ORDER',
          title: 'طلب جديد',
          message: `لديك طلب جديد مدفوع بقيمة ${transaction.order.sellerAmount} ريال`,
          relatedId: transaction.orderId,
        },
      })
    } else {
      // تحديث الطلب - فشل الدفع
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'CANCELLED',
        },
      })

      // إنشاع إشعار للمشتري
      await prisma.notification.create({
        data: {
          userId: transaction.order.buyerId,
          type: 'PAYMENT_FAILED',
          title: 'فشل الدفع',
          message: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى',
          relatedId: transaction.orderId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: status === 'COMPLETED' ? 'Payment successful' : 'Payment failed',
      status,
    })
  } catch (error: any) {
    console.error('Error processing payment callback:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في معالجة الدفع' },
      { status: 500 }
    )
  }
}

// GET - للتحقق من حالة الدفعة يدوياً
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const gatewayId = searchParams.get('gatewayId')

    if (!transactionId && !gatewayId) {
      return NextResponse.json(
        { success: false, error: 'معرف المعاملة مطلوب' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          transactionId ? { id: transactionId } : {},
          gatewayId ? { gatewayTransactionId: gatewayId } : {},
        ],
      },
      include: {
        order: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'المعاملة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error: any) {
    console.error('Error checking transaction:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في التحقق من المعاملة' },
      { status: 500 }
    )
  }
}
