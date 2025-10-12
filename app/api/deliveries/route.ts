import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema
const deliverySchema = z.object({
  serviceOrderId: z.string(),
  message: z.string().min(10),
  files: z.array(z.string()).min(1),
})

// POST /api/deliveries - Create delivery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = deliverySchema.parse(body)

    // Verify order ownership
    const order = await prisma.serviceOrder.findUnique({
      where: { id: validatedData.serviceOrderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get revision number
    const previousDeliveries = await prisma.delivery.count({
      where: { serviceOrderId: validatedData.serviceOrderId },
    })

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        id: nanoid(),
        serviceOrderId: validatedData.serviceOrderId,
        sellerId: session.user.id,
        message: validatedData.message,
        files: validatedData.files,
        revisionNumber: previousDeliveries,
      },
    })

    // Update order status to DELIVERED
    await prisma.serviceOrder.update({
      where: { id: validatedData.serviceOrderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
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

    console.error('Error creating delivery:', error)
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    )
  }
}

// GET /api/deliveries - List deliveries for an order
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceOrderId = searchParams.get('serviceOrderId')

    if (!serviceOrderId) {
      return NextResponse.json(
        { error: 'serviceOrderId is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this order
    const order = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.sellerId !== session.user.id && order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deliveries = await prisma.delivery.findMany({
      where: { serviceOrderId },
      orderBy: { deliveredAt: 'desc' },
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
