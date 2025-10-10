import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createDisputeSchema = z.object({
  reason: z.string().min(20, 'السبب يجب أن يكون 20 حرف على الأقل'),
  details: z.string().min(50, 'التفاصيل يجب أن تكون 50 حرف على الأقل'),
  evidence: z.array(z.string().url()).optional().default([]),
})

// ============================================
// POST - Create dispute from escrow
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const escrowId = params.id
    const body = await request.json()
    const validatedData = createDisputeSchema.parse(body)

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        productOrder: { include: { product: true } },
        serviceOrder: { include: { service: true } },
        contract: { include: { project: true } },
      },
    })

    if (!escrow) {
      return NextResponse.json(
        { success: false, error: 'سجل الضمان غير موجود' },
        { status: 404 }
      )
    }

    // Check if buyer initiated and within 7-day window
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'فقط المشتري يمكنه فتح نزاع' },
        { status: 403 }
      )
    }

    if (escrow.status !== 'HELD') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن فتح نزاع على هذا الضمان' },
        { status: 400 }
      )
    }

    // Create dispute in transaction
    const dispute = await prisma.$transaction(async (tx) => {
      // Update escrow
      await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: 'DISPUTED' },
      })

      // Create dispute
      const newDispute = await tx.dispute.create({
        data: {
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          escrowId: escrow.id,
          productOrderId: escrow.productOrderId,
          serviceOrderId: escrow.serviceOrderId,
          contractId: escrow.contractId,
          reason: validatedData.reason,
          buyerEvidence: validatedData.details,
          buyerAttachments: validatedData.evidence,
          amount: escrow.amount,
          status: 'OPEN',
        },
      })

      // Notify seller
      await tx.notification.create({
        data: {
          userId: escrow.sellerId,
          type: 'DISPUTE',
          title: 'تم فتح نزاع',
          message: `تم فتح نزاع من قبل المشتري. يرجى تقديم ردك.`,
          link: `/disputes/${newDispute.id}`,
          isRead: false,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_DISPUTE',
          entityType: 'Dispute',
          entityId: newDispute.id,
          details: {
            reason: validatedData.reason,
            amount: escrow.amount.toString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return newDispute
    })

    return NextResponse.json({
      success: true,
      message: 'تم فتح النزاع بنجاح',
      data: { disputeId: dispute.id },
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating dispute:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في فتح النزاع' },
      { status: 500 }
    )
  }
}
