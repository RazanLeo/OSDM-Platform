import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// ============================================
// GET - Get payment status
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const paymentId = params.id

    // Fetch payment with related order
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        productOrder: {
          include: {
            buyer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            product: {
              select: {
                titleAr: true,
                titleEn: true,
                thumbnail: true,
              },
            },
          },
        },
        serviceOrder: {
          include: {
            buyer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            service: {
              select: {
                titleAr: true,
                titleEn: true,
                thumbnail: true,
              },
            },
          },
        },
        contract: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
              },
            },
            project: {
              select: {
                titleAr: true,
                titleEn: true,
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

    // Verify user is authorized
    const buyerId =
      payment.productOrder?.buyer.id ||
      payment.serviceOrder?.buyer.id ||
      payment.contract?.client.id

    if (buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بعرض هذا الدفع' },
        { status: 403 }
      )
    }

    // Format response
    const response: any = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      gatewayTransactionId: payment.gatewayTransactionId,
    }

    // Add order details based on market type
    if (payment.productOrder) {
      response.orderType = 'product'
      response.order = {
        id: payment.productOrder.id,
        status: payment.productOrder.status,
        product: payment.productOrder.product,
      }
    } else if (payment.serviceOrder) {
      response.orderType = 'service'
      response.order = {
        id: payment.serviceOrder.id,
        orderNumber: payment.serviceOrder.orderNumber,
        status: payment.serviceOrder.status,
        service: payment.serviceOrder.service,
      }
    } else if (payment.contract) {
      response.orderType = 'project'
      response.order = {
        id: payment.contract.id,
        contractNumber: payment.contract.contractNumber,
        status: payment.contract.status,
        project: payment.contract.project,
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error: any) {
    console.error('❌ Error fetching payment status:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب حالة الدفع' },
      { status: 500 }
    )
  }
}
