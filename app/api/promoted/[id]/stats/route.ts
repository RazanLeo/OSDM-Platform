import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/promoted/[id]/stats - Get promoted listing statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const promoted = await prisma.promotedListing.findUnique({
      where: { id },
    })

    if (!promoted) {
      return NextResponse.json(
        { error: 'Promoted listing not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (promoted.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate metrics
    const remainingBudget = Number(promoted.budget) - Number(promoted.spent)
    const ctr = promoted.views > 0 ? (promoted.clicks / promoted.views) * 100 : 0
    const conversionRate =
      promoted.clicks > 0 ? (promoted.orders / promoted.clicks) * 100 : 0
    const costPerClick =
      promoted.clicks > 0 ? Number(promoted.spent) / promoted.clicks : 0
    const costPerOrder =
      promoted.orders > 0 ? Number(promoted.spent) / promoted.orders : 0

    const daysLeft = Math.ceil(
      (promoted.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return NextResponse.json({
      stats: {
        budget: Number(promoted.budget),
        spent: Number(promoted.spent),
        remainingBudget,
        views: promoted.views,
        clicks: promoted.clicks,
        orders: promoted.orders,
        ctr: ctr.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
        costPerClick: costPerClick.toFixed(2),
        costPerOrder: costPerOrder.toFixed(2),
        daysLeft,
        isActive: promoted.isActive,
        startDate: promoted.startDate,
        endDate: promoted.endDate,
      },
    })
  } catch (error) {
    console.error('Error fetching promoted listing stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promoted listing stats' },
      { status: 500 }
    )
  }
}
