import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// POST - Handle payment gateway webhook callbacks
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get gateway signature for verification
    const signature = request.headers.get('x-gateway-signature') ||
                     request.headers.get('x-paytabs-signature') ||
                     request.headers.get('x-moyasar-signature')

    // Verify webhook authenticity
    const isValid = await verifyWebhookSignature(body, signature)

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook data based on gateway
    const webhookData = parseWebhookData(body)

    if (!webhookData) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook data' },
        { status: 400 }
      )
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: webhookData.orderId },
          { gatewayTransactionId: webhookData.transactionId },
        ],
      },
      include: {
        productOrder: {
          include: {
            buyer: true,
            seller: true,
            product: true,
          },
        },
        serviceOrder: {
          include: {
            buyer: true,
            seller: true,
            service: true,
          },
        },
        contract: {
          include: {
            client: true,
            freelancer: true,
            project: true,
          },
        },
      },
    })

    if (!payment) {
      console.error('❌ Payment not found:', webhookData.orderId)
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Handle based on payment status
    if (webhookData.status === 'SUCCESS' || webhookData.status === 'COMPLETED') {
      await handleSuccessfulPayment(payment, webhookData)
    } else if (webhookData.status === 'FAILED') {
      await handleFailedPayment(payment, webhookData)
    } else if (webhookData.status === 'REFUNDED') {
      await handleRefundedPayment(payment, webhookData)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    })
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify webhook signature
 */
async function verifyWebhookSignature(
  body: any,
  signature: string | null
): Promise<boolean> {
  // In production, verify signature using gateway's secret key
  // This is a placeholder - implement based on each gateway's docs

  if (!signature) {
    // For development, allow webhooks without signature
    return process.env.NODE_ENV === 'development'
  }

  // Example for PayTabs:
  // const hash = crypto.createHmac('sha256', process.env.PAYTABS_SECRET!)
  //   .update(JSON.stringify(body))
  //   .digest('hex')
  // return hash === signature

  return true
}

/**
 * Parse webhook data from different gateways
 */
