import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/affiliate/sales - Get affiliate sales list
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    })

    if (!affiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 })
    }

    const where = {
      affiliateId: affiliate.id,
      ...(status && { status }),
    }

    const [sales, total] = await Promise.all([
      prisma.affiliateSale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.affiliateSale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching affiliate sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate sales' },
      { status: 500 }
    )
  }
}
