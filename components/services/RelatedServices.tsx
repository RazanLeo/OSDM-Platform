import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Clock } from 'lucide-react'

interface RelatedServicesProps {
  categoryId: string
  currentServiceId: string
  className?: string
}

export default async function RelatedServices({
  categoryId,
  currentServiceId,
  className
}: RelatedServicesProps) {
  const relatedServices = await prisma.customService.findMany({
    where: {
      categoryId,
      id: { not: currentServiceId },
      status: 'PUBLISHED'
    },
    include: {
      seller: {
        select: {
          username: true,
          fullName: true,
          avatar: true,
          sellerLevel: true
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

  if (relatedServices.length === 0) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  const getDeliveryTimeLabel = (time: string) => {
    const labels: Record<string, string> = {
      ONE_DAY: 'يوم',
      THREE_DAYS: '3 أيام',
      ONE_WEEK: 'أسبوع',
      TWO_WEEKS: 'أسبوعين',
      ONE_MONTH: 'شهر'
    }
    return labels[time] || time
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">خدمات ذات صلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedServices.map((service) => {
          const averageRating = service.averageRating || 0
          const packages = service.packages as any[]
          const startingPrice = packages.length > 0
            ? Math.min(...packages.map((p: any) => p.price))
            : 0

          return (
            <Link key={service.id} href={`/services/${service.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={service.thumbnail}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {service.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">
                        مميزة
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {service.title}
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
                        ({service._count.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getDeliveryTimeLabel(service.deliveryTime)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-muted-foreground">يبدأ من</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(startingPrice)}
                    </span>
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
