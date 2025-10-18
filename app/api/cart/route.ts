import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        Product: {
          include: {
            User: {
              select: {
                fullName: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedItems = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        titleAr: item.Product.titleAr,
        titleEn: item.Product.titleEn,
        thumbnail: item.Product.thumbnail,
        price: parseFloat(item.Product.price.toString()),
        seller: {
          name: item.Product.User.fullName || item.Product.User.username,
        },
      },
      quantity: item.quantity,
    }))

    return NextResponse.json({
      success: true,
      data: formattedItems,
    })
  } catch (error: any) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    if (existingItem) {
      // Update quantity
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Cart updated',
      })
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        productId,
        quantity,
      },
    })

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Added to cart',
    })
  } catch (error: any) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
