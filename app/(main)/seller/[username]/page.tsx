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
import { Progress } from '@/components/ui/progress'
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  ShoppingBag,
  Briefcase,
  FileText,
  Award,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import ShareButton from '@/components/products/ShareButton'

interface SellerProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: SellerProfilePageProps): Promise<Metadata> {
  const seller = await prisma.user.findUnique({
    where: { username: params.username }
  })

  if (!seller) {
    return {
      title: 'البائع غير موجود - OSDM',
    }
  }

  return {
    title: `${seller.fullName} - OSDM`,
    description: seller.bio || `ملف البائع ${seller.fullName} على منصة OSDM`,
  }
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const session = await getServerSession(authOptions)

  const seller = await prisma.user.findUnique({
    where: {
      username: params.username
    },
    include: {
      readyProducts: {
        where: { status: 'PUBLISHED' },
        include: {
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 12
      },
      customServices: {
        where: { status: 'PUBLISHED' },
        include: {
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 12
      },
      reviews: {
        include: {
          buyer: {
            select: {
              username: true,
              fullName: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              thumbnail: true
            }
          },
          service: {
            select: {
              id: true,
              title: true,
              thumbnail: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          readyProducts: true,
          customServices: true,
          projects: true,
          orders: true,
          reviews: true
        }
      }
    }
  })

  if (!seller) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === seller.id

  // Calculate stats
  const totalProducts = seller._count.readyProducts
  const totalServices = seller._count.customServices
  const totalSales = seller._count.orders
  const totalReviews = seller._count.reviews
  const averageRating = seller.averageRating || 0

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = seller.reviews.filter(r => r.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

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
    <div className="min-h-screen bg-muted/30">
      {/* Cover Image */}
      <div className="relative h-64 w-full bg-gradient-to-r from-primary/20 to-primary/10">
        {seller.coverImage && (
          <Image
            src={seller.coverImage}
            alt={`${seller.fullName} cover`}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4 -mt-32 pb-12 max-w-7xl">
        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-24 md:pt-6">
            <div className="md:flex md:items-start md:gap-8">
              {/* Avatar */}
              <div className="relative -mt-32 md:-mt-16 mb-6 md:mb-0 flex justify-center md:block">
                <Avatar className="h-40 w-40 border-4 border-background">
                  <AvatarImage src={seller.avatar || undefined} />
                  <AvatarFallback className="text-4xl">{seller.fullName[0]}</AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{seller.fullName}</h1>
                      {seller.sellerBadge && (
                        <Badge className="bg-yellow-500">
                          <Award className="h-3 w-3 ml-1" />
                          {seller.sellerBadge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">@{seller.username}</p>
                    {seller.sellerLevel && (
                      <Badge variant="secondary" className="mb-4">
                        {seller.sellerLevel}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {!isOwnProfile && (
                      <Button asChild>
                        <Link href={`/messages?seller=${seller.username}`}>
                          <MessageCircle className="h-4 w-4 ml-2" />
                          إرسال رسالة
                        </Link>
                      </Button>
                    )}
                    <ShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL}/seller/${seller.username}`}
                      title={seller.fullName}
                    />
                  </div>
                </div>

                {/* Bio */}
                {seller.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {seller.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  {seller.city && seller.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{seller.city}, {seller.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>عضو منذ {formatDistanceToNow(new Date(seller.createdAt), { addSuffix: true, locale: ar })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">التقييم ({totalReviews})</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalProducts}</span>
                </div>
                <p className="text-sm text-muted-foreground">منتج رقمي</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalServices}</span>
                </div>
                <p className="text-sm text-muted-foreground">خدمة مخصصة</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalSales}</span>
                </div>
                <p className="text-sm text-muted-foreground">مبيعات</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">
                  المنتجات ({totalProducts})
                </TabsTrigger>
                <TabsTrigger value="services">
                  الخدمات ({totalServices})
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  التقييمات ({totalReviews})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                {seller.readyProducts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">لا توجد منتجات بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {seller.readyProducts.map((product) => (
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
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                {product.title}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(product.price)}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{product.averageRating?.toFixed(1) || '0'}</span>
                                  <span>({product._count.reviews})</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                {seller.customServices.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">لا توجد خدمات بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {seller.customServices.map((service) => {
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
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                  {service.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs text-muted-foreground">يبدأ من</span>
                                    <p className="text-lg font-bold text-primary">
                                      {formatPrice(startingPrice)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{service.averageRating?.toFixed(1) || '0'}</span>
                                    <span>({service._count.reviews})</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {seller.reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
                      </div>
                    ) : (
                      seller.reviews.map((review, index) => (
                        <div key={review.id}>
                          {index > 0 && <Separator className="my-6" />}
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.buyer.avatar || undefined} />
                              <AvatarFallback>{review.buyer.fullName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.buyer.fullName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ar })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground leading-relaxed mb-2">
                                {review.comment}
                              </p>
                              {(review.product || review.service) && (
                                <Link
                                  href={review.product ? `/products/${review.product.id}` : `/services/${review.service?.id}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  {review.product?.title || review.service?.title}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            {seller.responseTime || seller.completionRate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    إحصائيات الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seller.responseTime && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">وقت الاستجابة</span>
                        </div>
                        <span className="font-semibold">{seller.responseTime}</span>
                      </div>
                    </div>
                  )}

                  {seller.completionRate && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">معدل الإنجاز</span>
                        </div>
                        <span className="font-semibold">{seller.completionRate}%</span>
                      </div>
                      <Progress value={seller.completionRate} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Rating Distribution */}
            {totalReviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>توزيع التقييمات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{rating}</span>
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-left">
                        {count}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {seller.skills && (seller.skills as string[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>المهارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(seller.skills as string[]).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {seller.languages && (seller.languages as string[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>اللغات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(seller.languages as string[]).map((language, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{language}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