function parseWebhookData(body: any): any {
  // PayTabs format
  if (body.tran_ref) {
    return {
      transactionId: body.tran_ref,
      orderId: body.cart_id,
      status: body.payment_result?.response_status === 'A' ? 'SUCCESS' : 'FAILED',
      amount: body.cart_amount,
      currency: body.cart_currency,
      gatewayResponse: body,
    }
  }

  // Moyasar format
  if (body.id && body.status) {
    return {
      transactionId: body.id,
      orderId: body.metadata?.order_id,
      status: body.status === 'paid' ? 'SUCCESS' :
              body.status === 'failed' ? 'FAILED' :
              body.status === 'refunded' ? 'REFUNDED' : 'PENDING',
      amount: body.amount / 100, // Convert from halalas
      currency: body.currency,
      gatewayResponse: body,
    }
  }

  // Generic format
  return {
    transactionId: body.transaction_id || body.id,
    orderId: body.order_id || body.reference,
    status: body.status?.toUpperCase(),
    amount: body.amount,
    currency: body.currency || 'SAR',
    gatewayResponse: body,
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(payment: any, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // 1. Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        gatewayResponse: webhookData.gatewayResponse,
      },
    })

    // 2. Update order status based on market type
    if (payment.productOrder) {
      // Update ProductOrder
      await tx.productOrder.update({
        where: { id: payment.productOrder.id },
        data: { status: 'PAID' },
      })

      // Update Escrow to HELD
      await tx.escrow.updateMany({
        where: { productOrderId: payment.productOrder.id },
        data: {
          status: 'HELD',
          heldAt: new Date(),
        },
      })

      // Send notifications
      await tx.notification.createMany({
        data: [
          {
            userId: payment.productOrder.buyerId,
            type: 'PAYMENT',
            title: 'تم الدفع بنجاح',
            message: `تم إتمام الدفع لشراء "${payment.productOrder.product.titleAr}". يمكنك الآن تحميل المنتج.`,
            link: `/buyer/orders/${payment.productOrder.id}`,
            isRead: false,
          },
          {
            userId: payment.productOrder.sellerId,
            type: 'PAYMENT',
            title: 'تم استلام الدفع',
            message: `تم استلام الدفع لمنتجك "${payment.productOrder.product.titleAr}". المبلغ محفوظ في الضمان.`,
            link: `/seller/orders/${payment.productOrder.id}`,
            isRead: false,
          },
        ],
      })

      // Auto-complete digital product orders
      await tx.productOrder.update({
        where: { id: payment.productOrder.id },
        data: {
          status: 'COMPLETED',
          deliveredAt: new Date(),
          completedAt: new Date(),
        },
      })

      // Release escrow for digital products
      const escrow = await tx.escrow.findFirst({
        where: { productOrderId: payment.productOrder.id },
      })

      if (escrow) {
        await releaseEscrowToSeller(tx, escrow)
      }
    } else if (payment.serviceOrder) {
      // Update ServiceOrder
      await tx.serviceOrder.update({
        where: { id: payment.serviceOrder.id },
        data: { status: 'PAID' },
      })

      // Update Escrow to HELD
      await tx.escrow.updateMany({
        where: { serviceOrderId: payment.serviceOrder.id },
        data: {
          status: 'HELD',
          heldAt: new Date(),
        },
      })

      // Send notifications
      await tx.notification.createMany({
        data: [
          {
            userId: payment.serviceOrder.buyerId,
            type: 'PAYMENT',
            title: 'تم الدفع بنجاح',
            message: `تم إتمام الدفع لطلب الخدمة "${payment.serviceOrder.service.titleAr}". البائع سيبدأ العمل الآن.`,
            link: `/buyer/orders/${payment.serviceOrder.id}`,
            isRead: false,
          },
          {
            userId: payment.serviceOrder.sellerId,
            type: 'PAYMENT',
            title: 'تم استلام الدفع',
            message: `تم استلام الدفع لخدمتك "${payment.serviceOrder.service.titleAr}". يمكنك البدء في العمل.`,
            link: `/seller/orders/${payment.serviceOrder.id}`,
            isRead: false,
          },
        ],
      })

      // Update order status to IN_PROGRESS
      await tx.serviceOrder.update({
        where: { id: payment.serviceOrder.id },
        data: { status: 'IN_PROGRESS' },
      })
    } else if (payment.contract) {
      // Update Contract
      await tx.contract.update({
        where: { id: payment.contract.id },
        data: { status: 'IN_PROGRESS' },
      })

      // Update Escrow to HELD
      await tx.escrow.updateMany({
        where: { contractId: payment.contract.id },
        data: {
          status: 'HELD',
          heldAt: new Date(),
        },
      })

      // Send notifications
      await tx.notification.createMany({
        data: [
          {
            userId: payment.contract.clientId,
            type: 'PAYMENT',
            title: 'تم الدفع بنجاح',
            message: `تم إتمام الدفع للمشروع "${payment.contract.project.titleAr}". المستقل سيبدأ العمل الآن.`,
            link: `/contracts/${payment.contract.id}`,
            isRead: false,
          },
          {
            userId: payment.contract.freelancerId,
            type: 'PAYMENT',
            title: 'تم استلام الدفع',
            message: `تم استلام الدفع للمشروع "${payment.contract.project.titleAr}". يمكنك البدء في العمل.`,
            link: `/contracts/${payment.contract.id}`,
            isRead: false,
          },
        ],
      })
    }
  })
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(payment: any, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        gatewayResponse: webhookData.gatewayResponse,
      },
    })

    // Update order status
    if (payment.productOrder) {
      await tx.productOrder.update({
        where: { id: payment.productOrder.id },
        data: { status: 'CANCELLED' },
      })

      // Cancel escrow
      await tx.escrow.updateMany({
        where: { productOrderId: payment.productOrder.id },
        data: { status: 'CANCELLED' },
      })
    } else if (payment.serviceOrder) {
      await tx.serviceOrder.update({
        where: { id: payment.serviceOrder.id },
        data: { status: 'CANCELLED' },
      })

      await tx.escrow.updateMany({
        where: { serviceOrderId: payment.serviceOrder.id },
        data: { status: 'CANCELLED' },
      })
    } else if (payment.contract) {
      await tx.contract.update({
        where: { id: payment.contract.id },
        data: { status: 'CANCELLED' },
      })

      await tx.escrow.updateMany({
        where: { contractId: payment.contract.id },
        data: { status: 'CANCELLED' },
      })

      // Reopen project
      await tx.project.update({
        where: { id: payment.contract.projectId },
        data: { status: 'OPEN' },
      })
    }

    // Send notification
    const userId = payment.productOrder?.buyerId ||
                   payment.serviceOrder?.buyerId ||
                   payment.contract?.clientId

    if (userId) {
      await tx.notification.create({
        data: {
          userId,
          type: 'PAYMENT',
          title: 'فشل الدفع',
          message: 'لم تتم عملية الدفع. الرجاء المحاولة مرة أخرى.',
          link: `/checkout/${payment.id}`,
          isRead: false,
        },
      })
    }
  })
}

