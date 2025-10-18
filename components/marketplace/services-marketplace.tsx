"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n/language-provider"
import { Search, SlidersHorizontal, Star, Briefcase, Clock, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { customServicesCategories } from "@/lib/data/marketplace-categories"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Service {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  seller: {
    id: string
    name: string
    avatar?: string
    rating: number
    totalOrders: number
  }
  categorySlug: string
  packages: {
    basic: {
      nameAr: string
      nameEn: string
      price: number
      deliveryDays: number
      featuresAr: string[]
      featuresEn: string[]
    }
    standard?: {
      nameAr: string
      nameEn: string
      price: number
      deliveryDays: number
      featuresAr: string[]
      featuresEn: string[]
    }
    premium?: {
      nameAr: string
      nameEn: string
      price: number
      deliveryDays: number
      featuresAr: string[]
      featuresEn: string[]
    }
  }
  rating: number
  totalOrders: number
  thumbnail: string
}

export function ServicesMarketplace() {
  const { t, isRTL } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams()

        if (searchQuery) params.append('search', searchQuery)
        if (selectedCategories.length > 0) {
          params.append('categoryId', selectedCategories.join(','))
        }
        if (sortBy) params.append('sortBy', sortBy)
        params.append('minPrice', priceRange[0].toString())
        params.append('maxPrice', priceRange[1].toString())

        const response = await fetch(`/api/services?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.data) {
          setServices(data.data.map((s: any) => ({
            id: s.id,
            titleAr: s.titleAr,
            titleEn: s.titleEn,
            descriptionAr: s.descriptionAr,
            descriptionEn: s.descriptionEn,
            seller: {
              id: s.User?.id || '',
              name: s.User?.fullName || s.User?.username || 'Unknown',
              avatar: s.User?.avatar,
              rating: parseFloat(s.User?.averageRating) || 0,
              totalOrders: s.User?.totalOrders || 0,
            },
            categorySlug: s.ServiceCategory?.slug || 'uncategorized',
            packages: {
              basic: s.ServicePackage?.find((p: any) => p.tier === 'BASIC') || {
                nameAr: 'باقة أساسية',
                nameEn: 'Basic',
                price: s.basePrice || 0,
                deliveryDays: s.deliveryDays || 3,
                featuresAr: [],
                featuresEn: [],
              },
              standard: s.ServicePackage?.find((p: any) => p.tier === 'STANDARD'),
              premium: s.ServicePackage?.find((p: any) => p.tier === 'PREMIUM'),
            },
            rating: parseFloat(s.averageRating) || 0,
            totalOrders: s.orderCount || 0,
            thumbnail: s.thumbnail || '/placeholder.jpg',
          })))
        }
      } catch (error) {
        console.error('Error fetching services:', error)

        // Mock data fallback - في الواقع سيتم جلبها من API
        const mockServices: Service[] = [
        {
          id: "1",
          titleAr: "تصميم شعار احترافي مع هوية بصرية متكاملة",
          titleEn: "Professional Logo Design with Complete Brand Identity",
          descriptionAr: "تصميم شعار احترافي يعبر عن هوية علامتك التجارية مع دليل استخدام كامل",
          descriptionEn: "Professional logo design that represents your brand identity with complete usage guidelines",
          seller: {
            id: "s1",
            name: "أحمد المصمم",
            rating: 4.9,
            totalOrders: 234,
          },
          categorySlug: "logo-design",
          packages: {
            basic: {
              nameAr: "باقة أساسية",
              nameEn: "Basic Package",
              price: 500,
              deliveryDays: 3,
              featuresAr: ["شعار واحد", "3 تعديلات", "ملفات PNG و JPG"],
              featuresEn: ["1 Logo", "3 Revisions", "PNG & JPG Files"],
            },
            standard: {
              nameAr: "باقة قياسية",
              nameEn: "Standard Package",
              price: 1000,
              deliveryDays: 5,
              featuresAr: ["3 تصاميم للشعار", "5 تعديلات", "جميع صيغ الملفات", "بطاقة عمل"],
              featuresEn: ["3 Logo Designs", "5 Revisions", "All File Formats", "Business Card"],
            },
            premium: {
              nameAr: "باقة متميزة",
              nameEn: "Premium Package",
              price: 2000,
              deliveryDays: 7,
              featuresAr: ["5 تصاميم للشعار", "تعديلات غير محدودة", "هوية بصرية كاملة", "دليل الاستخدام"],
              featuresEn: ["5 Logo Designs", "Unlimited Revisions", "Complete Brand Identity", "Usage Guide"],
            },
          },
          rating: 4.9,
          totalOrders: 234,
          thumbnail: "/placeholder.jpg",
        },
        {
          id: "2",
          titleAr: "تطوير موقع ووردبريس احترافي متجاوب",
          titleEn: "Professional Responsive WordPress Website Development",
          descriptionAr: "تطوير موقع ووردبريس احترافي متجاوب مع جميع الأجهزة وسريع التحميل",
          descriptionEn: "Professional responsive WordPress website development with fast loading speed",
          seller: {
            id: "s2",
            name: "فاطمة المطورة",
            rating: 5.0,
            totalOrders: 189,
          },
          categorySlug: "wordpress-development",
          packages: {
            basic: {
              nameAr: "باقة أساسية",
              nameEn: "Basic Package",
              price: 1500,
              deliveryDays: 7,
              featuresAr: ["5 صفحات", "تصميم متجاوب", "سرعة تحميل عالية", "تحسين SEO أساسي"],
              featuresEn: ["5 Pages", "Responsive Design", "Fast Loading", "Basic SEO"],
            },
            standard: {
              nameAr: "باقة قياسية",
              nameEn: "Standard Package",
              price: 3000,
              deliveryDays: 14,
              featuresAr: ["10 صفحات", "نموذج تواصل", "ربط وسائل التواصل", "تحسين SEO متقدم", "شهر دعم مجاني"],
              featuresEn: ["10 Pages", "Contact Form", "Social Media Integration", "Advanced SEO", "1 Month Free Support"],
            },
            premium: {
              nameAr: "باقة متميزة",
              nameEn: "Premium Package",
              price: 5000,
              deliveryDays: 21,
              featuresAr: ["صفحات غير محدودة", "متجر إلكتروني", "نظام عضويات", "3 أشهر دعم مجاني", "تدريب كامل"],
              featuresEn: ["Unlimited Pages", "E-commerce", "Membership System", "3 Months Support", "Complete Training"],
            },
          },
          rating: 5.0,
          totalOrders: 189,
          thumbnail: "/placeholder.jpg",
        },
        {
          id: "3",
          titleAr: "كتابة محتوى تسويقي احترافي باللغة العربية",
          titleEn: "Professional Arabic Marketing Content Writing",
          descriptionAr: "كتابة محتوى تسويقي احترافي يجذب العملاء ويحقق أهدافك التسويقية",
          descriptionEn: "Professional marketing content writing that attracts customers and achieves your marketing goals",
          seller: {
            id: "s3",
            name: "سارة الكاتبة",
            rating: 4.8,
            totalOrders: 456,
          },
          categorySlug: "content-writing",
          packages: {
            basic: {
              nameAr: "باقة أساسية",
              nameEn: "Basic Package",
              price: 300,
              deliveryDays: 2,
              featuresAr: ["500 كلمة", "تعديل واحد", "تدقيق لغوي"],
              featuresEn: ["500 Words", "1 Revision", "Proofreading"],
            },
            standard: {
              nameAr: "باقة قياسية",
              nameEn: "Standard Package",
              price: 600,
              deliveryDays: 3,
              featuresAr: ["1000 كلمة", "3 تعديلات", "تحسين SEO", "صور توضيحية"],
              featuresEn: ["1000 Words", "3 Revisions", "SEO Optimization", "Images"],
            },
            premium: {
              nameAr: "باقة متميزة",
              nameEn: "Premium Package",
              price: 1200,
              deliveryDays: 5,
              featuresAr: ["2000 كلمة", "تعديلات غير محدودة", "استراتيجية محتوى", "جدولة نشر"],
              featuresEn: ["2000 Words", "Unlimited Revisions", "Content Strategy", "Publishing Schedule"],
            },
          },
          rating: 4.8,
          totalOrders: 456,
          thumbnail: "/placeholder.jpg",
        },
        {
          id: "4",
          titleAr: "إدارة حسابات التواصل الاجتماعي",
          titleEn: "Social Media Management Services",
          descriptionAr: "إدارة احترافية لحسابات التواصل الاجتماعي مع محتوى جذاب وتفاعل مستمر",
          descriptionEn: "Professional social media management with engaging content and continuous interaction",
          seller: {
            id: "s4",
            name: "خالد المسوق",
            rating: 4.7,
            totalOrders: 312,
          },
          categorySlug: "social-media-management",
          packages: {
            basic: {
              nameAr: "باقة أساسية",
              nameEn: "Basic Package",
              price: 1000,
              deliveryDays: 30,
              featuresAr: ["منصة واحدة", "10 منشورات شهرياً", "تصميم بسيط", "تقرير شهري"],
              featuresEn: ["1 Platform", "10 Posts/Month", "Basic Design", "Monthly Report"],
            },
            standard: {
              nameAr: "باقة قياسية",
              nameEn: "Standard Package",
              price: 2000,
              deliveryDays: 30,
              featuresAr: ["منصتين", "20 منشور شهرياً", "تصاميم احترافية", "رد على التعليقات", "تقارير تفصيلية"],
              featuresEn: ["2 Platforms", "20 Posts/Month", "Professional Design", "Reply to Comments", "Detailed Reports"],
            },
            premium: {
              nameAr: "باقة متميزة",
              nameEn: "Premium Package",
              price: 4000,
              deliveryDays: 30,
              featuresAr: ["3 منصات", "30 منشور شهرياً", "إعلانات ممولة", "فيديوهات", "استشارات أسبوعية"],
              featuresEn: ["3 Platforms", "30 Posts/Month", "Paid Ads", "Videos", "Weekly Consultations"],
            },
          },
          rating: 4.7,
          totalOrders: 312,
          thumbnail: "/placeholder.jpg",
        },
      ]

        setServices(mockServices)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [searchQuery, selectedCategories, sortBy, priceRange])

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          {isRTL ? "سوق الخدمات المخصصة" : "Custom Services Market"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "احصل على خدمات مخصصة من محترفين موثوقين بباقات مرنة"
            : "Get custom services from trusted professionals with flexible packages"}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "ابحث عن الخدمات..." : "Search services..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={isRTL ? "ترتيب حسب" : "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{isRTL ? "الأكثر شعبية" : "Most Popular"}</SelectItem>
            <SelectItem value="newest">{isRTL ? "الأحدث" : "Newest"}</SelectItem>
            <SelectItem value="price-low">{isRTL ? "السعر: الأقل أولاً" : "Price: Low to High"}</SelectItem>
            <SelectItem value="price-high">{isRTL ? "السعر: الأعلى أولاً" : "Price: High to Low"}</SelectItem>
            <SelectItem value="rating">{isRTL ? "الأعلى تقييمًا" : "Highest Rated"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {isRTL ? "التصنيفات" : "Categories"}
                </h3>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                  >
                    {isRTL ? "مسح الكل" : "Clear all"}
                  </Button>
                )}
              </div>

              <Accordion type="multiple" className="w-full">
                {customServicesCategories.slice(0, 5).map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm">
                      {isRTL ? category.nameAr : category.nameEn}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {category.subcategories.slice(0, 3).map((subcategory) => (
                          <div key={subcategory.id} className="space-y-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={subcategory.id}
                                checked={selectedCategories.includes(subcategory.id)}
                                onCheckedChange={() => toggleCategory(subcategory.id)}
                              />
                              <label
                                htmlFor={subcategory.id}
                                className="text-sm cursor-pointer"
                              >
                                {isRTL ? subcategory.nameAr : subcategory.nameEn}
                              </label>
                            </div>
                          </div>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                            {isRTL ? `+${category.subcategories.length - 3} المزيد` : `+${category.subcategories.length - 3} more`}
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button variant="link" className="w-full mt-4" size="sm">
                {isRTL ? "عرض جميع التصنيفات →" : "View all categories →"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isRTL ? `عرض ${services.length} خدمة` : `Showing ${services.length} services`}
            </p>
          </div>

          <div className="space-y-6">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Service Info - Left */}
                    <div className="md:col-span-1 space-y-4">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                          {service.seller.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{service.seller.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span>{service.seller.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{service.seller.totalOrders} {isRTL ? "طلب" : "orders"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Details - Right */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          {isRTL ? service.titleAr : service.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? service.descriptionAr : service.descriptionEn}
                        </p>
                      </div>

                      {/* Packages */}
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="basic">
                            {isRTL ? service.packages.basic.nameAr : service.packages.basic.nameEn}
                          </TabsTrigger>
                          {service.packages.standard && (
                            <TabsTrigger value="standard">
                              {isRTL ? service.packages.standard.nameAr : service.packages.standard.nameEn}
                            </TabsTrigger>
                          )}
                          {service.packages.premium && (
                            <TabsTrigger value="premium">
                              {isRTL ? service.packages.premium.nameAr : service.packages.premium.nameEn}
                            </TabsTrigger>
                          )}
                        </TabsList>

                        <TabsContent value="basic" className="mt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{service.packages.basic.deliveryDays} {isRTL ? "أيام" : "days"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="text-lg font-bold text-green-600">
                                    {service.packages.basic.price} ر.س
                                  </span>
                                </div>
                              </div>
                              <Button size="sm">
                                {isRTL ? "طلب الخدمة" : "Order Now"}
                              </Button>
                            </div>
                            <ul className="space-y-1 text-sm">
                              {(isRTL ? service.packages.basic.featuresAr : service.packages.basic.featuresEn).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>

                        {service.packages.standard && (
                          <TabsContent value="standard" className="mt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{service.packages.standard.deliveryDays} {isRTL ? "أيام" : "days"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-lg font-bold text-green-600">
                                      {service.packages.standard.price} ر.س
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm">
                                  {isRTL ? "طلب الخدمة" : "Order Now"}
                                </Button>
                              </div>
                              <ul className="space-y-1 text-sm">
                                {(isRTL ? service.packages.standard.featuresAr : service.packages.standard.featuresEn).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                        )}

                        {service.packages.premium && (
                          <TabsContent value="premium" className="mt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{service.packages.premium.deliveryDays} {isRTL ? "أيام" : "days"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-lg font-bold text-green-600">
                                      {service.packages.premium.price} ر.س
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm">
                                  {isRTL ? "طلب الخدمة" : "Order Now"}
                                </Button>
                              </div>
                              <ul className="space-y-1 text-sm">
                                {(isRTL ? service.packages.premium.featuresAr : service.packages.premium.featuresEn).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">{isRTL ? "السابق" : "Previous"}</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="default" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">{isRTL ? "التالي" : "Next"}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
