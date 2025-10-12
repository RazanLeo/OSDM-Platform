import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const licenseSchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  buyerEmail: z.string().email(),
  maxActivations: z.number().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
})

// Function to generate license key
function generateLicenseKey(): string {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(nanoid(5).toUpperCase())
  }
  return segments.join('-')
}

// POST /api/licenses/generate - Generate license key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = licenseSchema.parse(body)

    // Verify product ownership or admin
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (product.sellerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate unique license key
    let licenseKey = generateLicenseKey()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.license.findUnique({
        where: { licenseKey },
      })
      if (!existing) break
      licenseKey = generateLicenseKey()
      attempts++
    }

    // Create license
    const license = await prisma.license.create({
      data: {
        id: nanoid(),
        productId: validatedData.productId,
        orderId: validatedData.orderId,
        licenseKey,
        buyerEmail: validatedData.buyerEmail,
        maxActivations: validatedData.maxActivations || 1,
        expiresAt: validatedData.expiresAt
          ? new Date(validatedData.expiresAt)
          : null,
      },
    })

    return NextResponse.json({
      message: 'License key generated successfully',
      license: {
        id: license.id,
        licenseKey: license.licenseKey,
        maxActivations: license.maxActivations,
        expiresAt: license.expiresAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error generating license:', error)
    return NextResponse.json(
      { error: 'Failed to generate license key' },
      { status: 500 }
    )
  }
}

// GET /api/licenses/generate - Get licenses for a product or order
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const orderId = searchParams.get('orderId')
    const buyerEmail = searchParams.get('buyerEmail')

    if (!productId && !orderId && !buyerEmail) {
      return NextResponse.json(
        { error: 'productId, orderId, or buyerEmail required' },
        { status: 400 }
      )
    }

    const where: any = {}
    if (productId) where.productId = productId
    if (orderId) where.orderId = orderId
    if (buyerEmail) where.buyerEmail = buyerEmail

    const licenses = await prisma.license.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ licenses })
  } catch (error) {
    console.error('Error fetching licenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    )
  }
}
