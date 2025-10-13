import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const comparisonSchema = z.object({
  productIds: z.array(z.string()).min(2).max(5),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productIds } = comparisonSchema.parse(body)

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isApproved: true,
        isActive: true,
      },
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
        packages: true,
      },
    })

    if (products.length < 2) {
      return NextResponse.json({ error: 'At least 2 valid products required' }, { status: 400 })
    }

    const comparison = products.map(product => ({
      id: product.id,
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      price: product.price,
      images: product.images,
      category: product.category,
      subcategory: product.subcategory,
      productType: product.productType,
      isExclusive: product.isExclusive,
      previewImages: product.previewImages,
      salesCount: product.salesCount,
      averageRating: product.averageRating,
      totalReviews: product.ProductReview.length,
      seller: product.Seller,
      packages: product.packages,
      features: {
        hasLicense: product.licenseType !== null,
        hasAffiliateProgram: product.affiliateCommission > 0,
        isSubscription: product.isSubscription,
        fileSize: product.fileSize,
        fileType: product.fileType,
      },
    }))

    return NextResponse.json({ comparison })
  } catch (error) {
    console.error('Error comparing products:', error)
    return NextResponse.json({ error: 'Failed to compare products' }, { status: 500 })
  }
}
