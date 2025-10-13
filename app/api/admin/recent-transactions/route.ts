import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = []

    // Get recent product orders
    const productOrders = await prisma.productOrder.findMany({
      where: { status: "COMPLETED" },
      include: {
        Product: {
          select: {
            titleEn: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: "desc"
      }
    })

    items.push(...productOrders.map(o => ({
      id: o.id,
      title: `Product: ${o.Product.titleEn}`,
      amount: Number(o.amount),
      commission: Number(o.amount) * 0.25, // 25% platform commission
      createdAt: o.createdAt
    })))

    return NextResponse.json({ items: items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10) })
  } catch (error) {
    console.error("Admin recent transactions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent transactions" },
      { status: 500 }
    )
  }
}
