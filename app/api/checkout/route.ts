import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billingInfo, discountCode } = body

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        Product: {
          include: {
            User: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = cartItems.map((item) => {
      const itemTotal = parseFloat(item.Product.price.toString()) * item.quantity
      subtotal += itemTotal

      return {
        productId: item.productId,
        sellerId: item.Product.sellerId,
        quantity: item.quantity,
        price: parseFloat(item.Product.price.toString()),
        subtotal: itemTotal,
      }
    })

    // Apply discount if provided
    let discount = 0
    let discountCodeId = null

    if (discountCode) {
      const discountRecord = await prisma.discountCode.findUnique({
        where: { code: discountCode.toUpperCase() },
      })

      if (discountRecord && discountRecord.isActive) {
        if (discountRecord.type === 'PERCENTAGE') {
          discount = subtotal * (parseFloat(discountRecord.value.toString()) / 100)
        } else {
          discount = parseFloat(discountRecord.value.toString())
        }
        discountCodeId = discountRecord.id

        // Increment usage count
        await prisma.discountCode.update({
          where: { id: discountRecord.id },
          data: { usedCount: { increment: 1 } },
        })
      }
    }

    const total = Math.max(0, subtotal - discount)
    const platformFee = total * 0.25 // 25% platform commission
    const paymentFee = total * 0.05 // 5% payment gateway fee

    // Create order in database
    const orderId = nanoid()
    const order = await prisma.productOrder.create({
      data: {
        id: orderId,
        buyerId: session.user.id,
        subtotal,
        discount,
        total,
        platformFee,
        paymentFee,
        discountCodeId,
        status: 'PENDING',
        billingInfo: JSON.stringify(billingInfo),
      },
    })

    // Create order items
    await Promise.all(
      orderItems.map((item) =>
        prisma.orderItem.create({
          data: {
            id: nanoid(),
            orderId: order.id,
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          },
        })
      )
    )

    // Create Stripe Checkout Session
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'sar',
        product_data: {
          name: item.Product.titleEn,
          description: item.Product.descriptionEn?.substring(0, 300),
          images: item.Product.thumbnail ? [item.Product.thumbnail] : [],
        },
        unit_amount: Math.round(parseFloat(item.Product.price.toString()) * 100), // Convert to halalas
      },
      quantity: item.quantity,
    }))

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/ar/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/ar/checkout/cancel?order_id=${orderId}`,
      metadata: {
        orderId: orderId,
        userId: session.user.id,
      },
      customer_email: billingInfo.email,
    })

    // Update order with Stripe session ID
    await prisma.productOrder.update({
      where: { id: orderId },
      data: { stripeSessionId: stripeSession.id },
    })

    // Clear cart after creating order
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      success: true,
      orderId: orderId,
      checkoutUrl: stripeSession.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
