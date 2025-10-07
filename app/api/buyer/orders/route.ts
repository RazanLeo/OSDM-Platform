import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: List buyer's orders (services)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized - Buyer access only" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit
    const buyerId = session.user.id

    // Build where clause
    const where: any = {
      buyerId,
      customServiceId: { not: null },
    }

    if (status !== "all") {
      where.status = status
    }

    // Fetch orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customService: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              images: true,
            },
          },
          selectedPackage: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profileImage: true,
              averageRating: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
