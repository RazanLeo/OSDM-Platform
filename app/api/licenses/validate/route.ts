import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const validateSchema = z.object({
  licenseKey: z.string(),
  productId: z.string().optional(),
})

// POST /api/licenses/validate - Validate and activate license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateSchema.parse(body)

    // Find license
    const license = await prisma.license.findUnique({
      where: { licenseKey: validatedData.licenseKey },
    })

    if (!license) {
      return NextResponse.json(
        { valid: false, error: 'Invalid license key' },
        { status: 404 }
      )
    }

    // Check if license matches product
    if (validatedData.productId && license.productId !== validatedData.productId) {
      return NextResponse.json(
        { valid: false, error: 'License key does not match this product' },
        { status: 400 }
      )
    }

    // Check if license is active
    if (!license.isActive) {
      return NextResponse.json(
        { valid: false, error: 'License key has been deactivated' },
        { status: 400 }
      )
    }

    // Check if license is expired
    if (license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'License key has expired' },
        { status: 400 }
      )
    }

    // Check activation limit
    if (license.activationCount >= license.maxActivations) {
      return NextResponse.json(
        {
          valid: false,
          error: `Maximum activations (${license.maxActivations}) reached`,
        },
        { status: 400 }
      )
    }

    // Increment activation count
    const updatedLicense = await prisma.license.update({
      where: { licenseKey: validatedData.licenseKey },
      data: {
        activationCount: { increment: 1 },
        ...(license.activationCount === 0 && { activatedAt: new Date() }),
      },
    })

    return NextResponse.json({
      valid: true,
      license: {
        productId: updatedLicense.productId,
        activationCount: updatedLicense.activationCount,
        maxActivations: updatedLicense.maxActivations,
        expiresAt: updatedLicense.expiresAt,
        activatedAt: updatedLicense.activatedAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error validating license:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate license' },
      { status: 500 }
    )
  }
}
