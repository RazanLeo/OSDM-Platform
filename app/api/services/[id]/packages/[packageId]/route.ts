import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const packageUpdateSchema = z.object({
  nameAr: z.string().min(3).optional(),
  nameEn: z.string().min(3).optional(),
  descriptionAr: z.string().min(10).optional(),
  descriptionEn: z.string().min(10).optional(),
  price: z.number().min(5).optional(),
  deliveryDays: z.number().min(1).optional(),
  revisions: z.number().min(0).optional(),
  isUnlimited: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  quickDelivery: z.boolean().optional(),
  quickDeliveryFee: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// PUT /api/services/[id]/packages/[packageId] - Update service package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, packageId } = await params
    const body = await request.json()
    const validatedData = packageUpdateSchema.parse(body)

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

    // Verify package exists and belongs to this service
    const existingPackage = await prisma.servicePackage.findUnique({
      where: { id: packageId },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (existingPackage.serviceId !== id) {
      return NextResponse.json({ error: 'Package does not belong to this service' }, { status: 400 })
    }

    // Update package
    const updatedPackage = await prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Service package updated successfully',
      package: updatedPackage,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating service package:', error)
    return NextResponse.json(
      { error: 'Failed to update service package' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id]/packages/[packageId] - Delete service package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, packageId } = await params

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

    // Verify package exists and belongs to this service
    const existingPackage = await prisma.servicePackage.findUnique({
      where: { id: packageId },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (existingPackage.serviceId !== id) {
      return NextResponse.json({ error: 'Package does not belong to this service' }, { status: 400 })
    }

    // Delete package
    await prisma.servicePackage.delete({
      where: { id: packageId },
    })

    return NextResponse.json({
      message: 'Service package deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting service package:', error)
    return NextResponse.json(
      { error: 'Failed to delete service package' },
      { status: 500 }
    )
  }
}

// GET /api/services/[id]/packages/[packageId] - Get single package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { id, packageId } = await params

    const packageData = await prisma.servicePackage.findUnique({
      where: {
        id: packageId,
      },
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (packageData.serviceId !== id) {
      return NextResponse.json({ error: 'Package does not belong to this service' }, { status: 400 })
    }

    return NextResponse.json({ package: packageData })
  } catch (error) {
    console.error('Error fetching service package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service package' },
      { status: 500 }
    )
  }
}
