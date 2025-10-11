"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, CheckCircle, AlertCircle, MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import type { Locale } from "@/lib/i18n/config"

interface BuyerServicesDashboardProps {
  orders: any[]
  stats: {
    activeOrders: number
    completedOrders: number
    totalSpent: number
  }
  locale: Locale
  translations: any
}

export function BuyerServicesDashboard({
  orders,
  stats,
  locale,
  translations: t
}: BuyerServicesDashboardProps) {
  const isArabic = locale === "ar"

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "default"
      case "DELIVERED":
        return "secondary"
      case "COMPLETED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-[#4691A9]" />
          {isArabic ? "طلباتي - الخدمات المتخصصة" : "My Orders - Custom Services"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isArabic
            ? "جميع طلبات الخدمات المتخصصة التي قمت بطلبها"
            : "All custom service orders you've requested"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "طلبات نشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "طلبات مكتملة" : "Completed Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "تم التسليم" : "Delivered"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي المبلغ المدفوع" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "على جميع الطلبات" : "Across all orders"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "جميع الطلبات" : "All Orders"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "تتبع جميع طلبات الخدمات وحالة التنفيذ"
              : "Track all your service orders and their progress"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد طلبات بعد" : "No orders yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "ابدأ بتصفح الخدمات المتخصصة واطلب أول خدمة لك"
                  : "Start browsing custom services and order your first service"}
              </p>
              <Link href={`/${locale}/marketplace/services`}>
                <Button>
                  {isArabic ? "تصفح الخدمات" : "Browse Services"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {isArabic ? order.service?.titleAr : order.service?.titleEn}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? "البائع:" : "Seller:"} {order.service?.seller?.name || order.service?.seller?.fullName || order.seller?.fullName}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status === "IN_PROGRESS"
                              ? isArabic
                                ? "قيد التنفيذ"
                                : "In Progress"
                              : order.status === "DELIVERED"
                              ? isArabic
                                ? "تم التسليم"
                                : "Delivered"
                              : order.status === "COMPLETED"
                              ? isArabic
                                ? "مكتمل"
                                : "Completed"
                              : isArabic
                              ? "معلق"
                              : "Pending"}
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
                            <p className="font-medium">{Number(order.amount).toFixed(2)} {t.sar}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {isArabic ? "وقت التسليم" : "Delivery Time"}
                            </p>
                            <p className="font-medium">
                              {order.deliveryTime || order.deliveryDays || "-"} {isArabic ? "يوم" : "days"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {isArabic ? "الموعد النهائي" : "Deadline"}
                            </p>
                            <p className="font-medium">
                              {new Date(order.deadline || order.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}
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
                        {order.status === "DELIVERED" && (
                          <Button className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isArabic ? "قبول التسليم" : "Accept Delivery"}
                          </Button>
                        )}
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {isArabic ? "المحادثة" : "Messages"}
                        </Button>
                        {order.status === "COMPLETED" && (
                          <Button variant="outline" className="w-full">
                            <Star className="h-4 w-4 mr-2" />
                            {isArabic ? "تقييم" : "Review"}
                          </Button>
                        )}
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
