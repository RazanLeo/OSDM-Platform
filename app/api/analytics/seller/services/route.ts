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
      totalServices,
      activeServices,
      totalOrders,
      totalRevenue,
      totalViews,
      activeOrders,
      completedOrders,
      recentOrders,
      topServices,
      revenueByDay,
    ] = await Promise.all([
      prisma.service.count({
        where: { sellerId: session.user.id },
      }),
      prisma.service.count({
        where: { sellerId: session.user.id, isActive: true },
      }),
      prisma.serviceOrder.count({
        where: {
          Service: { sellerId: session.user.id },
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceOrder.aggregate({
        where: {
          Service: { sellerId: session.user.id },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.service.aggregate({
        where: { sellerId: session.user.id },
        _sum: { viewCount: true },
      }),
      prisma.serviceOrder.count({
        where: {
          Service: { sellerId: session.user.id },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.serviceOrder.count({
        where: {
          Service: { sellerId: session.user.id },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceOrder.findMany({
        where: {
          Service: { sellerId: session.user.id },
          createdAt: { gte: startDate },
        },
        include: {
          Service: {
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
      prisma.service.findMany({
        where: { sellerId: session.user.id },
        orderBy: { ordersCount: 'desc' },
        take: 5,
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          ordersCount: true,
          averageRating: true,
        },
      }),
      prisma.$queryRaw`
        SELECT DATE(so."createdAt") as date, SUM(so.amount) as revenue, COUNT(*) as orders
        FROM "ServiceOrder" so
        INNER JOIN "Service" s ON so."serviceId" = s.id
        WHERE s."sellerId" = ${session.user.id}
          AND so.status = 'COMPLETED'
          AND so."createdAt" >= ${startDate}
        GROUP BY DATE(so."createdAt")
        ORDER BY DATE(so."createdAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalServices,
        activeServices,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalViews: totalViews._sum.viewCount || 0,
        activeOrders,
        completedOrders,
      },
      recentOrders,
      topServices,
      revenueByDay,
    })
  } catch (error) {
    console.error('Error fetching service analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
