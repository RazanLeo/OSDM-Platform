import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const buyerRequestSchema = z.object({
  titleAr: z.string().min(10),
  titleEn: z.string().min(10),
  descriptionAr: z.string().min(50),
  descriptionEn: z.string().min(50),
  categoryId: z.string(),
  budget: z.number().min(5),
  deadline: z.string().datetime(),
  skills: z.array(z.string()),
})

// POST /api/buyer-requests - Create buyer request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = buyerRequestSchema.parse(body)

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const buyerRequest = await prisma.buyerRequest.create({
      data: {
        id: nanoid(),
        buyerId: session.user.id,
        titleAr: validatedData.titleAr,
        titleEn: validatedData.titleEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        categoryId: validatedData.categoryId,
        budget: validatedData.budget,
        deadline: new Date(validatedData.deadline),
        skills: validatedData.skills,
        expiresAt,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Buyer request created successfully',
      buyerRequest,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating buyer request:', error)
    return NextResponse.json(
      { error: 'Failed to create buyer request' },
      { status: 500 }
    )
  }
}

// GET /api/buyer-requests - List buyer requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status') || 'OPEN'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      status,
      expiresAt: { gte: new Date() }, // Only active requests
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [requests, total] = await Promise.all([
      prisma.buyerRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          User: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              country: true,
            },
          },
        },
      }),
      prisma.buyerRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching buyer requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buyer requests' },
      { status: 500 }
    )
  }
}
