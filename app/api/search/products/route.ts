import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const productType = searchParams.get('productType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isExclusive = searchParams.get('isExclusive')
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

    if (productType) {
      where.productType = productType
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) }
    }

    if (isExclusive) {
      where.isExclusive = isExclusive === 'true'
    }

    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = order
    } else if (sortBy === 'sales') {
      orderBy.salesCount = order
    } else if (sortBy === 'rating') {
      orderBy.averageRating = order
    } else {
      orderBy.createdAt = order
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          Seller: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              profileImage: true,
              averageRating: true,
              totalReviews: true,
            },
          },
          ProductReview: {
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
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}
