"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Briefcase,
  DollarSign,
  Download,
  Eye,
  Trash2,
  Star,
} from "lucide-react"

interface BuyerDashboardClientProps {
  locale: Locale
  statsData: any
  purchasesData: any
  ordersData: any
  favoritesData: any
}

export function BuyerDashboardClient({
  locale,
  statsData,
  purchasesData,
  ordersData,
  favoritesData,
}: BuyerDashboardClientProps) {
  const router = useRouter()
  const isRTL = locale === "ar"
  const [activeTab, setActiveTab] = useState("overview")

  const t = {
    dashboard: isRTL ? "لوحة تحكم المشتري" : "Buyer Dashboard",
    overview: isRTL ? "نظرة عامة" : "Overview",
    purchases: isRTL ? "مشترياتي" : "My Purchases",
    orders: isRTL ? "طلباتي" : "My Orders",
    favorites: isRTL ? "المفضلة" : "Favorites",
    projects: isRTL ? "مشاريعي" : "My Projects",
    totalPurchases: isRTL ? "إجمالي المشتريات" : "Total Purchases",
    totalOrders: isRTL ? "إجمالي الطلبات" : "Total Orders",
    activeOrders: isRTL ? "طلبات نشطة" : "Active Orders",
    totalSpent: isRTL ? "إجمالي المصروفات" : "Total Spent",
    favoriteItems: isRTL ? "عناصر مفضلة" : "Favorite Items",
    activeProjects: isRTL ? "مشاريع نشطة" : "Active Projects",
    monthlySpending: isRTL ? "المصروفات الشهرية" : "Monthly Spending",
    recentPurchases: isRTL ? "المشتريات الأخيرة" : "Recent Purchases",
    product: isRTL ? "المنتج" : "Product",
    seller: isRTL ? "البائع" : "Seller",
    price: isRTL ? "السعر" : "Price",
    date: isRTL ? "التاريخ" : "Date",
    status: isRTL ? "الحالة" : "Status",
    actions: isRTL ? "الإجراءات" : "Actions",
    download: isRTL ? "تحميل" : "Download",
    view: isRTL ? "عرض" : "View",
    remove: isRTL ? "إزالة" : "Remove",
    viewAll: isRTL ? "عرض الكل" : "View All",
    pending: isRTL ? "قيد الانتظار" : "Pending",
    inProgress: isRTL ? "جاري التنفيذ" : "In Progress",
    completed: isRTL ? "مكتمل" : "Completed",
    service: isRTL ? "الخدمة" : "Service",
    amount: isRTL ? "المبلغ" : "Amount",
  }

  const stats = statsData?.overview || {}

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    const res = await fetch(`/api/buyer/favorites?id=${favoriteId}`, {
      method: "DELETE",
    })

    if (res.ok) {
      router.refresh()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.dashboard}</h1>
        <p className="text-muted-foreground">
          {isRTL
            ? "تتبع مشترياتك وطلباتك ومشاريعك"
            : "Track your purchases, orders, and projects"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalPurchases}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPurchases || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "منتج رقمي" : "Digital products"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalOrders}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t.activeOrders}: {stats.activeOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalSpent}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "إجمالي الإنفاق" : "Total spending"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.favoriteItems}
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.favoriteProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "عنصر محفوظ" : "Saved items"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="purchases">{t.purchases}</TabsTrigger>
          <TabsTrigger value="orders">{t.orders}</TabsTrigger>
          <TabsTrigger value="favorites">{t.favorites}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.monthlySpending}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statsData?.monthlySpending || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4691A9"
                    fill="#4691A9"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.recentPurchases}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("purchases")}
              >
                {t.viewAll}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.product}</TableHead>
                    <TableHead>{t.seller}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsData?.recentPurchases?.map((purchase: any) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {isRTL
                          ? purchase.readyProduct?.titleAr
                          : purchase.readyProduct?.titleEn}
                      </TableCell>
                      <TableCell>{purchase.seller?.fullName}</TableCell>
                      <TableCell>
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <h2 className="text-2xl font-bold">{t.purchases}</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.product}</TableHead>
                    <TableHead>{t.seller}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasesData?.purchases?.map((purchase: any) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {isRTL
                          ? purchase.readyProduct?.titleAr
                          : purchase.readyProduct?.titleEn}
                      </TableCell>
                      <TableCell>{purchase.seller?.fullName}</TableCell>
                      <TableCell>
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">{t.orders}</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.service}</TableHead>
                    <TableHead>{t.seller}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.date}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData?.orders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {isRTL
                          ? order.customService?.titleAr
                          : order.customService?.titleEn}
                      </TableCell>
                      <TableCell>{order.seller?.fullName}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "default"
                              : order.status === "IN_PROGRESS"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.status === "COMPLETED"
                            ? t.completed
                            : order.status === "IN_PROGRESS"
                            ? t.inProgress
                            : t.pending}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <h2 className="text-2xl font-bold">{t.favorites}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritesData?.favorites?.map((favorite: any) => {
              const item = favorite.readyProduct || favorite.customService
              const isProduct = !!favorite.readyProduct

              return (
                <Card key={favorite.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted mb-3 rounded-md overflow-hidden">
                      {item?.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={isRTL ? item.titleAr : item.titleEn}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">
                      {isRTL ? item?.titleAr : item?.titleEn}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      {isProduct ? (
                        <p className="text-lg font-bold">
                          {formatCurrency(item.price)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? "خدمة مخصصة" : "Custom Service"}
                        </p>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">
                          {item?.averageRating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          router.push(
                            `/${locale}/marketplace/${isProduct ? "ready-products" : "custom-services"}/${item.id}`
                          )
                        }
                      >
                        {t.view}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
