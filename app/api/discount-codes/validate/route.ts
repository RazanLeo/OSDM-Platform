import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  amount: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, productId, serviceId, amount } = validateSchema.parse(body)

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!discount || !discount.isActive) {
      return NextResponse.json({ valid: false, error: 'Invalid code' }, { status: 404 })
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Code expired' }, { status: 400 })
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ valid: false, error: 'Code fully used' }, { status: 400 })
    }

    if (discount.productId && discount.productId !== productId) {
      return NextResponse.json({ valid: false, error: 'Code not valid for this product' }, { status: 400 })
    }

    if (discount.serviceId && discount.serviceId !== serviceId) {
      return NextResponse.json({ valid: false, error: 'Code not valid for this service' }, { status: 400 })
    }

    let discountAmount = 0
    if (discount.discountType === 'PERCENTAGE') {
      discountAmount = (amount * Number(discount.discountValue)) / 100
    } else {
      discountAmount = Number(discount.discountValue)
    }

    const finalAmount = Math.max(0, amount - discountAmount)

    return NextResponse.json({
      valid: true,
      discountAmount,
      finalAmount,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
    })
  } catch (error) {
    console.error('Error validating discount:', error)
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
