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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Star,
  ShoppingCart,
  Mail,
  Percent,
  Link as LinkIcon,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Tag,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function SellerProductsDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [discountCodes, setDiscountCodes] = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, productsRes, customersRes, discountsRes, affiliatesRes] = await Promise.all([
        fetch("/api/analytics/seller/products").then(r => r.json()),
        fetch("/api/products?sellerId=me").then(r => r.json()),
        fetch("/api/customers").then(r => r.json()),
        fetch("/api/discount-codes").then(r => r.json()),
        fetch("/api/affiliate/stats").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setProducts(productsRes.products || [])
      setCustomers(customersRes.customers || [])
      setDiscountCodes(discountsRes.discountCodes || [])
      setAffiliates(affiliatesRes.affiliates || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Gumroad Style */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {isArabic ? "🟢 لوحة تحكم البائع - المنتجات الجاهزة" : "🟢 Seller Dashboard - Ready Products"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "إدارة منتجاتك الرقمية | Gumroad + Picalica"
              : "Manage your digital products | Gumroad + Picalica"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href={`/${locale}/dashboard/seller/products/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "منتج جديد" : "New Product"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics - Gumroad Dashboard Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الإيرادات" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {analytics?.summary?.totalRevenue?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "بعد العمولات" : "After commissions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي المبيعات" : "Total Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.summary?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "طلب مكتمل" : "Completed orders"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "عدد المنتجات" : "Total Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">{analytics?.summary?.totalProducts || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              {analytics?.summary?.activeProducts || 0} {isArabic ? "نشط" : "active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "التحميلات" : "Downloads"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.summary?.totalDownloads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "تحميل فوري" : "Instant downloads"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "المشاهدات" : "Views"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{analytics?.summary?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "مشاهدة للمنتجات" : "Product views"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? "المنتجات" : "Products"}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isArabic ? "الطلبات" : "Orders"}
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            {isArabic ? "العملاء" : "Customers"}
          </TabsTrigger>
          <TabsTrigger value="discounts">
            <Percent className="h-4 w-4 mr-2" />
            {isArabic ? "الخصومات" : "Discounts"}
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            <LinkIcon className="h-4 w-4 mr-2" />
            {isArabic ? "التسويق بالعمولة" : "Affiliates"}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isArabic ? "التحليلات" : "Analytics"}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "منتجاتي الرقمية" : "My Digital Products"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "إدارة منتجاتك، الأسعار، الملفات، والإصدارات"
                      : "Manage your products, prices, files, and versions"}
                  </CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/${locale}/dashboard/seller/products/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "إضافة منتج" : "Add Product"}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
                    <TableHead>{isArabic ? "المبيعات" : "Sales"}</TableHead>
                    <TableHead>{isArabic ? "التحميلات" : "Downloads"}</TableHead>
                    <TableHead>{isArabic ? "التقييم" : "Rating"}</TableHead>
                    <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد منتجات بعد" : "No products yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.titleEn}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                {isArabic ? product.titleAr : product.titleEn}
                              </p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.price} {isArabic ? "ر.س" : "SAR"}
                        </TableCell>
                        <TableCell>{product.salesCount || 0}</TableCell>
                        <TableCell>{product.downloadCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{product.averageRating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.isExclusive ? (
                            <Badge variant="default" className="bg-violet-600">
                              {isArabic ? "حصري" : "Exclusive"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{isArabic ? "غير حصري" : "Non-Exclusive"}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge variant="default" className="bg-green-600">
                              {isArabic ? "نشط" : "Active"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{isArabic ? "غير نشط" : "Inactive"}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                {isArabic ? "عرض" : "View"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {isArabic ? "تعديل" : "Edit"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                {isArabic ? "الإصدارات" : "Versions"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {isArabic ? "التحليلات" : "Analytics"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isArabic ? "حذف" : "Delete"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs... (Orders, Customers, Discounts, Affiliates, Analytics) */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إدارة العملاء" : "Customer Management"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "نظام CRM كامل - Gumroad Customer System"
                  : "Full CRM system - Gumroad Customer System"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {customers.length} {isArabic ? "عميل" : "customers"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "أكواد الخصم" : "Discount Codes"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "أكواد خصم Gumroad" : "Gumroad Discount Codes"}
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {isArabic ? "كود جديد" : "New Code"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isArabic ? "إنشاء كود خصم" : "Create Discount Code"}</DialogTitle>
                      <DialogDescription>
                        {isArabic
                          ? "أنشئ كود خصم لمنتجاتك"
                          : "Create a discount code for your products"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{isArabic ? "الكود" : "Code"}</Label>
                        <Input placeholder={isArabic ? "مثال: SAVE20" : "e.g., SAVE20"} />
                      </div>
                      <div>
                        <Label>{isArabic ? "نوع الخصم" : "Discount Type"}</Label>
                        <select className="w-full border rounded-md p-2">
                          <option value="PERCENTAGE">{isArabic ? "نسبة مئوية" : "Percentage"}</option>
                          <option value="FIXED_AMOUNT">{isArabic ? "مبلغ ثابت" : "Fixed Amount"}</option>
                        </select>
                      </div>
                      <div>
                        <Label>{isArabic ? "قيمة الخصم" : "Discount Value"}</Label>
                        <Input type="number" placeholder="20" />
                      </div>
                      <Button className="w-full">{isArabic ? "إنشاء" : "Create"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {discountCodes.length} {isArabic ? "كود خصم نشط" : "active discount codes"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
