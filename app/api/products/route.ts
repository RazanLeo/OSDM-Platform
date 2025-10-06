import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema للـ validation
const createProductSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  price: z.number().min(0, 'السعر يجب أن يكون صفر أو أكثر'),
  category: z.string().min(1, 'التصنيف مطلوب'),
  subcategory: z.string().optional(),
  productType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url('رابط الصورة غير صحيح').optional(),
  images: z.array(z.string().url()).optional(),
  demoUrl: z.string().url().optional(),
  licenseType: z.enum(['PERSONAL', 'COMMERCIAL', 'EXTENDED']).optional(),
  compatibility: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
})

// GET - جلب جميع المنتجات مع الفلترة والبحث
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // معاملات البحث والفلترة
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | undefined
    const sellerId = searchParams.get('sellerId') || undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    const bestseller = searchParams.get('bestseller') === 'true' ? true : undefined

    // بناء شروط البحث
    const where: any = {
      AND: [
        // البحث في العنوان والوصف
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } },
              ],
            }
          : {},
        // التصنيف
        category ? { category: { equals: category } } : {},
        subcategory ? { subcategory: { equals: subcategory } } : {},
        // السعر
        { price: { gte: minPrice, lte: maxPrice } },
        // الحالة
        status ? { status } : {},
        // البائع
        sellerId ? { sellerId } : {},
        // مميز
        featured !== undefined ? { featured } : {},
        bestseller !== undefined ? { bestseller } : {},
      ],
    }

    // العد الإجمالي
    const total = await prisma.readyProduct.count({ where })

    // جلب المنتجات
    const products = await prisma.readyProduct.findMany({
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
            sellerProfile: {
              select: {
                verifiedBadge: true,
                rating: true,
                totalSales: true,
                level: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    })

    // حساب الإحصائيات
    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: products,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المنتجات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء منتج جديد
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // التحقق من تسجيل الدخول
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // التحقق من أن المستخدم بائع
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true },
    })

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون بائعاً لإنشاء منتج' },
        { status: 403 }
      )
    }

    // التحقق من رسوم نشر المنتج
    const listingFeeSetting = await prisma.platformSettings.findUnique({
      where: { key: 'PRODUCT_LISTING_FEE' },
    })

    const listingFee = listingFeeSetting?.value
      ? (listingFeeSetting.value as any).amount || 0
      : 0

    if (user.balance < listingFee) {
      return NextResponse.json(
        {
          success: false,
          error: `رصيدك غير كافٍ. يجب أن يكون لديك ${listingFee} ريال على الأقل لنشر منتج`,
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validation
    const validatedData = createProductSchema.parse(body)

    // إنشاء المنتج
    const product = await prisma.readyProduct.create({
      data: {
        ...validatedData,
        sellerId: session.user.id,
        slug: generateSlug(validatedData.title),
        status: 'DRAFT', // يبدأ كمسودة
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
      },
    })

    // خصم رسوم النشر من رصيد البائع (سيتم تفعيله بعد إضافة نظام الدفع)
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { balance: { decrement: listingFee } },
    // })

    // إنشاء إشعار للبائع
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PRODUCT_CREATED',
        title: 'تم إنشاء المنتج',
        message: `تم إنشاء المنتج "${product.title}" بنجاح`,
        relatedId: product.id,
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
    console.error('Error creating product:', error)

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

// دالة مساعدة لإنشاء slug
function generateSlug(title: string): string {
  const arabicToEnglish: { [key: string]: string } = {
    ا: 'a',
    ب: 'b',
    ت: 't',
    ث: 'th',
    ج: 'j',
    ح: 'h',
    خ: 'kh',
    د: 'd',
    ذ: 'dh',
    ر: 'r',
    ز: 'z',
    س: 's',
    ش: 'sh',
    ص: 's',
    ض: 'd',
    ط: 't',
    ظ: 'dh',
    ع: 'a',
    غ: 'gh',
    ف: 'f',
    ق: 'q',
    ك: 'k',
    ل: 'l',
    م: 'm',
    ن: 'n',
    ه: 'h',
    و: 'w',
    ي: 'y',
    ة: 'h',
    ى: 'a',
    ئ: 'e',
    ء: 'a',
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

  // إضافة رقم عشوائي للتفرد
  slug += '-' + Math.random().toString(36).substring(2, 8)

  return slug
}
