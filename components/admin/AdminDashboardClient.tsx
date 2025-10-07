"use client"

import { useState } from "react"
import {
  Users, Package, DollarSign, ShoppingCart, Clock, AlertCircle,
  TrendingUp, Star, Eye, Search, MoreVertical, Edit, Trash2,
  Ban, CheckCircle, XCircle, Download, ArrowUpRight, MessageSquare,
  BarChart3, Wallet, Settings
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

interface AdminDashboardClientProps {
  locale: string
  statsData: any
  usersData: any
  productsData: any
  ordersData: any
  disputesData: any
}

export function AdminDashboardClient({
  locale,
  statsData,
  usersData,
  productsData,
  ordersData,
  disputesData,
}: AdminDashboardClientProps) {
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
    export: isArabic ? "تصدير" : "Export",

    // Status
    active: isArabic ? "نشط" : "Active",
    suspended: isArabic ? "معلق" : "Suspended",
    pending: isArabic ? "قيد الانتظار" : "Pending",
    approved: isArabic ? "موافق عليه" : "Approved",
    rejected: isArabic ? "مرفوض" : "Rejected",
    completed: isArabic ? "مكتمل" : "Completed",
    processing: isArabic ? "قيد المعالجة" : "Processing",

    thisMonth: isArabic ? "هذا الشهر" : "This month",
    vsLastMonth: isArabic ? "عن الشهر الماضي" : "vs last month",
    platformGrowth: isArabic ? "نمو المنصة" : "Platform Growth",
    categoryDistribution: isArabic ? "توزيع الفئات" : "Category Distribution",
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("User action error:", error)
    }
  }

  const handleProductAction = async (productId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Product action error:", error)
    }
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
              <div className="text-2xl font-bold">{statsData.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+{statsData.overview.newUsersThisMonth}</span>
                <span className="text-muted-foreground ml-1">{t.thisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4691A9] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalSales}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-[#4691A9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsData.overview.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">{statsData.overview.completedOrders} orders</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#89A58F] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.platformRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-[#89A58F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsData.overview.platformRevenue.toFixed(2)}
              </div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">25% commission</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeProducts}</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.overview.approvedProducts}</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">{statsData.overview.pendingProducts} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeOrders}</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.overview.processingOrders}</div>
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
              <div className="text-2xl font-bold">{statsData.overview.openDisputes}</div>
              <Badge variant="destructive" className="text-xs mt-1">
                {isArabic ? "يحتاج انتباه" : "Needs attention"}
              </Badge>
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
                    <AreaChart data={statsData.platformStats}>
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
                        data={statsData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statsData.categoryData.map((entry: any, index: number) => {
                          const colors = ["#846F9C", "#4691A9", "#89A58F", "#FFA500", "#A0A0A0"]
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
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
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? "مستخدمين جدد" : "New Users"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{statsData.overview.newUsersThisMonth}</div>
                  <Progress value={68} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? "قيد المراجعة" : "Pending Review"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{statsData.overview.pendingProducts}</div>
                  <Progress value={45} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.openDisputes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{statsData.overview.openDisputes}</div>
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
                    <CardTitle>{isArabic ? "إدارة المستخدمين" : "User Management"}</CardTitle>
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
                    {usersData.users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.fullName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'SELLER' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive && !user.isSuspended ? 'default' : 'destructive'}>
                            {user.isSuspended ? t.suspended : t.active}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'SELLER' ? (
                            <div className="text-sm">
                              <p>{user.totalSales} sales</p>
                              <p className="text-muted-foreground">${user.totalEarnings.toFixed(2)}</p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <p>{user.totalPurchases} purchases</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm">{user.averageRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t.edit}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!user.isSuspended ? (
                                <DropdownMenuItem
                                  className="text-orange-600"
                                  onClick={() => handleUserAction(user.id, "suspend")}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {t.suspend}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleUserAction(user.id, "activate")}
                                >
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
                    <CardTitle>{isArabic ? "إدارة المنتجات" : "Product Management"}</CardTitle>
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
                    {productsData.products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {isArabic ? product.titleAr : product.titleEn}
                        </TableCell>
                        <TableCell>{product.seller.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell className="font-semibold">${product.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm">{product.averageRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'APPROVED' ? 'default' : 'secondary'}>
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
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                              {product.status === 'PENDING' && (
                                <>
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => handleProductAction(product.id, "approve")}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t.approve}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleProductAction(product.id, "reject")}
                                  >
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

          {/* Orders, Financial, Settings tabs would be similar... */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "إدارة الطلبات" : "Order Management"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isArabic ? "سيتم إضافة بيانات الطلبات قريباً..." : "Order data coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "التقارير المالية" : "Financial Reports"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isArabic ? "سيتم إضافة التقارير المالية قريباً..." : "Financial reports coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "إعدادات المنصة" : "Platform Settings"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isArabic ? "سيتم إضافة الإعدادات قريباً..." : "Settings coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
