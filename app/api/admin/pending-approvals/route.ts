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

    // Get pending products
    const pendingProducts = await prisma.product.findMany({
      where: { status: "PENDING" },
      include: {
        User: {
          select: {
            fullName: true
          }
        }
      },
      take: 20,
      orderBy: {
        createdAt: "desc"
      }
    })

    items.push(...pendingProducts.map(p => ({
      id: p.id,
      type: "Product",
      title: p.titleEn,
      userName: p.User.fullName,
      createdAt: p.createdAt
    })))

    // Get pending services
    const pendingServices = await prisma.service.findMany({
      where: { status: "PENDING" },
      include: {
        User: {
          select: {
            fullName: true
          }
        }
      },
      take: 20,
      orderBy: {
        createdAt: "desc"
      }
    })

    items.push(...pendingServices.map(s => ({
      id: s.id,
      type: "Service",
      title: s.titleEn,
      userName: s.User.fullName,
      createdAt: s.createdAt
    })))

    return NextResponse.json({ items: items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) })
  } catch (error) {
    console.error("Admin pending approvals error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending approvals" },
      { status: 500 }
    )
  }
}
