import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const portfolioSchema = z.object({
  titleAr: z.string().min(5),
  titleEn: z.string().min(5),
  descriptionAr: z.string().min(20),
  descriptionEn: z.string().min(20),
  images: z.array(z.string()).min(1),
  attachments: z.array(z.string()).optional(),
  link: z.string().url().optional(),
  skills: z.array(z.string()),
  completionDate: z.string().datetime().optional(),
  clientName: z.string().optional(),
  isPublished: z.boolean().optional(),
})

// POST /api/portfolio - Create portfolio item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = portfolioSchema.parse(body)

    const portfolio = await prisma.portfolio.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        titleAr: validatedData.titleAr,
        titleEn: validatedData.titleEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        images: validatedData.images,
        attachments: validatedData.attachments || [],
        link: validatedData.link,
        skills: validatedData.skills,
        completionDate: validatedData.completionDate
          ? new Date(validatedData.completionDate)
          : null,
        clientName: validatedData.clientName,
        isPublished: validatedData.isPublished ?? true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Portfolio item created successfully',
      portfolio,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    )
  }
}

// GET /api/portfolio - List portfolio items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const session = await getServerSession(authOptions)

    if (!userId && !session?.user) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const targetUserId = userId || session?.user?.id

    // If viewing own portfolio, show all. Otherwise, only published
    const isOwnPortfolio = session?.user?.id === targetUserId

    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: targetUserId,
        ...(isOwnPortfolio ? {} : { isPublished: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ portfolios })
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    )
  }
}
