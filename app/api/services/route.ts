import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const servicePackageSchema = z.object({
  type: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  nameAr: z.string().min(3, 'اسم الباقة العربي يجب أن يكون 3 أحرف على الأقل'),
  nameEn: z.string().min(3, 'Package name must be at least 3 characters'),
  descriptionAr: z.string().min(10, 'وصف الباقة العربي يجب أن يكون 10 أحرف على الأقل'),
  descriptionEn: z.string().min(10, 'Package description must be at least 10 characters'),
  price: z.number().min(0, 'السعر يجب أن يكون صفر أو أكثر'),
  deliveryDays: z.number().min(1, 'أيام التسليم يجب أن تكون 1 على الأقل'),
  revisions: z.number().min(0, 'عدد التعديلات يجب أن يكون صفر أو أكثر'),
  features: z.array(z.string()).min(1, 'يجب إضافة ميزة واحدة على الأقل'),
})

const createServiceSchema = z.object({
  // Basic Info (Bilingual)
  titleAr: z.string().min(3, 'العنوان العربي يجب أن يكون 3 أحرف على الأقل'),
  titleEn: z.string().min(3, 'English title must be at least 3 characters'),
  descriptionAr: z.string().min(20, 'الوصف العربي يجب أن يكون 20 حرف على الأقل'),
  descriptionEn: z.string().min(20, 'English description must be at least 20 characters'),

  // Category
  categoryId: z.string().cuid('معرف التصنيف غير صحيح'),

  // Packages (at least one required)
  packages: z.array(servicePackageSchema).min(1, 'يجب إضافة باقة واحدة على الأقل').max(3, 'يمكنك إضافة 3 باقات كحد أقصى'),

  // Media
  thumbnail: z.string().url('رابط الصورة المصغرة غير صحيح').optional(),
  images: z.array(z.string().url()).optional().default([]),
  videoUrl: z.string().url().optional(),

  // Requirements
  buyerRequirements: z.string().optional(),

  // Metadata
  tags: z.array(z.string()).optional().default([]),

  // SEO (optional)
  metaTitleAr: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaDescAr: z.string().optional(),
  metaDescEn: z.string().optional(),
})

// ============================================
// GET - List all services with filtering & search
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
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
    const status = searchParams.get('status') as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | undefined
    const sellerId = searchParams.get('sellerId') || undefined

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
                { tags: { hasSome: [search] } },
              ],
            }
          : {},
        // Category filter
        categoryId ? { categoryId } : {},
        // Status filter (default: show only APPROVED for public)
        status ? { status } : { status: 'APPROVED' },
        // Seller filter
        sellerId ? { sellerId } : {},
      ],
    }

    // Count total
    const total = await prisma.service.count({ where })

    // Fetch services
    const services = await prisma.service.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        seller: {
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
        packages: {
          orderBy: { price: 'asc' },
          select: {
            id: true,
            type: true,
            nameAr: true,
            nameEn: true,
            descriptionAr: true,
            descriptionEn: true,
            price: true,
            deliveryDays: true,
            revisions: true,
            features: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    // Calculate starting price from packages and apply price filter
    const servicesWithMinPrice = services
      .map((service) => {
        const minPackagePrice =
          service.packages.length > 0
            ? service.packages.reduce((min, pkg) => {
                const price = pkg.price.toNumber()
                return price < min ? price : min
              }, Infinity)
            : 0

        return {
          ...service,
          startingPrice: minPackagePrice,
        }
      })
      .filter((s) => s.startingPrice >= minPrice && s.startingPrice <= maxPrice)

    // Format response based on language
    const formattedServices = servicesWithMinPrice.map((service) => ({
      ...service,
      title: lang === 'ar' ? service.titleAr : service.titleEn,
      description: lang === 'ar' ? service.descriptionAr : service.descriptionEn,
      category: {
        ...service.category,
        name: lang === 'ar' ? service.category.nameAr : service.category.nameEn,
      },
      packages: service.packages.map((pkg) => ({
        ...pkg,
        name: lang === 'ar' ? pkg.nameAr : pkg.nameEn,
        description: lang === 'ar' ? pkg.descriptionAr : pkg.descriptionEn,
      })),
    }))

    // Pagination stats
    const stats = {
      total: formattedServices.length,
      pages: Math.ceil(formattedServices.length / limit),
      currentPage: page,
      limit,
      hasMore: page < Math.ceil(formattedServices.length / limit),
    }

    return NextResponse.json({
      success: true,
      data: formattedServices.slice((page - 1) * limit, page * limit),
      pagination: stats,
    })
  } catch (error: any) {
    console.error('❌ Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الخدمات' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create new service
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

    // Check if user can sell (USER role can be both buyer AND seller in unified account)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Check if user has active subscription
    if (user.subscription.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'يجب أن يكون لديك اشتراك نشط لإنشاء خدمة',
          hint: 'اختر باقة الاشتراك المناسبة: 100/250/500 ريال شهرياً',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation
    const validatedData = createServiceSchema.parse(body)

    // Verify category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'التصنيف المحدد غير موجود' },
        { status: 400 }
      )
    }

    // Generate unique slug from titleEn
    const slug = await generateUniqueSlug(validatedData.titleEn)

    // Separate packages from service data
    const { packages, ...serviceData } = validatedData

    // Create service with packages
    const service = await prisma.service.create({
      data: {
        sellerId: session.user.id,
        titleAr: serviceData.titleAr,
        titleEn: serviceData.titleEn,
        descriptionAr: serviceData.descriptionAr,
        descriptionEn: serviceData.descriptionEn,
        slug,
        categoryId: serviceData.categoryId,
        thumbnail: serviceData.thumbnail,
        images: serviceData.images || [],
        videoUrl: serviceData.videoUrl,
        buyerRequirements: serviceData.buyerRequirements,
        tags: serviceData.tags || [],
        metaTitleAr: serviceData.metaTitleAr,
        metaTitleEn: serviceData.metaTitleEn,
        metaDescAr: serviceData.metaDescAr,
        metaDescEn: serviceData.metaDescEn,
        status: 'DRAFT', // يبدأ كمسودة
        packages: {
          create: packages.map((pkg) => ({
            type: pkg.type,
            nameAr: pkg.nameAr,
            nameEn: pkg.nameEn,
            descriptionAr: pkg.descriptionAr,
            descriptionEn: pkg.descriptionEn,
            price: new Decimal(pkg.price),
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            features: pkg.features,
          })),
        },
      },
      include: {
        seller: {
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
        packages: true,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'تم إنشاء الخدمة بنجاح',
        message: `تم إنشاء الخدمة "${service.titleAr}" كمسودة. يمكنك تعديلها ثم نشرها للمراجعة.`,
        link: `/seller/services/${service.id}`,
        isRead: false,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SERVICE',
        entityType: 'Service',
        entityId: service.id,
        details: {
          title: service.titleEn,
          category: category.nameEn,
          packages: packages.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الخدمة بنجاح',
        data: service,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating service:', error)

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
      { success: false, error: 'فشل في إنشاء الخدمة' },
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
    const existing = await prisma.service.findUnique({
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
