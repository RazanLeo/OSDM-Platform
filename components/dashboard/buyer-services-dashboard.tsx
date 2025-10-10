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
import { Briefcase, Clock, CheckCircle, AlertCircle, MessageSquare, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface ServiceOrder {
  id: string
  service: {
    id: string
    titleAr: string
    titleEn: string
    seller: {
      name: string
      avatar?: string
    }
  }
  package: "BASIC" | "STANDARD" | "PREMIUM"
  amount: number
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED"
  orderedAt: string
  deadline: string
  progress: number
  deliveryTime: number
}

export function BuyerServicesDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockOrders: ServiceOrder[] = [
        {
          id: "so1",
          service: {
            id: "s1",
            titleAr: "تصميم شعار احترافي",
            titleEn: "Professional Logo Design",
            seller: {
              name: "أحمد المصمم",
              avatar: "/placeholder.jpg",
            },
          },
          package: "PREMIUM",
          amount: 500,
          status: "IN_PROGRESS",
          orderedAt: "2025-10-09T10:00:00Z",
          deadline: "2025-10-14T10:00:00Z",
          progress: 60,
          deliveryTime: 5,
        },
        {
          id: "so2",
          service: {
            id: "s2",
            titleAr: "كتابة محتوى تسويقي",
            titleEn: "Marketing Content Writing",
            seller: {
              name: "سارة الكاتبة",
            },
          },
          package: "STANDARD",
          amount: 350,
          status: "DELIVERED",
          orderedAt: "2025-10-05T14:00:00Z",
          deadline: "2025-10-12T14:00:00Z",
          progress: 100,
          deliveryTime: 7,
        },
        {
          id: "so3",
          service: {
            id: "s3",
            titleAr: "تطوير موقع ووردبريس",
            titleEn: "WordPress Website Development",
            seller: {
              name: "محمد المطور",
            },
          },
          package: "BASIC",
          amount: 800,
          status: "COMPLETED",
          orderedAt: "2025-09-20T09:00:00Z",
          deadline: "2025-10-05T09:00:00Z",
          progress: 100,
          deliveryTime: 15,
        },
      ]

      setOrders(mockOrders)
      setStats({
        activeOrders: mockOrders.filter((o) => o.status === "IN_PROGRESS").length,
        completedOrders: mockOrders.filter((o) => o.status === "COMPLETED").length,
        totalSpent: mockOrders.reduce((sum, o) => sum + o.amount, 0),
      })
      setLoading(false)
    }

    if (session) {
      fetchOrders()
    }
  }, [session])

  const getStatusIcon = (status: ServiceOrder["status"]) => {
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

  const getStatusColor = (status: ServiceOrder["status"]) => {
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
          <Briefcase className="h-8 w-8" />
          {isRTL ? "طلباتي - الخدمات المتخصصة" : "My Orders - Custom Services"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "جميع طلبات الخدمات المتخصصة التي قمت بطلبها"
            : "All custom service orders you've requested"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "طلبات نشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "طلبات مكتملة" : "Completed Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "تم التسليم" : "Delivered"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المبلغ المدفوع" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "على جميع الطلبات" : "Across all orders"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "جميع الطلبات" : "All Orders"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "تتبع جميع طلبات الخدمات وحالة التنفيذ"
              : "Track all your service orders and their progress"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد طلبات بعد" : "No orders yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL
                  ? "ابدأ بتصفح الخدمات المتخصصة واطلب أول خدمة لك"
                  : "Start browsing custom services and order your first service"}
              </p>
              <Button asChild>
                <Link href="/marketplace/services">{isRTL ? "تصفح الخدمات" : "Browse Services"}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
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
                              {isRTL ? "البائع:" : "Seller:"} {order.service.seller.name}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status === "IN_PROGRESS"
                              ? isRTL
                                ? "قيد التنفيذ"
                                : "In Progress"
                              : order.status === "DELIVERED"
                              ? isRTL
                                ? "تم التسليم"
                                : "Delivered"
                              : order.status === "COMPLETED"
                              ? isRTL
                                ? "مكتمل"
                                : "Completed"
                              : isRTL
                              ? "معلق"
                              : "Pending"}
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
                            <p className="font-medium">{order.amount.toLocaleString()} ر.س</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? "وقت التسليم" : "Delivery Time"}
                            </p>
                            <p className="font-medium">
                              {order.deliveryTime} {isRTL ? "يوم" : "days"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? "الموعد النهائي" : "Deadline"}
                            </p>
                            <p className="font-medium">
                              {new Date(order.deadline).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
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
                        {order.status === "DELIVERED" && (
                          <Button className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isRTL ? "قبول التسليم" : "Accept Delivery"}
                          </Button>
                        )}
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {isRTL ? "المحادثة" : "Messages"}
                        </Button>
                        {order.status === "COMPLETED" && (
                          <Button variant="outline" className="w-full">
                            <Star className="h-4 w-4 mr-2" />
                            {isRTL ? "تقييم" : "Review"}
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
