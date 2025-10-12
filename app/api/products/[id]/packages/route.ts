import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Validation schema for package creation
const packageSchema = z.object({
  tier: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  nameAr: z.string().min(3),
  nameEn: z.string().min(3),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  price: z.number().min(5),
  features: z.array(z.string()),
  deliveryDays: z.number().min(1).optional(),
  revisions: z.number().min(0).optional(),
  isUnlimited: z.boolean().optional(),
  files: z.array(z.string()).optional(),
})

// GET /api/products/[id]/packages - List all packages for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const packages = await prisma.productPackage.findMany({
      where: {
        productId: id,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching product packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/packages - Create new package
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

    // Validate input
    const validatedData = packageSchema.parse(body)

    // Check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if package with this tier already exists
    const existingPackage = await prisma.productPackage.findFirst({
      where: {
        productId: id,
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
    const newPackage = await prisma.productPackage.create({
      data: {
        id: nanoid(),
        productId: id,
        tier: validatedData.tier,
        nameAr: validatedData.nameAr,
        nameEn: validatedData.nameEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        price: validatedData.price,
        features: validatedData.features,
        deliveryDays: validatedData.deliveryDays,
        revisions: validatedData.revisions || 0,
        isUnlimited: validatedData.isUnlimited || false,
        files: validatedData.files || [],
        sortOrder:
          validatedData.tier === 'BASIC' ? 1 : validatedData.tier === 'STANDARD' ? 2 : 3,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Package created successfully',
      package: newPackage,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/packages - Delete all packages (when needed)
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

    // Check if product belongs to user
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete all packages for this product
    await prisma.productPackage.deleteMany({
      where: {
        productId: id,
      },
    })

    return NextResponse.json({ message: 'All packages deleted successfully' })
  } catch (error) {
    console.error('Error deleting packages:', error)
    return NextResponse.json(
      { error: 'Failed to delete packages' },
      { status: 500 }
    )
  }
}
