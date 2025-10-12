import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const discountCodeSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(1),
  maxUses: z.number().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
})

// POST /api/discount-codes - Create discount code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = discountCodeSchema.parse(body)

    // Check if code already exists
    const existing = await prisma.discountCode.findUnique({
      where: { code: validatedData.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      )
    }

    // Validate percentage
    if (
      validatedData.discountType === 'PERCENTAGE' &&
      validatedData.discountValue > 100
    ) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      )
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        id: nanoid(),
        code: validatedData.code,
        sellerId: session.user.id,
        productId: validatedData.productId,
        serviceId: validatedData.serviceId,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        maxUses: validatedData.maxUses,
        expiresAt: validatedData.expiresAt
          ? new Date(validatedData.expiresAt)
          : null,
      },
    })

    return NextResponse.json({
      message: 'Discount code created successfully',
      discountCode,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating discount code:', error)
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    )
  }
}

// GET /api/discount-codes - List seller's discount codes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: any = { sellerId: session.user.id }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const discountCodes = await prisma.discountCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ discountCodes })
  } catch (error) {
    console.error('Error fetching discount codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    )
  }
}
