import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      where: { sellerId: session.user.id },
      include: {
        ServiceCategory: { select: { nameAr: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedServices = services.map(s => ({
      id: s.id,
      titleAr: s.titleAr,
      titleEn: s.titleEn,
      descriptionAr: s.descriptionAr,
      descriptionEn: s.descriptionEn,
      basePrice: parseFloat(s.basePrice?.toString() || '0'),
      thumbnail: s.thumbnail,
      categoryId: s.categoryId,
      status: s.status,
      orderCount: s.orderCount,
      averageRating: parseFloat(s.averageRating?.toString() || '0'),
      createdAt: s.createdAt,
    }))

    return NextResponse.json({ success: true, data: formattedServices })
  } catch (error) {
    console.error('Error fetching seller services:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 })
  }
}
