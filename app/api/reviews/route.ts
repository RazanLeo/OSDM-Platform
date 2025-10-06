import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema للتقييم
const createReviewSchema = z.object({
  orderId: z.string().cuid('معرف الطلب غير صحيح'),
  rating: z.number().min(1, 'التقييم يجب أن يكون 1 على الأقل').max(5, 'التقييم يجب أن يكون 5 كحد أقصى'),
  comment: z.string().min(10, 'التعليق يجب أن يكون 10 أحرف على الأقل'),
  communicationRating: z.number().min(1).max(5).optional(),
  serviceQualityRating: z.number().min(1).max(5).optional(),
  deliveryTimeRating: z.number().min(1).max(5).optional(),
})

// POST - إنشاء تقييم جديد
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
    const validatedData = createReviewSchema.parse(body)

    // التحقق من الطلب
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        product: true,
        service: true,
        project: true,
        review: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // يمكن فقط للمشتري تقييم الطلب
    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'يمكن فقط للمشتري تقييم الطلب' },
        { status: 403 }
      )
    }

    // يجب أن يكون الطلب مكتملاً
    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'يجب أن يكون الطلب مكتملاً لتقييمه' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود تقييم سابق
    if (order.review) {
      return NextResponse.json(
        { success: false, error: 'لقد قمت بتقييم هذا الطلب بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء التقييم
    const review = await prisma.review.create({
      data: {
        buyerId: session.user.id,
        sellerId: order.sellerId,
        orderId: validatedData.orderId,
        productId: order.productId || undefined,
        serviceId: order.serviceId || undefined,
        projectId: order.projectId || undefined,
        rating: validatedData.rating,
        comment: validatedData.comment,
        communicationRating: validatedData.communicationRating,
        serviceQualityRating: validatedData.serviceQualityRating,
        deliveryTimeRating: validatedData.deliveryTimeRating,
      },
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
    })

    // تحديث متوسط التقييم للبائع
    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: order.sellerId },
    })

    const averageRating =
      sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length

    await prisma.user.update({
      where: { id: order.sellerId },
      data: { rating: averageRating },
    })

    // تحديث التقييم في الملف الشخصي
    if (order.orderType === 'PRODUCT' || order.orderType === 'SERVICE') {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: order.sellerId },
      })

      if (sellerProfile) {
        await prisma.sellerProfile.update({
          where: { userId: order.sellerId },
          data: { rating: averageRating },
        })
      }
    } else if (order.orderType === 'PROJECT') {
      const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId: order.sellerId },
      })

      if (freelancerProfile) {
        await prisma.freelancerProfile.update({
          where: { userId: order.sellerId },
          data: { rating: averageRating },
        })
      }
    }

    // تحديث تقييم المنتج/الخدمة
    if (order.productId) {
      const productReviews = await prisma.review.findMany({
        where: { productId: order.productId },
      })
      const productAvgRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length

      await prisma.readyProduct.update({
        where: { id: order.productId },
        data: {
          rating: productAvgRating,
          reviewsCount: productReviews.length,
        },
      })
    } else if (order.serviceId) {
      const serviceReviews = await prisma.review.findMany({
        where: { serviceId: order.serviceId },
      })
      const serviceAvgRating =
        serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length

      await prisma.customService.update({
        where: { id: order.serviceId },
        data: {
          rating: serviceAvgRating,
          reviewsCount: serviceReviews.length,
        },
      })
    }

    // إنشاء إشعار للبائع
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'NEW_REVIEW',
        title: 'تقييم جديد',
        message: `تلقيت تقييماً جديداً (${validatedData.rating} نجوم)`,
        relatedId: review.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة التقييم بنجاح',
        data: review,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating review:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إضافة التقييم' },
      { status: 500 }
    )
  }
}

// GET - جلب التقييمات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const sellerId = searchParams.get('sellerId')
    const productId = searchParams.get('productId')
    const serviceId = searchParams.get('serviceId')
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    if (sellerId) where.sellerId = sellerId
    if (productId) where.productId = productId
    if (serviceId) where.serviceId = serviceId
    if (projectId) where.projectId = projectId

    const total = await prisma.review.count({ where })

    const reviews = await prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        sellerResponse: true,
      },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    // حساب توزيع التقييمات
    const ratingDistribution = {
      5: await prisma.review.count({ where: { ...where, rating: 5 } }),
      4: await prisma.review.count({ where: { ...where, rating: 4 } }),
      3: await prisma.review.count({ where: { ...where, rating: 3 } }),
      2: await prisma.review.count({ where: { ...where, rating: 2 } }),
      1: await prisma.review.count({ where: { ...where, rating: 1 } }),
    }

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: reviews,
      stats,
      ratingDistribution,
      averageRating,
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التقييمات' },
      { status: 500 }
    )
  }
}
