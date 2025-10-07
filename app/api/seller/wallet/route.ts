import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db"

// GET: Get wallet details and transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit
    const sellerId = session.user.id

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { balance: true },
    })

    // Get earnings summary
    const [totalEarnings, pendingEarnings, withdrawnAmount] = await Promise.all(
      [
        prisma.order.aggregate({
          where: {
            sellerId,
            paymentStatus: "PAID",
          },
          _sum: {
            sellerEarnings: true,
          },
        }),
        prisma.order.aggregate({
          where: {
            sellerId,
            status: "COMPLETED",
            paymentStatus: "PAID",
          },
          _sum: {
            sellerEarnings: true,
          },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: sellerId,
            type: "WITHDRAWAL",
            status: "COMPLETED",
          },
          _sum: {
            amount: true,
          },
        }),
      ]
    )

    // Get recent transactions
    const [transactions, totalTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: sellerId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            include: {
              readyProduct: {
                select: {
                  titleAr: true,
                  titleEn: true,
                },
              },
              customService: {
                select: {
                  titleAr: true,
                  titleEn: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaction.count({
        where: { userId: sellerId },
      }),
    ])

    const totalPages = Math.ceil(totalTransactions / limit)

    return NextResponse.json({
      wallet: {
        availableBalance: user?.balance || 0,
        totalEarnings: totalEarnings._sum.sellerEarnings || 0,
        pendingEarnings: pendingEarnings._sum.sellerEarnings || 0,
        withdrawnAmount: withdrawnAmount._sum.amount || 0,
      },
      transactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching wallet data:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    )
  }
}

// POST: Request withdrawal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized - Seller access only" },
        { status: 401 }
      )
    }

    const { amount, method, accountDetails } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const sellerId = session.user.id

    // Check balance
    const user = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { balance: true },
    })

    if (!user || user.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Minimum withdrawal amount (100 SAR)
    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is 100 SAR" },
        { status: 400 }
      )
    }

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: sellerId,
        type: "WITHDRAWAL",
        amount,
        status: "PENDING",
        description: `Withdrawal request via ${method}`,
        metadata: {
          method,
          accountDetails,
          requestedAt: new Date().toISOString(),
        },
      },
    })

    // Deduct from balance
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    })

    return NextResponse.json({
      success: true,
      transaction,
      message: "Withdrawal request submitted successfully",
    })
  } catch (error) {
    console.error("Error requesting withdrawal:", error)
    return NextResponse.json(
      { error: "Failed to process withdrawal request" },
      { status: 500 }
    )
  }
}
