import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// POST - Purchase a product
// ============================================
export async function POST(
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

    const productId = params.id

    // Fetch product with seller and revenue settings
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // Check product status
    if (product.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'هذا المنتج غير متاح للشراء حالياً' },
        { status: 400 }
      )
    }

    // Check if user is trying to buy their own product
    if (product.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك شراء منتجك الخاص' },
        { status: 400 }
      )
    }

    // Check if user already purchased this product
    const existingPurchase = await prisma.productOrder.findFirst({
      where: {
        productId,
        buyerId: session.user.id,
        status: {
          in: ['PENDING', 'PAID', 'COMPLETED'],
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        {
          success: false,
          error: 'لقد قمت بشراء هذا المنتج مسبقاً',
          orderId: existingPurchase.id,
        },
        { status: 400 }
      )
    }

    // Get revenue settings for commission calculation
    const revenueSettings = await prisma.revenueSettings.findFirst()

    const platformCommission = revenueSettings?.platformCommission || new Decimal(25)
    const paymentGatewayFee = revenueSettings?.paymentGatewayFee || new Decimal(5)

    // Calculate amounts
    const productPrice = product.price
    const commissionAmount = productPrice.mul(platformCommission).div(100)
    const gatewayFeeAmount = productPrice.mul(paymentGatewayFee).div(100)
    const sellerAmount = productPrice.sub(commissionAmount).sub(gatewayFeeAmount)

    // Create order
    const order = await prisma.productOrder.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.sellerId,
        productId: product.id,
        amount: productPrice,
        commissionAmount,
        sellerAmount,
        status: 'PENDING', // سيتحول إلى PAID بعد الدفع
      },
      include: {
        product: {
          select: {
            titleAr: true,
            titleEn: true,
            thumbnail: true,
          },
        },
        buyer: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: productPrice,
        currency: 'SAR',
        paymentMethod: 'MADA', // سيتم تحديثه بعد اختيار البوابة
        status: 'PENDING',
        marketType: 'PRODUCTS',
      },
    })

    // Create escrow to hold funds
    const escrow = await prisma.escrow.create({
      data: {
        amount: sellerAmount,
        buyerId: session.user.id,
        sellerId: product.sellerId,
        status: 'PENDING',
        marketType: 'PRODUCTS',
        productOrderId: order.id,
      },
    })

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: session.user.id,
          type: 'ORDER',
          title: 'طلب شراء جديد',
          message: `تم إنشاء طلب شراء للمنتج "${product.titleAr}". الرجاء إتمام عملية الدفع.`,
          link: `/buyer/orders/${order.id}`,
          isRead: false,
        },
        {
          userId: product.sellerId,
          type: 'ORDER',
          title: 'طلب شراء جديد',
          message: `لديك طلب شراء جديد للمنتج "${product.titleAr}" من ${order.buyer.fullName}`,
          link: `/seller/orders/${order.id}`,
          isRead: false,
        },
      ],
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PRODUCT_ORDER',
        entityType: 'ProductOrder',
        entityId: order.id,
        details: {
          product: product.titleEn,
          amount: productPrice.toString(),
          seller: product.seller.username,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الطلب بنجاح. الرجاء إتمام عملية الدفع.',
        data: {
          order: {
            id: order.id,
            amount: order.amount,
            status: order.status,
            createdAt: order.createdAt,
          },
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
          },
          escrow: {
            id: escrow.id,
            status: escrow.status,
          },
          // Payment URL will be added here after payment gateway integration
          paymentUrl: `/checkout/${payment.id}`,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating product order:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الطلب' },
      { status: 500 }
    )
  }
}
