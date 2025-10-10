import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const processPaymentSchema = z.object({
  paymentId: z.string().cuid('معرف الدفع غير صحيح'),
  paymentMethod: z.enum([
    'MADA',
    'VISA',
    'MASTERCARD',
    'APPLE_PAY',
    'STC_PAY',
    'PAYTABS',
    'MOYASAR',
    'PAYPAL',
    'GOOGLE_PAY',
  ]),
  // Optional fields for card payments
  cardToken: z.string().optional(),
  // Optional fields for wallet payments
  walletPhone: z.string().optional(),
})

// ============================================
// POST - Process payment through selected gateway
// ============================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validation
    const validatedData = processPaymentSchema.parse(body)

    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id: validatedData.paymentId },
      include: {
        productOrder: {
          include: {
            product: {
              select: {
                titleAr: true,
                titleEn: true,
              },
            },
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        serviceOrder: {
          include: {
            service: {
              select: {
                titleAr: true,
                titleEn: true,
              },
            },
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        contract: {
          include: {
            project: {
              select: {
                titleAr: true,
                titleEn: true,
              },
            },
            client: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'سجل الدفع غير موجود' },
        { status: 404 }
      )
    }

    // Verify user is authorized to pay
    const buyerId =
      payment.productOrder?.buyer.id ||
      payment.serviceOrder?.buyer.id ||
      payment.contract?.client.id

    if (buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بإتمام هذه الدفعة' },
        { status: 403 }
      )
    }

    // Check payment status
    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'هذه الدفعة تم معالجتها بالفعل أو ملغاة' },
        { status: 400 }
      )
    }

    // Update payment method
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentMethod: validatedData.paymentMethod,
      },
    })

    // Get payment gateway configuration
    const gatewayConfig = getGatewayConfig(validatedData.paymentMethod)

    // Prepare payment data
    const paymentData = {
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      orderId: payment.id,
      customerName: payment.productOrder?.buyer.fullName ||
                    payment.serviceOrder?.buyer.fullName ||
                    payment.contract?.client.fullName || '',
      customerEmail: payment.productOrder?.buyer.email ||
                     payment.serviceOrder?.buyer.email ||
                     payment.contract?.client.email || '',
      description: getPaymentDescription(payment),
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    }

    // Process payment through gateway
    let gatewayResponse: any

    try {
      gatewayResponse = await processGatewayPayment(
        validatedData.paymentMethod,
        paymentData,
        gatewayConfig
      )
    } catch (error: any) {
      console.error('❌ Gateway payment error:', error)

      // Update payment status to FAILED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gatewayResponse: { error: error.message },
        },
      })

      return NextResponse.json(
        { success: false, error: 'فشل في معالجة الدفع عبر البوابة' },
        { status: 500 }
      )
    }

    // Update payment with gateway info
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayTransactionId: gatewayResponse.transactionId,
        gatewayResponse: gatewayResponse,
        status: 'PROCESSING',
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROCESS_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        details: {
          paymentMethod: validatedData.paymentMethod,
          amount: payment.amount.toString(),
          currency: payment.currency,
          transactionId: gatewayResponse.transactionId,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم بدء عملية الدفع بنجاح',
      data: {
        payment: {
          id: payment.id,
          status: 'PROCESSING',
          transactionId: gatewayResponse.transactionId,
        },
        gateway: {
          name: gatewayConfig.name,
          paymentUrl: gatewayResponse.paymentUrl,
          redirectUrl: gatewayResponse.redirectUrl,
        },
      },
    })
  } catch (error: any) {
    console.error('❌ Error processing payment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في معالجة الدفع' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get payment gateway configuration
 */
function getGatewayConfig(paymentMethod: string) {
  const configs: Record<string, any> = {
    MADA: {
      name: 'مدى',
      apiUrl: process.env.MADA_API_URL || 'https://api.mada.sa',
      apiKey: process.env.MADA_API_KEY,
      merchantId: process.env.MADA_MERCHANT_ID,
    },
    VISA: {
      name: 'Visa',
      apiUrl: process.env.PAYTABS_API_URL || 'https://secure.paytabs.sa',
      apiKey: process.env.PAYTABS_API_KEY,
      profileId: process.env.PAYTABS_PROFILE_ID,
    },
    MASTERCARD: {
      name: 'Mastercard',
      apiUrl: process.env.PAYTABS_API_URL || 'https://secure.paytabs.sa',
      apiKey: process.env.PAYTABS_API_KEY,
      profileId: process.env.PAYTABS_PROFILE_ID,
    },
    APPLE_PAY: {
      name: 'Apple Pay',
      apiUrl: process.env.APPLE_PAY_API_URL,
      merchantId: process.env.APPLE_PAY_MERCHANT_ID,
      certificate: process.env.APPLE_PAY_CERTIFICATE,
    },
    STC_PAY: {
      name: 'STC Pay',
      apiUrl: process.env.STC_PAY_API_URL || 'https://api.stcpay.com.sa',
      apiKey: process.env.STC_PAY_API_KEY,
      merchantId: process.env.STC_PAY_MERCHANT_ID,
    },
    PAYTABS: {
      name: 'PayTabs',
      apiUrl: process.env.PAYTABS_API_URL || 'https://secure.paytabs.sa',
      apiKey: process.env.PAYTABS_API_KEY,
      profileId: process.env.PAYTABS_PROFILE_ID,
    },
    MOYASAR: {
      name: 'Moyasar',
      apiUrl: process.env.MOYASAR_API_URL || 'https://api.moyasar.com',
      apiKey: process.env.MOYASAR_API_KEY,
    },
    PAYPAL: {
      name: 'PayPal',
      apiUrl: process.env.PAYPAL_API_URL || 'https://api-m.paypal.com',
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    GOOGLE_PAY: {
      name: 'Google Pay',
      apiUrl: process.env.GOOGLE_PAY_API_URL,
      merchantId: process.env.GOOGLE_PAY_MERCHANT_ID,
    },
  }

  return configs[paymentMethod] || configs.PAYTABS
}

/**
 * Get payment description based on order type
 */
function getPaymentDescription(payment: any): string {
  if (payment.productOrder) {
    return `شراء منتج: ${payment.productOrder.product.titleAr}`
  } else if (payment.serviceOrder) {
    return `طلب خدمة: ${payment.serviceOrder.service.titleAr}`
  } else if (payment.contract) {
    return `عقد مشروع: ${payment.contract.project.titleAr}`
  }
  return 'دفعة لمنصة OSDM'
}

/**
 * Process payment through payment gateway
 * This is a placeholder - actual implementation depends on each gateway's API
 */
async function processGatewayPayment(
  paymentMethod: string,
  paymentData: any,
  config: any
): Promise<any> {
  // ⚠️ IMPORTANT: This is a mock implementation
  // In production, integrate with actual payment gateway APIs

  // Example for PayTabs integration:
  if (paymentMethod === 'PAYTABS' || paymentMethod === 'VISA' || paymentMethod === 'MASTERCARD') {
    return processPayTabs(paymentData, config)
  }

  // Example for Moyasar integration:
  if (paymentMethod === 'MOYASAR') {
    return processMoyasar(paymentData, config)
  }

  // Mock response for development
  return {
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    paymentUrl: `https://payment-gateway.example.com/pay?ref=${paymentData.orderId}`,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback?payment_id=${paymentData.orderId}`,
    status: 'PROCESSING',
  }
}

/**
 * PayTabs integration
 */
async function processPayTabs(paymentData: any, config: any): Promise<any> {
  // Actual PayTabs API integration would go here
  const response = await fetch(`${config.apiUrl}/payment/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': config.apiKey,
    },
    body: JSON.stringify({
      profile_id: config.profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId,
      cart_description: paymentData.description,
      cart_currency: paymentData.currency,
      cart_amount: paymentData.amount,
      callback: paymentData.returnUrl,
      return: paymentData.returnUrl,
      customer_details: {
        name: paymentData.customerName,
        email: paymentData.customerEmail,
      },
    }),
  })

  const result = await response.json()

  return {
    transactionId: result.tran_ref,
    paymentUrl: result.redirect_url,
    redirectUrl: result.redirect_url,
    status: 'PROCESSING',
  }
}

/**
 * Moyasar integration
 */
async function processMoyasar(paymentData: any, config: any): Promise<any> {
  // Actual Moyasar API integration would go here
  const response = await fetch(`${config.apiUrl}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: Math.round(paymentData.amount * 100), // Convert to halalas
      currency: paymentData.currency,
      description: paymentData.description,
      callback_url: paymentData.returnUrl,
      source: {
        type: 'creditcard',
      },
      metadata: {
        order_id: paymentData.orderId,
      },
    }),
  })

  const result = await response.json()

  return {
    transactionId: result.id,
    paymentUrl: result.source.transaction_url,
    redirectUrl: result.source.transaction_url,
    status: 'PROCESSING',
  }
}
