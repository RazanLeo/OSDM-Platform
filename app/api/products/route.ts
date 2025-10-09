import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createProductSchema = z.object({
  // Basic Info (Bilingual)
  titleAr: z.string().min(3, 'العنوان العربي يجب أن يكون 3 أحرف على الأقل'),
  titleEn: z.string().min(3, 'English title must be at least 3 characters'),
  descriptionAr: z.string().min(10, 'الوصف العربي يجب أن يكون 10 أحرف على الأقل'),
  descriptionEn: z.string().min(10, 'English description must be at least 10 characters'),

  // Category
  categoryId: z.string().cuid('معرف التصنيف غير صحيح'),

  // Pricing
  price: z.number().min(0, 'السعر يجب أن يكون صفر أو أكثر'),
  originalPrice: z.number().optional(),

  // Media
  thumbnail: z.string().url('رابط الصورة المصغرة غير صحيح'),
  images: z.array(z.string().url()).optional().default([]),
  demoUrl: z.string().url().optional(),

  // Metadata
  tags: z.array(z.string()).optional().default([]),

  // SEO (optional)
  metaTitleAr: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaDescAr: z.string().optional(),
  metaDescEn: z.string().optional(),
})

// ============================================
// GET - List all products with filtering & search
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
        // Price range
        { price: { gte: new Decimal(minPrice), lte: new Decimal(maxPrice) } },
        // Status filter (default: show only APPROVED for public)
        status ? { status } : { status: 'APPROVED' },
        // Seller filter
        sellerId ? { sellerId } : {},
      ],
    }

    // Count total
    const total = await prisma.product.count({ where })

    // Fetch products
    const products = await prisma.product.findMany({
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
        files: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            downloadUrl: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          },
        },
      },
    })

    // Format response based on language
    const formattedProducts = products.map((product) => ({
      ...product,
      title: lang === 'ar' ? product.titleAr : product.titleEn,
      description: lang === 'ar' ? product.descriptionAr : product.descriptionEn,
      category: {
        ...product.category,
        name: lang === 'ar' ? product.category.nameAr : product.category.nameEn,
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
      data: formattedProducts,
      pagination: stats,
    })
  } catch (error: any) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المنتجات' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create new product
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
          error: 'يجب أن يكون لديك اشتراك نشط لإنشاء منتج',
          hint: 'اختر باقة الاشتراك المناسبة: 100/250/500 ريال شهرياً',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation
    const validatedData = createProductSchema.parse(body)

    // Verify category exists
    const category = await prisma.productCategory.findUnique({
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

    // Create product
    const product = await prisma.product.create({
      data: {
        sellerId: session.user.id,
        titleAr: validatedData.titleAr,
        titleEn: validatedData.titleEn,
        descriptionAr: validatedData.descriptionAr,
        descriptionEn: validatedData.descriptionEn,
        slug,
        categoryId: validatedData.categoryId,
        price: new Decimal(validatedData.price),
        originalPrice: validatedData.originalPrice
          ? new Decimal(validatedData.originalPrice)
          : null,
        thumbnail: validatedData.thumbnail,
        images: validatedData.images || [],
        demoUrl: validatedData.demoUrl,
        tags: validatedData.tags || [],
        metaTitleAr: validatedData.metaTitleAr,
        metaTitleEn: validatedData.metaTitleEn,
        metaDescAr: validatedData.metaDescAr,
        metaDescEn: validatedData.metaDescEn,
        status: 'DRAFT', // يبدأ كمسودة
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
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'تم إنشاء المنتج بنجاح',
        message: `تم إنشاء المنتج "${product.titleAr}" كمسودة. يمكنك تعديله ثم نشره للمراجعة.`,
        link: `/seller/products/${product.id}`,
        isRead: false,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PRODUCT',
        entityType: 'Product',
        entityId: product.id,
        details: {
          title: product.titleEn,
          category: category.nameEn,
          price: product.price.toString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المنتج بنجاح',
        data: product,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating product:', error)

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
      { success: false, error: 'فشل في إنشاء المنتج' },
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
    const existing = await prisma.product.findUnique({
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
