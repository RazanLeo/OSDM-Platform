"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Briefcase,
  FolderKanban,
  Download,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function UnifiedOverviewDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [viewMode, setViewMode] = useState<"seller" | "buyer">("seller")
  const [marketFilter, setMarketFilter] = useState<"all" | "products" | "services" | "projects">("all")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [viewMode, marketFilter, timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load analytics from all 6 dashboards
      const [productsData, servicesData, projectsData] = await Promise.all([
        fetch(`/api/analytics/${viewMode}/products?period=${timeRange}`).then(r => r.json()),
        fetch(`/api/analytics/${viewMode}/services?period=${timeRange}`).then(r => r.json()),
        fetch(`/api/analytics/${viewMode}/projects?period=${timeRange}`).then(r => r.json()),
      ])

      setAnalytics({
        products: productsData,
        services: servicesData,
        projects: projectsData,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals across all markets
  const getTotalRevenue = () => {
    if (!analytics) return 0
    const productsRev = analytics.products?.summary?.totalRevenue || 0
    const servicesRev = analytics.services?.summary?.totalRevenue || 0
    const projectsRev = analytics.projects?.summary?.totalEarnings || 0
    return productsRev + servicesRev + projectsRev
  }

  const getTotalOrders = () => {
    if (!analytics) return 0
    const productsSales = analytics.products?.summary?.totalSales || 0
    const servicesOrders = analytics.services?.summary?.totalOrders || 0
    const projectsCompleted = analytics.projects?.summary?.completedProjects || 0
    return productsSales + servicesOrders + projectsCompleted
  }

  // Revenue chart data
  const revenueChartData = {
    labels: isArabic
      ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
      : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: isArabic ? "المنتجات الجاهزة" : "Ready Products",
        data: [12000, 15000, 13000, 17000, 16000, 19000, 21000],
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: isArabic ? "الخدمات المتخصصة" : "Custom Services",
        data: [8000, 9500, 11000, 10000, 12000, 13500, 15000],
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: isArabic ? "فرص العمل الحر" : "Freelance Jobs",
        data: [5000, 6000, 7000, 8000, 9000, 10000, 12000],
        borderColor: "rgb(217, 70, 239)",
        backgroundColor: "rgba(217, 70, 239, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Market distribution
  const marketDistributionData = {
    labels: isArabic
      ? ["المنتجات الجاهزة", "الخدمات المتخصصة", "فرص العمل الحر"]
      : ["Ready Products", "Custom Services", "Freelance Jobs"],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(217, 70, 239, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            {isArabic ? "الملخص العام - لوحة التحكم الرئيسية" : "Overview Dashboard - Main Control"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "رؤية شاملة لجميع أنشطتك عبر الأسواق الثلاثة"
              : "Comprehensive view of all your activities across three markets"}
          </p>
        </div>

        {/* Mode & Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="seller">{isArabic ? "🟢 بائع" : "🟢 Seller"}</TabsTrigger>
              <TabsTrigger value="buyer">{isArabic ? "🔵 مشتري" : "🔵 Buyer"}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={marketFilter} onValueChange={(v) => setMarketFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">{isArabic ? "الكل" : "All"}</TabsTrigger>
              <TabsTrigger value="products">{isArabic ? "منتجات" : "Products"}</TabsTrigger>
              <TabsTrigger value="services">{isArabic ? "خدمات" : "Services"}</TabsTrigger>
              <TabsTrigger value="projects">{isArabic ? "مشاريع" : "Projects"}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="7d">{isArabic ? "7 أيام" : "7 Days"}</TabsTrigger>
              <TabsTrigger value="30d">{isArabic ? "30 يوم" : "30 Days"}</TabsTrigger>
              <TabsTrigger value="90d">{isArabic ? "90 يوم" : "90 Days"}</TabsTrigger>
              <TabsTrigger value="1y">{isArabic ? "سنة" : "1 Year"}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-violet-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي الإيرادات" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-violet-600">
                  {getTotalRevenue().toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  +12.5% {isArabic ? "من الشهر الماضي" : "from last month"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-violet-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "إجمالي الطلبات" : "Total Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{getTotalOrders()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  +8.2% {isArabic ? "من الشهر الماضي" : "from last month"}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-fuchsia-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "الطلبات النشطة" : "Active Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-fuchsia-600">24</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {isArabic ? "قيد التنفيذ" : "In Progress"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-fuchsia-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "التقييم العام" : "Overall Rating"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-pink-600">4.8</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <Star className="h-8 w-8 text-pink-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Performance Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isArabic ? "الإيرادات عبر الأسواق الثلاثة" : "Revenue Across Three Markets"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "تتبع أداء إيراداتك في كل سوق على حدة"
                : "Track your revenue performance in each market separately"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "توزيع الأسواق" : "Market Distribution"}</CardTitle>
            <CardDescription>
              {isArabic ? "نسبة المبيعات لكل سوق" : "Sales percentage per market"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Doughnut
              data={marketDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Links to Sub-Dashboards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-10 w-10 text-violet-600" />
              <div>
                <CardTitle>{isArabic ? "المنتجات الجاهزة" : "Ready Products"}</CardTitle>
                <CardDescription className="text-xs">Gumroad + Picalica</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "المبيعات" : "Sales"}:</span>
                <span className="font-bold">{analytics?.products?.summary?.totalSales || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "الإيرادات" : "Revenue"}:</span>
                <span className="font-bold">
                  {analytics?.products?.summary?.totalRevenue?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                </span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700">
              {isArabic ? "عرض التفاصيل" : "View Details"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="h-10 w-10 text-purple-600" />
              <div>
                <CardTitle>{isArabic ? "الخدمات المتخصصة" : "Custom Services"}</CardTitle>
                <CardDescription className="text-xs">Fiverr + Khamsat</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "الطلبات" : "Orders"}:</span>
                <span className="font-bold">{analytics?.services?.summary?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "الإيرادات" : "Revenue"}:</span>
                <span className="font-bold">
                  {analytics?.services?.summary?.totalRevenue?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                </span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              {isArabic ? "عرض التفاصيل" : "View Details"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950 dark:to-pink-950">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FolderKanban className="h-10 w-10 text-fuchsia-600" />
              <div>
                <CardTitle>{isArabic ? "فرص العمل الحر" : "Freelance Jobs"}</CardTitle>
                <CardDescription className="text-xs">Upwork + Mostaql + Bahr</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "المشاريع" : "Projects"}:</span>
                <span className="font-bold">{analytics?.projects?.summary?.totalProjects || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{isArabic ? "الأرباح" : "Earnings"}:</span>
                <span className="font-bold">
                  {analytics?.projects?.summary?.totalEarnings?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                </span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700">
              {isArabic ? "عرض التفاصيل" : "View Details"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
