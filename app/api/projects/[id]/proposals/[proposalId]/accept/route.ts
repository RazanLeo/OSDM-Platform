import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST - قبول عرض
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; proposalId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    // يمكن فقط للعميل صاحب المشروع قبول العروض
    if (project.clientId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لقبول هذا العرض' },
        { status: 403 }
      )
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        freelancer: true,
        proposedMilestones: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'العرض غير موجود' },
        { status: 404 }
      )
    }

    if (proposal.projectId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'هذا العرض لا ينتمي لهذا المشروع' },
        { status: 400 }
      )
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'هذا العرض تم الرد عليه بالفعل' },
        { status: 400 }
      )
    }

    // قبول العرض
    const acceptedProposal = await prisma.proposal.update({
      where: { id: params.proposalId },
      data: { status: 'ACCEPTED' },
    })

    // رفض جميع العروض الأخرى
    await prisma.proposal.updateMany({
      where: {
        projectId: params.id,
        id: { not: params.proposalId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    })

    // تحديث حالة المشروع
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'IN_PROGRESS',
        assignedFreelancerId: proposal.freelancerId,
        acceptedProposalId: proposal.id,
      },
    })

    // إنشاء المعالم من العرض المقبول
    if (proposal.proposedMilestones && proposal.proposedMilestones.length > 0) {
      await prisma.milestone.createMany({
        data: proposal.proposedMilestones.map((m) => ({
          projectId: params.id,
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          status: 'PENDING',
        })),
      })
    }

    // إنشاء الطلب (Order)
    const platformFeeSetting = await prisma.platformSettings.findUnique({
      where: { key: 'PLATFORM_FEE' },
    })

    const platformFeePercentage = platformFeeSetting?.value
      ? (platformFeeSetting.value as any).percentage || 25
      : 25

    const platformFee = (proposal.proposedAmount * platformFeePercentage) / 100
    const freelancerAmount = proposal.proposedAmount - platformFee

    const order = await prisma.order.create({
      data: {
        buyerId: project.clientId,
        sellerId: proposal.freelancerId,
        projectId: params.id,
        orderType: 'PROJECT',
        amount: proposal.proposedAmount,
        platformFee,
        sellerAmount: freelancerAmount,
        status: 'IN_PROGRESS',
      },
    })

    // إنشاء محادثة
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: project.clientId,
        participant2Id: proposal.freelancerId,
        projectId: params.id,
        orderId: order.id,
        lastMessageAt: new Date(),
      },
    })

    // إنشاء إشعار للمستقل
    await prisma.notification.create({
      data: {
        userId: proposal.freelancerId,
        type: 'PROPOSAL_ACCEPTED',
        title: 'تم قبول عرضك',
        message: `تهانينا! تم قبول عرضك على المشروع "${project.title}"`,
        relatedId: proposal.id,
      },
    })

    // إنشاء إشعار للعميل
    await prisma.notification.create({
      data: {
        userId: project.clientId,
        type: 'PROJECT_STARTED',
        title: 'بدء المشروع',
        message: `تم قبول العرض وبدء العمل على المشروع "${project.title}"`,
        relatedId: project.id,
      },
    })

    // إنشاع إشعارات للعروض المرفوضة
    const rejectedProposals = await prisma.proposal.findMany({
      where: {
        projectId: params.id,
        id: { not: params.proposalId },
        status: 'REJECTED',
      },
    })

    for (const rejected of rejectedProposals) {
      await prisma.notification.create({
        data: {
          userId: rejected.freelancerId,
          type: 'PROPOSAL_REJECTED',
          title: 'لم يتم قبول عرضك',
          message: `نأسف، لم يتم قبول عرضك على المشروع "${project.title}"`,
          relatedId: rejected.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم قبول العرض بنجاح',
      data: {
        proposal: acceptedProposal,
        project: updatedProject,
        order,
        conversationId: conversation.id,
      },
    })
  } catch (error: any) {
    console.error('Error accepting proposal:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في قبول العرض' },
      { status: 500 }
    )
  }
}
