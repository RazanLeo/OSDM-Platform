import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingBag } from "lucide-react"
import Image from "next/image"

interface ServiceCardProps {
  service: {
    slug: string
    titleAr: string
    titleEn: string
    thumbnail: string | null
    averageRating: number
    orderCount: number
    seller: {
      username: string
      avatar: string | null
    }
    packages: Array<{
      type: string
      price: number
    }>
  }
  locale: string
  isArabic: boolean
}

export function ServiceCard({ service, locale, isArabic }: ServiceCardProps) {
  const title = isArabic ? service.titleAr : service.titleEn
  const rating = Number(service.averageRating)

  // Get minimum price from packages
  const minPrice = service.packages.length > 0
    ? Math.min(...service.packages.map(p => Number(p.price)))
    : 0

  // Count package types
  const packageTypes = service.packages.map(p => p.type)
  const hasBasic = packageTypes.includes("BASIC")
  const hasStandard = packageTypes.includes("STANDARD")
  const hasPremium = packageTypes.includes("PREMIUM")

  return (
    <Link href={`/${locale}/marketplace/services/${service.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Service Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-t-lg overflow-hidden">
            {service.thumbnail ? (
              <Image
                src={service.thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground opacity-50">
                  <ShoppingBag className="h-12 w-12" />
                </div>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div>
              <h3 className="font-semibold line-clamp-2 text-sm md:text-base min-h-[2.5rem]">
                {title}
              </h3>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4691A9] to-[#89A58F] flex items-center justify-center text-xs text-white font-medium">
                {service.seller.username[0].toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {service.seller.username}
              </p>
            </div>

            {/* Package Badges */}
            <div className="flex items-center gap-1 flex-wrap">
              {hasBasic && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {isArabic ? "أساسي" : "Basic"}
                </Badge>
              )}
              {hasStandard && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {isArabic ? "متقدم" : "Standard"}
                </Badge>
              )}
              {hasPremium && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {isArabic ? "مميز" : "Premium"}
                </Badge>
              )}
            </div>

            {/* Rating & Orders */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">
                  {rating > 0 ? rating.toFixed(1) : isArabic ? "جديد" : "New"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{service.orderCount} {isArabic ? "طلب" : "orders"}</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "يبدأ من" : "Starting at"}
                </p>
                <p className="text-lg font-bold" style={{ color: "#4691A9" }}>
                  {minPrice.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#4691A9] to-[#89A58F] hover:opacity-90"
              >
                {isArabic ? "عرض الباقات" : "View Packages"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
