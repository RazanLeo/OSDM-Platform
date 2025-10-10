"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n/language-provider"
import { Package, Plus, TrendingUp, DollarSign, Eye, Edit, Trash2, BarChart3 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Product {
  id: string
  titleAr: string
  titleEn: string
  price: number
  sales: number
  revenue: number
  views: number
  rating: number
  isActive: boolean
  createdAt: string
}

export function SellerProductsDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    avgRating: 0,
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockProducts: Product[] = [
        {
          id: "p1",
          titleAr: "كتاب تعلم البرمجة بلغة بايثون",
          titleEn: "Learn Python Programming Book",
          price: 199,
          sales: 45,
          revenue: 8955,
          views: 523,
          rating: 4.8,
          isActive: true,
          createdAt: "2025-09-01T00:00:00Z",
        },
        {
          id: "p2",
          titleAr: "قوالب Canva احترافية - 100 تصميم",
          titleEn: "Professional Canva Templates - 100 Designs",
          price: 149,
          sales: 32,
          revenue: 4768,
          views: 412,
          rating: 4.9,
          isActive: true,
          createdAt: "2025-08-15T00:00:00Z",
        },
        {
          id: "p3",
          titleAr: "دورة تصميم UI/UX كاملة",
          titleEn: "Complete UI/UX Design Course",
          price: 399,
          sales: 28,
          revenue: 11172,
          views: 891,
          rating: 5.0,
          isActive: true,
          createdAt: "2025-07-20T00:00:00Z",
        },
        {
          id: "p4",
          titleAr: "قوالب إكسل محاسبية جاهزة",
          titleEn: "Ready Accounting Excel Templates",
          price: 99,
          sales: 18,
          revenue: 1782,
          views: 234,
          rating: 4.6,
          isActive: false,
          createdAt: "2025-06-10T00:00:00Z",
        },
      ]

      setProducts(mockProducts)
      const totalRev = mockProducts.reduce((sum, p) => sum + p.revenue, 0)
      const totalSls = mockProducts.reduce((sum, p) => sum + p.sales, 0)
      const avgRat = mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length

      setStats({
        totalProducts: mockProducts.length,
        activeProducts: mockProducts.filter((p) => p.isActive).length,
        totalSales: totalSls,
        totalRevenue: totalRev,
        avgRating: Math.round(avgRat * 10) / 10,
      })
      setLoading(false)
    }

    if (session) {
      fetchProducts()
    }
  }, [session])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            {isRTL ? "منتجاتي - المنتجات الرقمية" : "My Products - Digital Products"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL
              ? "إدارة منتجاتك الرقمية ومتابعة المبيعات"
              : "Manage your digital products and track sales"}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          {isRTL ? "إضافة منتج جديد" : "Add New Product"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المنتجات" : "Total Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProducts} {isRTL ? "نشط" : "active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المبيعات" : "Total Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isRTL ? "+15% هذا الشهر" : "+15% this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isRTL ? "+12% هذا الشهر" : "+12% this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "متوسط التقييم" : "Avg Rating"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.avgRating}
              <span className="text-yellow-500">★</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "عبر جميع المنتجات" : "Across all products"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#846F9C] to-[#4691A9] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isRTL ? "صافي الأرباح" : "Net Earnings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.totalRevenue * 0.7).toLocaleString()} ر.س
            </div>
            <p className="text-xs text-white/80 mt-1">
              {isRTL ? "بعد العمولة 30%" : "After 30% commission"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "جميع المنتجات" : "All Products"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "قائمة منتجاتك الرقمية مع الإحصائيات"
              : "List of your digital products with statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد منتجات بعد" : "No products yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL
                  ? "ابدأ بإضافة أول منتج رقمي لك وابدأ البيع"
                  : "Start by adding your first digital product and start selling"}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? "إضافة منتج" : "Add Product"}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "المنتج" : "Product"}</TableHead>
                  <TableHead>{isRTL ? "السعر" : "Price"}</TableHead>
                  <TableHead>{isRTL ? "المبيعات" : "Sales"}</TableHead>
                  <TableHead>{isRTL ? "الإيرادات" : "Revenue"}</TableHead>
                  <TableHead>{isRTL ? "المشاهدات" : "Views"}</TableHead>
                  <TableHead>{isRTL ? "التقييم" : "Rating"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {isRTL ? product.titleAr : product.titleEn}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.price.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.sales}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {product.revenue.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {product.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{isRTL ? "إضافة منتج جديد" : "Add New Product"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "ابدأ بيع منتج جديد" : "Start selling a new product"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{isRTL ? "تحليلات مفصلة" : "Detailed Analytics"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "شاهد تقارير المبيعات" : "View sales reports"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{isRTL ? "سحب الأرباح" : "Withdraw Earnings"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "اطلب سحب أرباحك" : "Request withdrawal"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
