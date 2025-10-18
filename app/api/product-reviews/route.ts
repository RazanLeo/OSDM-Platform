import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const reviewSchema = z.object({
  orderId: z.string(),
  productId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    const order = await prisma.productOrder.findUnique({
      where: { id: validatedData.orderId },
      include: { Product: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only buyer can review' }, { status: 403 })
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Order must be completed' }, { status: 400 })
    }

    const existingReview = await prisma.productReview.findUnique({
      where: { orderId: validatedData.orderId },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.productReview.create({
        data: {
          id: nanoid(),
          productId: order.productId,
          reviewerId: session.user.id,
          sellerId: order.sellerId,
          orderId: validatedData.orderId,
          rating: validatedData.rating,
          comment: validatedData.comment,
          updatedAt: new Date(),
        },
        include: {
          User_ProductReview_reviewerIdToUser: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
        },
      })

      const allReviews = await tx.productReview.findMany({
        where: { productId: order.productId },
      })
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await tx.product.update({
        where: { id: order.productId },
        data: {
          averageRating: avgRating,
          reviewCount: allReviews.length,
        },
      })

      await tx.notification.create({
        data: {
          id: nanoid(),
          userId: order.sellerId,
          type: 'SYSTEM',
          titleAr: 'تقييم جديد',
          titleEn: 'New Review',
          messageAr: `تلقيت تقييماً جديداً (${validatedData.rating} نجوم)`,
          messageEn: `You received a new review (${validatedData.rating} stars)`,
          link: `/dashboard/seller/products/${order.productId}`,
        },
      })

      return newReview
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const sellerId = searchParams.get('sellerId')

    const where: any = {}
    if (productId) where.productId = productId
    if (sellerId) where.sellerId = sellerId

    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        User_ProductReview_reviewerIdToUser: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: { averageRating, ratingDistribution, total: reviews.length },
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
