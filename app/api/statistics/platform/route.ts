import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalServices,
      totalProjects,
      totalProductOrders,
      totalServiceOrders,
      totalRevenue,
      activeProjects,
      topRatedSellers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          sellerLevel: { not: null },
        },
      }),
      prisma.product.count({
        where: { isApproved: true },
      }),
      prisma.service.count({
        where: { isApproved: true },
      }),
      prisma.project.count(),
      prisma.productOrder.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.serviceOrder.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.$queryRaw`
        SELECT
          (SELECT COALESCE(SUM(amount), 0) FROM "ProductOrder" WHERE status = 'COMPLETED') +
          (SELECT COALESCE(SUM(amount), 0) FROM "ServiceOrder" WHERE status = 'COMPLETED') +
          (SELECT COALESCE(SUM(budget), 0) FROM "Project" WHERE status = 'COMPLETED') as total
      `,
      prisma.project.count({
        where: { status: 'OPEN' },
      }),
      prisma.user.count({
        where: {
          sellerLevel: 'TOP_RATED',
        },
      }),
    ])

    const revenueResult: any = totalRevenue
    const totalPlatformRevenue = revenueResult[0]?.total || 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalUsers - totalSellers,
      },
      marketplace: {
        products: totalProducts,
        services: totalServices,
        projects: totalProjects,
        activeProjects,
      },
      transactions: {
        productOrders: totalProductOrders,
        serviceOrders: totalServiceOrders,
        totalOrders: totalProductOrders + totalServiceOrders,
      },
      revenue: {
        total: totalPlatformRevenue,
        platformFee: Number(totalPlatformRevenue) * 0.25,
        gatewayFee: Number(totalPlatformRevenue) * 0.05,
      },
      sellers: {
        topRated: topRatedSellers,
      },
    })
  } catch (error) {
    console.error('Error fetching platform statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
