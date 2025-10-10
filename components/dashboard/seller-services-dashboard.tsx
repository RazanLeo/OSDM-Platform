"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/language-provider"
import { Briefcase, Plus, TrendingUp, Clock, MessageSquare, Upload, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface ServiceOrder {
  id: string
  service: {
    titleAr: string
    titleEn: string
  }
  buyer: {
    name: string
    avatar?: string
  }
  package: "BASIC" | "STANDARD" | "PREMIUM"
  amount: number
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED"
  orderedAt: string
  deadline: string
  progress: number
  unreadMessages: number
}

interface Service {
  id: string
  titleAr: string
  titleEn: string
  orders: number
  revenue: number
  rating: number
  isActive: boolean
}

export function SellerServicesDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalServices: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockOrders: ServiceOrder[] = [
        {
          id: "so1",
          service: {
            titleAr: "تصميم شعار احترافي",
            titleEn: "Professional Logo Design",
          },
          buyer: {
            name: "محمد أحمد",
          },
          package: "PREMIUM",
          amount: 500,
          status: "IN_PROGRESS",
          orderedAt: "2025-10-09T10:00:00Z",
          deadline: "2025-10-14T10:00:00Z",
          progress: 75,
          unreadMessages: 2,
        },
        {
          id: "so2",
          service: {
            titleAr: "كتابة محتوى تسويقي",
            titleEn: "Marketing Content Writing",
          },
          buyer: {
            name: "سارة علي",
          },
          package: "STANDARD",
          amount: 350,
          status: "PENDING",
          orderedAt: "2025-10-10T14:00:00Z",
          deadline: "2025-10-17T14:00:00Z",
          progress: 0,
          unreadMessages: 0,
        },
        {
          id: "so3",
          service: {
            titleAr: "تطوير موقع ووردبريس",
            titleEn: "WordPress Website Development",
          },
          buyer: {
            name: "أحمد خالد",
          },
          package: "BASIC",
          amount: 800,
          status: "DELIVERED",
          orderedAt: "2025-09-20T09:00:00Z",
          deadline: "2025-10-05T09:00:00Z",
          progress: 100,
          unreadMessages: 1,
        },
      ]

      const mockServices: Service[] = [
        {
          id: "s1",
          titleAr: "تصميم شعار احترافي",
          titleEn: "Professional Logo Design",
          orders: 45,
          revenue: 22500,
          rating: 4.9,
          isActive: true,
        },
        {
          id: "s2",
          titleAr: "كتابة محتوى تسويقي",
          titleEn: "Marketing Content Writing",
          orders: 32,
          revenue: 11200,
          rating: 4.8,
          isActive: true,
        },
        {
          id: "s3",
          titleAr: "تطوير موقع ووردبريس",
          titleEn: "WordPress Development",
          orders: 18,
          revenue: 14400,
          rating: 5.0,
          isActive: true,
        },
      ]

      setOrders(mockOrders)
      setServices(mockServices)

      setStats({
        totalServices: mockServices.length,
        activeOrders: mockOrders.filter((o) => o.status === "IN_PROGRESS" || o.status === "PENDING").length,
        completedOrders: mockOrders.filter((o) => o.status === "COMPLETED").length,
        totalRevenue: mockServices.reduce((sum, s) => sum + s.revenue, 0),
        pendingDeliveries: mockOrders.filter((o) => o.status === "DELIVERED").length,
      })
      setLoading(false)
    }

    if (session) {
      fetchData()
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
            <Briefcase className="h-8 w-8" />
            {isRTL ? "خدماتي - الخدمات المتخصصة" : "My Services - Custom Services"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL
              ? "إدارة خدماتك وطلبات العملاء"
              : "Manage your services and customer orders"}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          {isRTL ? "إضافة خدمة جديدة" : "Add New Service"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي الخدمات" : "Total Services"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "خدمة منشورة" : "Published services"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "طلبات نشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {isRTL ? "يحتاج إجراء" : "Needs action"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "طلبات مكتملة" : "Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isRTL ? "+8% هذا الشهر" : "+8% this month"}
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

        <Card className="bg-gradient-to-br from-[#4691A9] to-[#89A58F] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isRTL ? "تسليمات معلقة" : "Pending Deliveries"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
            <p className="text-xs text-white/80 mt-1">
              {isRTL ? "بانتظار قبول العميل" : "Awaiting client approval"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "الطلبات النشطة" : "Active Orders"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "الطلبات التي تحتاج إلى إجراء منك"
              : "Orders that need your attention"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد طلبات نشطة" : "No active orders"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL
                  ? "جميع طلباتك مكتملة. عمل رائع!"
                  : "All your orders are completed. Great job!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {isRTL ? order.service.titleAr : order.service.titleEn}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? "العميل:" : "Client:"} {order.buyer.name}
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
                                ? isRTL
                                  ? "قيد التنفيذ"
                                  : "In Progress"
                                : order.status === "DELIVERED"
                                ? isRTL
                                  ? "تم التسليم"
                                  : "Delivered"
                                : isRTL
                                ? "جديد"
                                : "New"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isRTL ? "الباقة" : "Package"}
                              </p>
                              <p className="font-medium">
                                {order.package === "BASIC"
                                  ? isRTL
                                    ? "أساسي"
                                    : "Basic"
                                  : order.package === "STANDARD"
                                  ? isRTL
                                    ? "قياسي"
                                    : "Standard"
                                  : isRTL
                                  ? "مميز"
                                  : "Premium"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isRTL ? "المبلغ" : "Amount"}
                              </p>
                              <p className="font-medium text-green-600">
                                {order.amount.toLocaleString()} ر.س
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isRTL ? "الموعد النهائي" : "Deadline"}
                              </p>
                              <p className="font-medium">
                                {new Date(order.deadline).toLocaleDateString(
                                  isRTL ? "ar-SA" : "en-US"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isRTL ? "الرسائل" : "Messages"}
                              </p>
                              <p className="font-medium flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {order.unreadMessages > 0 && (
                                  <Badge variant="destructive" className="text-xs px-1">
                                    {order.unreadMessages}
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>

                          {order.status === "IN_PROGRESS" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {isRTL ? "التقدم:" : "Progress:"}
                                </span>
                                <span className="font-medium">{order.progress}%</span>
                              </div>
                              <Progress value={order.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[150px]">
                          {order.status === "PENDING" && (
                            <Button className="w-full">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isRTL ? "بدء العمل" : "Start Work"}
                            </Button>
                          )}
                          {order.status === "IN_PROGRESS" && (
                            <Button className="w-full">
                              <Upload className="h-4 w-4 mr-2" />
                              {isRTL ? "تسليم العمل" : "Deliver Work"}
                            </Button>
                          )}
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {isRTL ? "المحادثة" : "Messages"}
                            {order.unreadMessages > 0 && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {order.unreadMessages}
                              </Badge>
                            )}
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
          <CardTitle>{isRTL ? "خدماتي المنشورة" : "My Published Services"}</CardTitle>
          <CardDescription>
            {isRTL ? "جميع خدماتك مع الإحصائيات" : "All your services with statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">
                        {isRTL ? service.titleAr : service.titleEn}
                      </h3>
                      <Badge variant={service.isActive ? "default" : "secondary"} className="mt-2">
                        {service.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">{isRTL ? "طلبات" : "Orders"}</p>
                        <p className="font-bold">{service.orders}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">{isRTL ? "إيرادات" : "Revenue"}</p>
                        <p className="font-bold text-sm">{(service.revenue / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">{isRTL ? "تقييم" : "Rating"}</p>
                        <p className="font-bold flex items-center justify-center gap-1">
                          {service.rating}
                          <span className="text-yellow-500">★</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        {isRTL ? "تعديل" : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        {isRTL ? "إحصائيات" : "Stats"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
