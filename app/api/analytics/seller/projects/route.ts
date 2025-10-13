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
      totalProjects,
      openProjects,
      completedProjects,
      totalBids,
      acceptedBids,
      totalEarnings,
      avgBidAmount,
      recentBids,
      successRate,
      earningsByDay,
    ] = await Promise.all([
      prisma.project.count({
        where: { clientId: session.user.id },
      }),
      prisma.project.count({
        where: { clientId: session.user.id, status: 'OPEN' },
      }),
      prisma.project.count({
        where: { clientId: session.user.id, status: 'COMPLETED' },
      }),
      prisma.projectBid.count({
        where: {
          freelancerId: session.user.id,
          createdAt: { gte: startDate },
        },
      }),
      prisma.projectBid.count({
        where: {
          freelancerId: session.user.id,
          status: 'ACCEPTED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.project.aggregate({
        where: {
          freelancerId: session.user.id,
          status: 'COMPLETED',
          updatedAt: { gte: startDate },
        },
        _sum: { budget: true },
      }),
      prisma.projectBid.aggregate({
        where: {
          freelancerId: session.user.id,
          createdAt: { gte: startDate },
        },
        _avg: { bidAmount: true },
      }),
      prisma.projectBid.findMany({
        where: {
          freelancerId: session.user.id,
          createdAt: { gte: startDate },
        },
        include: {
          Project: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              budget: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.projectBid.groupBy({
        by: ['status'],
        where: {
          freelancerId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT DATE(p."updatedAt") as date, SUM(p.budget) as earnings, COUNT(*) as projects
        FROM "Project" p
        WHERE p."freelancerId" = ${session.user.id}
          AND p.status = 'COMPLETED'
          AND p."updatedAt" >= ${startDate}
        GROUP BY DATE(p."updatedAt")
        ORDER BY DATE(p."updatedAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalProjects,
        openProjects,
        completedProjects,
        totalBids,
        acceptedBids,
        totalEarnings: totalEarnings._sum.budget || 0,
        avgBidAmount: avgBidAmount._avg.bidAmount || 0,
        successRate: totalBids > 0 ? ((acceptedBids / totalBids) * 100).toFixed(2) : 0,
      },
      recentBids,
      bidStatusBreakdown: successRate,
      earningsByDay,
    })
  } catch (error) {
    console.error('Error fetching project analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
