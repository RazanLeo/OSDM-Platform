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
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  Heart,
  TrendingUp,
  Package,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  List,
  Grid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoriesView } from "./categories-view"

interface ReadyProductsClientProps {
  locale: Locale
  categories: Category[]
  translations: any
  searchParams: { [key: string]: string | string[] | undefined }
}

interface MockProduct {
  id: string
  title: string
  titleAr: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  seller: string
  sales: number
  image: string
  badge?: "bestseller" | "trending" | "new"
  categoryId: string
}

// Mock data للمنتجات
const mockProducts: MockProduct[] = [
  {
    id: "1",
    title: "Complete E-Book on Digital Marketing",
    titleAr: "كتاب شامل عن التسويق الرقمي",
    price: 99,
    originalPrice: 149,
    rating: 4.8,
    reviews: 324,
    seller: "محمد أحمد",
    sales: 1250,
    image: "/placeholder.svg",
    badge: "bestseller",
    categoryId: "text-content",
  },
  {
    id: "2",
    title: "Professional Logo Design Templates Pack",
    titleAr: "حزمة قوالب تصميم شعارات احترافية",
    price: 149,
    rating: 4.9,
    reviews: 456,
    seller: "سارة خالد",
    sales: 890,
    image: "/placeholder.svg",
    badge: "trending",
    categoryId: "visual-content",
  },
  {
    id: "3",
    title: "Background Music Collection - Royalty Free",
    titleAr: "مجموعة موسيقى خلفية - خالية من حقوق الملكية",
    price: 199,
    rating: 4.7,
    reviews: 234,
    seller: "عبدالله محمود",
    sales: 567,
    image: "/placeholder.svg",
    badge: "new",
    categoryId: "audio-content",
  },
  {
    id: "4",
    title: "Video Editing Templates for Social Media",
    titleAr: "قوالب مونتاج فيديو للسوشيال ميديا",
    price: 179,
    originalPrice: 249,
    rating: 4.6,
    reviews: 189,
    seller: "فاطمة علي",
    sales: 432,
    image: "/placeholder.svg",
    categoryId: "video-content",
  },
  {
    id: "5",
    title: "Business Plan Template - Editable",
    titleAr: "قالب خطة عمل - قابل للتعديل",
    price: 79,
    rating: 4.5,
    reviews: 145,
    seller: "أحمد حسن",
    sales: 678,
    image: "/placeholder.svg",
    categoryId: "text-content",
  },
  {
    id: "6",
    title: "UI/UX Design Kit for Mobile Apps",
    titleAr: "مجموعة تصميم واجهات للتطبيقات",
    price: 299,
    rating: 5.0,
    reviews: 567,
    seller: "نورة الشمري",
    sales: 1100,
    image: "/placeholder.svg",
    badge: "bestseller",
    categoryId: "visual-content",
  },
]

