import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: List buyer's favorites
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

    // Fetch favorites with pagination
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: buyerId },
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
              discountPrice: true,
              averageRating: true,
              salesCount: true,
              category: true,
              seller: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  profileImage: true,
                },
              },
            },
          },
          customService: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              images: true,
              averageRating: true,
              category: true,
              packages: {
                orderBy: {
                  price: "asc",
                },
                take: 1,
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
          },
        },
      }),
      prisma.favorite.count({ where: { userId: buyerId } }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    )
  }
}

// POST: Add to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized - Buyer access only" },
        { status: 401 }
      )
    }

    const { readyProductId, customServiceId } = await request.json()

    if (!readyProductId && !customServiceId) {
      return NextResponse.json(
        { error: "Product ID or Service ID is required" },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        ...(readyProductId && { readyProductId }),
        ...(customServiceId && { customServiceId }),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 400 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        ...(readyProductId && { readyProductId }),
        ...(customServiceId && { customServiceId }),
      },
    })

    return NextResponse.json({
      success: true,
      favorite,
      message: "Added to favorites",
    })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    )
  }
}

// DELETE: Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized - Buyer access only" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get("id")

    if (!favoriteId) {
      return NextResponse.json(
        { error: "Favorite ID is required" },
        { status: 400 }
      )
    }

    // Check ownership
    const favorite = await prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId: session.user.id,
      },
    })

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: { id: favoriteId },
    })

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    )
  }
}
