import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const packageSchema = z.object({
  name: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  price: z.number().min(0),
  deliveryDays: z.number().min(1),
  revisions: z.number().min(0),
  features: z.array(z.string()),
  description: z.string().optional(),
})

const updateServiceSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(20).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  serviceType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional(),
  requirements: z.string().optional(),
  packages: z.array(packageSchema).optional(),
  deliveryTime: z.enum(['ONE_DAY', 'THREE_DAYS', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'CUSTOM']).optional(),
  revisions: z.number().min(0).optional(),
  fastDelivery: z.boolean().optional(),
  commercialUse: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SUSPENDED']).optional(),
})

// GET - جلب خدمة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.customService.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            country: true,
            city: true,
            memberSince: true,
            sellerProfile: {
              select: {
                bio: true,
                verifiedBadge: true,
                rating: true,
                totalSales: true,
                totalEarnings: true,
                level: true,
                responseTime: true,
                responseRate: true,
                skills: true,
                languages: true,
              },
            },
          },
        },
        packages: {
          orderBy: { price: 'asc' },
        },
        reviews: {
          include: {
            buyer: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
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

    // زيادة عدد المشاهدات
    await prisma.customService.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    // حساب متوسط التقييم
    const avgRating =
      service.reviews.length > 0
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
          service.reviews.length
        : 0

    // السعر الأدنى
    const startingPrice =
      service.packages.length > 0
        ? Math.min(...service.packages.map((p) => p.price))
        : 0

    return NextResponse.json({
      success: true,
      data: {
        ...service,
        averageRating: avgRating,
        totalReviews: service._count.reviews,
        totalOrders: service._count.orders,
        startingPrice,
      },
    })
  } catch (error: any) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الخدمة' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث خدمة
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const existingService = await prisma.customService.findUnique({
      where: { id: params.id },
      include: { packages: true },
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (
      existingService.sellerId !== session.user.id &&
      user?.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لتعديل هذه الخدمة' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    // فصل الباقات
    const { packages, ...serviceData } = validatedData

    // تحديث الخدمة
    const updatedService = await prisma.customService.update({
      where: { id: params.id },
      data: serviceData,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        packages: true,
      },
    })

    // تحديث الباقات إذا تم إرسالها
    if (packages && packages.length > 0) {
      // حذف الباقات القديمة
      await prisma.servicePackage.deleteMany({
        where: { serviceId: params.id },
      })

      // إنشاء الباقات الجديدة
      await prisma.servicePackage.createMany({
        data: packages.map((pkg) => ({
          ...pkg,
          serviceId: params.id,
        })),
      })
    }

    await prisma.notification.create({
      data: {
        userId: existingService.sellerId,
        type: 'SERVICE_UPDATED',
        title: 'تم تحديث الخدمة',
        message: `تم تحديث الخدمة "${updatedService.title}" بنجاح`,
        relatedId: updatedService.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الخدمة بنجاح',
      data: updatedService,
    })
  } catch (error: any) {
    console.error('Error updating service:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الخدمة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف خدمة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const service = await prisma.customService.findUnique({
      where: { id: params.id },
      include: { orders: true },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (service.sellerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لحذف هذه الخدمة' },
        { status: 403 }
      )
    }

    // التحقق من الطلبات النشطة
    const activeOrders = service.orders.filter(
      (order) =>
        order.status === 'PENDING' ||
        order.status === 'PROCESSING' ||
        order.status === 'IN_PROGRESS'
    )

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف الخدمة لأنها تحتوي على طلبات نشطة',
        },
        { status: 400 }
      )
    }

    // حذف soft
    await prisma.customService.update({
      where: { id: params.id },
      data: {
        status: 'SUSPENDED',
        deletedAt: new Date(),
      },
    })

    await prisma.notification.create({
      data: {
        userId: service.sellerId,
        type: 'SERVICE_DELETED',
        title: 'تم حذف الخدمة',
        message: `تم حذف الخدمة "${service.title}"`,
        relatedId: service.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الخدمة بنجاح',
    })
  } catch (error: any) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الخدمة' },
      { status: 500 }
    )
  }
}
