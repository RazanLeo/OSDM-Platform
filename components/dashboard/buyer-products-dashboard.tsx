"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n/language-provider"
import { Package, Download, Receipt, Star, ShoppingBag } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ProductPurchase {
  id: string
  product: {
    id: string
    titleAr: string
    titleEn: string
    thumbnail: string
  }
  amount: number
  purchasedAt: string
  downloadCount: number
  status: "PAID" | "COMPLETED" | "REFUNDED"
}

export function BuyerProductsDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<ProductPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    downloadableItems: 0,
  })

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true)
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockPurchases: ProductPurchase[] = [
        {
          id: "1",
          product: {
            id: "p1",
            titleAr: "كتاب تعلم البرمجة بلغة بايثون",
            titleEn: "Learn Python Programming Book",
            thumbnail: "/placeholder.jpg",
          },
          amount: 199,
          purchasedAt: "2025-10-08T10:00:00Z",
          downloadCount: 3,
          status: "COMPLETED",
        },
        {
          id: "2",
          product: {
            id: "p2",
            titleAr: "قوالب Canva احترافية - 100 تصميم",
            titleEn: "Professional Canva Templates - 100 Designs",
            thumbnail: "/placeholder.jpg",
          },
          amount: 149,
          purchasedAt: "2025-10-05T14:30:00Z",
          downloadCount: 1,
          status: "COMPLETED",
        },
        {
          id: "3",
          product: {
            id: "p3",
            titleAr: "دورة تصميم UI/UX كاملة",
            titleEn: "Complete UI/UX Design Course",
            thumbnail: "/placeholder.jpg",
          },
          amount: 399,
          purchasedAt: "2025-10-01T09:15:00Z",
          downloadCount: 5,
          status: "COMPLETED",
        },
      ]

      setPurchases(mockPurchases)
      setStats({
        totalPurchases: mockPurchases.length,
        totalSpent: mockPurchases.reduce((sum, p) => sum + p.amount, 0),
        downloadableItems: mockPurchases.length,
      })
      setLoading(false)
    }

    if (session) {
      fetchPurchases()
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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8" />
          {isRTL ? "مشترياتي - المنتجات الرقمية" : "My Purchases - Digital Products"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "جميع المنتجات الرقمية التي قمت بشرائها"
            : "All digital products you've purchased"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المشتريات" : "Total Purchases"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "منتج مشترى" : "Products purchased"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المبلغ المدفوع" : "Total Amount Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "على جميع المشتريات" : "Across all purchases"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "منتجات قابلة للتحميل" : "Downloadable Items"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloadableItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "جاهزة للتحميل" : "Ready to download"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "المكتبة الرقمية" : "Digital Library"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "جميع مشترياتك من المنتجات الرقمية مع روابط التحميل"
              : "All your digital product purchases with download links"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد مشتريات بعد" : "No purchases yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL
                  ? "ابدأ بتصفح المنتجات الرقمية واشترِ أول منتج لك"
                  : "Start browsing digital products and make your first purchase"}
              </p>
              <Button asChild>
                <Link href="/marketplace/products">{isRTL ? "تصفح المنتجات" : "Browse Products"}</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "المنتج" : "Product"}</TableHead>
                  <TableHead>{isRTL ? "تاريخ الشراء" : "Purchase Date"}</TableHead>
                  <TableHead>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead>{isRTL ? "التحميلات" : "Downloads"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isRTL ? purchase.product.titleAr : purchase.product.titleEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {purchase.product.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.purchasedAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {purchase.amount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.downloadCount}x</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "COMPLETED"
                            ? "default"
                            : purchase.status === "REFUNDED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {purchase.status === "COMPLETED"
                          ? isRTL
                            ? "مكتمل"
                            : "Completed"
                          : purchase.status === "REFUNDED"
                          ? isRTL
                            ? "مسترجع"
                            : "Refunded"
                          : isRTL
                          ? "معلق"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {isRTL ? "تحميل" : "Download"}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Receipt className="h-4 w-4 mr-2" />
                          {isRTL ? "الفاتورة" : "Invoice"}
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
            {isRTL ? "تقييماتي" : "My Reviews"}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? "المنتجات التي قمت بتقييمها"
              : "Products you've reviewed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {isRTL
              ? "لم تقم بتقييم أي منتج بعد. قيّم مشترياتك لمساعدة المشترين الآخرين"
              : "You haven't reviewed any products yet. Review your purchases to help other buyers"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
