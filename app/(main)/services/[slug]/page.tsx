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
  Clock,
  CheckCircle,
  MessageCircle,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import ServicePackages from '@/components/services/ServicePackages'
import ServiceReviews from '@/components/services/ServiceReviews'
import RelatedServices from '@/components/services/RelatedServices'
import ShareButton from '@/components/products/ShareButton'

interface ServicePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await prisma.customService.findUnique({
    where: { slug: params.slug },
    include: { seller: { select: { fullName: true, username: true } } }
  })

  if (!service) {
    return {
      title: 'الخدمة غير موجودة - OSDM',
    }
  }

  return {
    title: `${service.title} - OSDM`,
    description: service.description.substring(0, 160),
    openGraph: {
      title: service.title,
      description: service.description,
      images: [{ url: service.thumbnail }],
    },
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const session = await getServerSession(authOptions)

  const service = await prisma.customService.findUnique({
    where: {
      slug: params.slug,
      status: 'PUBLISHED'
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
          responseTime: true,
          completionRate: true,
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

  if (!service) {
    notFound()
  }

  // Increment view count
  await prisma.customService.update({
    where: { id: service.id },
    data: { views: { increment: 1 } }
  })

  // Calculate average rating
  const averageRating = service.reviews.length > 0
    ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
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

  // Get delivery time label
  const getDeliveryTimeLabel = (time: string) => {
    const labels: Record<string, string> = {
      ONE_DAY: 'يوم واحد',
      THREE_DAYS: '3 أيام',
      ONE_WEEK: 'أسبوع',
      TWO_WEEKS: 'أسبوعين',
      ONE_MONTH: 'شهر'
    }
    return labels[time] || time
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/services" className="hover:text-foreground">الخدمات</Link></li>
          <li>/</li>
          <li><Link href={`/services?category=${service.category.slug}`} className="hover:text-foreground">{service.category.nameAr}</Link></li>
          {service.subcategory && (
            <>
              <li>/</li>
              <li className="text-foreground">{service.subcategory.nameAr}</li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Right Column - Service Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={service.thumbnail}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
                {service.featured && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500">
                    خدمة مميزة
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-base">
                    <div className="flex items-center gap-1">
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
                      <span className="mr-2">
                        {averageRating.toFixed(1)} ({service._count.reviews} تقييم)
                      </span>
                    </div>
                    <span>•</span>
                    <span>{service._count.orders} طلب</span>
                  </CardDescription>
                </div>
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_BASE_URL}/services/${service.slug}`}
                  title={service.title}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">مدة التنفيذ</p>
                    <p className="font-semibold">{getDeliveryTimeLabel(service.deliveryTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">وقت الرد</p>
                    <p className="font-semibold">{service.seller.responseTime || 'سريع'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">معدل الإنجاز</p>
                    <p className="font-semibold">{service.seller.completionRate || 100}%</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Tags */}
              {service.tags && (service.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(service.tags as string[]).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Description */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">الوصف</TabsTrigger>
              <TabsTrigger value="features">ما ستحصل عليه</TabsTrigger>
              <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>وصف الخدمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ما ستحصل عليه</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features && (service.features as string[]).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المتطلبات من العميل</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.requirements && (service.requirements as string[]).map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reviews Section */}
          <ServiceReviews
            serviceId={service.id}
            reviews={service.reviews}
            averageRating={averageRating}
            totalReviews={service._count.reviews}
          />
        </div>

        {/* Left Column - Packages & Seller Info */}
        <div className="space-y-6">
          {/* Service Packages */}
          <ServicePackages
            serviceId={service.id}
            packages={service.packages as any}
            sellerId={service.sellerId}
            currentUserId={session?.user?.id}
          />

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات البائع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/seller/${service.seller.username}`}
                className="flex items-start gap-4 hover:bg-muted p-3 rounded-lg transition-colors"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={service.seller.avatar || undefined} />
                  <AvatarFallback>{service.seller.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{service.seller.fullName}</h4>
                    {service.seller.sellerBadge && (
                      <Badge variant="secondary" className="text-xs">
                        {service.seller.sellerBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{service.seller.username}</p>
                  {service.seller.sellerLevel && (
                    <Badge className="mt-2 text-xs">{service.seller.sellerLevel}</Badge>
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
                      {service.seller.averageRating?.toFixed(1) || 'جديد'}
                    </span>
                    {service.seller.totalReviews > 0 && (
                      <span className="text-muted-foreground">
                        ({service.seller.totalReviews})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المنتجات</span>
                  <span className="font-semibold">{service.seller._count.readyProducts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الخدمات</span>
                  <span className="font-semibold">{service.seller._count.customServices}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المبيعات</span>
                  <span className="font-semibold">{service.seller._count.orders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">عضو منذ</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(service.seller.createdAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/seller/${service.seller.username}`}>
                    عرض الملف الشخصي
                  </Link>
                </Button>

                {session?.user?.id !== service.sellerId && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/messages?seller=${service.seller.username}`}>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      إرسال رسالة
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guarantee Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">ضمان استرجاع الأموال</h4>
                    <p className="text-xs text-muted-foreground">
                      في حال عدم تنفيذ الخدمة كما هو متفق عليه
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">تعديلات مجانية</h4>
                    <p className="text-xs text-muted-foreground">
                      حسب الباقة المختارة
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">تواصل مباشر</h4>
                    <p className="text-xs text-muted-foreground">
                      مع البائع طوال فترة التنفيذ
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Services */}
      <RelatedServices
        categoryId={service.categoryId}
        currentServiceId={service.id}
        className="mt-12"
      />
    </div>
  )
}
