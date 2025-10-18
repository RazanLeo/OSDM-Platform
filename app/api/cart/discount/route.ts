import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Discount code required' }, { status: 400 })
    }

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 })
    }

    if (!discount.isActive) {
      return NextResponse.json({ error: 'Discount code is inactive' }, { status: 400 })
    }

    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Discount code has expired' }, { status: 400 })
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return NextResponse.json({ error: 'Discount code usage limit reached' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: parseFloat(discount.value.toString()),
      },
    })
  } catch (error: any) {
    console.error('Error applying discount:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply discount' },
      { status: 500 }
    )
  }
}
