import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get new users today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // Get total revenue (sum of all completed orders)
    const productOrders = await prisma.productOrder.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "COMPLETED"
      }
    })

    const serviceOrders = await prisma.serviceOrder.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "COMPLETED"
      }
    })

    const projectPayments = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "COMPLETED"
      }
    })

    const totalRevenue = (
      Number(productOrders._sum.amount || 0) +
      Number(serviceOrders._sum.amount || 0) +
      Number(projectPayments._sum.amount || 0)
    )

    // Platform commission (25%)
    const platformCommission = totalRevenue * 0.25

    // Gateway fees (5%)
    const gatewayFees = totalRevenue * 0.05

    // Seller payouts (70%)
    const sellerPayouts = totalRevenue * 0.70

    // Net profit
    const netProfit = platformCommission - gatewayFees

    // Active transactions
    const activeTransactions = await prisma.productOrder.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"]
        }
      }
    })

    // Pending items
    const pendingProducts = await prisma.product.count({
      where: { status: "PENDING" }
    })
    const pendingServices = await prisma.service.count({
      where: { status: "PENDING" }
    })
    const pendingItems = pendingProducts + pendingServices

    // Content counts
    const totalProducts = await prisma.product.count()
    const totalServices = await prisma.service.count()
    const totalProjects = await prisma.project.count()

    // User types
    const activeSellers = await prisma.user.count({
      where: {
        role: {
          in: ["SELLER", "FREELANCER"]
        }
      }
    })

    const activeBuyers = await prisma.user.count({
      where: {
        role: "BUYER"
      }
    })

    const bannedUsers = await prisma.user.count({
      where: {
        isBanned: true
      }
    })

    return NextResponse.json({
      totalUsers,
      newUsersToday,
      totalRevenue,
      revenueToday: 0, // Would need to calculate from today's orders
      activeTransactions,
      pendingItems,
      platformCommission,
      gatewayFees,
      sellerPayouts,
      netProfit,
      totalProducts,
      totalServices,
      totalProjects,
      activeSellers,
      activeBuyers,
      bannedUsers,
    })
  } catch (error) {
    console.error("Admin statistics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
