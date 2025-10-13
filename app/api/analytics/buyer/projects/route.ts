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
      totalPosted,
      activeProjects,
      completedProjects,
      totalBidsReceived,
      totalSpent,
      avgBidsPerProject,
      recentProjects,
      spendingByDay,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          clientId: session.user.id,
          createdAt: { gte: startDate },
        },
      }),
      prisma.project.count({
        where: {
          clientId: session.user.id,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.project.count({
        where: {
          clientId: session.user.id,
          status: 'COMPLETED',
          updatedAt: { gte: startDate },
        },
      }),
      prisma.projectBid.count({
        where: {
          Project: {
            clientId: session.user.id,
          },
          createdAt: { gte: startDate },
        },
      }),
      prisma.project.aggregate({
        where: {
          clientId: session.user.id,
          status: 'COMPLETED',
          updatedAt: { gte: startDate },
        },
        _sum: { budget: true },
      }),
      prisma.project.aggregate({
        where: {
          clientId: session.user.id,
          createdAt: { gte: startDate },
        },
        _avg: { proposalCount: true },
      }),
      prisma.project.findMany({
        where: {
          clientId: session.user.id,
          createdAt: { gte: startDate },
        },
        include: {
          ProjectBid: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.$queryRaw`
        SELECT DATE(p."updatedAt") as date, SUM(p.budget) as spent, COUNT(*) as projects
        FROM "Project" p
        WHERE p."clientId" = ${session.user.id}
          AND p.status = 'COMPLETED'
          AND p."updatedAt" >= ${startDate}
        GROUP BY DATE(p."updatedAt")
        ORDER BY DATE(p."updatedAt") ASC
      `,
    ])

    return NextResponse.json({
      summary: {
        totalPosted,
        activeProjects,
        completedProjects,
        totalBidsReceived,
        totalSpent: totalSpent._sum.budget || 0,
        avgBidsPerProject: avgBidsPerProject._avg.proposalCount || 0,
      },
      recentProjects,
      spendingByDay,
    })
  } catch (error) {
    console.error('Error fetching buyer project analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
