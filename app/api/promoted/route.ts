import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const promotedSchema = z.object({
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  projectId: z.string().optional(),
  budget: z.number().min(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => data.productId || data.serviceId || data.projectId,
  {
    message: 'At least one of productId, serviceId, or projectId is required',
  }
)

// POST /api/promoted - Create promoted listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = promotedSchema.parse(body)

    // Verify ownership of the item being promoted
    if (validatedData.productId) {
      const product = await prisma.product.findUnique({
        where: { id: validatedData.productId },
      })
      if (!product || product.sellerId !== session.user.id) {
        return NextResponse.json({ error: 'Product not found or forbidden' }, { status: 403 })
      }
    }

    if (validatedData.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId },
      })
      if (!service || service.sellerId !== session.user.id) {
        return NextResponse.json({ error: 'Service not found or forbidden' }, { status: 403 })
      }
    }

    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      })
      if (!project || project.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 403 })
      }
    }

    // Create promoted listing
    const promoted = await prisma.promotedListing.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        productId: validatedData.productId,
        serviceId: validatedData.serviceId,
        projectId: validatedData.projectId,
        budget: validatedData.budget,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Promoted listing created successfully',
      promoted,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating promoted listing:', error)
    return NextResponse.json(
      { error: 'Failed to create promoted listing' },
      { status: 500 }
    )
  }
}

// GET /api/promoted - List user's promoted listings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: any = { userId: session.user.id }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const promotedListings = await prisma.promotedListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promotedListings })
  } catch (error) {
    console.error('Error fetching promoted listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promoted listings' },
      { status: 500 }
    )
  }
}
