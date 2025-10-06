"use client"

import type { Locale } from "@/lib/i18n/config"
import { useState } from "react"
import {
  Plus, Package, DollarSign, TrendingUp, Eye, ShoppingCart,
  Star, Clock, Download, Edit, Trash2, Copy, Filter, Search,
  ArrowUpRight, ArrowDownRight, MoreVertical, FileText,
  Wallet, CreditCard, Settings, MessageSquare, BarChart3,
  Users, CheckCircle, XCircle, AlertCircle, TrendingDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

// Mock Data
const salesData = [
  { name: "Jan", sales: 4000, revenue: 2400 },
  { name: "Feb", sales: 3000, revenue: 1398 },
  { name: "Mar", sales: 2000, revenue: 9800 },
  { name: "Apr", sales: 2780, revenue: 3908 },
  { name: "May", sales: 1890, revenue: 4800 },
  { name: "Jun", sales: 2390, revenue: 3800 },
  { name: "Jul", sales: 3490, revenue: 4300 },
]

const recentOrders = [
  { id: "#ORD-001", customer: "Ahmed Ali", product: "UI Kit Pro", amount: "$49.99", status: "completed", date: "2 hours ago" },
  { id: "#ORD-002", customer: "Sara Mohammed", product: "Dashboard Template", amount: "$79.99", status: "processing", date: "5 hours ago" },
  { id: "#ORD-003", customer: "Omar Hassan", product: "Icon Pack", amount: "$19.99", status: "completed", date: "1 day ago" },
  { id: "#ORD-004", customer: "Layla Ibrahim", product: "Website Theme", amount: "$99.99", status: "pending", date: "2 days ago" },
]

const topProducts = [
  { name: "UI Kit Pro", sales: 245, revenue: "$12,245", trend: 12 },
  { name: "Dashboard Template", sales: 189, revenue: "$15,111", trend: 8 },
  { name: "Icon Pack", sales: 167, revenue: "$3,340", trend: -3 },
  { name: "Website Theme", sales: 142, revenue: "$14,200", trend: 15 },
]

const products = [
  {
    id: 1,
    name: "UI Kit Pro",
    category: "Design",
    price: "$49.99",
    sales: 245,
    views: 1520,
    revenue: "$12,245",
    status: "active",
    rating: 4.8,
    reviews: 45
  },
  {
    id: 2,
    name: "Dashboard Template",
    category: "Templates",
    price: "$79.99",
    sales: 189,
    views: 2340,
    revenue: "$15,111",
    status: "active",
    rating: 4.9,
    reviews: 67
  },
  {
    id: 3,
    name: "Icon Pack",
    category: "Graphics",
    price: "$19.99",
    sales: 167,
    views: 890,
    revenue: "$3,340",
    status: "active",
    rating: 4.7,
    reviews: 23
  },
]

const reviews = [
  {
    id: 1,
    customer: "Ahmed Ali",
    avatar: "/avatars/01.png",
    product: "UI Kit Pro",
    rating: 5,
    comment: "Excellent product! Very professional and easy to use.",
    date: "2 days ago",
    replied: false
  },
  {
    id: 2,
    customer: "Sara Mohammed",
    avatar: "/avatars/02.png",
    product: "Dashboard Template",
    rating: 4,
    comment: "Great template, but documentation could be better.",
    date: "5 days ago",
    replied: true
  },
]

const withdrawals = [
  { id: 1, amount: "$1,240", status: "completed", date: "Jan 15, 2025", method: "PayPal" },
  { id: 2, amount: "$850", status: "completed", date: "Dec 20, 2024", method: "Bank Transfer" },
  { id: 3, amount: "$2,100", status: "processing", date: "Feb 1, 2025", method: "PayPal" },
]

export default function SellerDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const isArabic = locale === "ar"
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const t = {
    title: isArabic ? "لوحة تحكم البائع" : "Seller Dashboard",
    subtitle: isArabic ? "إدارة منتجاتك ومبيعاتك" : "Manage your products and sales",
    addProduct: isArabic ? "إضافة منتج جديد" : "Add New Product",

    // Stats
    totalSales: isArabic ? "إجمالي المبيعات" : "Total Sales",
    earnings: isArabic ? "الأرباح" : "Earnings",
    products: isArabic ? "المنتجات المنشورة" : "Published Products",
    newOrders: isArabic ? "الطلبات الجديدة" : "New Orders",
    avgRating: isArabic ? "التقييم" : "Average Rating",
    responseRate: isArabic ? "معدل الاستجابة" : "Response Rate",

    // Tabs
    overview: isArabic ? "نظرة عامة" : "Overview",
    myProducts: isArabic ? "المنتجات" : "Products",
    orders: isArabic ? "الطلبات" : "Orders",
    earningsTab: isArabic ? "الأرباح" : "Earnings",
    reviewsTab: isArabic ? "التقييمات" : "Reviews",
    settingsTab: isArabic ? "الإعدادات" : "Settings",

    // Overview
    salesChart: isArabic ? "رسم بياني للمبيعات" : "Sales Chart",
    recentOrders: isArabic ? "أحدث الطلبات" : "Recent Orders",
    topProducts: isArabic ? "المنتجات الأكثر مبيعاً" : "Top Products",

    // Common
    search: isArabic ? "بحث..." : "Search...",
    filter: isArabic ? "تصفية" : "Filter",
    actions: isArabic ? "الإجراءات" : "Actions",
    edit: isArabic ? "تعديل" : "Edit",
    delete: isArabic ? "حذف" : "Delete",
    duplicate: isArabic ? "نسخ" : "Duplicate",
    viewAll: isArabic ? "عرض الكل" : "View All",

    // Status
    active: isArabic ? "نشط" : "Active",
    pending: isArabic ? "قيد الانتظار" : "Pending",
    completed: isArabic ? "مكتمل" : "Completed",
    processing: isArabic ? "قيد المعالجة" : "Processing",

    // Earnings
    walletBalance: isArabic ? "رصيد المحفظة" : "Wallet Balance",
    pendingEarnings: isArabic ? "الأرباح المعلقة" : "Pending Earnings",
    withdraw: isArabic ? "سحب الأرباح" : "Withdraw",
    withdrawHistory: isArabic ? "سجل السحوبات" : "Withdrawal History",

    thisMonth: isArabic ? "هذا الشهر" : "This month",
    lastMonth: isArabic ? "الشهر الماضي" : "Last month",
    vsLastMonth: isArabic ? "عن الشهر الماضي" : "vs last month",
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <Button size="lg" className="gap-2 bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90">
            <Plus className="h-5 w-5" />
            {t.addProduct}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-l-4 border-l-[#846F9C] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalSales}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-[#846F9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,567</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+12.5%</span>
                <span className="text-muted-foreground ml-1">{t.vsLastMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4691A9] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.earnings}</CardTitle>
              <DollarSign className="h-4 w-4 text-[#4691A9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$18,420</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+8.2%</span>
                <span className="text-muted-foreground ml-1">{t.vsLastMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#89A58F] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.products}</CardTitle>
              <Package className="h-4 w-4 text-[#89A58F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">3 {t.active.toLowerCase()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.newOrders}</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">{t.pending.toLowerCase()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.avgRating}</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">From 135 reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.responseRate}</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">Avg: 2h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              {t.myProducts}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t.orders}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t.earningsTab}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              {t.reviewsTab}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              {t.settingsTab}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t.salesChart}</CardTitle>
                <CardDescription>{t.lastMonth}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#846F9C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#846F9C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4691A9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4691A9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#846F9C" fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="revenue" stroke="#4691A9" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t.recentOrders}</CardTitle>
                    <CardDescription>Latest transactions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">{t.viewAll}</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{order.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{order.customer}</p>
                            <p className="text-xs text-muted-foreground">{order.product}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{order.amount}</p>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}
                            className="text-xs mt-1"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.topProducts}</CardTitle>
                  <CardDescription>Best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'}`} />
                            <span className="font-medium text-sm">{product.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{product.revenue}</span>
                            {product.trend > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={(product.sales / 250) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{t.myProducts}</CardTitle>
                    <CardDescription>Manage all your digital products</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>{product.views}</TableCell>
                        <TableCell className="font-semibold">{product.revenue}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm">{product.rating}</span>
                            <span className="text-xs text-muted-foreground">({product.reviews})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t.edit}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                {t.duplicate}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.orders}</CardTitle>
                <CardDescription>Track and manage your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.walletBalance}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$18,420.50</div>
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    {t.withdraw}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.pendingEarnings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$2,150.00</div>
                  <p className="text-sm text-muted-foreground">Available in 7 days</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.thisMonth}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$8,420.00</div>
                  <div className="flex items-center text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+12.5%</span>
                    <span className="text-muted-foreground ml-1">{t.vsLastMonth}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t.withdrawHistory}</CardTitle>
                <CardDescription>Your withdrawal transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-semibold">{withdrawal.amount}</TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>
                          <Badge variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{withdrawal.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.reviewsTab}</CardTitle>
                <CardDescription>Customer feedback on your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-3 pb-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>{review.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.customer}</p>
                            <p className="text-sm text-muted-foreground">{review.product}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      {!review.replied && (
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      )}
                      {review.replied && (
                        <Badge variant="secondary">Replied</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Profile</CardTitle>
                <CardDescription>Manage your seller information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                </div>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{isArabic ? "قريباً..." : "Settings coming soon..."}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
