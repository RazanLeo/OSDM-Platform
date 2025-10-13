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
      totalOrders,
      totalSpent,
      activeOrders,
      completedOrders,
      recentOrders,
      topCategories,
      spendingByDay,
    ] = await Promise.all([
      prisma.serviceOrder.count({
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceOrder.aggregate({
        where: {
          buyerId: session.user.id,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.serviceOrder.count({
        where: {
          buyerId: session.user.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.serviceOrder.count({
        where: {
          buyerId: session.user.id,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceOrder.findMany({
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
        include: {
          Service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              category: true,
              images: true,
            },
          },
          Seller: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.serviceOrder.groupBy({
        by: ['serviceId'],
        where: {
          buyerId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: true,
        _sum: { amount: true },
        orderBy: {
          _count: {
            serviceId: 'desc',
          },
        },
        take: 5,
      }),
      prisma.$queryRaw`
        SELECT DATE(so."createdAt") as date, SUM(so.amount) as spent, COUNT(*) as orders
        FROM "ServiceOrder" so
        WHERE so."buyerId" = ${session.user.id}
          AND so.status = 'COMPLETED'
          AND so."createdAt" >= ${startDate}
        GROUP BY DATE(so."createdAt")
        ORDER BY DATE(so."createdAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalOrders,
        totalSpent: totalSpent._sum.amount || 0,
        activeOrders,
        completedOrders,
        avgOrderValue: totalOrders > 0 ? (totalSpent._sum.amount || 0) / totalOrders : 0,
      },
      recentOrders,
      topCategories,
      spendingByDay,
    })
  } catch (error) {
    console.error('Error fetching buyer service analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
