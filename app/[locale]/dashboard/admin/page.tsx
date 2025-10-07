"use client"

import type { Locale } from "@/lib/i18n/config"
import { useState } from "react"
import {
  Users, Package, DollarSign, ShoppingCart, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, XCircle, Clock, Star, Eye, Search,
  Filter, MoreVertical, Edit, Trash2, Ban, CheckCheck, FileText,
  BarChart3, PieChart, Activity, Wallet, CreditCard, Settings,
  UserCheck, UserX, ShieldAlert, Download, ArrowUpRight, ArrowDownRight,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart as RePieChart, Pie, Cell } from "recharts"

// Mock Data
const platformStats = [
  { name: "Jan", users: 120, revenue: 12400, products: 45 },
  { name: "Feb", users: 180, revenue: 18900, products: 67 },
  { name: "Mar", users: 240, revenue: 24500, products: 89 },
  { name: "Apr", users: 310, revenue: 31200, products: 112 },
  { name: "May", users: 380, revenue: 38900, products: 145 },
  { name: "Jun", users: 450, revenue: 45600, products: 178 },
]

const categoryData = [
  { name: "Design", value: 35, color: "#846F9C" },
  { name: "Development", value: 28, color: "#4691A9" },
  { name: "Marketing", value: 18, color: "#89A58F" },
  { name: "Business", value: 12, color: "#FFA500" },
  { name: "Others", value: 7, color: "#A0A0A0" },
]

const users = [
  {
    id: 1,
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    role: "Seller",
    status: "active",
    joinDate: "Jan 15, 2025",
    sales: 45,
    revenue: "$2,250",
    rating: 4.8
  },
  {
    id: 2,
    name: "Sara Mohammed",
    email: "sara@example.com",
    role: "Buyer",
    status: "active",
    joinDate: "Jan 10, 2025",
    purchases: 12,
    spent: "$580",
    rating: 4.9
  },
  {
    id: 3,
    name: "Omar Hassan",
    email: "omar@example.com",
    role: "Seller",
    status: "suspended",
    joinDate: "Dec 20, 2024",
    sales: 23,
    revenue: "$1,150",
    rating: 4.2
  },
  {
    id: 4,
    name: "Layla Ibrahim",
    email: "layla@example.com",
    role: "Seller",
    status: "active",
    joinDate: "Jan 5, 2025",
    sales: 67,
    revenue: "$3,350",
    rating: 4.9
  },
]

const products = [
  {
    id: 1,
    name: "UI Kit Pro",
    seller: "Ahmed Ali",
    category: "Design",
    price: "$49.99",
    sales: 245,
    revenue: "$12,245",
    status: "approved",
    rating: 4.8,
    reported: 0
  },
  {
    id: 2,
    name: "Dashboard Template",
    seller: "Layla Ibrahim",
    category: "Development",
    price: "$79.99",
    sales: 189,
    revenue: "$15,111",
    status: "pending",
    rating: 4.9,
    reported: 0
  },
  {
    id: 3,
    name: "Marketing Course",
    seller: "Omar Hassan",
    category: "Marketing",
    price: "$99.99",
    sales: 34,
    revenue: "$3,400",
    status: "approved",
    rating: 3.8,
    reported: 3
  },
]

const allOrders = [
  {
    id: "#ORD-001",
    buyer: "Sara Mohammed",
    seller: "Ahmed Ali",
    product: "UI Kit Pro",
    amount: "$49.99",
    commission: "$4.99",
    status: "completed",
    date: "Jan 15, 2025"
  },
  {
    id: "#ORD-002",
    buyer: "Ali Khalid",
    seller: "Layla Ibrahim",
    product: "Dashboard Template",
    amount: "$79.99",
    commission: "$7.99",
    status: "processing",
    date: "Jan 14, 2025"
  },
  {
    id: "#ORD-003",
    buyer: "Fatima Noor",
    seller: "Ahmed Ali",
    product: "Icon Pack",
    amount: "$19.99",
    commission: "$1.99",
    status: "completed",
    date: "Jan 13, 2025"
  },
]

const disputes = [
  {
    id: "#DIS-001",
    order: "#ORD-045",
    buyer: "Khaled Ahmad",
    seller: "Omar Hassan",
    reason: "Product not as described",
    amount: "$99.99",
    status: "open",
    date: "Jan 12, 2025"
  },
  {
    id: "#DIS-002",
    order: "#ORD-038",
    buyer: "Noor Salem",
    seller: "Ahmed Ali",
    reason: "Refund request",
    amount: "$49.99",
    status: "resolved",
    date: "Jan 8, 2025"
  },
]

const revenueData = [
  { month: "Jan", sales: 24500, commission: 2450, withdrawals: 18200 },
  { month: "Feb", sales: 31200, commission: 3120, withdrawals: 24500 },
  { month: "Mar", sales: 28900, commission: 2890, withdrawals: 21800 },
  { month: "Apr", sales: 35600, commission: 3560, withdrawals: 27400 },
  { month: "May", sales: 42300, commission: 4230, withdrawals: 32100 },
  { month: "Jun", sales: 48900, commission: 4890, withdrawals: 38600 },
]

