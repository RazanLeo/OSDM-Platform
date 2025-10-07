import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: List seller's products
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
    const category = searchParams.get("category") || "all"

    const skip = (page - 1) * limit
    const sellerId = session.user.id

    // Build where clause
    const where: any = {
      sellerId,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: "insensitive" } },
        { titleEn: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status !== "all") {
      where.status = status
    }

    if (category !== "all") {
      where.category = category
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.readyProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.readyProduct.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST: Create new product
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

    // Validate required fields
    if (!data.titleAr || !data.titleEn || !data.price || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.readyProduct.create({
      data: {
        sellerId: session.user.id,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        category: data.category,
        subcategory: data.subcategory,
        price: parseFloat(data.price),
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        images: data.images || [],
        files: data.files || [],
        demoUrl: data.demoUrl,
        tags: data.tags || [],
        licenseType: data.licenseType || "PERSONAL",
        allowCommercialUse: data.allowCommercialUse || false,
        includeSourceFiles: data.includeSourceFiles || false,
        futureUpdates: data.futureUpdates || false,
        supportIncluded: data.supportIncluded || false,
        languages: data.languages || [],
        softwareRequired: data.softwareRequired || [],
        compatibleWith: data.compatibleWith || [],
        status: "PENDING", // Always pending for admin approval
      },
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: session.user.id, // Temporary - should be admin user
        type: "NEW_CONTENT",
        titleAr: "منتج جديد يحتاج موافقة",
        titleEn: "New product needs approval",
        messageAr: `قام البائع ${session.user.fullName} بإضافة منتج جديد: "${data.titleAr}"`,
        messageEn: `Seller ${session.user.fullName} added a new product: "${data.titleEn}"`,
        link: `/api/admin/products/${product.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      product,
      message: "Product created successfully and submitted for approval",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