/**
 * Handle refunded payment
 */
async function handleRefundedPayment(payment: any, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        gatewayResponse: webhookData.gatewayResponse,
      },
    })

    // Update escrow
    const escrow = await tx.escrow.findFirst({
      where: {
        OR: [
          { productOrderId: payment.productOrder?.id },
          { serviceOrderId: payment.serviceOrder?.id },
          { contractId: payment.contract?.id },
        ],
      },
    })

    if (escrow) {
      await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
        },
      })
    }

    // Send notifications
    const buyerId = payment.productOrder?.buyerId ||
                    payment.serviceOrder?.buyerId ||
                    payment.contract?.clientId
    const sellerId = payment.productOrder?.sellerId ||
                     payment.serviceOrder?.sellerId ||
                     payment.contract?.freelancerId

    if (buyerId) {
      await tx.notification.create({
        data: {
          userId: buyerId,
          type: 'PAYMENT',
          title: 'تم استرداد المبلغ',
          message: 'تم استرداد المبلغ إلى حسابك بنجاح.',
          isRead: false,
        },
      })
    }

    if (sellerId) {
      await tx.notification.create({
        data: {
          userId: sellerId,
          type: 'PAYMENT',
          title: 'تم استرداد المبلغ',
          message: 'تم استرداد المبلغ للمشتري.',
          isRead: false,
        },
      })
    }
  })
}

/**
 * Release escrow to seller's wallet
 */
async function releaseEscrowToSeller(tx: any, escrow: any) {
  // Update escrow status
  await tx.escrow.update({
    where: { id: escrow.id },
    data: {
      status: 'RELEASED',
      releasedAt: new Date(),
    },
  })

  // Get or create seller's wallet
  let wallet = await tx.wallet.findUnique({
    where: { userId: escrow.sellerId },
  })

  if (!wallet) {
    wallet = await tx.wallet.create({
      data: {
        userId: escrow.sellerId,
        balance: new Decimal(0),
        currency: 'SAR',
      },
    })
  }

  // Add amount to wallet
  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: {
        increment: escrow.amount,
      },
      totalEarned: {
        increment: escrow.amount,
      },
    },
  })

  // Send notification
  await tx.notification.create({
    data: {
      userId: escrow.sellerId,
      type: 'WALLET',
      title: 'تم إضافة المبلغ لمحفظتك',
      message: `تم إضافة ${escrow.amount} ريال لمحفظتك. يمكنك سحبها الآن.`,
      link: '/wallet',
      isRead: false,
    },
  })
}
