import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: itemId } = await params
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    })

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: itemId } = await params

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    })

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    })
  } catch (error: any) {
    console.error('Error deleting cart item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete cart item' },
      { status: 500 }
    )
  }
}
