import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: List seller's services
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit
    const sellerId = session.user.id

    const where: any = {
      sellerId,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: "insensitive" } },
        { titleEn: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status !== "all") {
      where.status = status
    }

    const [services, total] = await Promise.all([
      prisma.customService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          packages: true,
          _count: {
            select: {
              reviews: true,
              orders: true,
            },
          },
        },
      }),
      prisma.customService.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

// POST: Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const data = await request.json()

    if (!data.titleAr || !data.titleEn || !data.category || !data.packages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create service with packages
    const service = await prisma.customService.create({
      data: {
        sellerId: session.user.id,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        category: data.category,
        subcategory: data.subcategory,
        images: data.images || [],
        portfolioSamples: data.portfolioSamples || [],
        tags: data.tags || [],
        status: "PENDING",
        packages: {
          create: data.packages.map((pkg: any) => ({
            nameAr: pkg.nameAr,
            nameEn: pkg.nameEn,
            descriptionAr: pkg.descriptionAr,
            descriptionEn: pkg.descriptionEn,
            price: parseFloat(pkg.price),
            deliveryDays: parseInt(pkg.deliveryDays),
            revisions: parseInt(pkg.revisions),
            features: pkg.features || [],
          })),
        },
      },
      include: {
        packages: true,
      },
    })

    return NextResponse.json({
      success: true,
      service,
      message: "Service created successfully",
    })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
