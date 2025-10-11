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
import { Package, Download, Receipt, Star, ShoppingBag } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"

interface BuyerProductsDashboardProps {
  purchases: any[]
  stats: {
    totalPurchases: number
    totalSpent: number
    downloadableItems: number
  }
  locale: Locale
  translations: any
}

export function BuyerProductsDashboard({
  purchases,
  stats,
  locale,
  translations: t
}: BuyerProductsDashboardProps) {
  const isArabic = locale === "ar"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-[#846F9C]" />
          {isArabic ? "مشترياتي - المنتجات الرقمية" : "My Purchases - Digital Products"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isArabic
            ? "جميع المنتجات الرقمية التي قمت بشرائها"
            : "All digital products you've purchased"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي المشتريات" : "Total Purchases"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "منتج مشترى" : "Products purchased"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي المبلغ المدفوع" : "Total Amount Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "على جميع المشتريات" : "Across all purchases"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "منتجات قابلة للتحميل" : "Downloadable Items"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloadableItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "جاهزة للتحميل" : "Ready to download"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "المكتبة الرقمية" : "Digital Library"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "جميع مشترياتك من المنتجات الرقمية مع روابط التحميل"
              : "All your digital product purchases with download links"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد مشتريات بعد" : "No purchases yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "ابدأ بتصفح المنتجات الرقمية واشترِ أول منتج لك"
                  : "Start browsing digital products and make your first purchase"}
              </p>
              <Link href={`/${locale}/marketplace/ready-products`}>
                <Button>
                  {isArabic ? "تصفح المنتجات" : "Browse Products"}
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                  <TableHead>{isArabic ? "تاريخ الشراء" : "Purchase Date"}</TableHead>
                  <TableHead>{isArabic ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead>{isArabic ? "التحميلات" : "Downloads"}</TableHead>
                  <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase: any) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isArabic ? purchase.product?.titleAr : purchase.product?.titleEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {purchase.product?.id || purchase.productId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.createdAt || purchase.purchasedAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(purchase.amount).toFixed(2)} {t.sar}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.downloadCount || 0}x</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "COMPLETED" || purchase.status === "PAID"
                            ? "default"
                            : purchase.status === "REFUNDED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {purchase.status === "COMPLETED" || purchase.status === "PAID"
                          ? isArabic
                            ? "مكتمل"
                            : "Completed"
                          : purchase.status === "REFUNDED"
                          ? isArabic
                            ? "مسترجع"
                            : "Refunded"
                          : isArabic
                          ? "معلق"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {isArabic ? "تحميل" : "Download"}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Receipt className="h-4 w-4 mr-2" />
                          {isArabic ? "الفاتورة" : "Invoice"}
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

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {isArabic ? "تقييماتي" : "My Reviews"}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? "المنتجات التي قمت بتقييمها"
              : "Products you've reviewed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {isArabic
              ? "لم تقم بتقييم أي منتج بعد. قيّم مشترياتك لمساعدة المشترين الآخرين"
              : "You haven't reviewed any products yet. Review your purchases to help other buyers"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
