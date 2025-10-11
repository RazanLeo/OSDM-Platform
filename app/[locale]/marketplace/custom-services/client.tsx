"use client"

import { useState, useMemo, useEffect } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Category } from "@/lib/data/marketplace-categories"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Star,
  Heart,
  Clock,
  CheckCircle2,
  Package,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  Award,
  TrendingUp,
  Grid,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoriesView } from "./categories-view"

interface CustomServicesClientProps {
  locale: Locale
  categories: Category[]
  translations: any
  searchParams: { [key: string]: string | string[] | undefined }
}

interface ServicePackage {
  name: string
  price: number
  deliveryDays: number
  revisions: number
  features: string[]
}

interface MockService {
  id: string
  title: string
  titleAr: string
  seller: {
    name: string
    avatar: string
    level: "new" | "level1" | "level2" | "top"
    rating: number
    reviews: number
    completedOrders: number
  }
  rating: number
  reviews: number
  startingPrice: number
  image: string
  badge?: "recommended" | "featured" | "bestseller"
  categoryId: string
  packages: {
    basic: ServicePackage
    standard: ServicePackage
    premium: ServicePackage
  }
}

// Mock data للخدمات
const mockServices: MockService[] = [
  {
    id: "1",
    title: "Professional Logo Design for Your Business",
    titleAr: "تصميم شعار احترافي لعملك",
    seller: {
      name: "أحمد الشمري",
      avatar: "/placeholder.svg",
      level: "top",
      rating: 5.0,
      reviews: 1234,
      completedOrders: 2500,
    },
    rating: 4.9,
    reviews: 856,
    startingPrice: 250,
    image: "/placeholder.svg",
    badge: "bestseller",
    categoryId: "graphic-design",
    packages: {
      basic: {
        name: "Basic",
        price: 250,
        deliveryDays: 3,
        revisions: 2,
        features: ["1 Logo Concept", "2 Revisions", "Source Files", "24h Support"],
      },
      standard: {
        name: "Standard",
        price: 500,
        deliveryDays: 2,
        revisions: 4,
        features: ["3 Logo Concepts", "4 Revisions", "All Source Files", "Social Media Kit", "Priority Support"],
      },
      premium: {
        name: "Premium",
        price: 900,
        deliveryDays: 1,
        revisions: -1,
        features: [
          "5 Logo Concepts",
          "Unlimited Revisions",
          "All Source Files",
          "Brand Guidelines",
          "Social Media Kit",
          "24/7 Priority Support",
        ],
      },
    },
  },
  {
    id: "2",
    title: "Full Stack Web Development - React & Node.js",
    titleAr: "تطوير مواقع Full Stack - React و Node.js",
    seller: {
      name: "سارة محمد",
      avatar: "/placeholder.svg",
      level: "level2",
      rating: 4.8,
      reviews: 567,
      completedOrders: 890,
    },
    rating: 4.9,
    reviews: 432,
    startingPrice: 1500,
    image: "/placeholder.svg",
    badge: "recommended",
    categoryId: "web-development",
    packages: {
      basic: {
        name: "Basic",
        price: 1500,
        deliveryDays: 14,
        revisions: 2,
        features: ["5 Pages", "Responsive Design", "Basic SEO", "2 Revisions"],
      },
      standard: {
        name: "Standard",
        price: 3000,
        deliveryDays: 21,
        revisions: 4,
        features: ["10 Pages", "Responsive Design", "Advanced SEO", "CMS Integration", "4 Revisions"],
      },
      premium: {
        name: "Premium",
        price: 5500,
        deliveryDays: 30,
        revisions: -1,
        features: [
          "Unlimited Pages",
          "Custom Design",
          "E-commerce Integration",
          "Advanced SEO",
          "CMS Integration",
          "Unlimited Revisions",
        ],
      },
    },
  },
  {
    id: "3",
    title: "Professional Arabic Content Writing",
    titleAr: "كتابة محتوى عربي احترافي",
    seller: {
      name: "فاطمة العتيبي",
      avatar: "/placeholder.svg",
      level: "level1",
      rating: 4.7,
      reviews: 234,
      completedOrders: 456,
    },
    rating: 4.8,
    reviews: 189,
    startingPrice: 100,
    image: "/placeholder.svg",
    badge: "featured",
    categoryId: "content-writing",
    packages: {
      basic: {
        name: "Basic",
        price: 100,
        deliveryDays: 2,
        revisions: 1,
        features: ["500 Words", "SEO Optimized", "1 Revision", "Fast Delivery"],
      },
      standard: {
        name: "Standard",
        price: 250,
        deliveryDays: 3,
        revisions: 2,
        features: ["1500 Words", "SEO Optimized", "2 Revisions", "Keywords Research"],
      },
      premium: {
        name: "Premium",
        price: 500,
        deliveryDays: 5,
        revisions: 3,
        features: ["3000 Words", "SEO Optimized", "3 Revisions", "Keywords Research", "Social Media Posts"],
      },
    },
  },
  {
    id: "4",
    title: "Digital Marketing & Social Media Management",
    titleAr: "التسويق الرقمي وإدارة السوشيال ميديا",
    seller: {
      name: "خالد الأحمد",
      avatar: "/placeholder.svg",
      level: "top",
      rating: 4.9,
      reviews: 789,
      completedOrders: 1456,
    },
    rating: 4.9,
    reviews: 567,
    startingPrice: 800,
    image: "/placeholder.svg",
    categoryId: "digital-marketing",
    packages: {
      basic: {
        name: "Basic",
        price: 800,
        deliveryDays: 7,
        revisions: 2,
        features: ["2 Platforms", "10 Posts/Month", "Basic Analytics", "Content Calendar"],
      },
      standard: {
        name: "Standard",
        price: 1500,
        deliveryDays: 7,
        revisions: 3,
        features: ["4 Platforms", "20 Posts/Month", "Advanced Analytics", "Content Calendar", "Ad Campaigns"],
      },
      premium: {
        name: "Premium",
        price: 3000,
        deliveryDays: 7,
        revisions: -1,
        features: [
          "All Platforms",
          "40 Posts/Month",
          "Advanced Analytics",
          "Content Calendar",
          "Ad Campaigns",
          "Influencer Outreach",
        ],
      },
    },
  },
]

