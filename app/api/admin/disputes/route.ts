import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status) {
      where.status = status
    }

    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
              },
            },
            seller: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
        initiator: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ disputes })
  } catch (error) {
    console.error("Admin disputes fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    )
  }
}
