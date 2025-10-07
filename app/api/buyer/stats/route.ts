import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized - Buyer access only" },
        { status: 401 }
      )
    }

    const buyerId = session.user.id

    // Get buyer's statistics
    const [
      totalPurchases,
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent,
      favoriteProducts,
      activeProjects,
    ] = await Promise.all([
      // Purchases (Ready Products)
      prisma.order.count({
        where: {
          buyerId,
          readyProductId: { not: null },
          paymentStatus: "PAID",
        },
      }),

      // Total Orders (Services + Products)
      prisma.order.count({
        where: { buyerId },
      }),

      // Active Orders
      prisma.order.count({
        where: {
          buyerId,
          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },
      }),

      // Completed Orders
      prisma.order.count({
        where: {
          buyerId,
          status: "COMPLETED",
        },
      }),

      // Total Spent
      prisma.order.aggregate({
        where: {
          buyerId,
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Favorite Products
      prisma.favorite.count({
        where: { userId: buyerId },
      }),

      // Active Projects Posted
      prisma.freelanceJob.count({
        where: {
          buyerId,
          status: "OPEN",
        },
      }),
    ])

    // Get recent purchases
    const recentPurchases = await prisma.order.findMany({
      where: {
        buyerId,
        readyProductId: { not: null },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        readyProduct: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            images: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profileImage: true,
          },
        },
      },
    })

    // Get active orders (services)
    const activeServiceOrders = await prisma.order.findMany({
      where: {
        buyerId,
        customServiceId: { not: null },
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customService: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profileImage: true,
          },
        },
      },
    })

    // Get favorite products
    const favorites = await prisma.favorite.findMany({
      where: { userId: buyerId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        readyProduct: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            images: true,
            price: true,
            averageRating: true,
            salesCount: true,
          },
        },
        customService: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            images: true,
            averageRating: true,
          },
        },
      },
    })

    // Get posted projects
    const postedProjects = await prisma.freelanceJob.findMany({
      where: { buyerId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    })

    // Calculate monthly spending (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlySpending = await prisma.$queryRaw<
      Array<{ month: string; amount: number }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COALESCE(SUM("totalAmount"), 0)::float as amount
      FROM "Order"
      WHERE "buyerId" = ${buyerId}
        AND "paymentStatus" = 'PAID'
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `

    return NextResponse.json({
      overview: {
        totalPurchases,
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent: totalSpent._sum.totalAmount || 0,
        favoriteProducts,
        activeProjects,
      },
      recentPurchases,
      activeServiceOrders,
      favorites,
      postedProjects,
      monthlySpending,
    })
  } catch (error) {
    console.error("Error fetching buyer stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch buyer statistics" },
      { status: 500 }
    )
  }
}
