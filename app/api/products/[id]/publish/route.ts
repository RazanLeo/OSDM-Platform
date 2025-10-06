import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST - نشر منتج (تحويله من DRAFT إلى PUBLISHED)
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

    const product = await prisma.readyProduct.findUnique({
      where: { id: params.id },
      include: {
        files: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    if (product.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لنشر هذا المنتج' },
        { status: 403 }
      )
    }

    // التحقق من أن المنتج مكتمل
    if (!product.title || !product.description || !product.price) {
      return NextResponse.json(
        {
          success: false,
          error: 'يجب إكمال بيانات المنتج قبل النشر (العنوان، الوصف، السعر)',
        },
        { status: 400 }
      )
    }

    if (!product.thumbnail) {
      return NextResponse.json(
        { success: false, error: 'يجب إضافة صورة مصغرة للمنتج' },
        { status: 400 }
      )
    }

    if (product.files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'يجب إضافة ملف واحد على الأقل للمنتج' },
        { status: 400 }
      )
    }

    // نشر المنتج
    const publishedProduct = await prisma.readyProduct.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    // إنشاء إشعار
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: 'PRODUCT_PUBLISHED',
        title: 'تم نشر المنتج',
        message: `تم نشر المنتج "${product.title}" بنجاح وأصبح متاحاً للمشترين`,
        relatedId: product.id,
      },
    })

    // إنشاء إشعار للإدارة
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'NEW_PRODUCT',
          title: 'منتج جديد',
          message: `تم نشر منتج جديد: "${product.title}"`,
          relatedId: product.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم نشر المنتج بنجاح',
      data: publishedProduct,
    })
  } catch (error: any) {
    console.error('Error publishing product:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في نشر المنتج' },
      { status: 500 }
    )
  }
}
