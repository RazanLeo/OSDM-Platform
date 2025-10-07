import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// Resolve dispute
export async function PATCH(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { disputeId } = params
    const body = await request.json()
    const { resolution, favoredParty, refundAmount } = body

    // Update dispute status
    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      },
      include: {
        order: {
          include: {
            buyer: true,
            seller: true,
          },
        },
      },
    })

    // If refund is needed, update order status
    if (refundAmount && refundAmount > 0) {
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
        },
      })

      // Update buyer and seller balances
      await prisma.user.update({
        where: { id: dispute.order.buyerId },
        data: {
          balance: {
            increment: refundAmount,
          },
        },
      })

      if (favoredParty === "seller") {
        // Seller keeps the money
        await prisma.user.update({
          where: { id: dispute.order.sellerId },
          data: {
            balance: {
              increment: dispute.order.sellerAmount - refundAmount,
            },
          },
        })
      }
    }

    // Create notifications for both parties
    await prisma.notification.createMany({
      data: [
        {
          userId: dispute.order.buyerId,
          type: "NEW_DISPUTE",
          titleAr: "تم حل النزاع",
          titleEn: "Dispute Resolved",
          messageAr: `تم حل النزاع الخاص بطلبك. ${resolution}`,
          messageEn: `Your dispute has been resolved. ${resolution}`,
          link: `/ar/dashboard/buyer/orders/${dispute.orderId}`,
        },
        {
          userId: dispute.order.sellerId,
          type: "NEW_DISPUTE",
          titleAr: "تم حل النزاع",
          titleEn: "Dispute Resolved",
          messageAr: `تم حل النزاع الخاص بطلبك. ${resolution}`,
          messageEn: `The dispute has been resolved. ${resolution}`,
          link: `/ar/dashboard/seller/orders/${dispute.orderId}`,
        },
      ],
    })

    return NextResponse.json({
      success: true,
      dispute,
    })
  } catch (error) {
    console.error("Admin dispute resolve error:", error)
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    )
  }
}
