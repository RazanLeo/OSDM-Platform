"use client"

import type { Locale } from "@/lib/i18n/config"
import { useState } from "react"
import {
  ShoppingBag, Heart, MessageSquare, Download, Star, Clock,
  Package, CreditCard, FileText, Eye, Search, Filter,
  CheckCircle, XCircle, AlertCircle, MoreVertical, RefreshCw,
  TrendingUp, Wallet, Settings, BarChart3, ArrowUpRight
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

// Mock Data
const myOrders = [
  {
    id: "#ORD-101",
    product: "UI Kit Pro",
    seller: "Design Studio",
    amount: "$49.99",
    status: "completed",
    date: "Jan 15, 2025",
    downloadable: true
  },
  {
    id: "#ORD-102",
    product: "Dashboard Template",
    seller: "CodeCraft",
    amount: "$79.99",
    status: "completed",
    date: "Jan 10, 2025",
    downloadable: true
  },
  {
    id: "#ORD-103",
    product: "Icon Pack",
    seller: "IconMasters",
    amount: "$19.99",
    status: "processing",
    date: "Jan 12, 2025",
    downloadable: false
  },
  {
    id: "#ORD-104",
    product: "Website Theme",
    seller: "ThemeForge",
    amount: "$99.99",
    status: "completed",
    date: "Jan 5, 2025",
    downloadable: true
  },
]

const favoriteProducts = [
  {
    id: 1,
    name: "Modern Dashboard UI",
    seller: "PixelPerfect",
    price: "$59.99",
    rating: 4.8,
    reviews: 234,
    image: "/products/01.jpg"
  },
  {
    id: 2,
    name: "E-commerce Template",
    seller: "WebWizards",
    price: "$89.99",
    rating: 4.9,
    reviews: 456,
    image: "/products/02.jpg"
  },
  {
    id: 3,
    name: "Mobile App UI Kit",
    seller: "AppDesign Co",
    price: "$44.99",
    rating: 4.7,
    reviews: 189,
    image: "/products/03.jpg"
  },
]

const downloads = [
  {
    id: 1,
    product: "UI Kit Pro",
    version: "v2.1.0",
    size: "45 MB",
    date: "Jan 15, 2025",
    downloads: 3
  },
  {
    id: 2,
    product: "Dashboard Template",
    version: "v1.5.2",
    size: "78 MB",
    date: "Jan 10, 2025",
    downloads: 2
  },
  {
    id: 3,
    product: "Website Theme",
    version: "v3.0.1",
    size: "120 MB",
    date: "Jan 5, 2025",
    downloads: 1
  },
]

const myReviews = [
  {
    id: 1,
    product: "UI Kit Pro",
    seller: "Design Studio",
    rating: 5,
    comment: "Outstanding quality! Easy to customize and well documented.",
    date: "Jan 16, 2025"
  },
  {
    id: 2,
    product: "Dashboard Template",
    seller: "CodeCraft",
    rating: 4,
    comment: "Great template overall. Could use more components.",
    date: "Jan 11, 2025"
  },
]

const messages = [
  {
    id: 1,
    seller: "Design Studio",
    lastMessage: "Thank you for your purchase! Let me know if you need any help.",
    unread: 2,
    time: "2h ago",
    avatar: "/avatars/seller1.png"
  },
  {
    id: 2,
    seller: "CodeCraft",
    lastMessage: "I've updated the template with new features.",
    unread: 0,
    time: "1d ago",
    avatar: "/avatars/seller2.png"
  },
]

const transactions = [
  { id: 1, type: "Purchase", product: "UI Kit Pro", amount: "-$49.99", date: "Jan 15, 2025", status: "completed" },
  { id: 2, type: "Refund", product: "Old Template", amount: "+$29.99", date: "Jan 8, 2025", status: "completed" },
  { id: 3, type: "Purchase", product: "Dashboard Template", amount: "-$79.99", date: "Jan 10, 2025", status: "completed" },
]

export default function BuyerDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const isArabic = locale === "ar"
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const t = {
    title: isArabic ? "لوحة تحكم المشتري" : "Buyer Dashboard",
    subtitle: isArabic ? "إدارة مشترياتك ومفضلاتك" : "Manage your purchases and favorites",

    // Stats
    totalPurchases: isArabic ? "إجمالي المشتريات" : "Total Purchases",
    favorites: isArabic ? "المفضلة" : "Favorites",
    messages: isArabic ? "الرسائل" : "Messages",
    reviews: isArabic ? "التقييمات" : "Reviews",
    spent: isArabic ? "إجمالي الإنفاق" : "Total Spent",
    activeOrders: isArabic ? "الطلبات النشطة" : "Active Orders",

    // Tabs
    overview: isArabic ? "نظرة عامة" : "Overview",
    myOrders: isArabic ? "طلباتي" : "My Orders",
    favoritesTab: isArabic ? "المفضلة" : "Favorites",
    downloadsTab: isArabic ? "التنزيلات" : "Downloads",
    reviewsTab: isArabic ? "تقييماتي" : "My Reviews",
    walletTab: isArabic ? "المحفظة" : "Wallet",

    // Common
    search: isArabic ? "بحث..." : "Search...",
    filter: isArabic ? "تصفية" : "Filter",
    actions: isArabic ? "الإجراءات" : "Actions",
    download: isArabic ? "تنزيل" : "Download",
    viewDetails: isArabic ? "عرض التفاصيل" : "View Details",
    addToCart: isArabic ? "أضف للسلة" : "Add to Cart",
    removeFromFavorites: isArabic ? "إزالة من المفضلة" : "Remove from Favorites",
    writeReview: isArabic ? "كتابة تقييم" : "Write Review",
    editReview: isArabic ? "تعديل التقييم" : "Edit Review",
    viewAll: isArabic ? "عرض الكل" : "View All",

    // Status
    completed: isArabic ? "مكتمل" : "Completed",
    processing: isArabic ? "قيد المعالجة" : "Processing",
    pending: isArabic ? "قيد الانتظار" : "Pending",
    cancelled: isArabic ? "ملغي" : "Cancelled",

    // Orders
    orderHistory: isArabic ? "سجل الطلبات" : "Order History",
    recentPurchases: isArabic ? "أحدث المشتريات" : "Recent Purchases",

    // Downloads
    downloadHistory: isArabic ? "سجل التنزيلات" : "Download History",
    redownload: isArabic ? "إعادة التنزيل" : "Re-download",

    // Wallet
    walletBalance: isArabic ? "رصيد المحفظة" : "Wallet Balance",
    transactionHistory: isArabic ? "سجل المعاملات" : "Transaction History",
    addFunds: isArabic ? "إضافة رصيد" : "Add Funds",

    thisMonth: isArabic ? "هذا الشهر" : "This month",
    allTime: isArabic ? "الإجمالي" : "All time",
    new: isArabic ? "جديد" : "New",
    unread: isArabic ? "غير مقروء" : "Unread",
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
              <CardTitle className="text-sm font-medium">{t.totalPurchases}</CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#846F9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">{t.allTime}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4691A9] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.spent}</CardTitle>
              <CreditCard className="h-4 w-4 text-[#4691A9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,248</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">$249 {t.thisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#89A58F] hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.favorites}</CardTitle>
              <Heart className="h-4 w-4 text-[#89A58F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">products saved</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeOrders}</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">{t.processing}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.messages}</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <Badge variant="destructive" className="text-xs mt-1">2 {t.unread}</Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reviews}</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">reviews written</p>
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
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t.myOrders}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              {t.favoritesTab}
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />
              {t.downloadsTab}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              {t.reviewsTab}
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t.walletTab}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Purchases */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t.recentPurchases}</CardTitle>
                    <CardDescription>Your latest orders</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">{t.viewAll}</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#846F9C] to-[#4691A9] flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.product}</p>
                            <p className="text-xs text-muted-foreground">{order.seller}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{order.amount}</p>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
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

              {/* Messages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t.messages}</CardTitle>
                    <CardDescription>Recent conversations</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">{t.viewAll}</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{message.seller.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{message.seller}</p>
                            <span className="text-xs text-muted-foreground">{message.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{message.lastMessage}</p>
                          {message.unread > 0 && (
                            <Badge variant="destructive" className="text-xs mt-1">{message.unread} {t.new}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Products */}
            <Card>
              <CardHeader>
                <CardTitle>{t.favoritesTab}</CardTitle>
                <CardDescription>Products you've saved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-[#846F9C]/20 to-[#4691A9]/20 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-[#846F9C]" />
                      </div>
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.seller}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg">{product.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.reviews})</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">{t.addToCart}</Button>
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{t.orderHistory}</CardTitle>
                    <CardDescription>Track and manage your orders</CardDescription>
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
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.seller}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.date}</TableCell>
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
                              {order.downloadable && (
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  {t.download}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                {t.writeReview}
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

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.favoritesTab}</CardTitle>
                <CardDescription>Products saved to your favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-[#846F9C]/20 to-[#4691A9]/20 rounded-lg mb-4 flex items-center justify-center">
                        <Package className="h-16 w-16 text-[#846F9C]" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{product.seller}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-xl">{product.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.reviews})</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">{t.addToCart}</Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.downloadHistory}</CardTitle>
                <CardDescription>Download your purchased products</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloads.map((download) => (
                      <TableRow key={download.id}>
                        <TableCell className="font-medium">{download.product}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{download.version}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{download.size}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(download.downloads / 5) * 100} className="h-2 w-16" />
                            <span className="text-xs text-muted-foreground">{download.downloads}/5</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{download.date}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            {t.download}
                          </Button>
                        </TableCell>
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
                <CardDescription>Reviews you've written</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {myReviews.map((review) => (
                    <div key={review.id} className="space-y-3 pb-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{review.product}</h4>
                          <p className="text-sm text-muted-foreground">{review.seller}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                          <Button variant="outline" size="sm">
                            {t.editReview}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t.walletBalance}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$125.00</div>
                  <Button className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t.addFunds}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.transactionHistory}</CardTitle>
                  <CardDescription>Your payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.type}</TableCell>
                          <TableCell>{transaction.product}</TableCell>
                          <TableCell className={transaction.amount.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {transaction.amount}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                          <TableCell>
                            <Badge variant="default">{transaction.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