export function ReadyProductsClient({
  locale,
  categories,
  translations: t,
  searchParams,
}: ReadyProductsClientProps) {
  const isArabic = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("popular")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // استخدام searchParams للفلترة
  useEffect(() => {
    if (searchParams.category) {
      setSelectedCategory(searchParams.category as string)
    }
    if (searchParams.subcategory) {
      setSelectedSubcategory(searchParams.subcategory as string)
    }
    if (searchParams.q) {
      setSearchQuery(searchParams.q as string)
    }
  }, [searchParams])

  // فلترة المنتجات
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts

    // فلترة بالبحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.titleAr.toLowerCase().includes(query) ||
          product.seller.toLowerCase().includes(query)
      )
    }

    // فلترة بالتصنيف
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory)
    }

    // فلترة بالسعر
    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // الترتيب
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "sales":
        filtered.sort((a, b) => b.sales - a.sales)
        break
      case "newest":
        filtered.reverse()
        break
      default: // popular
        filtered.sort((a, b) => b.sales - a.sales)
    }

    return filtered
  }, [searchQuery, selectedCategory, sortBy, priceRange])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case "bestseller":
        return "default"
      case "trending":
        return "secondary"
      case "new":
        return "outline"
      default:
        return "default"
    }
  }

  const getBadgeText = (badge?: string) => {
    if (!badge) return ""
    switch (badge) {
      case "bestseller":
        return isArabic ? "الأكثر مبيعاً" : "Bestseller"
      case "trending":
        return isArabic ? "رائج" : "Trending"
      case "new":
        return isArabic ? "جديد" : "New"
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
              {t.gateway1Title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{t.gateway1Desc}</p>

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
                placeholder={isArabic ? "ابحث عن المنتجات..." : "Search for products..."}
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
        {/* Tabs للتبديل بين المنتجات والتصنيفات */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              {isArabic ? "المنتجات" : "Products"}
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {isArabic ? "جميع التصنيفات" : "All Categories"}
            </TabsTrigger>
          </TabsList>

          {/* عرض التصنيفات الكاملة */}
          <TabsContent value="categories">
            <CategoriesView
              locale={locale}
              categories={categories}
              onSelectType={(catId, subId, typeId) => {
                setSelectedCategory(catId)
                setSelectedSubcategory(subId)
                // Switch to products tab to show results
                const tab = document.querySelector('[value="products"]') as HTMLButtonElement
                tab?.click()
              }}
            />
          </TabsContent>

          {/* عرض المنتجات */}
          <TabsContent value="products">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside
            className={cn(
              "lg:col-span-1",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            <div className="sticky top-4 space-y-6">
              {/* Mobile Filter Close Button */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {isArabic ? "الفلاتر" : "Filters"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
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
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      <Button
                        variant={!selectedCategory ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCategory(null)
                          setSelectedSubcategory(null)
                        }}
                      >
                        {isArabic ? "جميع التصنيفات" : "All Categories"}
                      </Button>
                      {categories.map((category) => (
                        <div key={category.id}>
                          <Button
                            variant={
                              selectedCategory === category.id ? "default" : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setSelectedSubcategory(null)
                            }}
                          >
                            <span className="truncate">
                              {isArabic ? category.nameAr : category.nameEn}
                            </span>
                          </Button>

                          {/* Subcategories */}
                          {selectedCategory === category.id && (
                            <div className="ml-4 mt-2 space-y-1">
                              {category.subcategories.map((sub) => (
                                <Button
                                  key={sub.id}
                                  variant={
                                    selectedSubcategory === sub.id
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => setSelectedSubcategory(sub.id)}
                                >
                                  {isArabic ? sub.nameAr : sub.nameEn}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold">
                    {isArabic ? "نطاق السعر" : "Price Range"}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{priceRange[0]} {isArabic ? "ريال" : "SAR"}</span>
                      <span>{priceRange[1]} {isArabic ? "ريال" : "SAR"}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Clear Filters */}
              {(selectedCategory || searchQuery || priceRange[1] < 1000) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubcategory(null)
                    setSearchQuery("")
                    setPriceRange([0, 1000])
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
                  {filteredProducts.length}{" "}
                  {isArabic ? "منتج" : "products"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      {isArabic ? "الأكثر شعبية" : "Most Popular"}
                    </SelectItem>
                    <SelectItem value="newest">
                      {isArabic ? "الأحدث" : "Newest"}
                    </SelectItem>
                    <SelectItem value="price-low">
                      {isArabic ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
                    </SelectItem>
                    <SelectItem value="price-high">
                      {isArabic ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
                    </SelectItem>
                    <SelectItem value="rating">
                      {isArabic ? "الأعلى تقييماً" : "Highest Rated"}
                    </SelectItem>
                    <SelectItem value="sales">
                      {isArabic ? "الأكثر مبيعاً" : "Best Selling"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {isArabic ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic
                    ? "جرب تغيير الفلاتر أو كلمة البحث"
                    : "Try changing the filters or search query"}
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-[#846F9C]/50"
                    >
                      <CardHeader className="p-0 relative">
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Badge */}
                          {product.badge && (
                            <Badge
                              variant={getBadgeVariant(product.badge)}
                              className="absolute top-3 left-3 z-10"
                            >
                              {getBadgeText(product.badge)}
                            </Badge>
                          )}

                          {/* Favorite Button */}
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                favorites.has(product.id) &&
                                  "fill-red-500 text-red-500"
                              )}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        {/* Product Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#846F9C] transition-colors">
                          {isArabic ? product.titleAr : product.title}
                        </h3>

                        {/* Seller */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {isArabic ? "البائع:" : "Seller:"} {product.seller}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">
                              {product.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({product.reviews}{" "}
                            {isArabic ? "تقييم" : "reviews"})
                          </span>
                        </div>

                        {/* Sales */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                          <TrendingUp className="h-4 w-4" />
                          <span>
                            {product.sales} {isArabic ? "عملية بيع" : "sales"}
                          </span>
                        </div>

                        <Separator className="mb-4" />

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#846F9C]">
                                {product.price} {isArabic ? "ر.س" : "SAR"}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>
                            {product.originalPrice && (
                              <span className="text-xs text-green-600 font-semibold">
                                {isArabic ? "وفر" : "Save"}{" "}
                                {Math.round(
                                  ((product.originalPrice - product.price) /
                                    product.originalPrice) *
                                    100
                                )}
                                %
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isArabic ? "أضف للسلة" : "Add to Cart"}
                        </Button>
                      </CardFooter>
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
                      {isArabic ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      {isArabic ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
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
