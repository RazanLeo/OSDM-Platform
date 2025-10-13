import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const [
      totalPurchases,
      totalSpent,
      totalDownloads,
      recentPurchases,
      topCategories,
      spendingByDay,
    ] = await Promise.all([
      prisma.productOrder.count({
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
      }),
      prisma.productOrder.aggregate({
        where: {
          buyerId: session.user.id,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.downloadLog.count({
        where: {
          buyerId: session.user.id,
          downloadedAt: { gte: startDate },
        },
      }),
      prisma.productOrder.findMany({
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
        include: {
          Product: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              category: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.productOrder.groupBy({
        by: ['productId'],
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: true,
        _sum: { amount: true },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: 5,
      }),
      prisma.$queryRaw`
        SELECT DATE(po."createdAt") as date, SUM(po.amount) as spent, COUNT(*) as purchases
        FROM "ProductOrder" po
        WHERE po."buyerId" = ${session.user.id}
          AND po.status = 'COMPLETED'
          AND po."createdAt" >= ${startDate}
        GROUP BY DATE(po."createdAt")
        ORDER BY DATE(po."createdAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalPurchases,
        totalSpent: totalSpent._sum.amount || 0,
        totalDownloads,
        avgOrderValue: totalPurchases > 0 ? (totalSpent._sum.amount || 0) / totalPurchases : 0,
      },
      recentPurchases,
      topCategories,
      spendingByDay,
    })
  } catch (error) {
    console.error('Error fetching buyer product analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