export function CustomServicesClient({
  locale,
  categories,
  translations: t,
  searchParams,
}: CustomServicesClientProps) {
  const isArabic = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("recommended")
  const [deliveryTime, setDeliveryTime] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    if (searchParams.category) {
      setSelectedCategory(searchParams.category as string)
    }
    if (searchParams.q) {
      setSearchQuery(searchParams.q as string)
    }
  }, [searchParams])

  const filteredServices = useMemo(() => {
    let filtered = mockServices

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.titleAr.toLowerCase().includes(query) ||
          service.seller.name.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.categoryId === selectedCategory)
    }

    if (deliveryTime !== "all") {
      const days = parseInt(deliveryTime)
      filtered = filtered.filter((service) => service.packages.basic.deliveryDays <= days)
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.startingPrice - b.startingPrice)
        break
      case "price-high":
        filtered.sort((a, b) => b.startingPrice - a.startingPrice)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default: // recommended
        filtered.sort((a, b) => b.seller.completedOrders - a.seller.completedOrders)
    }

    return filtered
  }, [searchQuery, selectedCategory, sortBy, deliveryTime])

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const toggleFavorite = (serviceId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId)
      } else {
        newFavorites.add(serviceId)
      }
      return newFavorites
    })
  }

  const getSellerLevelBadge = (level: string) => {
    switch (level) {
      case "top":
        return { text: isArabic ? "بائع متميز" : "Top Seller", variant: "default" as const }
      case "level2":
        return { text: isArabic ? "مستوى 2" : "Level 2", variant: "secondary" as const }
      case "level1":
        return { text: isArabic ? "مستوى 1" : "Level 1", variant: "outline" as const }
      default:
        return { text: isArabic ? "جديد" : "New", variant: "outline" as const }
    }
  }

  const getBadgeText = (badge?: string) => {
    if (!badge) return ""
    switch (badge) {
      case "bestseller":
        return isArabic ? "الأكثر مبيعاً" : "Bestseller"
      case "recommended":
        return isArabic ? "موصى به" : "Recommended"
      case "featured":
        return isArabic ? "مميز" : "Featured"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#846F9C]/10 via-[#4691A9]/10 to-[#89A58F]/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
              {t.gateway2Title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{t.gateway2Desc}</p>

            {/* Search Bar */}
            <div className="relative">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                  isArabic ? "right-4" : "left-4"
                )}
              />
              <Input
                type="text"
                placeholder={isArabic ? "ابحث عن الخدمات..." : "Search for services..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-14 text-lg shadow-lg border-2",
                  isArabic ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="services">
              <Grid className="h-4 w-4 mr-2" />
              {isArabic ? "الخدمات" : "Services"}
            </TabsTrigger>
            <TabsTrigger value="categories">
              <List className="h-4 w-4 mr-2" />
              {isArabic ? "جميع التصنيفات" : "All Categories"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <CategoriesView
              locale={locale}
              categories={categories}
              onSelectType={(catId, subId, typeId) => {
                setSelectedCategory(catId)
                setSelectedSubcategory(subId)
              }}
            />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside className={cn("lg:col-span-1", showFilters ? "block" : "hidden lg:block")}>
            <div className="sticky top-4 space-y-6">
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{isArabic ? "الفلاتر" : "Filters"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#846F9C]" />
                    {isArabic ? "التصنيفات" : "Categories"}
                  </h3>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      <Button
                        variant={!selectedCategory ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(null)}
                      >
                        {isArabic ? "جميع الخدمات" : "All Services"}
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <span className="truncate">{isArabic ? category.nameAr : category.nameEn}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Delivery Time */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#4691A9]" />
                    {isArabic ? "وقت التسليم" : "Delivery Time"}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={deliveryTime === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setDeliveryTime("all")}
                    >
                      {isArabic ? "أي وقت" : "Any Time"}
                    </Button>
                    <Button
                      variant={deliveryTime === "1" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setDeliveryTime("1")}
                    >
                      {isArabic ? "24 ساعة" : "24 Hours"}
                    </Button>
                    <Button
                      variant={deliveryTime === "3" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setDeliveryTime("3")}
                    >
                      {isArabic ? "حتى 3 أيام" : "Up to 3 Days"}
                    </Button>
                    <Button
                      variant={deliveryTime === "7" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setDeliveryTime("7")}
                    >
                      {isArabic ? "حتى 7 أيام" : "Up to 7 Days"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Clear Filters */}
              {(selectedCategory || searchQuery || deliveryTime !== "all") && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery("")
                    setDeliveryTime("all")
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isArabic ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isArabic ? "الفلاتر" : "Filters"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {filteredServices.length} {isArabic ? "خدمة" : "services"}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">
                    {isArabic ? "موصى به" : "Recommended"}
                  </SelectItem>
                  <SelectItem value="rating">
                    {isArabic ? "الأعلى تقييماً" : "Highest Rated"}
                  </SelectItem>
                  <SelectItem value="reviews">
                    {isArabic ? "الأكثر تقييماً" : "Most Reviews"}
                  </SelectItem>
                  <SelectItem value="price-low">
                    {isArabic ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
                  </SelectItem>
                  <SelectItem value="price-high">
                    {isArabic ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Services Grid */}
            {paginatedServices.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {isArabic ? "لا توجد خدمات" : "No services found"}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? "جرب تغيير الفلاتر أو كلمة البحث" : "Try changing the filters or search query"}
                </p>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedServices.map((service) => (
                    <Card
                      key={service.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-[#846F9C]/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                        {/* Service Image */}
                        <div className="md:col-span-4 relative">
                          <div className="relative aspect-video md:aspect-square bg-gradient-to-br from-muted to-muted/50">
                            {service.badge && (
                              <Badge className="absolute top-3 left-3 z-10">{getBadgeText(service.badge)}</Badge>
                            )}
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-3 right-3 z-10"
                              onClick={() => toggleFavorite(service.id)}
                            >
                              <Heart
                                className={cn("h-4 w-4", favorites.has(service.id) && "fill-red-500 text-red-500")}
                              />
                            </Button>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="md:col-span-8 p-6">
                          <div className="flex items-start justify-between mb-4">
                            {/* Seller Info */}
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={service.seller.avatar} />
                                <AvatarFallback>{service.seller.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{service.seller.name}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant={getSellerLevelBadge(service.seller.level).variant} className="text-xs">
                                    {getSellerLevelBadge(service.seller.level).text}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{service.seller.rating}</span>
                                    <span className="text-muted-foreground">
                                      ({service.seller.reviews})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Service Title */}
                          <h3 className="text-xl font-bold mb-3 group-hover:text-[#846F9C] transition-colors">
                            {isArabic ? service.titleAr : service.title}
                          </h3>

                          {/* Rating & Reviews */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{service.rating}</span>
                              <span className="text-muted-foreground">
                                ({service.reviews} {isArabic ? "تقييم" : "reviews"})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm">
                                {service.seller.completedOrders} {isArabic ? "طلب مكتمل" : "orders completed"}
                              </span>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          {/* Packages Tabs */}
                          <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="basic">
                                {isArabic ? "أساسي" : "Basic"}
                              </TabsTrigger>
                              <TabsTrigger value="standard">
                                {isArabic ? "متوسط" : "Standard"}
                              </TabsTrigger>
                              <TabsTrigger value="premium">
                                {isArabic ? "متميز" : "Premium"}
                              </TabsTrigger>
                            </TabsList>

                            {["basic", "standard", "premium"].map((packageType) => {
                              const pkg = service.packages[packageType as keyof typeof service.packages]
                              return (
                                <TabsContent key={packageType} value={packageType} className="mt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      {pkg.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                          <span>{feature}</span>
                                        </div>
                                      ))}
                                      <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            {pkg.deliveryDays} {isArabic ? "يوم" : "days"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Zap className="h-4 w-4" />
                                          <span>
                                            {pkg.revisions === -1
                                              ? isArabic
                                                ? "تعديلات غير محدودة"
                                                : "Unlimited Revisions"
                                              : `${pkg.revisions} ${isArabic ? "تعديل" : "Revisions"}`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right mr-6">
                                      <p className="text-3xl font-bold text-[#846F9C] mb-2">
                                        {pkg.price} {isArabic ? "ر.س" : "SAR"}
                                      </p>
                                      <Button className="bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90">
                                        {isArabic ? "اطلب الآن" : "Order Now"}
                                      </Button>
                                    </div>
                                  </div>
                                </TabsContent>
                              )
                            })}
                          </Tabs>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
