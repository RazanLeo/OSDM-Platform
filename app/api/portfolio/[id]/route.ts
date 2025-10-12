import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const portfolioUpdateSchema = z.object({
  titleAr: z.string().min(5).optional(),
  titleEn: z.string().min(5).optional(),
  descriptionAr: z.string().min(20).optional(),
  descriptionEn: z.string().min(20).optional(),
  images: z.array(z.string()).min(1).optional(),
  attachments: z.array(z.string()).optional(),
  link: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  completionDate: z.string().datetime().optional(),
  clientName: z.string().optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/portfolio/[id] - Get single portfolio item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            bio: true,
            skills: true,
          },
        },
      },
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.portfolio.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio item' },
      { status: 500 }
    )
  }
}

// PUT /api/portfolio/[id] - Update portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = portfolioUpdateSchema.parse(body)

    // Check ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update portfolio
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.completionDate && {
          completionDate: new Date(validatedData.completionDate),
        }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Portfolio item updated successfully',
      portfolio,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    )
  }
}

// DELETE /api/portfolio/[id] - Delete portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete portfolio
    await prisma.portfolio.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Portfolio item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    )
  }
}
