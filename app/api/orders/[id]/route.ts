import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET - جلب طلب واحد
export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            email: true,
          },
        },
        product: {
          include: {
            files: true,
          },
        },
        service: {
          include: {
            packages: true,
          },
        },
        project: {
          include: {
            milestones: true,
          },
        },
        review: true,
        transaction: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (
      order.buyerId !== session.user.id &&
      order.sellerId !== session.user.id &&
      user?.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لرؤية هذا الطلب' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلب' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث حالة الطلب
const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  deliveryFiles: z.array(z.string().url()).optional(),
  deliveryNote: z.string().optional(),
  cancellationReason: z.string().optional(),
})

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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        service: true,
        project: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    // التحقق من الصلاحيات حسب نوع التحديث
    if (validatedData.status) {
      // البائع يمكنه تغيير الحالة إلى IN_PROGRESS أو COMPLETED
      if (
        order.sellerId === session.user.id &&
        (validatedData.status === 'IN_PROGRESS' || validatedData.status === 'COMPLETED')
      ) {
        // مسموح
      }
      // المشتري يمكنه الإلغاء
      else if (order.buyerId === session.user.id && validatedData.status === 'CANCELLED') {
        if (order.status !== 'PENDING') {
          return NextResponse.json(
            { success: false, error: 'لا يمكن إلغاء الطلب بعد بدء العمل عليه' },
            { status: 400 }
          )
        }
      }
      // الإدارة يمكنها تغيير أي حالة
      else if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لتحديث هذا الطلب' },
          { status: 403 }
        )
      }
    }

    // تحديث الطلب
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined,
      },
    })

    // إنشاء إشعارات حسب نوع التحديث
    if (validatedData.status === 'COMPLETED') {
      // إشعار للمشتري
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_COMPLETED',
          title: 'تم تسليم الطلب',
          message: `تم تسليم طلبك. يرجى مراجعته وتقييم التجربة`,
          relatedId: order.id,
        },
      })

      // تحديث إحصائيات البائع
      await prisma.user.update({
        where: { id: order.sellerId },
        data: {
          totalEarnings: { increment: order.sellerAmount },
          totalSales: { increment: 1 },
        },
      })

      if (order.orderType === 'PRODUCT') {
        await prisma.sellerProfile.update({
          where: { userId: order.sellerId },
          data: {
            totalSales: { increment: 1 },
            totalEarnings: { increment: order.sellerAmount },
          },
        })
      } else if (order.orderType === 'PROJECT') {
        await prisma.freelancerProfile.update({
          where: { userId: order.sellerId },
          data: {
            completedProjects: { increment: 1 },
            totalEarnings: { increment: order.sellerAmount },
          },
        })
      }

      // تحديث رصيد البائع (إضافة المبلغ)
      await prisma.user.update({
        where: { id: order.sellerId },
        data: {
          balance: { increment: order.sellerAmount },
        },
      })
    } else if (validatedData.status === 'CANCELLED') {
      // إشعار للبائع
      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          type: 'ORDER_CANCELLED',
          title: 'تم إلغاء الطلب',
          message: `تم إلغاء الطلب من قبل المشتري`,
          relatedId: order.id,
        },
      })

      // إشعار للمشتري
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_CANCELLED',
          title: 'تم إلغاء الطلب',
          message: `تم إلغاء طلبك بنجاح`,
          relatedId: order.id,
        },
      })
    } else if (validatedData.status === 'IN_PROGRESS') {
      // إشعار للمشتري
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_IN_PROGRESS',
          title: 'بدء العمل على الطلب',
          message: `بدأ البائع العمل على طلبك`,
          relatedId: order.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الطلب بنجاح',
      data: updatedOrder,
    })
  } catch (error: any) {
    console.error('Error updating order:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الطلب' },
      { status: 500 }
    )
  }
}
