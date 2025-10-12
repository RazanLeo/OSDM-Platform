import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const acceptSchema = z.object({
  feedback: z.string().min(10).optional(),
})

// POST /api/deliveries/[id]/accept - Accept delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = acceptSchema.parse(body)

    // Get delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        ServiceOrder: true,
      },
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    // Verify user is the buyer
    if (delivery.ServiceOrder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Accept delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        isAccepted: true,
        feedback: validatedData.feedback,
        respondedAt: new Date(),
      },
    })

    // Update order status to COMPLETED
    await prisma.serviceOrder.update({
      where: { id: delivery.serviceOrderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Delivery accepted successfully',
      delivery: updatedDelivery,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error accepting delivery:', error)
    return NextResponse.json(
      { error: 'Failed to accept delivery' },
      { status: 500 }
    )
  }
}
