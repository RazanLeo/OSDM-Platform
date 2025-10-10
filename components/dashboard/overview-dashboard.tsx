"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/i18n/language-provider"
import { Package, Briefcase, FolderKanban, TrendingUp, Wallet, ShoppingCart, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface DashboardStats {
  products: {
    totalSales: number
    totalRevenue: number
    activeListing: number
    pendingOrders: number
  }
  services: {
    totalOrders: number
    totalRevenue: number
    activeServices: number
    pendingDeliveries: number
  }
  projects: {
    totalContracts: number
    totalRevenue: number
    activeProjects: number
    pendingMilestones: number
  }
  wallet: {
    balance: number
    totalEarnings: number
    pendingPayments: number
  }
}

export function OverviewDashboard() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real data from API
    const fetchStats = async () => {
      setLoading(true)
      // Simulated data for now
      await new Promise((resolve) => setTimeout(resolve, 500))
      setStats({
        products: {
          totalSales: 125,
          totalRevenue: 45000,
          activeListing: 28,
          pendingOrders: 5,
        },
        services: {
          totalOrders: 87,
          totalRevenue: 32000,
          activeServices: 15,
          pendingDeliveries: 3,
        },
        projects: {
          totalContracts: 42,
          totalRevenue: 128000,
          activeProjects: 12,
          pendingMilestones: 8,
        },
        wallet: {
          balance: 15000,
          totalEarnings: 205000,
          pendingPayments: 7500,
        },
      })
      setLoading(false)
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">{t.overview}</h1>
        <p className="text-muted-foreground mt-2">
          مرحبًا {session?.user?.name}، إليك ملخص شامل لأدائك عبر جميع الأسواق
        </p>
      </div>

      {/* Wallet Overview */}
      <Card className="bg-gradient-to-br from-[#846F9C] to-[#4691A9] text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            {t.wallet}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-90">{t.balance}</p>
              <p className="text-2xl font-bold">{stats.wallet.balance.toLocaleString()} ر.س</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t.earnings}</p>
              <p className="text-2xl font-bold">{stats.wallet.totalEarnings.toLocaleString()} ر.س</p>
            </div>
            <div>
              <p className="text-sm opacity-90">معلق</p>
              <p className="text-2xl font-bold">{stats.wallet.pendingPayments.toLocaleString()} ر.س</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">{t.products}</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">{t.services}</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">{t.projects}</span>
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.totalSales}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +12% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.products.totalRevenue.toLocaleString()} ر.س
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +8% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  المنتجات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.activeListing}</div>
                <p className="text-xs text-muted-foreground mt-1">منتج منشور</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  طلبات معلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.pendingOrders}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  يحتاج إجراء
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.services.totalOrders}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +15% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.services.totalRevenue.toLocaleString()} ر.س
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +10% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الخدمات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.services.activeServices}</div>
                <p className="text-xs text-muted-foreground mt-1">خدمة منشورة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  تسليمات معلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.services.pendingDeliveries}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  يحتاج إجراء
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي العقود
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects.totalContracts}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +20% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.projects.totalRevenue.toLocaleString()} ر.س
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +18% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  مشاريع نشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects.activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">مشروع قيد التنفيذ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  معالم معلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects.pendingMilestones}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  يحتاج مراجعة
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاطات الأخيرة</CardTitle>
          <CardDescription>آخر 5 عمليات عبر جميع الأسواق</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { market: "products", action: "بيع منتج", time: "منذ ساعتين", amount: 350 },
              { market: "services", action: "طلب خدمة جديد", time: "منذ 4 ساعات", amount: 500 },
              { market: "projects", action: "تسليم معلم", time: "منذ يوم", amount: 2000 },
              { market: "products", action: "بيع منتج", time: "منذ يومين", amount: 150 },
              { market: "services", action: "اكتمال خدمة", time: "منذ 3 أيام", amount: 750 },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {activity.market === "products" && <Package className="h-4 w-4 text-[#846F9C]" />}
                  {activity.market === "services" && <Briefcase className="h-4 w-4 text-[#4691A9]" />}
                  {activity.market === "projects" && <FolderKanban className="h-4 w-4 text-[#89A58F]" />}
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="font-bold text-green-600">+{activity.amount} ر.س</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
