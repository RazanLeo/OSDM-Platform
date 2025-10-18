import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

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

    const order = await prisma.productOrder.findUnique({
      where: { id: orderId },
      include: {
        Product: {
          include: {
            ProductFile: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Order not completed yet' }, { status: 400 })
    }

    if (order.downloadExpiresAt && new Date(order.downloadExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Download link expired' }, { status: 400 })
    }

    const downloadUrl = order.Product.ProductFile[0]?.fileUrl || order.downloadUrl

    if (!downloadUrl) {
      return NextResponse.json({ error: 'No download available' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.productOrder.update({
        where: { id: orderId },
        data: {
          downloadCount: { increment: 1 },
          updatedAt: new Date(),
        },
      })

      await tx.product.update({
        where: { id: order.productId },
        data: {
          downloadCount: { increment: 1 },
        },
      })

      await tx.downloadLog.create({
        data: {
          id: nanoid(),
          productOrderId: orderId,
          productId: order.productId,
          buyerId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      message: 'Download link generated successfully',
    })
  } catch (error: any) {
    console.error('Error generating download link:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }
}
