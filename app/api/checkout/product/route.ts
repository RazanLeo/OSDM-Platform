import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, paymentMethod } = body

    if (!productId || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "APPROVED" },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if user is trying to buy their own product
    if (product.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own product" },
        { status: 400 }
      )
    }

    // Check if user already purchased this product
    const existingOrder = await prisma.productOrder.findFirst({
      where: {
        buyerId: session.user.id,
        productId: product.id,
        status: {
          in: ["PAID", "COMPLETED"],
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: "You already purchased this product" },
        { status: 400 }
      )
    }

    // Fetch revenue settings
    const settings = await prisma.revenueSettings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { error: "Revenue settings not found" },
        { status: 500 }
      )
    }

    // Calculate fees
    const productPrice = Number(product.price)
    const platformFee = (productPrice * Number(settings.platformCommission)) / 100
    const paymentFee = (productPrice * Number(settings.paymentGatewayFee)) / 100
    const totalAmount = productPrice + platformFee + paymentFee
    const sellerEarning = productPrice - platformFee - paymentFee

    // Create order, payment, and escrow in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create product order
      const order = await tx.productOrder.create({
        data: {
          orderNumber: `ORD-${nanoid(10).toUpperCase()}`,
          buyerId: session.user!.id,
          sellerId: product.sellerId,
          productId: product.id,
          productPrice: productPrice,
          platformFee: platformFee,
          paymentFee: paymentFee,
          totalAmount: totalAmount,
          sellerEarning: sellerEarning,
          status: "PENDING",
          downloadUrl: null, // Will be set after payment confirmation
          downloadExpiresAt: null,
        },
      })

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          paymentNumber: `PAY-${nanoid(10).toUpperCase()}`,
          payerId: session.user!.id,
          amount: totalAmount,
          currency: "SAR",
          method: paymentMethod,
          status: "PENDING",
          marketType: "PRODUCTS",
          productOrderId: order.id,
        },
      })

      // Create escrow
      const escrow = await tx.escrow.create({
        data: {
          id: `ESC-${nanoid(10).toUpperCase()}`,
          amount: sellerEarning,
          buyerId: session.user!.id,
          sellerId: product.sellerId,
          status: "PENDING",
          marketType: "PRODUCTS",
          productOrderId: order.id,
        },
      })

      // In a real implementation, here you would:
      // 1. Call payment gateway API (Moyasar, PayTabs, etc.)
      // 2. Wait for payment confirmation webhook
      // 3. Update order status to PAID
      // 4. Generate download URL for product files
      // 5. Update escrow status to HELD
      // 6. Send notifications to buyer and seller

      // For now, let's simulate successful payment
      // IMPORTANT: Remove this in production and implement real payment gateway
      const updatedOrder = await tx.productOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          downloadUrl: `/api/download/product/${order.id}`, // Generate secure download URL
          downloadExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      })

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      })

      await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: "HELD",
        },
      })

      // Update product download count
      await tx.product.update({
        where: { id: product.id },
        data: {
          downloadCount: { increment: 1 },
        },
      })

      // Create notifications
      await tx.notification.create({
        data: {
          id: `NOT-${nanoid(10)}`,
          userId: session.user!.id,
          type: "ORDER",
          titleAr: "تم الشراء بنجاح",
          titleEn: "Purchase Successful",
          messageAr: `تم شراء "${product.titleAr}" بنجاح. يمكنك تحميل المنتج الآن.`,
          messageEn: `Successfully purchased "${product.titleEn}". You can now download the product.`,
          link: `/dashboard/buyer/orders/${order.id}`,
        },
      })

      await tx.notification.create({
        data: {
          id: `NOT-${nanoid(10)}`,
          userId: product.sellerId,
          type: "ORDER",
          titleAr: "طلب جديد",
          titleEn: "New Order",
          messageAr: `لديك طلب جديد على "${product.titleAr}"`,
          messageEn: `You have a new order for "${product.titleEn}"`,
          link: `/dashboard/seller/orders/${order.id}`,
        },
      })

      return { order: updatedOrder, payment, escrow }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Purchase completed successfully",
        data: {
          orderId: result.order.id,
          orderNumber: result.order.orderNumber,
          downloadUrl: result.order.downloadUrl,
          totalAmount: result.order.totalAmount,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    )
  }
}
