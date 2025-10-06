import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
  className?: string
}

export default async function RelatedProducts({
  categoryId,
  currentProductId,
  className
}: RelatedProductsProps) {
  const relatedProducts = await prisma.readyProduct.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      status: 'PUBLISHED'
    },
    include: {
      seller: {
        select: {
          username: true,
          fullName: true,
          avatar: true
        }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    },
    take: 4,
    orderBy: {
      sales: 'desc'
    }
  })

  if (relatedProducts.length === 0) {
    return null
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const averageRating = product.averageRating || 0

          return (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">
                        مميز
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= averageRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        ({product._count.reviews})
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
