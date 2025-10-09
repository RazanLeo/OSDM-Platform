import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const orderServiceSchema = z.object({
  packageType: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  requirements: z.string().min(10, 'الرجاء كتابة متطلبات الخدمة (10 أحرف على الأقل)'),
  attachments: z.array(z.string().url()).optional().default([]),
})

// ============================================
// POST - Order a service (create ServiceOrder)
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

    const serviceId = params.id
    const body = await request.json()

    // Validation
    const validatedData = orderServiceSchema.parse(body)

    // Fetch service with seller and packages
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        packages: {
          where: {
            type: validatedData.packageType,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }

    // Check service status
    if (service.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'هذه الخدمة غير متاحة للطلب حالياً' },
        { status: 400 }
      )
    }

    // Check if user is trying to order their own service
    if (service.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك طلب خدمتك الخاصة' },
        { status: 400 }
      )
    }

    // Check if package exists
    if (service.packages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الباقة المحددة غير موجودة' },
        { status: 404 }
      )
    }

    const selectedPackage = service.packages[0]

    // Check if user already has an active order for this service
    const existingOrder = await prisma.serviceOrder.findFirst({
      where: {
        serviceId,
        buyerId: session.user.id,
        status: {
          in: ['PENDING', 'PAID', 'IN_PROGRESS'],
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'لديك طلب نشط لهذه الخدمة بالفعل',
          orderId: existingOrder.id,
        },
        { status: 400 }
      )
    }

    // Get revenue settings for commission calculation
    const revenueSettings = await prisma.revenueSettings.findFirst()

    const platformCommission = revenueSettings?.platformCommission || new Decimal(25)
    const paymentGatewayFee = revenueSettings?.paymentGatewayFee || new Decimal(5)

    // Calculate amounts
    const packagePrice = selectedPackage.price
    const platformFeeAmount = packagePrice.mul(platformCommission).div(100)
    const paymentFeeAmount = packagePrice.mul(paymentGatewayFee).div(100)
    const sellerEarning = packagePrice.sub(platformFeeAmount).sub(paymentFeeAmount)

    // Generate unique order number
    const orderNumber = await generateOrderNumber()

    // Calculate deadline
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + selectedPackage.deliveryDays)

    // Create order
    const order = await prisma.serviceOrder.create({
      data: {
        orderNumber,
        buyerId: session.user.id,
        sellerId: service.sellerId,
        serviceId: service.id,
        packageType: validatedData.packageType,
        packagePrice,
        deliveryDays: selectedPackage.deliveryDays,
        revisions: selectedPackage.revisions,
        requirements: validatedData.requirements,
        attachments: validatedData.attachments,
        platformFee: platformFeeAmount,
        paymentFee: paymentFeeAmount,
        totalAmount: packagePrice,
        sellerEarning,
        status: 'PENDING', // سيتحول إلى PAID بعد الدفع
        deadline,
      },
      include: {
        service: {
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
        amount: packagePrice,
        currency: 'SAR',
        paymentMethod: 'MADA', // سيتم تحديثه بعد اختيار البوابة
        status: 'PENDING',
        marketType: 'SERVICES',
        serviceOrderId: order.id,
      },
    })

    // Create escrow to hold funds
    const escrow = await prisma.escrow.create({
      data: {
        amount: sellerEarning,
        buyerId: session.user.id,
        sellerId: service.sellerId,
        status: 'PENDING',
        marketType: 'SERVICES',
        serviceOrderId: order.id,
      },
    })

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: session.user.id,
          type: 'ORDER',
          title: 'طلب خدمة جديد',
          message: `تم إنشاء طلب للخدمة "${service.titleAr}". الرجاء إتمام عملية الدفع.`,
          link: `/buyer/orders/${order.id}`,
          isRead: false,
        },
        {
          userId: service.sellerId,
          type: 'ORDER',
          title: 'طلب خدمة جديد',
          message: `لديك طلب جديد للخدمة "${service.titleAr}" من ${order.buyer.fullName}`,
          link: `/seller/orders/${order.id}`,
          isRead: false,
        },
      ],
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SERVICE_ORDER',
        entityType: 'ServiceOrder',
        entityId: order.id,
        details: {
          service: service.titleEn,
          package: validatedData.packageType,
          amount: packagePrice.toString(),
          seller: service.seller.username,
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
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            status: order.status,
            packageType: order.packageType,
            deliveryDays: order.deliveryDays,
            revisions: order.revisions,
            deadline: order.deadline,
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
    console.error('❌ Error creating service order:', error)

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
      { success: false, error: 'فشل في إنشاء الطلب' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique order number
 * Format: SERV-YYYY-XXXXXX (e.g., SERV-2025-000123)
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `SERV-${year}-`

  // Get last order number for this year
  const lastOrder = await prisma.serviceOrder.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  let nextNumber = 1
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2])
    nextNumber = lastNumber + 1
  }

  // Pad with zeros (6 digits)
  const paddedNumber = nextNumber.toString().padStart(6, '0')
  return `${prefix}${paddedNumber}`
}