const pendingWithdrawals = [
  { id: 1, seller: "Ahmed Ali", amount: "$1,240", method: "PayPal", date: "Jan 15, 2025", status: "pending" },
  { id: 2, seller: "Layla Ibrahim", amount: "$2,100", method: "Bank Transfer", date: "Jan 14, 2025", status: "pending" },
  { id: 3, seller: "Youssef Kareem", amount: "$850", method: "PayPal", date: "Jan 13, 2025", status: "processing" },
]

export default function AdminDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const isArabic = locale === "ar"
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const t = {
    title: isArabic ? "لوحة تحكم الإدارة" : "Admin Dashboard",
    subtitle: isArabic ? "إدارة شاملة للمنصة" : "Comprehensive platform management",

    // Stats
    totalUsers: isArabic ? "إجمالي المستخدمين" : "Total Users",
    totalSales: isArabic ? "إجمالي المبيعات" : "Total Sales",
    platformRevenue: isArabic ? "عمولات المنصة" : "Platform Revenue",
    activeProducts: isArabic ? "المنتجات النشطة" : "Active Products",
    activeOrders: isArabic ? "الطلبات النشطة" : "Active Orders",
    openDisputes: isArabic ? "النزاعات المفتوحة" : "Open Disputes",

    // Tabs
    overview: isArabic ? "نظرة عامة" : "Overview",
    usersTab: isArabic ? "المستخدمين" : "Users",
    productsTab: isArabic ? "المنتجات" : "Products",
    ordersTab: isArabic ? "الطلبات" : "Orders",
    financialTab: isArabic ? "التقارير المالية" : "Financial Reports",
    settingsTab: isArabic ? "الإعدادات" : "Settings",

    // Users
    userManagement: isArabic ? "إدارة المستخدمين" : "User Management",
    sellers: isArabic ? "البائعين" : "Sellers",
    buyers: isArabic ? "المشترين" : "Buyers",
    newUsers: isArabic ? "مستخدمين جدد" : "New Users",

    // Products
    productManagement: isArabic ? "إدارة المنتجات" : "Product Management",
    pendingReview: isArabic ? "قيد المراجعة" : "Pending Review",
    reportedProducts: isArabic ? "منتجات مبلغ عنها" : "Reported Products",

    // Orders
    orderManagement: isArabic ? "إدارة الطلبات" : "Order Management",
    disputeManagement: isArabic ? "إدارة النزاعات" : "Dispute Management",

    // Financial
    revenueStats: isArabic ? "إحصائيات الإيرادات" : "Revenue Statistics",
    withdrawalRequests: isArabic ? "طلبات السحب" : "Withdrawal Requests",
    commissionSettings: isArabic ? "إعدادات العمولات" : "Commission Settings",

    // Common
    search: isArabic ? "بحث..." : "Search...",
    filter: isArabic ? "تصفية" : "Filter",
    actions: isArabic ? "الإجراءات" : "Actions",
    approve: isArabic ? "موافقة" : "Approve",
    reject: isArabic ? "رفض" : "Reject",
    suspend: isArabic ? "تعليق" : "Suspend",
    activate: isArabic ? "تفعيل" : "Activate",
    viewDetails: isArabic ? "عرض التفاصيل" : "View Details",
    edit: isArabic ? "تعديل" : "Edit",
    delete: isArabic ? "حذف" : "Delete",
    viewAll: isArabic ? "عرض الكل" : "View All",
    export: isArabic ? "تصدير" : "Export",

    // Status
    active: isArabic ? "نشط" : "Active",
    suspended: isArabic ? "معلق" : "Suspended",
    pending: isArabic ? "قيد الانتظار" : "Pending",
    approved: isArabic ? "موافق عليه" : "Approved",
    rejected: isArabic ? "مرفوض" : "Rejected",
    completed: isArabic ? "مكتمل" : "Completed",
    processing: isArabic ? "قيد المعالجة" : "Processing",
    open: isArabic ? "مفتوح" : "Open",
    resolved: isArabic ? "محلول" : "Resolved",

    thisMonth: isArabic ? "هذا الشهر" : "This month",
    vsLastMonth: isArabic ? "عن الشهر الماضي" : "vs last month",
    platformGrowth: isArabic ? "نمو المنصة" : "Platform Growth",
    categoryDistribution: isArabic ? "توزيع الفئات" : "Category Distribution",
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-l-4 border-l-[#846F9C] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
              <Users className="h-4 w-4 text-[#846F9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+18.2%</span>
                <span className="text-muted-foreground ml-1">{t.vsLastMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4691A9] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalSales}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-[#4691A9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$248,567</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+24.5%</span>
                <span className="text-muted-foreground ml-1">{t.vsLastMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#89A58F] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.platformRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-[#89A58F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,856</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+21.8%</span>
                <span className="text-muted-foreground ml-1">{t.thisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeProducts}</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">24 {t.pendingReview}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeOrders}</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">{t.processing}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.openDisputes}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <Badge variant="destructive" className="text-xs mt-1">Needs attention</Badge>
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
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              {t.usersTab}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              {t.productsTab}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t.ordersTab}
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t.financialTab}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              {t.settingsTab}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.platformGrowth}</CardTitle>
                  <CardDescription>Users, Products, and Revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={platformStats}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#846F9C" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#846F9C" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4691A9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4691A9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#846F9C" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="products" stroke="#4691A9" fillOpacity={1} fill="url(#colorProducts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.categoryDistribution}</CardTitle>
                  <CardDescription>Products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.newUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">124</div>
                  <Progress value={68} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.pendingReview}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">24</div>
                  <Progress value={45} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.openDisputes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">12</div>
                  <Progress value={24} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">Needs resolution</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{t.userManagement}</CardTitle>
                    <CardDescription>Manage all platform users</CardDescription>
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
                        <SelectItem value="sellers">Sellers</SelectItem>
                        <SelectItem value="buyers">Buyers</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      {t.export}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Seller' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'Seller' ? (
                            <div className="text-sm">
                              <p>{user.sales} sales</p>
                              <p className="text-muted-foreground">{user.revenue}</p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <p>{user.purchases} purchases</p>
                              <p className="text-muted-foreground">{user.spent}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm">{user.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
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
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t.edit}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem className="text-orange-600">
                                  <Ban className="h-4 w-4 mr-2" />
                                  {t.suspend}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {t.activate}
                                </DropdownMenuItem>
                              )}
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

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{t.productManagement}</CardTitle>
                    <CardDescription>Review and manage all products</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="reported">Reported</SelectItem>
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
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sales</TableHead>
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
                        <TableCell>{product.seller}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell className="font-semibold">{product.revenue}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                            {product.reported > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {product.reported} reports
                              </Badge>
                            )}
                          </div>
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
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                              {product.status === 'pending' && (
                                <>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t.approve}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {t.reject}
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t.edit}
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
          <TabsContent value="orders" className="space-y-6">
            {/* All Orders */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orderManagement}</CardTitle>
                <CardDescription>Monitor all platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>{order.seller}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell className="text-green-600 font-medium">{order.commission}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
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

            {/* Disputes */}
            <Card>
              <CardHeader>
                <CardTitle>{t.disputeManagement}</CardTitle>
                <CardDescription>Handle customer disputes and refunds</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute ID</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">{dispute.id}</TableCell>
                        <TableCell>{dispute.order}</TableCell>
                        <TableCell>{dispute.buyer}</TableCell>
                        <TableCell>{dispute.seller}</TableCell>
                        <TableCell>{dispute.reason}</TableCell>
                        <TableCell className="font-semibold">{dispute.amount}</TableCell>
                        <TableCell>
                          <Badge variant={dispute.status === 'open' ? 'destructive' : 'default'}>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{dispute.date}</TableCell>
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
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                              {dispute.status === 'open' && (
                                <>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Resolve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-blue-600">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contact Parties
                                  </DropdownMenuItem>
                                </>
                              )}
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

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t.revenueStats}</CardTitle>
                <CardDescription>Sales, commissions, and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#846F9C" name="Sales" />
                    <Bar dataKey="commission" fill="#4691A9" name="Commission" />
                    <Bar dataKey="withdrawals" fill="#89A58F" name="Withdrawals" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$48,900</div>
                  <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$4,890</div>
                  <p className="text-xs text-muted-foreground">10% average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">$4,190</div>
                  <p className="text-xs text-muted-foreground">3 requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$700</div>
                  <p className="text-xs text-muted-foreground">After withdrawals</p>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Requests */}
            <Card>
              <CardHeader>
                <CardTitle>{t.withdrawalRequests}</CardTitle>
                <CardDescription>Pending seller withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">{withdrawal.seller}</TableCell>
                        <TableCell className="font-semibold">{withdrawal.amount}</TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>
                          <Badge variant={withdrawal.status === 'pending' ? 'secondary' : 'default'}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{withdrawal.date}</TableCell>
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
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t.approve}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                {t.reject}
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.commissionSettings}</CardTitle>
                <CardDescription>Configure platform fees and commissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Commission Rate</label>
                    <Input type="number" placeholder="10" />
                    <p className="text-xs text-muted-foreground">Percentage taken from each sale</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Withdrawal Amount</label>
                    <Input type="number" placeholder="50" />
                    <p className="text-xs text-muted-foreground">Minimum amount for withdrawals</p>
                  </div>
                </div>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{isArabic ? "المزيد من الإعدادات قريباً..." : "More settings coming soon..."}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
