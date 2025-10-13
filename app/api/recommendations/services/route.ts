import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId required' }, { status: 400 })
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const recommendations = await prisma.service.findMany({
      where: {
        id: { not: serviceId },
        isApproved: true,
        isActive: true,
        OR: [
          { category: service.category },
          { subcategory: service.subcategory },
          { tags: { hasSome: service.tags } },
        ],
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
            videoIntroUrl: true,
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

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching service recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
