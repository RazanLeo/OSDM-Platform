import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - جلب معلومات المحفظة
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        balance: true,
        totalEarnings: true,
        totalSpent: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // جلب السحوبات
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // جلب المعاملات
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: session.user.id },
          {
            order: {
              sellerId: session.user.id,
            },
          },
        ],
        status: 'COMPLETED',
      },
      include: {
        order: {
          select: {
            id: true,
            orderType: true,
            product: {
              select: {
                title: true,
              },
            },
            service: {
              select: {
                title: true,
              },
            },
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // حساب الإحصائيات
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0)

    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0)

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSpent: user.totalSpent,
        totalWithdrawn,
        pendingWithdrawals,
        availableForWithdrawal: user.balance - pendingWithdrawals,
        recentWithdrawals: withdrawals,
        recentTransactions: transactions,
      },
    })
  } catch (error: any) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المحفظة' },
      { status: 500 }
    )
  }
}
