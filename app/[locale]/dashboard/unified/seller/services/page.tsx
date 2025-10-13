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
  Plus,
  Briefcase,
  Clock,
  DollarSign,
  Package,
  Users,
  Star,
  TrendingUp,
  MessageSquare,
  FileText,
  Video,
  Award,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function SellerServicesDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, servicesRes, ordersRes] = await Promise.all([
        fetch("/api/analytics/seller/services").then(r => r.json()),
        fetch("/api/services?sellerId=me").then(r => r.json()),
        fetch("/api/service-orders?sellerId=me").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setServices(servicesRes.services || [])
      setOrders(ordersRes.orders || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Fiverr + Khamsat Style */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            {isArabic
              ? "🟢 لوحة تحكم البائع - سوق المنتجات والخدمات الرقمية المتخصصة حسب الطلب"
              : "🟢 Seller Dashboard - Custom Digital Products & Services By Order"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "إدارة خدماتك وعروضك المتخصصة | Fiverr + Khamsat"
              : "Manage your custom services and gigs | Fiverr + Khamsat"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href={`/${locale}/dashboard/seller/services/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "خدمة جديدة" : "New Service"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Seller Level Badge - Fiverr Style */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-fuchsia-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12 text-purple-600" />
              <div>
                <h3 className="text-xl font-bold">{isArabic ? "مستوى البائع" : "Seller Level"}</h3>
                <Badge className="bg-purple-600 mt-2">
                  {isArabic ? "بائع مميز - المستوى 2" : "Top Rated - Level 2"}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي الإيرادات" : "Total Revenue"}</p>
              <p className="text-3xl font-bold text-purple-600">
                {analytics?.summary?.totalRevenue?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Fiverr Dashboard Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "الطلبات النشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.summary?.activeOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "الطلبات المكتملة" : "Completed Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.summary?.completedOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "هذا الشهر" : "This month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الخدمات" : "Total Gigs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">{analytics?.summary?.totalServices || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              {analytics?.summary?.activeServices || 0} {isArabic ? "نشط" : "active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "التقييم" : "Rating"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600">4.9</div>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "من 156 تقييم" : "From 156 reviews"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "معدل الاستجابة" : "Response Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">98%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "خلال ساعة واحدة" : "Within 1 hour"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="services">
            <Briefcase className="h-4 w-4 mr-2" />
            {isArabic ? "خدماتي" : "My Gigs"}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? "الطلبات" : "Orders"}
          </TabsTrigger>
          <TabsTrigger value="buyer-requests">
            <MessageSquare className="h-4 w-4 mr-2" />
            {isArabic ? "طلبات المشترين" : "Buyer Requests"}
          </TabsTrigger>
          <TabsTrigger value="extras">
            <Zap className="h-4 w-4 mr-2" />
            {isArabic ? "الإضافات" : "Gig Extras"}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "القوالب" : "Templates"}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            {isArabic ? "التحليلات" : "Analytics"}
          </TabsTrigger>
        </TabsList>

        {/* Services/Gigs Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "خدماتي المتخصصة (Gigs)" : "My Custom Services (Gigs)"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "إدارة خدماتك بنظام Fiverr + Khamsat - باقات متعددة، فيديو تعريفي، متطلبات الطلب"
                      : "Manage your gigs with Fiverr + Khamsat system - Multiple packages, video intro, requirements"}
                  </CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/${locale}/dashboard/seller/services/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "إضافة خدمة" : "Add Gig"}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "الخدمة" : "Gig"}</TableHead>
                    <TableHead>{isArabic ? "الباقات" : "Packages"}</TableHead>
                    <TableHead>{isArabic ? "الطلبات" : "Orders"}</TableHead>
                    <TableHead>{isArabic ? "التقييم" : "Rating"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد خدمات بعد. ابدأ بإنشاء أول خدمة!" : "No gigs yet. Start by creating your first gig!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {service.images?.[0] && (
                              <img
                                src={service.images[0]}
                                alt={service.titleEn}
                                className="h-12 w-16 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                {isArabic ? service.titleAr : service.titleEn}
                              </p>
                              <p className="text-xs text-muted-foreground">{service.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">3 {isArabic ? "باقات" : "packages"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{service.ordersCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{service.averageRating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {service.isActive ? (
                            <Badge className="bg-green-600">{isArabic ? "نشط" : "Active"}</Badge>
                          ) : (
                            <Badge variant="secondary">{isArabic ? "متوقف" : "Paused"}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {isArabic ? "تعديل" : "Edit"}
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

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إدارة الطلبات - نظام Fiverr" : "Order Management - Fiverr System"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "طلبات نشطة، قيد التنفيذ، مكتملة - نظام التسليم والمراجعات"
                  : "Active, in progress, completed orders - Delivery & revision system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {isArabic ? "الكل" : "All"} ({orders.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    {isArabic ? "نشط" : "Active"} (0)
                  </Button>
                  <Button variant="outline" size="sm">
                    {isArabic ? "متأخر" : "Late"} (0)
                  </Button>
                  <Button variant="outline" size="sm">
                    {isArabic ? "مكتمل" : "Completed"} (0)
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? "لا توجد طلبات حالياً" : "No orders currently"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buyer Requests Tab - Fiverr Feature */}
        <TabsContent value="buyer-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "لوحة طلبات المشترين - ميزة Fiverr" : "Buyer Requests Board - Fiverr Feature"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "تصفح طلبات المشترين وقدم عروضك المخصصة"
                  : "Browse buyer requests and submit custom offers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد طلبات جديدة" : "No new requests"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gig Extras Tab - Fiverr Feature */}
        <TabsContent value="extras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إضافات الخدمة (Gig Extras) - Fiverr" : "Gig Extras - Fiverr"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "خدمات إضافية يمكن للعملاء شراؤها مع الطلب الأساسي"
                  : "Additional services customers can purchase with the main order"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isArabic ? "إضافة Extra جديد" : "Add New Extra"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "قوالب الردود السريعة - Fiverr" : "Quick Response Templates - Fiverr"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "قوالب جاهزة للرد على استفسارات العملاء بسرعة"
                  : "Pre-made templates for quick customer inquiry responses"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isArabic ? "إضافة قالب" : "Add Template"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
