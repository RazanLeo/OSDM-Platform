import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const subscriptionSchema = z.object({
  productId: z.string(),
  plan: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  amount: z.number().min(5),
})

// POST /api/subscriptions/products - Subscribe to a product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = subscriptionSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already subscribed
    const existing = await prisma.subscription_Product.findFirst({
      where: {
        productId: validatedData.productId,
        subscriberId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed to this product' },
        { status: 400 }
      )
    }

    // Calculate billing cycle dates
    const now = new Date()
    const currentPeriodEnd = new Date(now)

    switch (validatedData.plan) {
      case 'MONTHLY':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
        break
      case 'QUARTERLY':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3)
        break
      case 'YEARLY':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
        break
    }

    // Create subscription
    const subscription = await prisma.subscription_Product.create({
      data: {
        id: nanoid(),
        productId: validatedData.productId,
        subscriberId: session.user.id,
        plan: validatedData.plan,
        amount: validatedData.amount,
        billingCycle: validatedData.plan,
        currentPeriodStart: now,
        currentPeriodEnd,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Subscribed successfully',
      subscription,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// GET /api/subscriptions/products - List user subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ACTIVE'

    const subscriptions = await prisma.subscription_Product.findMany({
      where: {
        subscriberId: session.user.id,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
