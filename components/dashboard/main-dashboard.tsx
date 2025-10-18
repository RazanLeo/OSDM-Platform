"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package, Briefcase, FolderKanban,
  ShoppingCart, DollarSign, Users,
  TrendingUp, Download, Star, Clock,
  LayoutDashboard, Settings, Bell
} from "lucide-react"
import Link from "next/link"

export function MainDashboard({ isArabic = true }: { isArabic?: boolean }) {
  const [mode, setMode] = useState<"seller" | "buyer">("seller")

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setMode("seller")}
              variant={mode === "seller" ? "default" : "outline"}
              size="lg"
              className="w-48"
            >
              <Package className="h-5 w-5 mr-2" />
              {isArabic ? "وضع البائع" : "Seller Mode"}
            </Button>
            <Button
              onClick={() => setMode("buyer")}
              variant={mode === "buyer" ? "default" : "outline"}
              size="lg"
              className="w-48"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isArabic ? "وضع المشتري" : "Buyer Mode"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Title */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          {isArabic ? "لوحة التحكم الرئيسية" : "Main Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === "seller"
            ? (isArabic ? "إدارة منتجاتك وخدماتك ومشاريعك" : "Manage your products, services, and projects")
            : (isArabic ? "إدارة مشترياتك ومشاريعك وطلباتك" : "Manage your purchases, projects, and orders")
          }
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mode === "seller"
                ? (isArabic ? "إجمالي المبيعات" : "Total Sales")
                : (isArabic ? "إجمالي المشتريات" : "Total Purchases")
              }
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 ر.س</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "+20% من الشهر الماضي" : "+20% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mode === "seller"
                ? (isArabic ? "الطلبات النشطة" : "Active Orders")
                : (isArabic ? "الطلبات الجارية" : "Ongoing Orders")
              }
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "+3 اليوم" : "+3 today"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? "التقييم" : "Rating"}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "من 150 تقييم" : "from 150 reviews"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mode === "seller"
                ? (isArabic ? "إجمالي العناصر" : "Total Items")
                : (isArabic ? "المفضلة" : "Favorites")
              }
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "+5 هذا الأسبوع" : "+5 this week"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 6 Sub-Dashboards Tabs */}
      <Tabs defaultValue={mode === "seller" ? "seller-products" : "buyer-products"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {mode === "seller" ? (
            <>
              <TabsTrigger value="seller-products" className="gap-2">
                <Package className="h-4 w-4" />
                {isArabic ? "المنتجات الجاهزة" : "Ready Products"}
              </TabsTrigger>
              <TabsTrigger value="seller-services" className="gap-2">
                <Briefcase className="h-4 w-4" />
                {isArabic ? "الخدمات المتخصصة" : "Custom Services"}
              </TabsTrigger>
              <TabsTrigger value="seller-projects" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                {isArabic ? "العمل الحر" : "Freelance Work"}
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="buyer-products" className="gap-2">
                <Package className="h-4 w-4" />
                {isArabic ? "مشترياتي" : "My Purchases"}
              </TabsTrigger>
              <TabsTrigger value="buyer-services" className="gap-2">
                <Briefcase className="h-4 w-4" />
                {isArabic ? "خدماتي" : "My Services"}
              </TabsTrigger>
              <TabsTrigger value="buyer-projects" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                {isArabic ? "مشاريعي" : "My Projects"}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* SELLER SUB-DASHBOARDS */}
        {mode === "seller" && (
          <>
            {/* 1. Seller Products Dashboard */}
            <TabsContent value="seller-products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {isArabic ? "لوحة تحكم المنتجات الجاهزة - Gumroad + Picalica" : "Ready Products Dashboard - Gumroad + Picalica"}
                    </span>
                    <Link href="/ar/seller/products/create">
                      <Button size="sm">{isArabic ? "+ منتج جديد" : "+ New Product"}</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "منتج نشط" : "Active Products"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">542</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "إجمالي التحميلات" : "Total Downloads"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">8,450 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "الإيرادات" : "Revenue"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/seller/products">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض جميع المنتجات →" : "View All Products →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Seller Services Dashboard */}
            <TabsContent value="seller-services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {isArabic ? "لوحة تحكم الخدمات المتخصصة - Fiverr + Khamsat" : "Custom Services Dashboard - Fiverr + Khamsat"}
                    </span>
                    <Link href="/ar/seller/services/create">
                      <Button size="sm">{isArabic ? "+ خدمة جديدة" : "+ New Service"}</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "خدمة نشطة" : "Active Services"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">67</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "طلب مكتمل" : "Completed Orders"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">15,200 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "الإيرادات" : "Revenue"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/seller/services">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض جميع الخدمات →" : "View All Services →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Seller Freelance Dashboard */}
            <TabsContent value="seller-projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    {isArabic ? "لوحة تحكم العمل الحر - Upwork + Mostaql + Bahr" : "Freelance Dashboard - Upwork + Mostaql + Bahr"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "مشروع نشط" : "Active Projects"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">34</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "عرض مقدم" : "Proposals Sent"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">22,100 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "الإيرادات" : "Revenue"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/seller/projects">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض المشاريع والعروض →" : "View Projects & Proposals →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* BUYER SUB-DASHBOARDS */}
        {mode === "buyer" && (
          <>
            {/* 4. Buyer Products Dashboard */}
            <TabsContent value="buyer-products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {isArabic ? "لوحة تحكم مشترياتي - Gumroad + Picalica" : "My Purchases Dashboard - Gumroad + Picalica"}
                    </span>
                    <Link href="/ar/marketplace/ready-products">
                      <Button size="sm">{isArabic ? "تصفح المنتجات" : "Browse Products"}</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "منتج مشترى" : "Products Purchased"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">156</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "تحميل" : "Downloads"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">5,430 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "إجمالي المصروفات" : "Total Spent"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/buyer/products">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض مشترياتي →" : "View My Purchases →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 5. Buyer Services Dashboard */}
            <TabsContent value="buyer-services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {isArabic ? "لوحة تحكم خدماتي - Fiverr + Khamsat" : "My Services Dashboard - Fiverr + Khamsat"}
                    </span>
                    <Link href="/ar/marketplace/custom-services">
                      <Button size="sm">{isArabic ? "تصفح الخدمات" : "Browse Services"}</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">15</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "طلب خدمة" : "Service Orders"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "قيد التنفيذ" : "In Progress"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">8,900 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "إجمالي المصروفات" : "Total Spent"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/buyer/services">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض طلباتي →" : "View My Orders →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 6. Buyer Projects Dashboard */}
            <TabsContent value="buyer-projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" />
                      {isArabic ? "لوحة تحكم مشاريعي - Upwork + Mostaql + Bahr" : "My Projects Dashboard - Upwork + Mostaql + Bahr"}
                    </span>
                    <Link href="/ar/client/projects/create">
                      <Button size="sm">{isArabic ? "+ مشروع جديد" : "+ New Project"}</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "مشروع منشور" : "Posted Projects"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">47</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "عرض مستلم" : "Proposals Received"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">18,500 ر.س</div>
                        <p className="text-xs text-muted-foreground">{isArabic ? "إجمالي المصروفات" : "Total Spent"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Link href="/ar/client/projects">
                    <Button variant="outline" className="w-full">{isArabic ? "عرض مشاريعي →" : "View My Projects →"}</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/ar/cart">
              <Button variant="outline" className="w-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                {isArabic ? "السلة" : "Cart"}
              </Button>
            </Link>
            <Link href="/ar/orders">
              <Button variant="outline" className="w-full gap-2">
                <Package className="h-4 w-4" />
                {isArabic ? "الطلبات" : "Orders"}
              </Button>
            </Link>
            <Link href="/ar/notifications">
              <Button variant="outline" className="w-full gap-2">
                <Bell className="h-4 w-4" />
                {isArabic ? "الإشعارات" : "Notifications"}
              </Button>
            </Link>
            <Link href="/ar/settings">
              <Button variant="outline" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                {isArabic ? "الإعدادات" : "Settings"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
