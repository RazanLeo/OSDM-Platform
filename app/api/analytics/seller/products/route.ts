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
      totalProducts,
      activeProducts,
      totalSales,
      totalRevenue,
      totalViews,
      totalDownloads,
      recentOrders,
      topProducts,
      revenueByDay,
    ] = await Promise.all([
      prisma.product.count({
        where: { sellerId: session.user.id },
      }),
      prisma.product.count({
        where: { sellerId: session.user.id, isActive: true },
      }),
      prisma.productOrder.count({
        where: {
          Product: { sellerId: session.user.id },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.productOrder.aggregate({
        where: {
          Product: { sellerId: session.user.id },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.product.aggregate({
        where: { sellerId: session.user.id },
        _sum: { viewCount: true },
      }),
      prisma.downloadLog.count({
        where: {
          Product: { sellerId: session.user.id },
          downloadedAt: { gte: startDate },
        },
      }),
      prisma.productOrder.findMany({
        where: {
          Product: { sellerId: session.user.id },
          createdAt: { gte: startDate },
        },
        include: {
          Product: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
            },
          },
          Buyer: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.product.findMany({
        where: { sellerId: session.user.id },
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          salesCount: true,
          price: true,
          averageRating: true,
        },
      }),
      prisma.$queryRaw`
        SELECT DATE(po."createdAt") as date, SUM(po.amount) as revenue, COUNT(*) as orders
        FROM "ProductOrder" po
        INNER JOIN "Product" p ON po."productId" = p.id
        WHERE p."sellerId" = ${session.user.id}
          AND po.status = 'COMPLETED'
          AND po."createdAt" >= ${startDate}
        GROUP BY DATE(po."createdAt")
        ORDER BY DATE(po."createdAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalProducts,
        activeProducts,
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalViews: totalViews._sum.viewCount || 0,
        totalDownloads,
      },
      recentOrders,
      topProducts,
      revenueByDay,
    })
  } catch (error) {
    console.error('Error fetching product analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
