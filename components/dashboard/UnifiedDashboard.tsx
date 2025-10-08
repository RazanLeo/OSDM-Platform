"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShoppingBag,
  Package,
  Briefcase,
  ShoppingCart,
  FileText,
  TrendingUp,
  DollarSign,
  Star,
  Users,
  Activity
} from "lucide-react"
import type { Locale } from "@/lib/i18n/config"

interface UnifiedDashboardProps {
  user: any
  locale: Locale
  translations: any
}

export function UnifiedDashboard({ user, locale, translations: t }: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const isArabic = locale === "ar"

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
            {isArabic ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic ? `مرحباً ${user.fullName}` : `Welcome ${user.fullName}`}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? "إجمالي المبيعات" : "Total Sales"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#846F9C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalEarnings.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground">
              {user.totalSales} {isArabic ? "عملية بيع" : "sales"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? "المشتريات" : "Purchases"}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#4691A9]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "إجمالي المشتريات" : "total purchases"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? "التقييم" : "Rating"}
            </CardTitle>
            <Star className="h-4 w-4 text-[#89A58F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {user.totalReviews} {isArabic ? "تقييم" : "reviews"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? "الرصيد" : "Balance"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#846F9C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.balance.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "متاح للسحب" : "available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            {isArabic ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="seller">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isArabic ? "كبائع" : "As Seller"}
          </TabsTrigger>
          <TabsTrigger value="buyer">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isArabic ? "كمشتري" : "As Buyer"}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Package className="h-8 w-8 text-[#846F9C]" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.readyProducts?.length || 0} {isArabic ? "منتج رقمي" : "digital products"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "سوق المنتجات الرقمية" : "Digital marketplace"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Briefcase className="h-8 w-8 text-[#4691A9]" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.customServices?.length || 0} {isArabic ? "خدمة مخصصة" : "custom services"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "سوق الخدمات المخصصة" : "Services marketplace"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-[#89A58F]" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.projects?.length || 0} {isArabic ? "مشروع/عرض" : "projects/proposals"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "سوق المشاريع والعمل الحر" : "Freelance marketplace"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "الإحصائيات" : "Statistics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{isArabic ? "معدل الإكمال" : "Completion Rate"}</span>
                      <span className="text-sm font-bold">95%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#846F9C] to-[#4691A9] h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{isArabic ? "رضا العملاء" : "Customer Satisfaction"}</span>
                      <span className="text-sm font-bold">4.8/5</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#4691A9] to-[#89A58F] h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{isArabic ? "وقت الاستجابة" : "Response Time"}</span>
                      <span className="text-sm font-bold">{isArabic ? "سريع" : "Fast"}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#89A58F] to-[#846F9C] h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seller Tab */}
        <TabsContent value="seller" className="space-y-4 mt-6">
          <Tabs defaultValue="digital" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="digital">
                <Package className="h-4 w-4 mr-2" />
                {isArabic ? "منتجات رقمية" : "Digital Products"}
              </TabsTrigger>
              <TabsTrigger value="services">
                <Briefcase className="h-4 w-4 mr-2" />
                {isArabic ? "خدمات مخصصة" : "Services"}
              </TabsTrigger>
              <TabsTrigger value="proposals">
                <FileText className="h-4 w-4 mr-2" />
                {isArabic ? "عروض المشاريع" : "Proposals"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="digital" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "منتجاتي الرقمية" : "My Digital Products"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "منتجات جاهزة للبيع (Gumroad + Picalica)" : "Ready-to-sell products (Gumroad + Picalica)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.readyProducts?.length > 0 ? (
                    <div className="space-y-3">
                      {user.readyProducts.map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-muted-foreground">{product.price} {t.sar}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {product.salesCount || 0} {isArabic ? "مبيعات" : "sales"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد منتجات بعد" : "No products yet"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "خدماتي المخصصة" : "My Custom Services"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "خدمات حسب الطلب (Fiverr + Khamsat)" : "On-demand services (Fiverr + Khamsat)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.customServices?.length > 0 ? (
                    <div className="space-y-3">
                      {user.customServices.map((service: any) => (
                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{service.title}</p>
                            <p className="text-sm text-muted-foreground">{isArabic ? "من" : "From"} {service.basePrice} {t.sar}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {service.ordersCount || 0} {isArabic ? "طلبات" : "orders"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد خدمات بعد" : "No services yet"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposals" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "عروضي على المشاريع" : "My Project Proposals"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "العمل الحر (Upwork + Mostaql + Bahr)" : "Freelance (Upwork + Mostaql + Bahr)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    {isArabic ? "قريباً..." : "Coming soon..."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Buyer Tab */}
        <TabsContent value="buyer" className="space-y-4 mt-6">
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchases">
                <Package className="h-4 w-4 mr-2" />
                {isArabic ? "مشترياتي الرقمية" : "Digital Purchases"}
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Briefcase className="h-4 w-4 mr-2" />
                {isArabic ? "طلباتي للخدمات" : "Service Orders"}
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FileText className="h-4 w-4 mr-2" />
                {isArabic ? "مشاريعي المنشورة" : "Posted Projects"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "مشترياتي من المنتجات الرقمية" : "My Digital Purchases"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "المنتجات التي اشتريتها" : "Products I purchased"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    {isArabic ? "لا توجد مشتريات بعد" : "No purchases yet"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "طلباتي للخدمات المخصصة" : "My Service Orders"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "الخدمات التي طلبتها" : "Services I ordered"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    {isArabic ? "لا توجد طلبات بعد" : "No orders yet"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "مشاريعي المنشورة" : "My Posted Projects"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "المشاريع التي نشرتها للعمل الحر" : "Projects I posted for freelancers"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.projects?.length > 0 ? (
                    <div className="space-y-3">
                      {user.projects.map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-muted-foreground">{project.budget} {t.sar}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.proposalsCount || 0} {isArabic ? "عروض" : "proposals"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد مشاريع بعد" : "No projects yet"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
