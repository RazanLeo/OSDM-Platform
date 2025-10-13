import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        await handleSuccessfulPayment(session)
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log("Payment failed:", failedPayment.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(session: any) {
  const { metadata, amount_total, id } = session

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: metadata.userId,
      amount: amount_total / 100, // Convert from cents
      currency: "SAR",
      method: "STRIPE",
      status: "COMPLETED",
      transactionId: id,
      metadata: JSON.stringify(metadata),
    },
  })

  // Create order based on type
  if (metadata.type === "product") {
    await prisma.productOrder.create({
      data: {
        productId: metadata.itemId,
        buyerId: metadata.userId,
        amount: amount_total / 100,
        status: "COMPLETED",
        paymentMethod: "STRIPE",
        paymentStatus: "PAID",
      },
    })

    // Increment download count
    await prisma.product.update({
      where: { id: metadata.itemId },
      data: { downloadCount: { increment: 1 } },
    })

  } else if (metadata.type === "service") {
    await prisma.serviceOrder.create({
      data: {
        serviceId: metadata.itemId,
        buyerId: metadata.userId,
        packageType: metadata.packageType,
        amount: amount_total / 100,
        status: "IN_PROGRESS",
        paymentMethod: "STRIPE",
        paymentStatus: "PAID",
      },
    })

  } else if (metadata.type === "project") {
    // Update proposal to accepted
    await prisma.proposal.update({
      where: { id: metadata.itemId },
      data: { status: "ACCEPTED" },
    })

    // Create project payment
    await prisma.payment.create({
      data: {
        userId: metadata.userId,
        amount: amount_total / 100,
        currency: "SAR",
        method: "STRIPE",
        status: "COMPLETED",
        transactionId: id,
      },
    })
  }

  console.log(`Payment processed successfully: ${id}`)
}
