import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProjectSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(50).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  skills: z.array(z.string()).optional(),
  budgetType: z.enum(['FIXED', 'HOURLY']).optional(),
  fixedBudget: z.number().min(0).optional(),
  hourlyRateMin: z.number().min(0).optional(),
  hourlyRateMax: z.number().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
  duration: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).optional(),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  attachments: z.array(z.string().url()).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

// GET - جلب مشروع واحد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            country: true,
            city: true,
            memberSince: true,
            totalSpent: true,
            verificationStatus: true,
          },
        },
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
        proposals: {
          include: {
            freelancer: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                country: true,
                freelancerProfile: {
                  select: {
                    bio: true,
                    rating: true,
                    totalEarnings: true,
                    completedProjects: true,
                    skills: true,
                    hourlyRate: true,
                    verifiedBadge: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignedFreelancer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            freelancerProfile: true,
          },
        },
        _count: {
          select: {
            proposals: true,
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

    // زيادة عدد المشاهدات
    await prisma.project.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        totalProposals: project._count.proposals,
      },
    })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشروع' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث مشروع
export async function PATCH(
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

    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (
      existingProject.clientId !== session.user.id &&
      user?.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لتعديل هذا المشروع' },
        { status: 403 }
      )
    }

    // لا يمكن تعديل المشروع إذا كان قيد التنفيذ أو مكتمل
    if (
      existingProject.status === 'IN_PROGRESS' ||
      existingProject.status === 'COMPLETED'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن تعديل المشروع في حالته الحالية',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    await prisma.notification.create({
      data: {
        userId: existingProject.clientId,
        type: 'PROJECT_UPDATED',
        title: 'تم تحديث المشروع',
        message: `تم تحديث المشروع "${updatedProject.title}" بنجاح`,
        relatedId: updatedProject.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      data: updatedProject,
    })
  } catch (error: any) {
    console.error('Error updating project:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المشروع' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مشروع (أو إلغاؤه)
export async function DELETE(
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
        proposals: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (project.clientId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لحذف هذا المشروع' },
        { status: 403 }
      )
    }

    // لا يمكن حذف المشروع إذا كان قيد التنفيذ
    if (project.status === 'IN_PROGRESS') {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المشروع لأنه قيد التنفيذ',
        },
        { status: 400 }
      )
    }

    // إلغاء المشروع بدلاً من الحذف
    await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        deletedAt: new Date(),
      },
    })

    // إنشاء إشعارات للمستقلين الذين قدموا عروضاً
    const freelancerIds = project.proposals.map((p) => p.freelancerId)
    for (const freelancerId of freelancerIds) {
      await prisma.notification.create({
        data: {
          userId: freelancerId,
          type: 'PROJECT_CANCELLED',
          title: 'تم إلغاء المشروع',
          message: `تم إلغاء المشروع "${project.title}" الذي قدمت عرضاً له`,
          relatedId: project.id,
        },
      })
    }

    await prisma.notification.create({
      data: {
        userId: project.clientId,
        type: 'PROJECT_DELETED',
        title: 'تم إلغاء المشروع',
        message: `تم إلغاء المشروع "${project.title}"`,
        relatedId: project.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء المشروع بنجاح',
    })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المشروع' },
      { status: 500 }
    )
  }
}
