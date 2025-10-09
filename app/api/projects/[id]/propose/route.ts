import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const milestoneSchema = z.object({
  title: z.string().min(3, 'عنوان المرحلة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  amount: z.number().min(0, 'المبلغ يجب أن يكون صفر أو أكثر'),
  duration: z.number().int().min(1, 'المدة يجب أن تكون يوم واحد على الأقل'),
})

const createProposalSchema = z.object({
  coverLetter: z.string().min(50, 'الرسالة التقديمية يجب أن تكون 50 حرف على الأقل'),
  proposedAmount: z.number().min(1, 'المبلغ المقترح يجب أن يكون أكبر من صفر'),
  deliveryDays: z.number().int().min(1, 'أيام التسليم يجب أن تكون يوم واحد على الأقل'),
  attachments: z.array(z.string().url()).optional().default([]),
  milestones: z.array(milestoneSchema).optional().default([]),
})

// ============================================
// POST - Submit a proposal (freelancer applies to project)
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

    const projectId = params.id
    const body = await request.json()

    // Validation
    const validatedData = createProposalSchema.parse(body)

    // Fetch project with client
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    // Check project status
    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'هذا المشروع غير مفتوح لاستقبال العروض' },
        { status: 400 }
      )
    }

    // Check if user is trying to apply to their own project
    if (project.clientId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك التقديم على مشروعك الخاص' },
        { status: 400 }
      )
    }

    // Check if user already submitted a proposal for this project
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId,
        freelancerId: session.user.id,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    })

    if (existingProposal) {
      return NextResponse.json(
        {
          success: false,
          error: 'لقد قمت بالفعل بتقديم عرض لهذا المشروع',
          proposalId: existingProposal.id,
        },
        { status: 400 }
      )
    }

    // Validate proposed amount is within project budget range
    const proposedAmount = new Decimal(validatedData.proposedAmount)
    if (project.budgetMin && project.budgetMax) {
      if (proposedAmount.lt(project.budgetMin) || proposedAmount.gt(project.budgetMax)) {
        return NextResponse.json(
          {
            success: false,
            error: `المبلغ المقترح يجب أن يكون بين ${project.budgetMin} و ${project.budgetMax} ريال`,
          },
          { status: 400 }
        )
      }
    }

    // Validate milestones total equals proposed amount (if milestones provided)
    if (validatedData.milestones.length > 0) {
      const milestonesTotal = validatedData.milestones.reduce(
        (sum, m) => sum + m.amount,
        0
      )
      if (Math.abs(milestonesTotal - validatedData.proposedAmount) > 0.01) {
        return NextResponse.json(
          {
            success: false,
            error: 'مجموع مبالغ المراحل يجب أن يساوي المبلغ المقترح الإجمالي',
          },
          { status: 400 }
        )
      }
    }

    // Get freelancer info
    const freelancer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        fullName: true,
      },
    })

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: session.user.id,
        coverLetter: validatedData.coverLetter,
        proposedAmount,
        deliveryDays: validatedData.deliveryDays,
        attachments: validatedData.attachments,
        milestonesJson: validatedData.milestones.length > 0
          ? JSON.stringify(validatedData.milestones)
          : null,
        status: 'PENDING',
      },
      include: {
        freelancer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true,
            isVerified: true,
            country: true,
          },
        },
        project: {
          select: {
            titleAr: true,
            titleEn: true,
          },
        },
      },
    })

    // Update project proposal count
    await prisma.project.update({
      where: { id: projectId },
      data: {
        proposalCount: {
          increment: 1,
        },
      },
    })

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: session.user.id,
          type: 'SYSTEM',
          title: 'تم تقديم العرض بنجاح',
          message: `تم تقديم عرضك على المشروع "${project.titleAr}" بنجاح. سيتم إعلامك عند قبول العرض.`,
          link: `/freelancer/proposals/${proposal.id}`,
          isRead: false,
        },
        {
          userId: project.clientId,
          type: 'PROPOSAL',
          title: 'عرض جديد على مشروعك',
          message: `تلقيت عرضاً جديداً من ${freelancer?.fullName} على مشروع "${project.titleAr}"`,
          link: `/projects/${project.id}/proposals/${proposal.id}`,
          isRead: false,
        },
      ],
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PROPOSAL',
        entityType: 'Proposal',
        entityId: proposal.id,
        details: {
          project: project.titleEn,
          proposedAmount: proposedAmount.toString(),
          deliveryDays: validatedData.deliveryDays,
          client: project.client.username,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم تقديم العرض بنجاح',
        data: {
          proposal: {
            id: proposal.id,
            proposedAmount: proposal.proposedAmount,
            deliveryDays: proposal.deliveryDays,
            status: proposal.status,
            createdAt: proposal.createdAt,
          },
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating proposal:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تقديم العرض' },
      { status: 500 }
    )
  }
}
