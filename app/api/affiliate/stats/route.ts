import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/affiliate/stats - Get affiliate statistics
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
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!affiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 })
    }

    // Calculate stats
    const totalPending = affiliate.AffiliateSale.filter(
      (sale) => sale.status === 'PENDING'
    ).reduce((sum, sale) => sum + Number(sale.commission), 0)

    const totalPaid = affiliate.AffiliateSale.filter(
      (sale) => sale.status === 'PAID'
    ).reduce((sum, sale) => sum + Number(sale.commission), 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthSales = affiliate.AffiliateSale.filter(
      (sale) => sale.createdAt >= thisMonth
    )

    const thisMonthEarnings = thisMonthSales.reduce(
      (sum, sale) => sum + Number(sale.commission),
      0
    )

    return NextResponse.json({
      stats: {
        totalClicks: affiliate.totalClicks,
        totalSales: affiliate.totalSales,
        totalEarnings: Number(affiliate.totalEarnings),
        pendingEarnings: totalPending,
        paidEarnings: totalPaid,
        conversionRate:
          affiliate.totalClicks > 0
            ? ((affiliate.totalSales / affiliate.totalClicks) * 100).toFixed(2)
            : '0.00',
        thisMonth: {
          sales: thisMonthSales.length,
          earnings: thisMonthEarnings,
        },
      },
      affiliateCode: affiliate.affiliateCode,
      commission: Number(affiliate.commission),
      isActive: affiliate.isActive,
      createdAt: affiliate.createdAt,
    })
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate stats' },
      { status: 500 }
    )
  }
}
