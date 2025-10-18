import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId } = await params
    const body = await request.json()
    const { response } = body

    if (!response || response.length < 5) {
      return NextResponse.json({ error: 'Response must be at least 5 characters' }, { status: 400 })
    }

    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Only seller can respond' }, { status: 403 })
    }

    const updated = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        sellerResponse: response,
        respondedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Error responding to review:', error)
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 })
  }
}
