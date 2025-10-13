"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
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
import {
  ShoppingBag,
  Download,
  Star,
  Clock,
  CheckCircle,
  Package,
  CreditCard,
  FileKey,
  Heart,
} from "lucide-react"
import Link from "next/link"

export default function BuyerProductsDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [licenses, setLicenses] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, purchasesRes, subscriptionsRes, licensesRes] = await Promise.all([
        fetch("/api/analytics/buyer/products").then(r => r.json()),
        fetch("/api/product-orders?buyerId=me").then(r => r.json()),
        fetch("/api/subscriptions/products").then(r => r.json()),
        fetch("/api/licenses/validate").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setPurchases(purchasesRes.orders || [])
      setSubscriptions(subscriptionsRes.subscriptions || [])
      setLicenses(licensesRes.licenses || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {isArabic
              ? "🔵 لوحة تحكم المشتري - سوق المنتجات الرقمية الجاهزة"
              : "🔵 Buyer Dashboard - Ready Digital Products Market"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "مشترياتك، تنزيلاتك، اشتراكاتك، تراخيصك"
              : "Your purchases, downloads, subscriptions, licenses"}
          </p>
        </div>

        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={`/${locale}/marketplace/ready-products`}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isArabic ? "تصفح المنتجات" : "Browse Products"}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي المشتريات" : "Total Purchases"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{analytics?.summary?.totalPurchases || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الإنفاق" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.summary?.totalSpent?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "التنزيلات" : "Downloads"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">{analytics?.summary?.totalDownloads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "الاشتراكات النشطة" : "Active Subscriptions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{subscriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="purchases">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? "مشترياتي" : "My Purchases"}
          </TabsTrigger>
          <TabsTrigger value="downloads">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "التنزيلات" : "Downloads"}
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="h-4 w-4 mr-2" />
            {isArabic ? "الاشتراكات" : "Subscriptions"}
          </TabsTrigger>
          <TabsTrigger value="licenses">
            <FileKey className="h-4 w-4 mr-2" />
            {isArabic ? "التراخيص" : "Licenses"}
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="h-4 w-4 mr-2" />
            {isArabic ? "المفضلة" : "Wishlist"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "مشترياتي من المنتجات الرقمية" : "My Digital Product Purchases"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "جميع المنتجات التي اشتريتها - تنزيل فوري مدى الحياة"
                  : "All products you've purchased - Instant lifetime download"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لم تشتري أي منتجات بعد" : "No purchases yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {purchase.Product.images?.[0] && (
                              <img
                                src={purchase.Product.images[0]}
                                alt={purchase.Product.titleEn}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                {isArabic ? purchase.Product.titleAr : purchase.Product.titleEn}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "البائع:" : "Seller:"} {purchase.Product.Seller.nameEn}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {purchase.amount} {isArabic ? "ر.س" : "SAR"}
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">{isArabic ? "مكتمل" : "Completed"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            {isArabic ? "تنزيل" : "Download"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "اشتراكاتي - Gumroad Subscriptions" : "My Subscriptions - Gumroad"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "إدارة اشتراكاتك الشهرية والسنوية"
                  : "Manage your monthly and annual subscriptions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد اشتراكات نشطة" : "No active subscriptions"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "تراخيصي - Gumroad License Keys" : "My Licenses - Gumroad Keys"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "مفاتيح التراخيص الخاصة بمنتجاتك"
                  : "License keys for your purchased products"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد تراخيص" : "No licenses"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
