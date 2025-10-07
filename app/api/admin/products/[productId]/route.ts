import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// Update product status (approve, reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = params
    const body = await request.json()
    const { action, reason } = body

    let updates: any = {}

    if (action === "approve") {
      updates = {
        status: "APPROVED",
        rejectionReason: null,
      }

      // Create notification for seller
      const product = await prisma.readyProduct.findUnique({
        where: { id: productId },
        select: { sellerId: true, titleAr: true, titleEn: true },
      })

      if (product) {
        await prisma.notification.create({
          data: {
            userId: product.sellerId,
            type: "CONTENT_APPROVED",
            titleAr: "تمت الموافقة على منتجك",
            titleEn: "Your product has been approved",
            messageAr: `تمت الموافقة على منتجك "${product.titleAr}" وهو الآن متاح للبيع`,
            messageEn: `Your product "${product.titleEn}" has been approved and is now available for sale`,
            link: `/ar/marketplace/ready-products/${productId}`,
          },
        })
      }
    } else if (action === "reject") {
      updates = {
        status: "REJECTED",
        rejectionReason: reason || "Product rejected by admin",
      }

      // Create notification for seller
      const product = await prisma.readyProduct.findUnique({
        where: { id: productId },
        select: { sellerId: true, titleAr: true, titleEn: true },
      })

      if (product) {
        await prisma.notification.create({
          data: {
            userId: product.sellerId,
            type: "CONTENT_REJECTED",
            titleAr: "تم رفض منتجك",
            titleEn: "Your product has been rejected",
            messageAr: `تم رفض منتجك "${product.titleAr}". السبب: ${reason || "لا يوجد سبب محدد"}`,
            messageEn: `Your product "${product.titleEn}" has been rejected. Reason: ${reason || "No reason provided"}`,
            link: `/ar/dashboard/seller/products/${productId}`,
          },
        })
      }
    }

    const updatedProduct = await prisma.readyProduct.update({
      where: { id: productId },
      data: updates,
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Admin product update error:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = params

    // Soft delete by changing status
    await prisma.readyProduct.update({
      where: { id: productId },
      data: {
        status: "REJECTED",
        rejectionReason: "Product deleted by admin",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    })
  } catch (error) {
    console.error("Admin product delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
