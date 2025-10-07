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
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react"

interface SellerDashboardClientProps {
  locale: Locale
  statsData: any
  productsData: any
  servicesData: any
  walletData: any
}

export function SellerDashboardClient({
  locale,
  statsData,
  productsData,
  servicesData,
  walletData,
}: SellerDashboardClientProps) {
  const router = useRouter()
  const isRTL = locale === "ar"
  const [activeTab, setActiveTab] = useState("overview")

  const t = {
    dashboard: isRTL ? "لوحة التحكم" : "Dashboard",
    overview: isRTL ? "نظرة عامة" : "Overview",
    products: isRTL ? "المنتجات" : "Products",
    services: isRTL ? "الخدمات" : "Services",
    orders: isRTL ? "الطلبات" : "Orders",
    wallet: isRTL ? "المحفظة" : "Wallet",
    settings: isRTL ? "الإعدادات" : "Settings",
    totalEarnings: isRTL ? "إجمالي الأرباح" : "Total Earnings",
    availableBalance: isRTL ? "الرصيد المتاح" : "Available Balance",
    pendingEarnings: isRTL ? "أرباح معلقة" : "Pending Earnings",
    totalProducts: isRTL ? "إجمالي المنتجات" : "Total Products",
    totalServices: isRTL ? "إجمالي الخدمات" : "Total Services",
    totalOrders: isRTL ? "إجمالي الطلبات" : "Total Orders",
    completedOrders: isRTL ? "طلبات مكتملة" : "Completed Orders",
    activeProducts: isRTL ? "منتجات نشطة" : "Active Products",
    pendingProducts: isRTL ? "منتجات قيد المراجعة" : "Pending Products",
    averageRating: isRTL ? "متوسط التقييم" : "Average Rating",
    totalReviews: isRTL ? "إجمالي التقييمات" : "Total Reviews",
    monthlyEarnings: isRTL ? "الأرباح الشهرية" : "Monthly Earnings",
    recentOrders: isRTL ? "الطلبات الأخيرة" : "Recent Orders",
    topProducts: isRTL ? "المنتجات الأكثر مبيعاً" : "Top Selling Products",
    addProduct: isRTL ? "إضافة منتج" : "Add Product",
    addService: isRTL ? "إضافة خدمة" : "Add Service",
    viewAll: isRTL ? "عرض الكل" : "View All",
    status: isRTL ? "الحالة" : "Status",
    price: isRTL ? "السعر" : "Price",
    sales: isRTL ? "المبيعات" : "Sales",
    revenue: isRTL ? "الإيرادات" : "Revenue",
    actions: isRTL ? "الإجراءات" : "Actions",
    approved: isRTL ? "موافق عليه" : "Approved",
    pending: isRTL ? "قيد المراجعة" : "Pending",
    rejected: isRTL ? "مرفوض" : "Rejected",
    edit: isRTL ? "تعديل" : "Edit",
    delete: isRTL ? "حذف" : "Delete",
    view: isRTL ? "عرض" : "View",
    buyer: isRTL ? "المشتري" : "Buyer",
    amount: isRTL ? "المبلغ" : "Amount",
    date: isRTL ? "التاريخ" : "Date",
    withdraw: isRTL ? "سحب" : "Withdraw",
    sar: isRTL ? "ر.س" : "SAR",
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
    return new Date(date).toLocaleDateString(
      isRTL ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    )
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
      return
    }

    const res = await fetch(`/api/seller/products/${productId}`, {
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
            ? "إدارة منتجاتك وخدماتك ومتابعة أرباحك"
            : "Manage your products, services, and track your earnings"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalEarnings}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.availableBalance}: {formatCurrency(stats.availableBalance || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalProducts}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t.activeProducts}: {stats.activeProducts || 0}
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
              {t.completedOrders}: {stats.completedOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.averageRating}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.averageRating || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews || 0} {t.totalReviews}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="products">{t.products}</TabsTrigger>
          <TabsTrigger value="services">{t.services}</TabsTrigger>
          <TabsTrigger value="orders">{t.orders}</TabsTrigger>
          <TabsTrigger value="wallet">{t.wallet}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Monthly Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.monthlyEarnings}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statsData?.monthlyEarnings || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#846F9C"
                    fill="#846F9C"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.topProducts}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("products")}
              >
                {t.viewAll}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead>{t.sales}</TableHead>
                    <TableHead>{t.revenue}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsData?.topProducts?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {isRTL ? product.titleAr : product.titleEn}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.salesCount || 0}</TableCell>
                      <TableCell>
                        {formatCurrency(product.totalRevenue || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t.products}</h2>
            <Button onClick={() => router.push(`/${locale}/dashboard/seller/products/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addProduct}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead>{t.sales}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData?.products?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {isRTL ? product.titleAr : product.titleEn}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "APPROVED"
                              ? "default"
                              : product.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {product.status === "APPROVED"
                            ? t.approved
                            : product.status === "PENDING"
                            ? t.pending
                            : t.rejected}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.salesCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/${locale}/dashboard/seller/products/${product.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/${locale}/dashboard/seller/products/${product.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t.services}</h2>
            <Button onClick={() => router.push(`/${locale}/dashboard/seller/services/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addService}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "الخدمة" : "Service"}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{isRTL ? "الطلبات" : "Orders"}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesData?.services?.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        {isRTL ? service.titleAr : service.titleEn}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            service.status === "APPROVED"
                              ? "default"
                              : service.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {service.status === "APPROVED"
                            ? t.approved
                            : service.status === "PENDING"
                            ? t.pending
                            : t.rejected}
                        </Badge>
                      </TableCell>
                      <TableCell>{service._count?.orders || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/${locale}/dashboard/seller/services/${service.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/${locale}/dashboard/seller/services/${service.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold">{t.recentOrders}</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.buyer}</TableHead>
                    <TableHead>{isRTL ? "المنتج/الخدمة" : "Product/Service"}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.date}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsData?.recentOrders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.buyer?.fullName}</TableCell>
                      <TableCell>
                        {order.readyProduct
                          ? isRTL
                            ? order.readyProduct.titleAr
                            : order.readyProduct.titleEn
                          : order.customService
                          ? isRTL
                            ? order.customService.titleAr
                            : order.customService.titleEn
                          : "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t.availableBalance}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(walletData?.wallet?.availableBalance || 0)}
                </div>
                <Button className="mt-4 w-full">{t.withdraw}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t.totalEarnings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(walletData?.wallet?.totalEarnings || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t.pendingEarnings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(walletData?.wallet?.pendingEarnings || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "المعاملات الأخيرة" : "Recent Transactions"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "النوع" : "Type"}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.date}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletData?.transactions?.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge>{transaction.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
