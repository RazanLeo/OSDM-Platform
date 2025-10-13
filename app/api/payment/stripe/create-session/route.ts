import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, itemId, packageType, quantity = 1 } = body

    if (!type || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    let item: any
    let amount: number
    let description: string
    let successUrl: string
    let cancelUrl: string

    // Fetch item details based on type
    if (type === "product") {
      item = await prisma.product.findUnique({
        where: { id: itemId },
        include: { User: true }
      })

      if (!item) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      amount = Number(item.price) * 100 // Convert to cents
      description = `Product: ${item.titleEn}`
      successUrl = `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=product&id=${itemId}`
      cancelUrl = `${process.env.NEXTAUTH_URL}/marketplace/ready-products/${item.slug}`

    } else if (type === "service") {
      item = await prisma.service.findUnique({
        where: { id: itemId },
        include: {
          User: true,
          ServicePackage: true
        }
      })

      if (!item) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }

      const selectedPackage = item.ServicePackage.find((pkg: any) => pkg.type === packageType)
      if (!selectedPackage) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 })
      }

      amount = Number(selectedPackage.price) * 100
      description = `Service: ${item.titleEn} - ${selectedPackage.type} Package`
      successUrl = `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=service&id=${itemId}`
      cancelUrl = `${process.env.NEXTAUTH_URL}/marketplace/services/${item.slug}`

    } else if (type === "project") {
      const proposal = await prisma.proposal.findUnique({
        where: { id: itemId },
        include: {
          Project: {
            include: { User: true }
          },
          User: true
        }
      })

      if (!proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
      }

      amount = Number(proposal.proposedAmount) * 100
      description = `Project: ${proposal.Project.titleEn}`
      successUrl = `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=project&id=${itemId}`
      cancelUrl = `${process.env.NEXTAUTH_URL}/marketplace/projects/${proposal.Project.slug}`

    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Calculate fees
    const platformCommission = amount * STRIPE_CONFIG.platformCommission
    const gatewayFee = amount * STRIPE_CONFIG.paymentGatewayFee
    const sellerAmount = amount - platformCommission - gatewayFee

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency.toLowerCase(),
            product_data: {
              name: description,
              description: `Platform Commission: ${STRIPE_CONFIG.platformCommission * 100}% | Gateway Fee: ${STRIPE_CONFIG.paymentGatewayFee * 100}%`,
            },
            unit_amount: amount,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        type,
        itemId,
        packageType: packageType || "",
        platformCommission: platformCommission.toString(),
        gatewayFee: gatewayFee.toString(),
        sellerAmount: sellerAmount.toString(),
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error("Stripe session creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    )
  }
}
