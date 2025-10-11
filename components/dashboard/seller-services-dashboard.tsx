"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, TrendingUp, Clock, MessageSquare, Upload, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"

interface SellerServicesDashboardProps {
  services: any[]
  orders: any[]
  stats: {
    totalServices: number
    activeOrders: number
    completedOrders: number
    totalRevenue: number
    pendingDeliveries: number
  }
  locale: Locale
  translations: any
}

export function SellerServicesDashboard({
  services,
  orders,
  stats,
  locale,
  translations: t
}: SellerServicesDashboardProps) {
  const isArabic = locale === "ar"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-[#4691A9]" />
            {isArabic ? "خدماتي - الخدمات المتخصصة" : "My Services - Custom Services"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "إدارة خدماتك وطلبات العملاء (Fiverr + Khamsat)"
              : "Manage your services and customer orders (Fiverr + Khamsat)"}
          </p>
        </div>
        <Link href={`/${locale}/seller/services/new`}>
          <Button size="lg" className="gap-2 bg-gradient-to-r from-[#4691A9] to-[#89A58F]">
            <Plus className="h-5 w-5" />
            {isArabic ? "إضافة خدمة جديدة" : "Add New Service"}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي الخدمات" : "Total Services"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "خدمة منشورة" : "Published services"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "طلبات نشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {isArabic ? "يحتاج إجراء" : "Needs action"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "طلبات مكتملة" : "Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isArabic ? "إجمالي المكتمل" : "total completed"}
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
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isArabic ? "صافي أرباحك" : "net earnings"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#4691A9] to-[#89A58F] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isArabic ? "تسليمات معلقة" : "Pending Deliveries"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
            <p className="text-xs text-white/80 mt-1">
              {isArabic ? "بانتظار قبول العميل" : "Awaiting client approval"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "الطلبات النشطة" : "Active Orders"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "الطلبات التي تحتاج إلى إجراء منك"
              : "Orders that need your attention"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.filter((o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد طلبات نشطة" : "No active orders"}
              </h3>
              <p className="text-muted-foreground">
                {isArabic
                  ? "جميع طلباتك مكتملة. عمل رائع!"
                  : "All your orders are completed. Great job!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter((o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED")
                .map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {isArabic ? order.service.titleAr : order.service.titleEn}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? "العميل:" : "Client:"} {order.buyer.name || order.buyer.fullName}
                              </p>
                            </div>
                            <Badge
                              variant={
                                order.status === "IN_PROGRESS"
                                  ? "default"
                                  : order.status === "DELIVERED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.status === "IN_PROGRESS"
                                ? isArabic
                                  ? "قيد التنفيذ"
                                  : "In Progress"
                                : order.status === "DELIVERED"
                                ? isArabic
                                  ? "تم التسليم"
                                  : "Delivered"
                                : isArabic
                                ? "جديد"
                                : "New"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "الباقة" : "Package"}
                              </p>
                              <p className="font-medium">
                                {order.package === "BASIC"
                                  ? isArabic
                                    ? "أساسي"
                                    : "Basic"
                                  : order.package === "STANDARD"
                                  ? isArabic
                                    ? "قياسي"
                                    : "Standard"
                                  : isArabic
                                  ? "مميز"
                                  : "Premium"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "المبلغ" : "Amount"}
                              </p>
                              <p className="font-medium text-green-600">
                                {Number(order.amount).toFixed(2)} {t.sar}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "الموعد النهائي" : "Deadline"}
                              </p>
                              <p className="font-medium">
                                {new Date(order.deadline || order.createdAt).toLocaleDateString(
                                  isArabic ? "ar-SA" : "en-US"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "الرسائل" : "Messages"}
                              </p>
                              <p className="font-medium flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                              </p>
                            </div>
                          </div>

                          {order.status === "IN_PROGRESS" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {isArabic ? "التقدم:" : "Progress:"}
                                </span>
                                <span className="font-medium">{order.progress || 0}%</span>
                              </div>
                              <Progress value={order.progress || 0} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[150px]">
                          {order.status === "PENDING" && (
                            <Button className="w-full">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isArabic ? "بدء العمل" : "Start Work"}
                            </Button>
                          )}
                          {order.status === "IN_PROGRESS" && (
                            <Button className="w-full">
                              <Upload className="h-4 w-4 mr-2" />
                              {isArabic ? "تسليم العمل" : "Deliver Work"}
                            </Button>
                          )}
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {isArabic ? "المحادثة" : "Messages"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Services */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "خدماتي المنشورة" : "My Published Services"}</CardTitle>
          <CardDescription>
            {isArabic ? "جميع خدماتك مع الإحصائيات" : "All your services with statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد خدمات بعد" : "No services yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "ابدأ بإضافة أول خدمة لك وابدأ البيع"
                  : "Start by adding your first service and start selling"}
              </p>
              <Link href={`/${locale}/seller/services/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة خدمة" : "Add Service"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">
                          {isArabic ? service.titleAr : service.titleEn}
                        </h3>
                        <Badge variant={service.status === "APPROVED" ? "default" : "secondary"} className="mt-2">
                          {service.status === "APPROVED" ? (isArabic ? "نشط" : "Active") : (isArabic ? service.status === "PENDING" ? "قيد المراجعة" : "موقوف" : service.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">{isArabic ? "طلبات" : "Orders"}</p>
                          <p className="font-bold">{service._count?.orders || 0}</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">{isArabic ? "تقييم" : "Rating"}</p>
                          <p className="font-bold flex items-center justify-center gap-1">
                            {Number(service.averageRating || 0).toFixed(1)}
                            <span className="text-yellow-500">★</span>
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">{isArabic ? "مراجعات" : "Reviews"}</p>
                          <p className="font-bold text-sm">{service._count?.reviews || 0}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/${locale}/seller/services/${service.id}/edit`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            {isArabic ? "تعديل" : "Edit"}
                          </Button>
                        </Link>
                        <Link href={`/${locale}/services/${service.slug}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            {isArabic ? "عرض" : "View"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
