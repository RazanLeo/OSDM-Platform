import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const affiliateSchema = z.object({
  commission: z.number().min(5).max(50).optional(),
})

// POST /api/affiliate/register - Register as affiliate
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = affiliateSchema.parse(body)

    // Check if already an affiliate
    const existing = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User is already an affiliate' },
        { status: 400 }
      )
    }

    // Generate unique affiliate code
    const affiliateCode = `${session.user.username.substring(0, 3).toUpperCase()}-${nanoid(8)}`

    // Create affiliate
    const affiliate = await prisma.affiliate.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        affiliateCode,
        commission: validatedData.commission || 10,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Affiliate registered successfully',
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        commission: affiliate.commission,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error registering affiliate:', error)
    return NextResponse.json(
      { error: 'Failed to register affiliate' },
      { status: 500 }
    )
  }
}

// GET /api/affiliate/register - Check affiliate status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
      include: {
        AffiliateSale: {
          where: { status: 'PENDING' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!affiliate) {
      return NextResponse.json({ isAffiliate: false })
    }

    return NextResponse.json({
      isAffiliate: true,
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        commission: affiliate.commission,
        totalClicks: affiliate.totalClicks,
        totalSales: affiliate.totalSales,
        totalEarnings: affiliate.totalEarnings,
        isActive: affiliate.isActive,
        recentSales: affiliate.AffiliateSale,
      },
    })
  } catch (error) {
    console.error('Error checking affiliate status:', error)
    return NextResponse.json(
      { error: 'Failed to check affiliate status' },
      { status: 500 }
    )
  }
}
