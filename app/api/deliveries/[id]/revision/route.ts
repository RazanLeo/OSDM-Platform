import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const revisionSchema = z.object({
  feedback: z.string().min(20),
})

// POST /api/deliveries/[id]/revision - Request revision
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
    const validatedData = revisionSchema.parse(body)

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

    // Check if revisions available
    if (
      !delivery.ServiceOrder.revisions &&
      delivery.ServiceOrder.revisions <= delivery.revisionNumber
    ) {
      return NextResponse.json(
        { error: 'No revisions remaining' },
        { status: 400 }
      )
    }

    // Request revision
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        isAccepted: false,
        feedback: validatedData.feedback,
        respondedAt: new Date(),
      },
    })

    // Update order status back to IN_PROGRESS
    await prisma.serviceOrder.update({
      where: { id: delivery.serviceOrderId },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Revision requested successfully',
      delivery: updatedDelivery,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error requesting revision:', error)
    return NextResponse.json(
      { error: 'Failed to request revision' },
      { status: 500 }
    )
  }
}
