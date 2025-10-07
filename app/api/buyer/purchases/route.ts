import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: List buyer's purchases (ready products)
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

    const skip = (page - 1) * limit
    const buyerId = session.user.id

    // Fetch purchases with pagination
    const [purchases, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          buyerId,
          readyProductId: { not: null },
          paymentStatus: "PAID",
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          readyProduct: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              images: true,
              price: true,
              files: true,
              category: true,
              subcategory: true,
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
      }),
      prisma.order.count({
        where: {
          buyerId,
          readyProductId: { not: null },
          paymentStatus: "PAID",
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      purchases,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    )
  }
}
