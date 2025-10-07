import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users count and breakdown
    const [
      totalUsers,
      sellersCount,
      buyersCount,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    // Get products count
    const [
      totalProducts,
      pendingProducts,
      approvedProducts,
    ] = await Promise.all([
      prisma.readyProduct.count(),
      prisma.readyProduct.count({ where: { status: "PENDING" } }),
      prisma.readyProduct.count({ where: { status: "APPROVED" } }),
    ])

    // Get orders stats
    const [
      totalOrders,
      completedOrders,
      processingOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "IN_PROGRESS"] } } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ])

    // Get platform commission (assuming 25% commission)
    const platformRevenue = (totalRevenue._sum.amount || 0) * 0.25

    // Get disputes count
    const [openDisputes, totalDisputes] = await Promise.all([
      prisma.dispute.count({ where: { status: "OPEN" } }),
      prisma.dispute.count(),
    ])

    // Get monthly growth data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyUsers = await prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `

    const monthlyProducts = await prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COUNT(*)::int as count
      FROM "ReadyProduct"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `

    const monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COALESCE(SUM("amount"), 0)::float as revenue
      FROM "Order"
      WHERE "createdAt" >= ${sixMonthsAgo}
      AND "status" = 'COMPLETED'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `

    // Combine monthly data
    const platformStats = monthlyUsers.map((userStat, index) => ({
      name: userStat.month,
      users: userStat.count,
      products: monthlyProducts[index]?.count || 0,
      revenue: monthlyRevenue[index]?.revenue || 0,
    }))

    // Get category distribution (top 5)
    const categoryDistribution = await prisma.readyProduct.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    })

    const categoryData = categoryDistribution.map((cat) => ({
      name: cat.category,
      value: cat._count.category,
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        sellersCount,
        buyersCount,
        newUsersThisMonth,
        totalProducts,
        pendingProducts,
        approvedProducts,
        totalOrders,
        completedOrders,
        processingOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        platformRevenue,
        openDisputes,
        totalDisputes,
      },
      platformStats,
      categoryData,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    )
  }
}
