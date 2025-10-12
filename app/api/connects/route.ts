import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const purchaseSchema = z.object({
  amount: z.number().min(10).max(100),
})

// POST /api/connects - Purchase connects
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = purchaseSchema.parse(body)

    // Calculate expiration (1 year from now)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Create connect purchase
    const connect = await prisma.connect.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        amount: validatedData.amount,
        type: 'PURCHASED',
        purchasedAt: new Date(),
        expiresAt,
      },
    })

    return NextResponse.json({
      message: `Successfully purchased ${validatedData.amount} connects`,
      connect,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error purchasing connects:', error)
    return NextResponse.json(
      { error: 'Failed to purchase connects' },
      { status: 500 }
    )
  }
}

// GET /api/connects - Get user's connect balance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all unused connects
    const connects = await prisma.connect.findMany({
      where: {
        userId: session.user.id,
        usedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate total available
    const totalAvailable = connects.reduce(
      (sum, connect) => sum + connect.amount,
      0
    )

    // Get used connects
    const usedConnects = await prisma.connect.findMany({
      where: {
        userId: session.user.id,
        usedAt: { not: null },
      },
      orderBy: { usedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      totalAvailable,
      connects,
      recentlyUsed: usedConnects,
    })
  } catch (error) {
    console.error('Error fetching connects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connects' },
      { status: 500 }
    )
  }
}
