import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: Get single product details
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { productId } = params

    const product = await prisma.readyProduct.findFirst({
      where: {
        id: productId,
        sellerId: session.user.id,
        deletedAt: null,
      },
      include: {
        reviews: {
          include: {
            buyer: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PATCH: Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { productId } = params
    const data = await request.json()

    // Check if product belongs to seller
    const existingProduct = await prisma.readyProduct.findFirst({
      where: {
        id: productId,
        sellerId: session.user.id,
        deletedAt: null,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Can't update approved/rejected products without resetting status
    if (
      existingProduct.status === "APPROVED" ||
      existingProduct.status === "REJECTED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot update approved/rejected products. Please create a new version.",
        },
        { status: 400 }
      )
    }

    // Update product
    const updatedProduct = await prisma.readyProduct.update({
      where: { id: productId },
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price ? parseFloat(data.price) : undefined,
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        images: data.images,
        files: data.files,
        demoUrl: data.demoUrl,
        tags: data.tags,
        licenseType: data.licenseType,
        allowCommercialUse: data.allowCommercialUse,
        includeSourceFiles: data.includeSourceFiles,
        futureUpdates: data.futureUpdates,
        supportIncluded: data.supportIncluded,
        languages: data.languages,
        softwareRequired: data.softwareRequired,
        compatibleWith: data.compatibleWith,
      },
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE: Soft delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { productId } = params

    // Check if product belongs to seller
    const product = await prisma.readyProduct.findFirst({
      where: {
        id: productId,
        sellerId: session.user.id,
        deletedAt: null,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Can't delete if there are active orders
    const activeOrders = await prisma.order.count({
      where: {
        readyProductId: productId,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product with active orders. Please complete or cancel orders first.",
        },
        { status: 400 }
      )
    }

    // Soft delete
    await prisma.readyProduct.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
