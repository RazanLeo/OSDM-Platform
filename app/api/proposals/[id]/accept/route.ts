import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// POST - Accept a proposal and create contract
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

    const proposalId = params.id

    // Fetch proposal with all relations
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
        freelancer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'العرض غير موجود' },
        { status: 404 }
      )
    }

    // Check if user is the project owner
    if (proposal.project.clientId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بقبول هذا العرض' },
        { status: 403 }
      )
    }

    // Check proposal status
    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'هذا العرض غير متاح للقبول' },
        { status: 400 }
      )
    }

    // Check if project already has a contract
    const existingContract = await prisma.contract.findUnique({
      where: { projectId: proposal.projectId },
    })

    if (existingContract) {
      return NextResponse.json(
        { success: false, error: 'هذا المشروع لديه عقد بالفعل' },
        { status: 400 }
      )
    }

    // Get revenue settings for commission calculation
    const revenueSettings = await prisma.revenueSettings.findFirst()

    const platformCommission = revenueSettings?.platformCommission || new Decimal(25)
    const paymentGatewayFee = revenueSettings?.paymentGatewayFee || new Decimal(5)

    // Calculate amounts
    const totalAmount = proposal.proposedAmount
    const platformFeeAmount = totalAmount.mul(platformCommission).div(100)
    const paymentFeeAmount = totalAmount.mul(paymentGatewayFee).div(100)
    const freelancerEarning = totalAmount.sub(platformFeeAmount).sub(paymentFeeAmount)

    // Generate unique contract number
    const contractNumber = await generateContractNumber()

    // Calculate deadline
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + proposal.deliveryDays)

    // Parse milestones from JSON if exists
    let parsedMilestones: any[] = []
    if (proposal.milestonesJson) {
      try {
        parsedMilestones = JSON.parse(proposal.milestonesJson)
      } catch (e) {
        console.error('Failed to parse milestones JSON:', e)
      }
    }

    // Create contract with transaction
    const contract = await prisma.$transaction(async (tx) => {
      // 1. Create contract
      const newContract = await tx.contract.create({
        data: {
          contractNumber,
          projectId: proposal.projectId,
          clientId: proposal.project.clientId,
          freelancerId: proposal.freelancerId,
          proposalId: proposal.id,
          totalAmount,
          platformFee: platformFeeAmount,
          paymentFee: paymentFeeAmount,
          freelancerEarning,
          deadline,
          status: 'IN_PROGRESS',
        },
        include: {
          project: {
            select: {
              titleAr: true,
              titleEn: true,
            },
          },
          client: {
            select: {
              username: true,
              fullName: true,
            },
          },
          freelancer: {
            select: {
              username: true,
              fullName: true,
            },
          },
        },
      })

      // 2. Create milestones if provided
      if (parsedMilestones.length > 0) {
        await tx.milestone.createMany({
          data: parsedMilestones.map((m: any, index: number) => {
            const milestoneDeadline = new Date()
            milestoneDeadline.setDate(milestoneDeadline.getDate() + (m.duration || 7))

            return {
              contractId: newContract.id,
              title: m.title,
              description: m.description || '',
              amount: new Decimal(m.amount),
              order: index + 1,
              deadline: milestoneDeadline,
              status: 'PENDING',
            }
          }),
        })
      }

      // 3. Update proposal status
      await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      })

      // 4. Reject all other proposals for this project
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      })

      // 5. Update project status
      await tx.project.update({
        where: { id: proposal.projectId },
        data: {
          status: 'IN_PROGRESS',
          closedAt: new Date(),
        },
      })

      // 6. Create payment record
      await tx.payment.create({
        data: {
          amount: totalAmount,
          currency: 'SAR',
          paymentMethod: 'MADA', // سيتم تحديثه بعد اختيار البوابة
          status: 'PENDING',
          marketType: 'PROJECTS',
          contractId: newContract.id,
        },
      })

      // 7. Create escrow to hold funds
      await tx.escrow.create({
        data: {
          amount: freelancerEarning,
          buyerId: proposal.project.clientId,
          sellerId: proposal.freelancerId,
          status: 'PENDING',
          marketType: 'PROJECTS',
          contractId: newContract.id,
        },
      })

      return newContract
    })

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: proposal.project.clientId,
          type: 'CONTRACT',
          title: 'تم إنشاء العقد',
          message: `تم قبول العرض وإنشاء عقد للمشروع "${proposal.project.titleAr}". الرجاء إتمام عملية الدفع.`,
          link: `/contracts/${contract.id}`,
          isRead: false,
        },
        {
          userId: proposal.freelancerId,
          type: 'CONTRACT',
          title: 'تم قبول عرضك',
          message: `تم قبول عرضك على المشروع "${proposal.project.titleAr}". يمكنك الآن البدء في العمل.`,
          link: `/contracts/${contract.id}`,
          isRead: false,
        },
      ],
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCEPT_PROPOSAL',
        entityType: 'Contract',
        entityId: contract.id,
        details: {
          project: proposal.project.titleEn,
          freelancer: proposal.freelancer.username,
          amount: totalAmount.toString(),
          contractNumber,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Fetch contract with milestones for response
    const fullContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        payment: true,
        escrow: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم قبول العرض وإنشاء العقد بنجاح. الرجاء إتمام عملية الدفع.',
        data: {
          contract: {
            id: fullContract?.id,
            contractNumber: fullContract?.contractNumber,
            totalAmount: fullContract?.totalAmount,
            freelancerEarning: fullContract?.freelancerEarning,
            status: fullContract?.status,
            deadline: fullContract?.deadline,
            createdAt: fullContract?.createdAt,
          },
          payment: fullContract?.payment ? {
            id: fullContract.payment.id,
            amount: fullContract.payment.amount,
            status: fullContract.payment.status,
          } : null,
          escrow: fullContract?.escrow ? {
            id: fullContract.escrow.id,
            status: fullContract.escrow.status,
          } : null,
          milestones: fullContract?.milestones || [],
          // Payment URL will be added here after payment gateway integration
          paymentUrl: fullContract?.payment ? `/checkout/${fullContract.payment.id}` : null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error accepting proposal:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في قبول العرض' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique contract number
 * Format: PROJ-YYYY-XXXXXX (e.g., PROJ-2025-000123)
 */
async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PROJ-${year}-`

  // Get last contract number for this year
  const lastContract = await prisma.contract.findFirst({
    where: {
      contractNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  let nextNumber = 1
  if (lastContract) {
    const lastNumber = parseInt(lastContract.contractNumber.split('-')[2])
    nextNumber = lastNumber + 1
  }

  // Pad with zeros (6 digits)
  const paddedNumber = nextNumber.toString().padStart(6, '0')
  return `${prefix}${paddedNumber}`
}
