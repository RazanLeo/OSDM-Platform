import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema للتحديث
const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  productType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  demoUrl: z.string().url().optional(),
  licenseType: z.enum(['PERSONAL', 'COMMERCIAL', 'EXTENDED']).optional(),
  compatibility: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SUSPENDED']).optional(),
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
})

// GET - جلب منتج واحد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.readyProduct.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            country: true,
            city: true,
            memberSince: true,
            sellerProfile: {
              select: {
                bio: true,
                verifiedBadge: true,
                rating: true,
                totalSales: true,
                totalEarnings: true,
                level: true,
                responseTime: true,
                responseRate: true,
                skills: true,
                languages: true,
              },
            },
          },
        },
        files: true,
        reviews: {
          include: {
            buyer: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            orders: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // زيادة عدد المشاهدات
    await prisma.readyProduct.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    // حساب متوسط التقييم
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        averageRating: avgRating,
        totalReviews: product._count.reviews,
        totalFavorites: product._count.favorites,
        totalOrders: product._count.orders,
      },
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المنتج' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث منتج
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

    // التحقق من أن المنتج موجود
    const existingProduct = await prisma.readyProduct.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات (البائع أو الإدارة)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (
      existingProduct.sellerId !== session.user.id &&
      user?.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لتعديل هذا المنتج' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // تحديث المنتج
    const updatedProduct = await prisma.readyProduct.update({
      where: { id: params.id },
      data: validatedData,
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

    // إنشاء إشعار
    await prisma.notification.create({
      data: {
        userId: existingProduct.sellerId,
        type: 'PRODUCT_UPDATED',
        title: 'تم تحديث المنتج',
        message: `تم تحديث المنتج "${updatedProduct.title}" بنجاح`,
        relatedId: updatedProduct.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      data: updatedProduct,
    })
  } catch (error: any) {
    console.error('Error updating product:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المنتج' },
      { status: 500 }
    )
  }
}

// DELETE - حذف منتج
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

    const product = await prisma.readyProduct.findUnique({
      where: { id: params.id },
      include: {
        orders: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (product.sellerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لحذف هذا المنتج' },
        { status: 403 }
      )
    }

    // التحقق من وجود طلبات نشطة
    const activeOrders = product.orders.filter(
      (order) => order.status === 'PENDING' || order.status === 'PROCESSING'
    )

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المنتج لأنه يحتوي على طلبات نشطة',
        },
        { status: 400 }
      )
    }

    // حذف المنتج (soft delete)
    await prisma.readyProduct.update({
      where: { id: params.id },
      data: {
        status: 'SUSPENDED',
        deletedAt: new Date(),
      },
    })

    // إنشاء إشعار
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: 'PRODUCT_DELETED',
        title: 'تم حذف المنتج',
        message: `تم حذف المنتج "${product.title}"`,
        relatedId: product.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المنتج' },
      { status: 500 }
    )
  }
}
