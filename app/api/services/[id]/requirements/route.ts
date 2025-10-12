import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const requirementSchema = z.object({
  questionAr: z.string().min(5),
  questionEn: z.string().min(5),
  type: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'FILE']),
  isRequired: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  order: z.number().optional(),
})

// POST /api/services/[id]/requirements - Create requirement
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
    const body = await request.json()
    const validatedData = requirementSchema.parse(body)

    // Verify service ownership
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get next order number
    const lastRequirement = await prisma.serviceRequirement.findFirst({
      where: { serviceId: id },
      orderBy: { order: 'desc' },
    })

    const requirement = await prisma.serviceRequirement.create({
      data: {
        id: nanoid(),
        serviceId: id,
        questionAr: validatedData.questionAr,
        questionEn: validatedData.questionEn,
        type: validatedData.type,
        isRequired: validatedData.isRequired ?? true,
        options: validatedData.options || [],
        order: validatedData.order ?? (lastRequirement ? lastRequirement.order + 1 : 0),
      },
    })

    return NextResponse.json({
      message: 'Requirement created successfully',
      requirement,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    )
  }
}

// GET /api/services/[id]/requirements - List requirements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const requirements = await prisma.serviceRequirement.findMany({
      where: { serviceId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ requirements })
  } catch (error) {
    console.error('Error fetching requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id]/requirements - Delete all requirements
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

    // Verify service ownership
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.serviceRequirement.deleteMany({
      where: { serviceId: id },
    })

    return NextResponse.json({
      message: 'All requirements deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting requirements:', error)
    return NextResponse.json(
      { error: 'Failed to delete requirements' },
      { status: 500 }
    )
  }
}
