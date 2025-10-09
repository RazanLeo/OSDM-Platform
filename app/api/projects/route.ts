import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createProjectSchema = z.object({
  // Basic Info (Bilingual)
  titleAr: z.string().min(5, 'العنوان العربي يجب أن يكون 5 أحرف على الأقل'),
  titleEn: z.string().min(5, 'English title must be at least 5 characters'),
  descriptionAr: z.string().min(50, 'الوصف العربي يجب أن يكون 50 حرف على الأقل'),
  descriptionEn: z.string().min(50, 'English description must be at least 50 characters'),

  // Category
  categoryId: z.string().cuid('معرف التصنيف غير صحيح'),

  // Budget
  budgetType: z.enum(['FIXED', 'HOURLY']),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),

  // Timeline
  duration: z.number().int().min(1, 'المدة يجب أن تكون يوم واحد على الأقل'), // عدد الأيام
  deadline: z.string().optional(), // ISO date string

  // Requirements
  skills: z.array(z.string()).min(1, 'يجب إضافة مهارة واحدة على الأقل'),
  attachments: z.array(z.string().url()).optional().default([]),
})

// ============================================
// GET - List all projects with filtering & search
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Search & Filter
    const search = searchParams.get('search') || ''
    const lang = searchParams.get('lang') || 'ar' // ar or en
    const categoryId = searchParams.get('categoryId') || ''
    const budgetType = searchParams.get('budgetType') as 'FIXED' | 'HOURLY' | ''
    const minBudget = parseFloat(searchParams.get('minBudget') || '0')
    const maxBudget = parseFloat(searchParams.get('maxBudget') || '999999')
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
    const status = searchParams.get('status') as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | undefined
    const clientId = searchParams.get('clientId') || undefined

    // Build WHERE clause
    const where: any = {
      AND: [
        // Search in titles and descriptions (bilingual)
        search
          ? {
              OR: [
                { titleAr: { contains: search, mode: 'insensitive' } },
                { titleEn: { contains: search, mode: 'insensitive' } },
                { descriptionAr: { contains: search, mode: 'insensitive' } },
                { descriptionEn: { contains: search, mode: 'insensitive' } },
                { skills: { hasSome: [search] } },
              ],
            }
          : {},
        // Category filter
        categoryId ? { categoryId } : {},
        // Budget type filter
        budgetType ? { budgetType } : {},
        // Status filter (default: show only OPEN for public)
        status ? { status } : { status: 'OPEN' },
        // Client filter
        clientId ? { clientId } : {},
        // Skills filter
        skills.length > 0 ? { skills: { hasSome: skills } } : {},
      ],
    }

    // Budget range filter
    if (budgetType === 'FIXED' || !budgetType) {
      where.AND.push({
        OR: [
          {
            AND: [
              { budgetMin: { gte: new Decimal(minBudget) } },
              { budgetMin: { lte: new Decimal(maxBudget) } },
            ],
          },
          {
            AND: [
              { budgetMax: { gte: new Decimal(minBudget) } },
              { budgetMax: { lte: new Decimal(maxBudget) } },
            ],
          },
        ],
      })
    }

    // Count total
    const total = await prisma.project.count({ where })

    // Fetch projects
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
            profilePicture: true,
            country: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    })

    // Format response based on language
    const formattedProjects = projects.map((project) => ({
      ...project,
      title: lang === 'ar' ? project.titleAr : project.titleEn,
      description: lang === 'ar' ? project.descriptionAr : project.descriptionEn,
      category: {
        ...project.category,
        name: lang === 'ar' ? project.category.nameAr : project.category.nameEn,
      },
    }))

    // Pagination stats
    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      hasMore: page < Math.ceil(total / limit),
    }

    return NextResponse.json({
      success: true,
      data: formattedProjects,
      pagination: stats,
    })
  } catch (error: any) {
    console.error('❌ Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشاريع' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create new project
// ============================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // Anyone can post projects (unified account system)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validation
    const validatedData = createProjectSchema.parse(body)

    // Verify category exists
    const category = await prisma.projectCategory.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'التصنيف المحدد غير موجود' },
        { status: 400 }
      )
    }

    // Validate budget based on type
    if (!validatedData.budgetMin || !validatedData.budgetMax) {
      return NextResponse.json(
        { success: false, error: 'يجب تحديد نطاق الميزانية (الحد الأدنى والأقصى)' },
        { status: 400 }
      )
    }

    if (validatedData.budgetMin > validatedData.budgetMax) {
      return NextResponse.json(
        { success: false, error: 'الحد الأدنى للميزانية يجب أن يكون أقل من الحد الأقصى' },
        { status: 400 }
      )
    }

    // Generate unique slug from titleEn
    const slug = await generateUniqueSlug(validatedData.titleEn)

    // Parse deadline if provided
    const deadline = validatedData.deadline ? new Date(validatedData.deadline) : null

    // Create project
    const project = await prisma.project.create({
      data: {
        clientId: session.user.id,
        titleAr: validatedData.titleAr,
        titleEn: validatedData.titleEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        slug,
        categoryId: validatedData.categoryId,
        budgetMin: new Decimal(validatedData.budgetMin),
        budgetMax: new Decimal(validatedData.budgetMax),
        budgetType: validatedData.budgetType,
        duration: validatedData.duration,
        deadline,
        skills: validatedData.skills,
        attachments: validatedData.attachments,
        status: 'OPEN',
        publishedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'تم نشر المشروع بنجاح',
        message: `تم نشر مشروعك "${project.titleAr}" بنجاح. سيتمكن المستقلون الآن من تقديم عروضهم.`,
        link: `/projects/${project.id}`,
        isRead: false,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PROJECT',
        entityType: 'Project',
        entityId: project.id,
        details: {
          title: project.titleEn,
          category: category.nameEn,
          budgetType: project.budgetType,
          budgetRange: `${project.budgetMin}-${project.budgetMax} SAR`,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم نشر المشروع بنجاح',
        data: project,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating project:', error)

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
      { success: false, error: 'فشل في نشر المشروع' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique slug from title
 * Ensures uniqueness by checking database
 */
async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .trim()

  let slug = baseSlug
  let counter = 1

  // Check if slug exists, if yes, append counter
  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
    })

    if (!existing) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
