import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const responseSchema = z.object({
  reviewId: z.string(),
  response: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, response } = responseSchema.parse(body)

    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      include: { Product: true },
    })

    if (!review || review.Product.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 403 })
    }

    const existing = await prisma.reviewResponse.findUnique({
      where: { productReviewId: reviewId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Response already exists' }, { status: 400 })
    }

    const reviewResponse = await prisma.reviewResponse.create({
      data: {
        id: nanoid(),
        reviewId,
        productReviewId: reviewId,
        response,
      },
    })

    return NextResponse.json({ message: 'Response posted', reviewResponse })
  } catch (error) {
    console.error('Error posting review response:', error)
    return NextResponse.json({ error: 'Failed to post response' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId required' }, { status: 400 })
    }

    const response = await prisma.reviewResponse.findUnique({
      where: { productReviewId: reviewId },
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error fetching review response:', error)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}
