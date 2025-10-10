import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// ============================================
// GET - List user's escrows
// ============================================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Filters
    const role = searchParams.get('role') || 'all' // buyer | seller | all
    const status = searchParams.get('status') || 'all' // PENDING | HELD | RELEASED | REFUNDED | DISPUTED | CANCELLED
    const marketType = searchParams.get('marketType') || 'all' // PRODUCTS | SERVICES | PROJECTS
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build WHERE clause
    const where: any = {
      AND: [],
    }

    // Filter by role
    if (role === 'buyer') {
      where.AND.push({ buyerId: session.user.id })
    } else if (role === 'seller') {
      where.AND.push({ sellerId: session.user.id })
    } else {
      where.AND.push({
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id },
        ],
      })
    }

    // Filter by status
    if (status !== 'all') {
      where.AND.push({ status })
    }

    // Filter by market type
    if (marketType !== 'all') {
      where.AND.push({ marketType })
    }

    // Count total
    const total = await prisma.escrow.count({ where })

    // Fetch escrows
    const escrows = await prisma.escrow.findMany({
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
            profilePicture: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true,
          },
        },
        productOrder: {
          include: {
            product: {
              select: {
                titleAr: true,
                titleEn: true,
                thumbnail: true,
              },
            },
          },
        },
        serviceOrder: {
          include: {
            service: {
              select: {
                titleAr: true,
                titleEn: true,
                thumbnail: true,
              },
            },
          },
        },
        contract: {
          include: {
            project: {
              select: {
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    })

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
      data: escrows,
      pagination: stats,
    })
  } catch (error: any) {
    console.error('❌ Error fetching escrows:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب سجلات الضمان' },
      { status: 500 }
    )
  }
}
