import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Download, Eye } from "lucide-react"
import Image from "next/image"

interface ProductCardProps {
  product: {
    slug: string
    titleAr: string
    titleEn: string
    thumbnail: string | null
    price: number
    averageRating: number
    downloadCount: number
    seller: {
      username: string
      avatar: string | null
    }
  }
  locale: string
  isArabic: boolean
}

export function ProductCard({ product, locale, isArabic }: ProductCardProps) {
  const title = isArabic ? product.titleAr : product.titleEn
  const rating = Number(product.averageRating)

  return (
    <Link href={`/${locale}/marketplace/ready-products/${product.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Product Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-lg overflow-hidden">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground opacity-50">
                  <Eye className="h-12 w-12" />
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div>
              <h3 className="font-semibold line-clamp-2 text-sm md:text-base min-h-[2.5rem]">
                {title}
              </h3>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#846F9C] to-[#4691A9] flex items-center justify-center text-xs text-white font-medium">
                {product.seller.username[0].toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {product.seller.username}
              </p>
            </div>

            {/* Rating & Downloads */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">
                  {rating > 0 ? rating.toFixed(1) : isArabic ? "جديد" : "New"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-3.5 w-3.5" />
                <span>{product.downloadCount}</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-lg font-bold" style={{ color: "#89A58F" }}>
                  {product.price.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90"
              >
                {isArabic ? "عرض" : "View"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
