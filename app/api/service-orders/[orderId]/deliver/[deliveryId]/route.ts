import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for buyer response
const responseSchema = z.object({
  isAccepted: z.boolean(),
  feedback: z.string().min(5, "Feedback must be at least 5 characters"),
})

// PUT /api/service-orders/[orderId]/deliver/[deliveryId] - Accept or request revision
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; deliveryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, deliveryId } = await params
    const body = await request.json()
    const validatedData = responseSchema.parse(body)

    // Find the order
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify buyer ownership
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden - Only buyer can respond to delivery' }, { status: 403 })
    }

    // Find the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    if (delivery.serviceOrderId !== orderId) {
      return NextResponse.json({ error: 'Delivery does not belong to this order' }, { status: 400 })
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        isAccepted: validatedData.isAccepted,
        feedback: validatedData.feedback,
        respondedAt: new Date(),
      },
    })

    // Update order status based on response
    if (validatedData.isAccepted) {
      // Check if revisions exceeded
      const currentRevisions = await prisma.delivery.count({
        where: { serviceOrderId: orderId },
      })

      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      // Revision requested - check if revisions are available
      const currentRevisions = await prisma.delivery.count({
        where: { serviceOrderId: orderId },
      })

      if (currentRevisions > order.revisions && !order.revisions) {
        return NextResponse.json(
          { error: 'No more revisions available' },
          { status: 400 }
        )
      }

      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: {
          status: 'REVISION_REQUESTED',
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      message: validatedData.isAccepted
        ? 'Delivery accepted successfully'
        : 'Revision requested successfully',
      delivery: updatedDelivery,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error responding to delivery:', error)
    return NextResponse.json(
      { error: 'Failed to respond to delivery' },
      { status: 500 }
    )
  }
}
