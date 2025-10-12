import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productOrderId } = await request.json()

    const order = await prisma.productOrder.findUnique({
      where: { id: productOrderId },
      include: { Product: true },
    })

    if (!order || order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const downloadLog = await prisma.downloadLog.create({
      data: {
        id: nanoid(),
        productOrderId,
        productId: order.productId,
        buyerId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    await prisma.productOrder.update({
      where: { id: productOrderId },
      data: { downloadCount: { increment: 1 } },
    })

    await prisma.product.update({
      where: { id: order.productId },
      data: { downloadCount: { increment: 1 } },
    })

    return NextResponse.json({
      message: 'Download logged',
      downloadUrl: order.downloadUrl,
    })
  } catch (error) {
    console.error('Error logging download:', error)
    return NextResponse.json({ error: 'Failed to log download' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const where: any = {}

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product || product.sellerId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      where.productId = productId
    } else {
      where.buyerId = session.user.id
    }

    const logs = await prisma.downloadLog.findMany({
      where,
      orderBy: { downloadedAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching download logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
