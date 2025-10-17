import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema for delivery
const deliverySchema = z.object({
  message: z.string().min(10, "Delivery message must be at least 10 characters"),
  files: z.array(z.string()).min(1, "At least one file is required"),
})

// POST /api/service-orders/[orderId]/deliver - Submit delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const body = await request.json()
    const validatedData = deliverySchema.parse(body)

    // Find the order
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        Service: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify seller ownership
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden - You are not the seller of this order' }, { status: 403 })
    }

    // Check order status - must be in progress
    if (order.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Order must be in progress to deliver. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    // Get current revision count
    const deliveryCount = await prisma.delivery.count({
      where: { serviceOrderId: orderId },
    })

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        id: nanoid(),
        serviceOrderId: orderId,
        sellerId: session.user.id,
        message: validatedData.message,
        files: validatedData.files,
        revisionNumber: deliveryCount,
      },
    })

    // Update order status to DELIVERED
    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        deliveryFiles: validatedData.files,
        deliveryNote: validatedData.message,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Delivery submitted successfully',
      delivery,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error submitting delivery:', error)
    return NextResponse.json(
      { error: 'Failed to submit delivery' },
      { status: 500 }
    )
  }
}

// GET /api/service-orders/[orderId]/deliver - Get all deliveries for order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params

    // Find the order
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify user is part of this order (buyer or seller)
    if (order.sellerId !== session.user.id && order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all deliveries
    const deliveries = await prisma.delivery.findMany({
      where: { serviceOrderId: orderId },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        deliveredAt: 'desc',
      },
    })

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
}
