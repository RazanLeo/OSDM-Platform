import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - Generate secure download link
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const productId = searchParams.get('productId')

    if (!orderId || !productId) {
      return NextResponse.json({ error: 'Missing orderId or productId' }, { status: 400 })
    }

    // Verify user owns this order
    const order = await prisma.productOrder.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            id: true,
            fileUrl: true,
            titleAr: true,
            titleEn: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.product.id !== productId) {
      return NextResponse.json({ error: 'Product mismatch' }, { status: 400 })
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Order not completed' }, { status: 400 })
    }

    // Increment download count
    await prisma.productOrder.update({
      where: { id: orderId },
      data: {
        downloadCount: {
          increment: 1,
        },
        lastDownloadedAt: new Date(),
      },
    })

    // Return download URL directly (user is already authenticated)
    return NextResponse.json({
      success: true,
      fileUrl: order.product.fileUrl,
      productName: order.product.titleAr || order.product.titleEn,
      downloadCount: order.downloadCount + 1,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }
}
