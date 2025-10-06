import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Download,
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle,
  FileText,
  Shield,
  Clock,
  MessageCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import AddToCartButton from '@/components/products/AddToCartButton'
import FavoriteButton from '@/components/products/FavoriteButton'
import ShareButton from '@/components/products/ShareButton'
import ProductReviews from '@/components/products/ProductReviews'
import RelatedProducts from '@/components/products/RelatedProducts'

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.readyProduct.findUnique({
    where: { slug: params.slug },
    include: { seller: { select: { fullName: true, username: true } } }
  })

  if (!product) {
    return {
      title: 'المنتج غير موجود - OSDM',
    }
  }

  return {
    title: `${product.title} - OSDM`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.thumbnail }],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const session = await getServerSession(authOptions)

  // Fetch product with all related data
  const product = await prisma.readyProduct.findUnique({
    where: {
      slug: params.slug,
      status: 'PUBLISHED' // Only show published products
    },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          sellerLevel: true,
          sellerBadge: true,
          averageRating: true,
          totalReviews: true,
          createdAt: true,
          _count: {
            select: {
              readyProducts: true,
              customServices: true,
              orders: true
            }
          }
        }
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true
        }
      },
      subcategory: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true
        }
      },
      reviews: {
        include: {
          buyer: {
            select: {
              username: true,
              fullName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          orders: true
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Check if user has favorited this product
  let isFavorited = false
  if (session?.user?.id) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id
        }
      }
    })
    isFavorited = !!favorite
  }

  // Increment view count
  await prisma.readyProduct.update({
    where: { id: product.id },
    data: { views: { increment: 1 } }
  })

  // Calculate average rating
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-foreground">المنتجات</Link></li>
          <li>/</li>
          <li><Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">{product.category.nameAr}</Link></li>
          {product.subcategory && (
            <>
              <li>/</li>
              <li className="text-foreground">{product.subcategory.nameAr}</li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Right Column - Product Images & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
                {product.featured && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500">
                    منتج مميز
                  </Badge>
                )}
                {product.bestseller && (
                  <Badge className="absolute top-4 left-4 bg-green-500">
                    الأكثر مبيعاً
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors">
                  <Image
                    src={image}
                    alt={`${product.title} - صورة ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">الوصف</TabsTrigger>
              <TabsTrigger value="features">المميزات</TabsTrigger>
              <TabsTrigger value="license">الترخيص</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>وصف المنتج</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>مميزات المنتج</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {product.features && (product.features as string[]).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="license" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الترخيص</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-semibold">
                        {product.licenseType === 'PERSONAL' && 'ترخيص شخصي'}
                        {product.licenseType === 'COMMERCIAL' && 'ترخيص تجاري'}
                        {product.licenseType === 'EXTENDED' && 'ترخيص موسع'}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.licenseType === 'PERSONAL' && 'يمكنك استخدام المنتج في مشاريعك الشخصية فقط'}
                        {product.licenseType === 'COMMERCIAL' && 'يمكنك استخدام المنتج في مشاريعك التجارية'}
                        {product.licenseType === 'EXTENDED' && 'يمكنك استخدام المنتج في مشاريع متعددة وإعادة بيعه'}
                      </p>
                    </div>
                  </div>
                  {product.licenseDetails && (
                    <p className="text-sm text-muted-foreground">
                      {product.licenseDetails}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reviews Section */}
          <ProductReviews
            productId={product.id}
            reviews={product.reviews}
            averageRating={averageRating}
            totalReviews={product._count.reviews}
          />
        </div>

        {/* Left Column - Purchase Card & Seller Info */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-2xl">{product.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= averageRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">
                  {averageRating.toFixed(1)} ({product._count.reviews} تقييم)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <Badge variant="destructive" className="mt-2">
                    خصم {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>{product._count.orders} مبيعات</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{product._count.favorites} مفضل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: ar })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{product.fileSize || 'متنوع'}</span>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {product.tags && (product.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(product.tags as string[]).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <AddToCartButton productId={product.id} />

                <div className="grid grid-cols-2 gap-2">
                  <FavoriteButton
                    productId={product.id}
                    initialFavorited={isFavorited}
                  />
                  <ShareButton
                    url={`${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`}
                    title={product.title}
                  />
                </div>

                {session?.user?.id !== product.sellerId && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/messages?seller=${product.seller.username}`}>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      تواصل مع البائع
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات البائع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/seller/${product.seller.username}`}
                className="flex items-start gap-4 hover:bg-muted p-3 rounded-lg transition-colors"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={product.seller.avatar || undefined} />
                  <AvatarFallback>{product.seller.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{product.seller.fullName}</h4>
                    {product.seller.sellerBadge && (
                      <Badge variant="secondary" className="text-xs">
                        {product.seller.sellerBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{product.seller.username}</p>
                  {product.seller.sellerLevel && (
                    <Badge className="mt-2 text-xs">{product.seller.sellerLevel}</Badge>
                  )}
                </div>
              </Link>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">التقييم</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {product.seller.averageRating?.toFixed(1) || 'جديد'}
                    </span>
                    {product.seller.totalReviews > 0 && (
                      <span className="text-muted-foreground">
                        ({product.seller.totalReviews})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المنتجات</span>
                  <span className="font-semibold">{product.seller._count.readyProducts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الخدمات</span>
                  <span className="font-semibold">{product.seller._count.customServices}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المبيعات</span>
                  <span className="font-semibold">{product.seller._count.orders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">عضو منذ</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(product.seller.createdAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/seller/${product.seller.username}`}>
                  عرض الملف الشخصي
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">شراء آمن ومضمون</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ دفع آمن 100%</li>
                    <li>✓ تحميل فوري بعد الدفع</li>
                    <li>✓ دعم فني متواصل</li>
                    <li>✓ ضمان استرجاع الأموال</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        categoryId={product.categoryId}
        currentProductId={product.id}
        className="mt-12"
      />
    </div>
  )
}
