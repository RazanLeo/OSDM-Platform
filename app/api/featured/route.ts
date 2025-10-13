import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    const result: any = {}

    if (type === 'all' || type === 'products') {
      const featuredProducts = await prisma.product.findMany({
        where: {
          isApproved: true,
          isActive: true,
          isFeatured: true,
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
      result.products = featuredProducts
    }

    if (type === 'all' || type === 'services') {
      const featuredServices = await prisma.service.findMany({
        where: {
          isApproved: true,
          isActive: true,
          isFeatured: true,
        },
        include: {
          Seller: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              profileImage: true,
              sellerLevel: true,
              averageRating: true,
            },
          },
          packages: true,
        },
        orderBy: [
          { averageRating: 'desc' },
          { ordersCount: 'desc' },
        ],
        take: limit,
      })
      result.services = featuredServices
    }

    if (type === 'all' || type === 'projects') {
      const featuredProjects = await prisma.project.findMany({
        where: {
          status: 'OPEN',
          isFeatured: true,
        },
        include: {
          Client: {
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
          { budget: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      })
      result.projects = featuredProjects
    }

    if (type === 'all' || type === 'sellers') {
      const topSellers = await prisma.user.findMany({
        where: {
          sellerLevel: { in: ['TOP_RATED', 'LEVEL_2'] },
        },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          profileImage: true,
          bioAr: true,
          bioEn: true,
          sellerLevel: true,
          averageRating: true,
          totalReviews: true,
          skills: true,
          videoIntroUrl: true,
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
        ],
        take: limit,
      })
      result.sellers = topSellers
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching featured items:', error)
    return NextResponse.json({ error: 'Failed to fetch featured items' }, { status: 500 })
  }
}
