import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Download,
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle,
  FileText,
  Shield,
  Clock,
  MessageCircle,
  Eye,
  ExternalLink,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"

interface ProductPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
  })

  if (!product) {
    return {
      title: locale === "ar" ? "المنتج غير موجود - OSDM" : "Product Not Found - OSDM",
    }
  }

  const isArabic = locale === "ar"
  const title = isArabic ? product.titleAr : product.titleEn
  const description = isArabic ? product.descriptionAr : product.descriptionEn

  return {
    title: `${title} - OSDM`,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description,
      images: [{ url: product.thumbnail }],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params
  const isArabic = locale === "ar"
  const session = await getServerSession(authOptions)

  // Fetch product with all related data
  const product = await prisma.product.findUnique({
    where: {
      slug,
      status: "APPROVED",
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
              Product: true,
            },
          },
        },
      },
      ProductCategory: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      ProductReview: {
        include: {
          User_ProductReview_reviewerIdToUser: {
            select: {
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          ProductReview: true,
          ProductOrder: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  })

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: "APPROVED",
      id: { not: product.id },
    },
    include: {
      User: {
        select: {
          username: true,
          avatar: true,
        },
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

  const title = isArabic ? product.titleAr : product.titleEn
  const description = isArabic ? product.descriptionAr : product.descriptionEn
  const categoryName = isArabic ? product.ProductCategory.nameAr : product.ProductCategory.nameEn

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
            <BreadcrumbLink href={`/${locale}/marketplace/ready-products`}>
              {isArabic ? "المنتجات" : "Products"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/${locale}/marketplace/ready-products?category=${product.ProductCategory.id}`}
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column - Product Images & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={product.thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* Picalica Preview Images Gallery */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isArabic ? "معاينة الصور - Picalica Style" : "Preview Images - Picalica Style"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer hover:border-primary transition-all hover:scale-105"
                    >
                      <Image src={image} alt={`${title} - ${index + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gumroad Subscription Packages */}
          {product.packages && product.packages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "باقات الاشتراك - Gumroad" : "Subscription Packages - Gumroad"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {product.packages.map((pkg: any, index: number) => (
                    <div key={index} className="p-4 border-2 rounded-lg hover:border-primary transition-colors">
                      <h4 className="font-bold text-lg mb-2">{pkg.name}</h4>
                      <p className="text-2xl font-bold text-primary mb-4">{formatPrice(pkg.price)}</p>
                      <ul className="space-y-2 text-sm">
                        {pkg.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4" asChild>
                        <Link href={`/${locale}/checkout/product/${product.id}?package=${index}`}>
                          {isArabic ? "اشترك الآن" : "Subscribe Now"}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">
                {isArabic ? "الوصف" : "Description"}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {isArabic ? "التقييمات" : "Reviews"} ({product._count.ProductReview})
              </TabsTrigger>
              <TabsTrigger value="affiliate">
                {isArabic ? "التسويق بالعمولة" : "Affiliate Program"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "وصف المنتج" : "Product Description"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {product.demoUrl && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">
                            {isArabic ? "معاينة المنتج" : "Product Demo"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isArabic
                              ? "شاهد المنتج قبل الشراء"
                              : "Preview the product before purchase"}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 ml-2" />
                            {isArabic ? "معاينة" : "Demo"}
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? "تقييمات العملاء" : "Customer Reviews"} (
                    {product._count.ProductReview})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.ProductReview.length > 0 ? (
                    <div className="space-y-6">
                      {product.ProductReview.map((review) => (
                        <div key={review.id} className="flex gap-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                review.User_ProductReview_reviewerIdToUser.avatar || undefined
                              }
                            />
                            <AvatarFallback>
                              {review.User_ProductReview_reviewerIdToUser.fullName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">
                                  {review.User_ProductReview_reviewerIdToUser.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  @{review.User_ProductReview_reviewerIdToUser.username}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-muted-foreground mb-2">{review.comment}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                                locale: isArabic ? ar : enUS,
                              })}
                            </p>
                            {review.sellerResponse && (
                              <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-semibold mb-1">
                                  {isArabic ? "رد البائع:" : "Seller Response:"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {review.sellerResponse}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد تقييمات بعد" : "No reviews yet"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="affiliate" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "برنامج التسويق بالعمولة - Gumroad Affiliate" : "Affiliate Program - Gumroad"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                    <h3 className="font-bold text-xl mb-2">
                      {isArabic ? "احصل على عمولة 10% لكل عملية بيع!" : "Earn 10% commission on every sale!"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {isArabic
                        ? "انضم لبرنامج التسويق بالعمولة واربح عند كل عملية بيع تتم عبر رابطك"
                        : "Join our affiliate program and earn money for every sale through your link"}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/marketplace/ready-products/${product.slug}?ref=YOUR_CODE`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <Button variant="outline">
                        {isArabic ? "نسخ" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-green-600">10%</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isArabic ? "عمولة على كل عملية بيع" : "Commission per sale"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">30</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isArabic ? "يوم صلاحية الكوكيز" : "Days cookie duration"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">∞</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isArabic ? "عمولات غير محدودة" : "Unlimited commissions"}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/${locale}/affiliate/join?product=${product.id}`}>
                      {isArabic ? "انضم للبرنامج الآن" : "Join Program Now"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Purchase Card & Seller Info */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Number(product.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Number(product.averageRating).toFixed(1)} ({product._count.ProductReview}{" "}
                  {isArabic ? "تقييم" : "reviews"})
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(Number(product.price))}
                  </span>
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(Number(product.originalPrice))}
                    </span>
                  )}
                </div>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <Badge variant="destructive" className="mt-2">
                    {isArabic ? "خصم" : "Save"}{" "}
                    {Math.round(
                      ((Number(product.originalPrice) - Number(product.price)) /
                        Number(product.originalPrice)) *
                        100
                    )}
                    %
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {product.downloadCount} {isArabic ? "مبيعات" : "sales"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {product.viewCount} {isArabic ? "مشاهدة" : "views"}
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDistanceToNow(new Date(product.createdAt), {
                      addSuffix: true,
                      locale: isArabic ? ar : enUS,
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Picalica Badges */}
              {(product.isExclusive || product.productType) && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {product.isExclusive && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        {isArabic ? "🏆 حصري" : "🏆 Exclusive"}
                      </Badge>
                    )}
                    {product.productType && (
                      <Badge variant="secondary" className="capitalize">
                        {product.productType}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Discount Code Input */}
              <div className="space-y-2">
                <Separator />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isArabic ? "كود الخصم" : "Discount Code"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    id="discountCode"
                  />
                  <Button variant="outline" type="button" onClick={() => {
                    const code = (document.getElementById('discountCode') as HTMLInputElement)?.value
                    if (code) {
                      fetch(`/api/discount-codes/validate?code=${code}&productId=${product.id}`)
                        .then(r => r.json())
                        .then(data => {
                          if (data.valid) {
                            alert(isArabic ? `تم تطبيق الخصم: ${data.discount}%` : `Discount applied: ${data.discount}%`)
                          } else {
                            alert(isArabic ? 'كود خصم غير صالح' : 'Invalid discount code')
                          }
                        })
                    }
                  }}>
                    {isArabic ? "تطبيق" : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/${locale}/checkout/product/${product.id}`}>
                    <ShoppingCart className="h-5 w-5 ml-2" />
                    {isArabic ? "شراء الآن" : "Buy Now"}
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/${locale}/compare?add=${product.id}`}>
                      {isArabic ? "مقارنة" : "Compare"}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 ml-2" />
                    {isArabic ? "مفضلة" : "Wishlist"}
                  </Button>
                </div>

                {session?.user?.id !== product.sellerId && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/${locale}/messages?seller=${product.User.username}`}>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      {isArabic ? "تواصل مع البائع" : "Contact Seller"}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "معلومات البائع" : "Seller Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/${locale}/seller/${product.User.username}`}
                className="flex items-start gap-4 hover:bg-muted p-3 rounded-lg transition-colors"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={product.User.avatar || undefined} />
                  <AvatarFallback>{product.User.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{product.User.fullName}</h4>
                  <p className="text-sm text-muted-foreground">@{product.User.username}</p>
                </div>
              </Link>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "المنتجات" : "Products"}
                  </span>
                  <span className="font-semibold">{product.User._count.Product}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "عضو منذ" : "Member since"}
                  </span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(product.User.createdAt), {
                      addSuffix: true,
                      locale: isArabic ? ar : enUS,
                    })}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${locale}/seller/${product.User.username}`}>
                  {isArabic ? "عرض الملف الشخصي" : "View Profile"}
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
                  <h4 className="font-semibold text-sm">
                    {isArabic ? "شراء آمن ومضمون" : "Safe & Secure Purchase"}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      {isArabic ? "✓ دفع آمن 100%" : "✓ 100% Secure Payment"}
                    </li>
                    <li>
                      {isArabic ? "✓ تحميل فوري بعد الدفع" : "✓ Instant Download After Payment"}
                    </li>
                    <li>
                      {isArabic ? "✓ دعم فني متواصل" : "✓ Continuous Technical Support"}
                    </li>
                    <li>
                      {isArabic ? "✓ ضمان استرجاع الأموال" : "✓ Money-Back Guarantee"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {isArabic ? "منتجات ذات صلة" : "Related Products"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/${locale}/marketplace/ready-products/${relatedProduct.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <Image
                      src={relatedProduct.thumbnail}
                      alt={isArabic ? relatedProduct.titleAr : relatedProduct.titleEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {isArabic ? relatedProduct.titleAr : relatedProduct.titleEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(Number(relatedProduct.price))}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{Number(relatedProduct.averageRating).toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
