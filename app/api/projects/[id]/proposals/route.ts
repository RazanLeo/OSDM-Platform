import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema لتقديم عرض
const createProposalSchema = z.object({
  coverLetter: z.string().min(50, 'يجب كتابة رسالة تعريفية (50 حرف على الأقل)'),
  proposedAmount: z.number().min(0, 'المبلغ المقترح يجب أن يكون صفر أو أكثر'),
  proposedDuration: z.string().min(1, 'المدة المقترحة مطلوبة'),
  attachments: z.array(z.string().url()).optional(),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      amount: z.number().min(0),
      dueDate: z.string(),
    })
  ).optional(),
})

// GET - جلب جميع العروض لمشروع معين
export async function GET(
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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    // يمكن فقط للعميل صاحب المشروع أو الإدارة رؤية جميع العروض
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (project.clientId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لرؤية العروض' },
        { status: 403 }
      )
    }

    const proposals = await prisma.proposal.findMany({
      where: { projectId: params.id },
      include: {
        freelancer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            country: true,
            city: true,
            freelancerProfile: {
              select: {
                bio: true,
                rating: true,
                totalEarnings: true,
                completedProjects: true,
                skills: true,
                hourlyRate: true,
                verifiedBadge: true,
                portfolio: true,
              },
            },
          },
        },
        proposedMilestones: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: proposals,
      total: proposals.length,
    })
  } catch (error: any) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب العروض' },
      { status: 500 }
    )
  }
}

// POST - تقديم عرض على مشروع
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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'هذا المشروع لم يعد مفتوحاً للعروض' },
        { status: 400 }
      )
    }

    // التحقق من أن المستخدم مستقل
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { freelancerProfile: true },
    })

    if (!user || (user.role !== 'FREELANCER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون مستقلاً لتقديم عرض' },
        { status: 403 }
      )
    }

    // لا يمكن تقديم عرض على مشروعك الخاص
    if (project.clientId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك تقديم عرض على مشروعك الخاص' },
        { status: 400 }
      )
    }

    // التحقق من عدم تقديم عرض سابق
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId: params.id,
        freelancerId: session.user.id,
      },
    })

    if (existingProposal) {
      return NextResponse.json(
        { success: false, error: 'لقد قدمت عرضاً بالفعل على هذا المشروع' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = createProposalSchema.parse(body)

    const { milestones, ...proposalData } = validatedData

    // إنشاء العرض
    const proposal = await prisma.proposal.create({
      data: {
        ...proposalData,
        projectId: params.id,
        freelancerId: session.user.id,
        status: 'PENDING',
        proposedMilestones: milestones
          ? {
              create: milestones.map((m) => ({
                ...m,
                dueDate: new Date(m.dueDate),
              })),
            }
          : undefined,
      },
      include: {
        freelancer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            freelancerProfile: true,
          },
        },
        proposedMilestones: true,
      },
    })

    // تحديث عدد العروض في المشروع
    await prisma.project.update({
      where: { id: params.id },
      data: {
        proposalsCount: { increment: 1 },
      },
    })

    // إنشاء إشعار للعميل
    await prisma.notification.create({
      data: {
        userId: project.clientId,
        type: 'NEW_PROPOSAL',
        title: 'عرض جديد',
        message: `تلقيت عرضاً جديداً من ${user.fullName} على المشروع "${project.title}"`,
        relatedId: proposal.id,
      },
    })

    // إنشاء إشعار للمستقل
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PROPOSAL_SENT',
        title: 'تم إرسال العرض',
        message: `تم إرسال عرضك على المشروع "${project.title}" بنجاح`,
        relatedId: proposal.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم تقديم العرض بنجاح',
        data: proposal,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating proposal:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تقديم العرض' },
      { status: 500 }
    )
  }
}
