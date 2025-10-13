import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sellerLevel: true,
        totalReviews: true,
        averageRating: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const badges: any[] = []

    if (user.sellerLevel === 'TOP_RATED') {
      badges.push({
        id: 'top_rated',
        nameAr: 'بائع مميز',
        nameEn: 'Top Rated Seller',
        icon: '⭐',
        color: 'gold',
      })
    }

    if (user.sellerLevel === 'LEVEL_2') {
      badges.push({
        id: 'level_2',
        nameAr: 'مستوى 2',
        nameEn: 'Level 2 Seller',
        icon: '🥈',
        color: 'silver',
      })
    }

    if (user.sellerLevel === 'LEVEL_1') {
      badges.push({
        id: 'level_1',
        nameAr: 'مستوى 1',
        nameEn: 'Level 1 Seller',
        icon: '🥉',
        color: 'bronze',
      })
    }

    if (user.averageRating >= 4.8 && user.totalReviews >= 50) {
      badges.push({
        id: 'excellent_reviews',
        nameAr: 'تقييمات ممتازة',
        nameEn: 'Excellent Reviews',
        icon: '💎',
        color: 'diamond',
      })
    }

    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365))
    if (accountAge >= 1) {
      badges.push({
        id: 'veteran',
        nameAr: `عضو منذ ${accountAge} سنة`,
        nameEn: `${accountAge} Year Member`,
        icon: '🏆',
        color: 'veteran',
      })
    }

    const [productCount, serviceCount, projectCount] = await Promise.all([
      prisma.product.count({ where: { sellerId: userId, isApproved: true } }),
      prisma.service.count({ where: { sellerId: userId, isApproved: true } }),
      prisma.project.count({ where: { freelancerId: userId, status: 'COMPLETED' } }),
    ])

    if (productCount >= 10) {
      badges.push({
        id: 'prolific_seller',
        nameAr: 'بائع نشط',
        nameEn: 'Prolific Seller',
        icon: '📦',
        color: 'purple',
      })
    }

    if (serviceCount >= 5) {
      badges.push({
        id: 'service_expert',
        nameAr: 'خبير خدمات',
        nameEn: 'Service Expert',
        icon: '🔧',
        color: 'blue',
      })
    }

    if (projectCount >= 20) {
      badges.push({
        id: 'freelance_master',
        nameAr: 'محترف مستقل',
        nameEn: 'Freelance Master',
        icon: '👨‍💼',
        color: 'green',
      })
    }

    return NextResponse.json({ badges })
  } catch (error) {
    console.error('Error fetching seller badges:', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}
