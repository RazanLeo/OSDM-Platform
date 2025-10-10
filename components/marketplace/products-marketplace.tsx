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
import { Search, SlidersHorizontal, Star, Download, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { readyProductsCategories } from "@/lib/data/marketplace-categories"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

interface Product {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  thumbnail: string
  rating: number
  sales: number
  seller: {
    name: string
    avatar?: string
  }
  categorySlug: string
}

export function ProductsMarketplace() {
  const { t, isRTL } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data - في الواقع سيتم جلبها من API
      const mockProducts: Product[] = [
        {
          id: "1",
          titleAr: "كتاب تعلم البرمجة بلغة بايثون - من الصفر",
          titleEn: "Learn Python Programming - From Scratch",
          descriptionAr: "كتاب شامل يغطي أساسيات ومتقدمات لغة بايثون مع أمثلة عملية",
          descriptionEn: "Comprehensive book covering Python basics and advanced topics with practical examples",
          price: 199,
          thumbnail: "/placeholder.jpg",
          rating: 4.8,
          sales: 523,
          seller: {
            name: "أحمد المبرمج",
          },
          categorySlug: "ebooks",
        },
        {
          id: "2",
          titleAr: "قوالب Canva احترافية - 100 تصميم",
          titleEn: "Professional Canva Templates - 100 Designs",
          descriptionAr: "مجموعة من 100 تصميم احترافي جاهز للاستخدام في Canva",
          descriptionEn: "Collection of 100 professional ready-to-use Canva designs",
          price: 149,
          thumbnail: "/placeholder.jpg",
          rating: 4.9,
          sales: 412,
          seller: {
            name: "سارة المصممة",
          },
          categorySlug: "canva-templates",
        },
        {
          id: "3",
          titleAr: "دورة تصميم UI/UX كاملة - فيديو",
          titleEn: "Complete UI/UX Design Course - Video",
          descriptionAr: "دورة شاملة في تصميم واجهات المستخدم وتجربة المستخدم",
          descriptionEn: "Comprehensive course in UI/UX design",
          price: 399,
          thumbnail: "/placeholder.jpg",
          rating: 5.0,
          sales: 891,
          seller: {
            name: "محمد التصميم",
          },
          categorySlug: "video-courses",
        },
        {
          id: "4",
          titleAr: "قوالب إكسل محاسبية - 50 نموذج",
          titleEn: "Accounting Excel Templates - 50 Forms",
          descriptionAr: "مجموعة من 50 قالب إكسل جاهز للمحاسبة والإدارة المالية",
          descriptionEn: "Collection of 50 ready-made Excel templates for accounting",
          price: 99,
          thumbnail: "/placeholder.jpg",
          rating: 4.6,
          sales: 234,
          seller: {
            name: "خالد المحاسب",
          },
          categorySlug: "excel-templates",
        },
        {
          id: "5",
          titleAr: "مكتبة أيقونات SVG - 500+ أيقونة",
          titleEn: "SVG Icons Library - 500+ Icons",
          descriptionAr: "مكتبة شاملة تحتوي على أكثر من 500 أيقونة بصيغة SVG",
          descriptionEn: "Comprehensive library with 500+ SVG icons",
          price: 79,
          thumbnail: "/placeholder.jpg",
          rating: 4.7,
          sales: 678,
          seller: {
            name: "نورة التصميم",
          },
          categorySlug: "icons",
        },
        {
          id: "6",
          titleAr: "قوالب مواقع HTML/CSS جاهزة",
          titleEn: "Ready HTML/CSS Website Templates",
          descriptionAr: "مجموعة من قوالب المواقع الجاهزة باستخدام HTML و CSS",
          descriptionEn: "Collection of ready website templates using HTML & CSS",
          price: 249,
          thumbnail: "/placeholder.jpg",
          rating: 4.8,
          sales: 345,
          seller: {
            name: "عمر المطور",
          },
          categorySlug: "html-css-templates",
        },
      ]

      setProducts(mockProducts)
      setLoading(false)
    }

    fetchProducts()
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
          <Package className="h-8 w-8" />
          {isRTL ? "سوق المنتجات الرقمية الجاهزة" : "Ready-Made Digital Products Market"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "اكتشف آلاف المنتجات الرقمية الجاهزة للتحميل الفوري"
            : "Discover thousands of digital products ready for instant download"}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "ابحث عن المنتجات..." : "Search products..."}
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
                {readyProductsCategories.slice(0, 5).map((category) => (
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

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isRTL ? `عرض ${products.length} منتج` : `Showing ${products.length} products`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2 mb-1">
                        {isRTL ? product.titleAr : product.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {isRTL ? product.descriptionAr : product.descriptionEn}
                      </p>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {product.seller.name[0]}
                      </div>
                      <p className="text-xs text-muted-foreground">{product.seller.name}</p>
                    </div>

                    {/* Rating & Sales */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{product.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="h-3 w-3" />
                        <span>{product.sales}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {product.price.toLocaleString()} ر.س
                        </p>
                      </div>
                      <Button size="sm">
                        {isRTL ? "شراء الآن" : "Buy Now"}
                      </Button>
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
