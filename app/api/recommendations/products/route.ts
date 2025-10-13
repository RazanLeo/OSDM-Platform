import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const recommendations = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isApproved: true,
        isActive: true,
        OR: [
          { category: product.category },
          { subcategory: product.subcategory },
          { productType: product.productType },
          { tags: { hasSome: product.tags } },
        ],
      },
      include: {
        Seller: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { salesCount: 'desc' },
      ],
      take: limit,
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching product recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
