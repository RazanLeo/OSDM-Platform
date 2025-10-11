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
import { Package, Plus, TrendingUp, DollarSign, Eye, Edit, Trash2, BarChart3 } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"

interface SellerProductsDashboardProps {
  products: any[]
  stats: {
    totalRevenue: number
    totalSales: number
    activeProducts: number
    pendingProducts: number
    totalProducts: number
  }
  locale: Locale
  translations: any
}

export function SellerProductsDashboard({
  products,
  stats,
  locale,
  translations: t
}: SellerProductsDashboardProps) {
  const isArabic = locale === "ar"

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      APPROVED: "default",
      PENDING: "secondary",
      DRAFT: "outline",
      REJECTED: "destructive",
      SUSPENDED: "destructive"
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      APPROVED: { ar: "معتمد", en: "Approved" },
      PENDING: { ar: "قيد المراجعة", en: "Pending" },
      DRAFT: { ar: "مسودة", en: "Draft" },
      REJECTED: { ar: "مرفوض", en: "Rejected" },
      SUSPENDED: { ar: "موقوف", en: "Suspended" }
    }
    return isArabic ? labels[status]?.ar : labels[status]?.en
  }

  // Calculate average rating across all products
  const totalRatings = products.reduce((sum, p) => sum + Number(p.averageRating), 0)
  const avgRating = products.length > 0 ? (totalRatings / products.length).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-[#846F9C]" />
            {isArabic ? "منتجاتي الرقمية" : "My Digital Products"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "إدارة منتجاتك الرقمية ومتابعة المبيعات (Gumroad + Picalica)"
              : "Manage your digital products and track sales (Gumroad + Picalica)"}
          </p>
        </div>
        <Link href={`/${locale}/seller/products/new`}>
          <Button size="lg" className="gap-2 bg-gradient-to-r from-[#846F9C] to-[#4691A9]">
            <Plus className="h-5 w-5" />
            {isArabic ? "إضافة منتج جديد" : "Add New Product"}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي المنتجات" : "Total Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProducts} {isArabic ? "نشط" : "active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي المبيعات" : "Total Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isArabic ? "منتجات مكتملة" : "completed orders"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي الإيرادات" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <DollarSign className="h-3 w-3 text-green-500" />
              {isArabic ? "صافي أرباحك" : "net earnings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "متوسط التقييم" : "Avg Rating"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {avgRating}
              <span className="text-yellow-500">★</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "عبر جميع المنتجات" : "across all products"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#846F9C] to-[#4691A9] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isArabic ? "قيد المراجعة" : "Pending Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProducts}</div>
            <p className="text-xs text-white/80 mt-1">
              {isArabic ? "منتجات في انتظار الموافقة" : "products awaiting approval"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "جميع المنتجات" : "All Products"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "قائمة منتجاتك الرقمية مع الإحصائيات"
              : "List of your digital products with statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد منتجات بعد" : "No products yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "ابدأ بإضافة أول منتج رقمي لك وابدأ البيع"
                  : "Start by adding your first digital product and start selling"}
              </p>
              <Link href={`/${locale}/seller/products/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة منتج" : "Add Product"}
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                  <TableHead>{isArabic ? "التصنيف" : "Category"}</TableHead>
                  <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
                  <TableHead>{isArabic ? "المبيعات" : "Sales"}</TableHead>
                  <TableHead>{isArabic ? "المشاهدات" : "Views"}</TableHead>
                  <TableHead>{isArabic ? "التقييم" : "Rating"}</TableHead>
                  <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {isArabic ? product.titleAr : product.titleEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.orders.length} {isArabic ? "طلب" : "orders"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {isArabic ? product.category.nameAr : product.category.nameEn}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(product.price).toFixed(2)} {t.sar}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product._count.orders}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {product.viewCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{Number(product.averageRating).toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs text-muted-foreground">
                          ({product._count.reviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link href={`/${locale}/products/${product.slug}`}>
                          <Button size="icon" variant="ghost" title={isArabic ? "عرض" : "View"}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/seller/products/${product.id}/edit`}>
                          <Button size="icon" variant="ghost" title={isArabic ? "تعديل" : "Edit"}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={isArabic ? "إحصائيات" : "Stats"}
                        >
                          <BarChart3 className="h-4 w-4" />
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
        <Link href={`/${locale}/seller/products/new`}>
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#846F9C]/10 rounded-lg">
                  <Plus className="h-6 w-6 text-[#846F9C]" />
                </div>
                <div>
                  <h3 className="font-semibold">{isArabic ? "إضافة منتج جديد" : "Add New Product"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "ابدأ بيع منتج جديد" : "Start selling a new product"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/dashboard/analytics`}>
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#4691A9]/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-[#4691A9]" />
                </div>
                <div>
                  <h3 className="font-semibold">{isArabic ? "تحليلات مفصلة" : "Detailed Analytics"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "شاهد تقارير المبيعات" : "View sales reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/dashboard/wallet`}>
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#89A58F]/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[#89A58F]" />
                </div>
                <div>
                  <h3 className="font-semibold">{isArabic ? "سحب الأرباح" : "Withdraw Earnings"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "اطلب سحب أرباحك" : "Request withdrawal"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
