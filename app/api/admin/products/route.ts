import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const filter = searchParams.get("filter") || "all"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (filter === "approved") {
      where.status = "APPROVED"
    } else if (filter === "pending") {
      where.status = "PENDING"
    } else if (filter === "rejected") {
      where.status = "REJECTED"
    }

    const [products, total] = await Promise.all([
      prisma.readyProduct.findMany({
        where,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
              averageRating: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.readyProduct.count({ where }),
    ])

    // Calculate revenue for each product
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const orderStats = await prisma.order.aggregate({
          where: {
            productId: product.id,
            status: "COMPLETED",
          },
          _sum: { amount: true },
          _count: true,
        })

        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        })

        return {
          ...product,
          sales: orderStats._count,
          revenue: orderStats._sum.amount || 0,
          averageRating: avgRating._avg.rating || 0,
        }
      })
    )

    return NextResponse.json({
      products: productsWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin products fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
