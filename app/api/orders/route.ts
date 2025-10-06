import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - جلب الطلبات (للبائع أو المشتري)
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
    const type = searchParams.get('type') as 'buyer' | 'seller' | 'all' // buyer = طلباتي كمشتري، seller = طلباتي كبائع
    const status = searchParams.get('status') as
      | 'PENDING'
      | 'PROCESSING'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'REFUNDED'
      | undefined
    const orderType = searchParams.get('orderType') as 'PRODUCT' | 'SERVICE' | 'PROJECT' | undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    let where: any = {}

    if (type === 'buyer') {
      where.buyerId = session.user.id
    } else if (type === 'seller') {
      where.sellerId = session.user.id
    } else if (user?.role === 'ADMIN') {
      // الإدارة يمكنها رؤية جميع الطلبات
      where = {}
    } else {
      // المستخدمون العاديون يرون طلباتهم فقط
      where.OR = [{ buyerId: session.user.id }, { sellerId: session.user.id }]
    }

    if (status) {
      where.status = status
    }

    if (orderType) {
      where.orderType = orderType
    }

    const total = await prisma.order.count({ where })

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        review: true,
      },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلبات' },
      { status: 500 }
    )
  }
}
