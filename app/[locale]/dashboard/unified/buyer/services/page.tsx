"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Briefcase, Clock, CheckCircle, MessageSquare, Star, Package, FileText, Plus } from "lucide-react"
import Link from "next/link"

export default function BuyerServicesDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch("/api/analytics/buyer/services").then(r => r.json()),
        fetch("/api/service-orders?buyerId=me").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setOrders(ordersRes.orders || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            {isArabic
              ? "🔵 لوحة تحكم المشتري - سوق المنتجات والخدمات الرقمية المتخصصة حسب الطلب"
              : "🔵 Buyer Dashboard - Custom Digital Products & Services Market"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? "طلباتك، مشاريعك، تواصلك مع المستقلين" : "Your orders, projects, freelancer communication"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href={`/${locale}/marketplace/custom-services`}>
              <Briefcase className="h-4 w-4 mr-2" />
              {isArabic ? "تصفح الخدمات" : "Browse Services"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/buyer-requests/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "طلب خدمة" : "Post Request"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "الطلبات النشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.summary?.activeOrders || 0}</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الإنفاق" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">
              {analytics?.summary?.totalSpent?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "المفضلة" : "Saved Gigs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            <Clock className="h-4 w-4 mr-2" />
            {isArabic ? "النشطة" : "Active"}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            {isArabic ? "المكتملة" : "Completed"}
          </TabsTrigger>
          <TabsTrigger value="requests">
            <MessageSquare className="h-4 w-4 mr-2" />
            {isArabic ? "طلباتي" : "My Requests"}
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Star className="h-4 w-4 mr-2" />
            {isArabic ? "المحفوظة" : "Saved"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "الطلبات النشطة - Fiverr Orders" : "Active Orders - Fiverr Style"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "الخدمة" : "Gig"}</TableHead>
                    <TableHead>{isArabic ? "البائع" : "Seller"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "التسليم" : "Delivery"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {isArabic ? "لا توجد طلبات نشطة" : "No active orders"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "طلبات الخدمة - Buyer Requests" : "Service Requests - Buyer Requests"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لم تنشر أي طلبات بعد" : "No requests posted yet"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
