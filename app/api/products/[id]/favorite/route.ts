import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST - إضافة/إزالة من المفضلة
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
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من وجوده في المفضلة
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.id,
        },
      },
    })

    if (existingFavorite) {
      // إزالة من المفضلة
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: params.id,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'تمت إزالة المنتج من المفضلة',
        favorited: false,
      })
    } else {
      // إضافة للمفضلة
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          productId: params.id,
          itemType: 'PRODUCT',
        },
      })

      // إنشاء إشعار للبائع
      await prisma.notification.create({
        data: {
          userId: product.sellerId,
          type: 'NEW_FAVORITE',
          title: 'إضافة للمفضلة',
          message: `تمت إضافة منتجك "${product.title}" للمفضلة`,
          relatedId: product.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'تمت إضافة المنتج للمفضلة',
        favorited: true,
      })
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المفضلة' },
      { status: 500 }
    )
  }
}

// GET - التحقق من وجود المنتج في المفضلة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({
        success: true,
        favorited: false,
      })
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      favorited: !!favorite,
    })
  } catch (error: any) {
    console.error('Error checking favorite:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في التحقق من المفضلة' },
      { status: 500 }
    )
  }
}
