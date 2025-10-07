import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const sellerId = session.user.id

    // Get seller's statistics
    const [
      totalProducts,
      totalServices,
      totalJobs,
      activeProducts,
      pendingProducts,
      totalOrders,
      completedOrders,
      totalEarnings,
      pendingBalance,
      availableBalance,
      averageRating,
      totalReviews,
    ] = await Promise.all([
      // Products
      prisma.readyProduct.count({
        where: { sellerId, deletedAt: null },
      }),
      prisma.customService.count({
        where: { sellerId, deletedAt: null },
      }),
      prisma.freelanceJob.count({
        where: { sellerId, deletedAt: null },
      }),
      prisma.readyProduct.count({
        where: { sellerId, status: "APPROVED", deletedAt: null },
      }),
      prisma.readyProduct.count({
        where: { sellerId, status: "PENDING", deletedAt: null },
      }),

      // Orders
      prisma.order.count({
        where: { sellerId },
      }),
      prisma.order.count({
        where: { sellerId, status: "COMPLETED" },
      }),

      // Earnings
      prisma.order.aggregate({
        where: {
          sellerId,
          paymentStatus: "PAID",
        },
        _sum: {
          sellerEarnings: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          sellerId,
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
        _sum: {
          sellerEarnings: true,
        },
      }),

      // Available balance from user
      prisma.user
        .findUnique({
          where: { id: sellerId },
          select: { balance: true },
        })
        .then((user) => user?.balance || 0),

      // Ratings
      prisma.review.aggregate({
        where: { sellerId },
        _avg: {
          rating: true,
        },
      }),
      prisma.review.count({
        where: { sellerId },
      }),
    ])

    // Calculate monthly earnings (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyEarnings = await prisma.$queryRaw<
      Array<{ month: string; earnings: number }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COALESCE(SUM("sellerEarnings"), 0)::float as earnings
      FROM "Order"
      WHERE "sellerId" = ${sellerId}
        AND "paymentStatus" = 'PAID'
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { sellerId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profileImage: true,
          },
        },
        readyProduct: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
        customService: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
      },
    })

    // Get top selling products
    const topProducts = await prisma.readyProduct.findMany({
      where: {
        sellerId,
        status: "APPROVED",
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        salesCount: "desc",
      },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        price: true,
        salesCount: true,
        totalRevenue: true,
        images: true,
        averageRating: true,
      },
    })

    return NextResponse.json({
      overview: {
        totalProducts,
        totalServices,
        totalJobs,
        activeProducts,
        pendingProducts,
        totalOrders,
        completedOrders,
        totalEarnings: totalEarnings._sum.sellerEarnings || 0,
        pendingBalance: pendingBalance._sum.sellerEarnings || 0,
        availableBalance,
        averageRating: averageRating._avg.rating || 0,
        totalReviews,
      },
      monthlyEarnings,
      recentOrders,
      topProducts,
    })
  } catch (error) {
    console.error("Error fetching seller stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch seller statistics" },
      { status: 500 }
    )
  }
}
