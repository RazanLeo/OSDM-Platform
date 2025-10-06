import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema للـ validation
const packageSchema = z.object({
  name: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  price: z.number().min(0),
  deliveryDays: z.number().min(1),
  revisions: z.number().min(0),
  features: z.array(z.string()),
  description: z.string().optional(),
})

const createServiceSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
  category: z.string().min(1, 'التصنيف مطلوب'),
  subcategory: z.string().optional(),
  serviceType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url('رابط الصورة غير صحيح').optional(),
  images: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional(),
  requirements: z.string().optional(),
  packages: z.array(packageSchema).min(1, 'يجب إضافة باقة واحدة على الأقل'),
  deliveryTime: z.enum(['ONE_DAY', 'THREE_DAYS', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'CUSTOM']),
  revisions: z.number().min(0).optional(),
  fastDelivery: z.boolean().optional(),
  commercialUse: z.boolean().optional(),
})

// GET - جلب جميع الخدمات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const deliveryTime = searchParams.get('deliveryTime') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const sellerId = searchParams.get('sellerId') || undefined
    const sellerLevel = searchParams.get('sellerLevel') || undefined

    // بناء شروط البحث
    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } },
              ],
            }
          : {},
        category ? { category } : {},
        subcategory ? { subcategory } : {},
        deliveryTime ? { deliveryTime } : {},
        sellerId ? { sellerId } : {},
        { status: 'PUBLISHED' }, // فقط الخدمات المنشورة
      ],
    }

    // فلترة حسب مستوى البائع
    if (sellerLevel) {
      where.AND.push({
        seller: {
          sellerProfile: {
            level: sellerLevel,
          },
        },
      })
    }

    const total = await prisma.customService.count({ where })

    const services = await prisma.customService.findMany({
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
            profileImage: true,
            country: true,
            sellerProfile: {
              select: {
                verifiedBadge: true,
                rating: true,
                totalSales: true,
                level: true,
                responseTime: true,
                responseRate: true,
              },
            },
          },
        },
        packages: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          },
        },
      },
    })

    // حساب السعر الأدنى لكل خدمة
    const servicesWithMinPrice = services.map((service) => {
      const minPackagePrice =
        service.packages.length > 0
          ? Math.min(...service.packages.map((p) => p.price))
          : 0

      return {
        ...service,
        startingPrice: minPackagePrice,
      }
    })

    // فلترة حسب السعر
    const filteredServices = servicesWithMinPrice.filter(
      (s) => s.startingPrice >= minPrice && s.startingPrice <= maxPrice
    )

    const stats = {
      total: filteredServices.length,
      pages: Math.ceil(filteredServices.length / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: filteredServices.slice((page - 1) * limit, page * limit),
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الخدمات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء خدمة جديدة
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
      include: { sellerProfile: true },
    })

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون بائعاً لإنشاء خدمة' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)

    // فصل الباقات عن بقية البيانات
    const { packages, ...serviceData } = validatedData

    // إنشاء الخدمة
    const service = await prisma.customService.create({
      data: {
        ...serviceData,
        sellerId: session.user.id,
        slug: generateSlug(validatedData.title),
        status: 'DRAFT',
        packages: {
          create: packages,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        packages: true,
      },
    })

    // إنشاء إشعار
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SERVICE_CREATED',
        title: 'تم إنشاء الخدمة',
        message: `تم إنشاء الخدمة "${service.title}" بنجاح`,
        relatedId: service.id,
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
    console.error('Error creating service:', error)

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
