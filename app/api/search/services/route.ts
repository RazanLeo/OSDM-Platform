import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sellerLevel = searchParams.get('sellerLevel')
    const deliveryTime = searchParams.get('deliveryTime')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      isApproved: true,
      isActive: true,
    }

    if (query) {
      where.OR = [
        { titleAr: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { descriptionAr: { contains: query, mode: 'insensitive' } },
        { descriptionEn: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (subcategory) {
      where.subcategory = subcategory
    }

    if (minPrice || maxPrice) {
      where.packages = {
        some: {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        },
      }
    }

    if (sellerLevel) {
      where.Seller = {
        sellerLevel: sellerLevel,
      }
    }

    if (deliveryTime) {
      where.packages = {
        some: {
          deliveryDays: { lte: parseInt(deliveryTime) },
        },
      }
    }

    const orderBy: any = {}
    if (sortBy === 'orders') {
      orderBy.ordersCount = order
    } else if (sortBy === 'rating') {
      orderBy.averageRating = order
    } else {
      orderBy.createdAt = order
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          Seller: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              profileImage: true,
              sellerLevel: true,
              averageRating: true,
              totalReviews: true,
              videoIntroUrl: true,
            },
          },
          packages: true,
          ServiceReview: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ])

    return NextResponse.json({
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error searching services:', error)
    return NextResponse.json({ error: 'Failed to search services' }, { status: 500 })
  }
}
