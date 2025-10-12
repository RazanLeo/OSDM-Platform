import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const packageSchema = z.object({
  tier: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  nameAr: z.string().min(3),
  nameEn: z.string().min(3),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  price: z.number().min(5),
  deliveryDays: z.number().min(1),
  revisions: z.number().min(0),
  isUnlimited: z.boolean().optional(),
  features: z.array(z.string()),
  extras: z.array(z.string()).optional(),
  quickDelivery: z.boolean().optional(),
  quickDeliveryFee: z.number().min(0).optional(),
})

// POST /api/services/[id]/packages - Create service package
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
    const validatedData = packageSchema.parse(body)

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

    // Check if package with this tier already exists
    const existingPackage = await prisma.servicePackage.findFirst({
      where: {
        serviceId: id,
        tier: validatedData.tier,
      },
    })

    if (existingPackage) {
      return NextResponse.json(
        { error: `Package with tier ${validatedData.tier} already exists` },
        { status: 400 }
      )
    }

    // Create package
    const newPackage = await prisma.servicePackage.create({
      data: {
        id: nanoid(),
        serviceId: id,
        tier: validatedData.tier,
        nameAr: validatedData.nameAr,
        nameEn: validatedData.nameEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        price: validatedData.price,
        deliveryDays: validatedData.deliveryDays,
        revisions: validatedData.revisions,
        isUnlimited: validatedData.isUnlimited || false,
        features: validatedData.features,
        extras: validatedData.extras || [],
        quickDelivery: validatedData.quickDelivery || false,
        quickDeliveryFee: validatedData.quickDeliveryFee,
        sortOrder:
          validatedData.tier === 'BASIC' ? 1 : validatedData.tier === 'STANDARD' ? 2 : 3,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Service package created successfully',
      package: newPackage,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating service package:', error)
    return NextResponse.json(
      { error: 'Failed to create service package' },
      { status: 500 }
    )
  }
}

// GET /api/services/[id]/packages - List service packages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const packages = await prisma.servicePackage.findMany({
      where: {
        serviceId: id,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching service packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service packages' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id]/packages - Delete all packages
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

    await prisma.servicePackage.deleteMany({
      where: { serviceId: id },
    })

    return NextResponse.json({
      message: 'All service packages deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting service packages:', error)
    return NextResponse.json(
      { error: 'Failed to delete service packages' },
      { status: 500 }
    )
  }
}
