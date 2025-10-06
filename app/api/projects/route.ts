import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema للـ validation
const createProjectSchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(50, 'الوصف يجب أن يكون 50 حرف على الأقل'),
  category: z.string().min(1, 'التصنيف مطلوب'),
  subcategory: z.string().optional(),
  skills: z.array(z.string()).min(1, 'يجب إضافة مهارة واحدة على الأقل'),
  budgetType: z.enum(['FIXED', 'HOURLY']),
  fixedBudget: z.number().min(0).optional(),
  hourlyRateMin: z.number().min(0).optional(),
  hourlyRateMax: z.number().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
  duration: z.string().min(1, 'المدة مطلوبة'),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
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

// GET - جلب جميع المشاريع
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const budgetType = searchParams.get('budgetType') as 'FIXED' | 'HOURLY' | ''
    const minBudget = parseFloat(searchParams.get('minBudget') || '0')
    const maxBudget = parseFloat(searchParams.get('maxBudget') || '999999')
    const experienceLevel = searchParams.get('experienceLevel') as 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | ''
    const projectSize = searchParams.get('projectSize') as 'SMALL' | 'MEDIUM' | 'LARGE' | ''
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const clientId = searchParams.get('clientId') || undefined
    const status = searchParams.get('status') as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | undefined

    // بناء شروط البحث
    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { skills: { hasSome: [search] } },
              ],
            }
          : {},
        category ? { category } : {},
        subcategory ? { subcategory } : {},
        budgetType ? { budgetType } : {},
        experienceLevel ? { experienceLevel } : {},
        projectSize ? { projectSize } : {},
        clientId ? { clientId } : {},
        status ? { status } : { status: 'OPEN' }, // فقط المشاريع المفتوحة افتراضياً
        skills.length > 0 ? { skills: { hasSome: skills } } : {},
      ],
    }

    // فلترة الميزانية
    if (budgetType === 'FIXED') {
      where.AND.push({
        fixedBudget: { gte: minBudget, lte: maxBudget },
      })
    } else if (budgetType === 'HOURLY') {
      where.AND.push({
        OR: [
          { hourlyRateMin: { gte: minBudget } },
          { hourlyRateMax: { lte: maxBudget } },
        ],
      })
    }

    const total = await prisma.project.count({ where })

    const projects = await prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
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
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: projects,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشاريع' },
      { status: 500 }
    )
  }
}

// POST - إنشاء مشروع جديد
export async function POST(request: NextRequest) {
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
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // يمكن للجميع نشر مشاريع (BUYER, SELLER, ADMIN)
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // فصل المعالم عن بقية البيانات
    const { milestones, ...projectData } = validatedData

    // التحقق من صحة الميزانية
    if (projectData.budgetType === 'FIXED' && !projectData.fixedBudget) {
      return NextResponse.json(
        { success: false, error: 'يجب تحديد الميزانية الثابتة' },
        { status: 400 }
      )
    }

    if (
      projectData.budgetType === 'HOURLY' &&
      (!projectData.hourlyRateMin || !projectData.hourlyRateMax)
    ) {
      return NextResponse.json(
        { success: false, error: 'يجب تحديد المعدل بالساعة' },
        { status: 400 }
      )
    }

    // إنشاء المشروع
    const project = await prisma.project.create({
      data: {
        ...projectData,
        clientId: session.user.id,
        slug: generateSlug(validatedData.title),
        status: 'OPEN',
        milestones: milestones
          ? {
              create: milestones.map((m) => ({
                ...m,
                dueDate: new Date(m.dueDate),
                status: 'PENDING',
              })),
            }
          : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        milestones: true,
      },
    })

    // إنشاء إشعار للعميل
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PROJECT_CREATED',
        title: 'تم إنشاء المشروع',
        message: `تم إنشاء المشروع "${project.title}" بنجاح`,
        relatedId: project.id,
      },
    })

    // إشعار للمستقلين المناسبين (اختياري - يمكن تطويره لاحقاً)
    // يمكن إرسال إشعارات للمستقلين الذين لديهم المهارات المطلوبة

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المشروع بنجاح',
        data: project,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project:', error)

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
      { success: false, error: 'فشل في إنشاء المشروع' },
      { status: 500 }
    )
  }
}

// دالة مساعدة لإنشاء slug
function generateSlug(title: string): string {
  const arabicToEnglish: { [key: string]: string } = {
    ا: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh', د: 'd',
    ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd', ط: 't',
    ظ: 'dh', ع: 'a', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm',
    ن: 'n', ه: 'h', و: 'w', ي: 'y', ة: 'h', ى: 'a', ئ: 'e', ء: 'a',
  }

  let slug = title
    .toLowerCase()
    .split('')
    .map((char) => arabicToEnglish[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  slug += '-' + Math.random().toString(36).substring(2, 8)
  return slug
}
