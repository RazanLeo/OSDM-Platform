import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Star,
  CheckCircle,
  Shield,
  Clock,
  MessageCircle,
  Eye,
  Video,
  RotateCcw,
  Zap,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"

interface ServicePageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  })

  if (!service) {
    return {
      title: params.locale === "ar" ? "الخدمة غير موجودة - OSDM" : "Service Not Found - OSDM",
    }
  }

  const isArabic = params.locale === "ar"
  const title = isArabic ? service.titleAr : service.titleEn
  const description = isArabic ? service.descriptionAr : service.descriptionEn

  return {
    title: `${title} - OSDM`,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description,
      images: [{ url: service.thumbnail }],
    },
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { locale, slug } = await params
  const isArabic = locale === "ar"
  const session = await getServerSession(authOptions)

  // Fetch service with all related data
  const service = await prisma.service.findUnique({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      User: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              Service: true,
            },
          },
        },
      },
      ServiceCategory: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      ServicePackage: {
        orderBy: {
          price: "asc",
        },
      },
      _count: {
        select: {
          ServiceOrder: true,
        },
      },
    },
  })

  if (!service) {
    notFound()
  }

  // Increment view count
  await prisma.service.update({
    where: { id: service.id },
    data: { viewCount: { increment: 1 } },
  })

  // Get related services
  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      status: "ACTIVE",
      id: { not: service.id },
    },
    include: {
      User: {
        select: {
          username: true,
          avatar: true,
        },
      },
      ServicePackage: {
        orderBy: {
          price: "asc",
        },
        take: 1,
      },
    },
    take: 4,
  })

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const title = isArabic ? service.titleAr : service.titleEn
  const description = isArabic ? service.descriptionAr : service.descriptionEn
  const categoryName = isArabic ? service.ServiceCategory.nameAr : service.ServiceCategory.nameEn

  // Get packages
  const basicPackage = service.ServicePackage.find((pkg) => pkg.type === "BASIC")
  const standardPackage = service.ServicePackage.find((pkg) => pkg.type === "STANDARD")
  const premiumPackage = service.ServicePackage.find((pkg) => pkg.type === "PREMIUM")

  // Calculate starting price
  const startingPrice = service.ServicePackage.length > 0
    ? Math.min(...service.ServicePackage.map(pkg => Number(pkg.price)))
    : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>
              {isArabic ? "الرئيسية" : "Home"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/marketplace/services`}>
              {isArabic ? "الخدمات" : "Services"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/${locale}/marketplace/services?category=${service.ServiceCategory.id}`}
            >
              {categoryName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left - Service Info */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

          {/* Seller Info */}
          <Link
            href={`/${locale}/seller/${service.User.username}`}
            className="flex items-center gap-3 hover:bg-muted p-3 rounded-lg transition-colors w-fit"
          >
            <Avatar>
              <AvatarImage src={service.User.avatar || undefined} />
              <AvatarFallback>{service.User.fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{service.User.fullName}</p>
              <p className="text-sm text-muted-foreground">@{service.User.username}</p>
            </div>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Number(service.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-muted-foreground">
                {Number(service.averageRating).toFixed(1)} ({service.reviewCount}{" "}
                {isArabic ? "تقييم" : "reviews"})
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{service.orderCount} {isArabic ? "طلب" : "orders"}</span>
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Starting Price */}
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {isArabic ? "يبدأ من" : "Starting at"}
            </p>
            <p className="text-3xl font-bold text-primary">{formatPrice(startingPrice)}</p>
          </div>
        </div>

        {/* Right - Main Image/Video */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                {service.videoUrl ? (
                  <div className="relative w-full h-full">
                    <Video className="absolute inset-0 m-auto h-16 w-16 text-white z-10 cursor-pointer" />
                    <Image
                      src={service.thumbnail}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <Image
                    src={service.thumbnail}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          {service.images && service.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {service.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                >
                  <Image src={image} alt={`${title} - ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Packages Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          {isArabic ? "اختر الباقة المناسبة" : "Choose Your Package"}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic Package */}
          {basicPackage && (
            <Card className="relative">
              <CardHeader>
                <CardTitle>{isArabic ? basicPackage.nameAr : basicPackage.nameEn}</CardTitle>
                <CardDescription>
                  {isArabic ? basicPackage.descriptionAr : basicPackage.descriptionEn}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(Number(basicPackage.price))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {basicPackage.deliveryDays} {isArabic ? "يوم" : "days"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      {basicPackage.revisions} {isArabic ? "تعديل" : "revisions"}
                    </span>
                  </div>
                </div>

                <Separator />

                <ul className="space-y-2">
                  {basicPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" asChild>
                  <Link href={`/${locale}/checkout/service/${service.id}?package=BASIC`}>
                    {isArabic ? "اطلب الآن" : "Order Now"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Standard Package */}
          {standardPackage && (
            <Card className="relative border-primary border-2">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                {isArabic ? "الأكثر طلباً" : "Most Popular"}
              </Badge>
              <CardHeader>
                <CardTitle>{isArabic ? standardPackage.nameAr : standardPackage.nameEn}</CardTitle>
                <CardDescription>
                  {isArabic ? standardPackage.descriptionAr : standardPackage.descriptionEn}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(Number(standardPackage.price))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {standardPackage.deliveryDays} {isArabic ? "يوم" : "days"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      {standardPackage.revisions} {isArabic ? "تعديل" : "revisions"}
                    </span>
                  </div>
                </div>

                <Separator />

                <ul className="space-y-2">
                  {standardPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" asChild>
                  <Link href={`/${locale}/checkout/service/${service.id}?package=STANDARD`}>
                    {isArabic ? "اطلب الآن" : "Order Now"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Premium Package */}
          {premiumPackage && (
            <Card className="relative">
              <CardHeader>
                <CardTitle>{isArabic ? premiumPackage.nameAr : premiumPackage.nameEn}</CardTitle>
                <CardDescription>
                  {isArabic ? premiumPackage.descriptionAr : premiumPackage.descriptionEn}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(Number(premiumPackage.price))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {premiumPackage.deliveryDays} {isArabic ? "يوم" : "days"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      {premiumPackage.revisions} {isArabic ? "تعديل" : "revisions"}
                    </span>
                  </div>
                </div>

                <Separator />

                <ul className="space-y-2">
                  {premiumPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" asChild>
                  <Link href={`/${locale}/checkout/service/${service.id}?package=PREMIUM`}>
                    {isArabic ? "اطلب الآن" : "Order Now"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">
                {isArabic ? "الوصف" : "Description"}
              </TabsTrigger>
              <TabsTrigger value="seller">
                {isArabic ? "معلومات البائع" : "About Seller"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "وصف الخدمة" : "Service Description"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seller" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "عن البائع" : "About the Seller"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={service.User.avatar || undefined} />
                      <AvatarFallback>{service.User.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{service.User.fullName}</h3>
                      <p className="text-muted-foreground">@{service.User.username}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {isArabic ? "الخدمات" : "Services"}
                      </p>
                      <p className="text-2xl font-bold">{service.User._count.Service}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {isArabic ? "عضو منذ" : "Member since"}
                      </p>
                      <p className="font-semibold">
                        {formatDistanceToNow(new Date(service.User.createdAt), {
                          addSuffix: true,
                          locale: isArabic ? ar : enUS,
                        })}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/${locale}/seller/${service.User.username}`}>
                      {isArabic ? "عرض الملف الشخصي" : "View Profile"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Seller */}
          {session?.user?.id !== service.sellerId && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/${locale}/messages?seller=${service.User.username}`}>
                    <MessageCircle className="h-4 w-4 ml-2" />
                    {isArabic ? "تواصل مع البائع" : "Contact Seller"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    {isArabic ? "ضمان الجودة" : "Quality Guarantee"}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      {isArabic ? "✓ دفع آمن 100%" : "✓ 100% Secure Payment"}
                    </li>
                    <li>
                      {isArabic ? "✓ ضمان التسليم في الموعد" : "✓ On-Time Delivery Guarantee"}
                    </li>
                    <li>
                      {isArabic ? "✓ تعديلات مجانية حسب الباقة" : "✓ Free Revisions as Per Package"}
                    </li>
                    <li>
                      {isArabic ? "✓ استرجاع الأموال في حالة عدم الرضا" : "✓ Money-Back if Not Satisfied"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {isArabic ? "خدمات ذات صلة" : "Related Services"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedServices.map((relatedService) => {
              const startPrice = relatedService.ServicePackage.length > 0
                ? Number(relatedService.ServicePackage[0].price)
                : 0
              return (
                <Link
                  key={relatedService.id}
                  href={`/${locale}/marketplace/services/${relatedService.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <Image
                        src={relatedService.thumbnail}
                        alt={isArabic ? relatedService.titleAr : relatedService.titleEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {isArabic ? relatedService.titleAr : relatedService.titleEn}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {isArabic ? "يبدأ من" : "Starting at"}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(startPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {Number(relatedService.averageRating).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
