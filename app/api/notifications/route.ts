import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - جلب الإشعارات
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = {
      userId: session.user.id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const total = await prisma.notification.count({ where })

    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      unreadCount,
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإشعارات' },
      { status: 500 }
    )
  }
}

// PATCH - وضع علامة مقروء على الإشعارات
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationIds, markAll } = body

    if (markAll) {
      // وضع علامة مقروء على جميع الإشعارات
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'تم وضع علامة مقروء على جميع الإشعارات',
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // وضع علامة مقروء على إشعارات محددة
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'تم وضع علامة مقروء على الإشعارات',
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الإشعارات' },
      { status: 500 }
    )
  }
}

// DELETE - حذف إشعارات
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (deleteAll) {
      // حذف جميع الإشعارات المقروءة
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          isRead: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'تم حذف جميع الإشعارات المقروءة',
      })
    } else if (notificationId) {
      // حذف إشعار محدد
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'الإشعار غير موجود' },
          { status: 404 }
        )
      }

      if (notification.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لحذف هذا الإشعار' },
          { status: 403 }
        )
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      })

      return NextResponse.json({
        success: true,
        message: 'تم حذف الإشعار بنجاح',
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الإشعارات' },
      { status: 500 }
    )
  }
}
