import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST /api/subscriptions/products/[id]/cancel - Cancel subscription
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get subscription
    const subscription = await prisma.subscription_Product.findUnique({
      where: { id },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (subscription.subscriberId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cancel subscription at period end
    const updatedSubscription = await prisma.subscription_Product.update({
      where: { id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Subscription will be canceled at the end of billing period',
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
