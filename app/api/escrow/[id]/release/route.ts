import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// POST - Release escrow to seller
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const escrowId = params.id

    // Fetch escrow
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
        productOrder: true,
        serviceOrder: true,
        contract: true,
      },
    })

    if (!escrow) {
      return NextResponse.json(
        { success: false, error: 'سجل الضمان غير موجود' },
        { status: 404 }
      )
    }

    // Check authorization (buyer, admin, or auto-release)
    const isAuthorized =
      escrow.buyerId === session.user.id ||
      session.user.role === 'ADMIN'

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بتحرير هذا الضمان' },
        { status: 403 }
      )
    }

    // Check escrow status
    if (escrow.status !== 'HELD') {
      return NextResponse.json(
        { success: false, error: 'هذا الضمان غير قابل للتحرير حالياً' },
        { status: 400 }
      )
    }

    // Release escrow in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update escrow status
      await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      })

      // 2. Get or create seller's wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: escrow.sellerId },
      })

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: escrow.sellerId,
            balance: new Decimal(0),
            currency: 'SAR',
          },
        })
      }

      // 3. Add amount to seller's wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: escrow.amount,
          },
          totalEarned: {
            increment: escrow.amount,
          },
        },
      })

      // 4. Update order status to COMPLETED
      if (escrow.productOrder) {
        await tx.productOrder.update({
          where: { id: escrow.productOrder.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      } else if (escrow.serviceOrder) {
        await tx.serviceOrder.update({
          where: { id: escrow.serviceOrder.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      } else if (escrow.contract) {
        await tx.contract.update({
          where: { id: escrow.contract.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      }

      // 5. Send notifications
      await tx.notification.createMany({
        data: [
          {
            userId: escrow.sellerId,
            type: 'WALLET',
            title: 'تم إضافة المبلغ لمحفظتك',
            message: `تم تحرير الضمان وإضافة ${escrow.amount} ريال لمحفظتك`,
            link: '/wallet',
            isRead: false,
          },
          {
            userId: escrow.buyerId,
            type: 'ORDER',
            title: 'تم إكمال الطلب',
            message: 'تم إكمال الطلب وتحرير المبلغ للبائع بنجاح',
            isRead: false,
          },
        ],
      })

      // 6. Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'RELEASE_ESCROW',
          entityType: 'Escrow',
          entityId: escrow.id,
          details: {
            amount: escrow.amount.toString(),
            seller: escrow.seller.fullName,
            buyer: escrow.buyer.fullName,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحرير الضمان بنجاح',
    })
  } catch (error: any) {
    console.error('❌ Error releasing escrow:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحرير الضمان' },
      { status: 500 }
    )
  }
}
