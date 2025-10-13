"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ShoppingBag,
  Briefcase,
  FolderKanban,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  Ban,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [stats, setStats] = useState<any>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [reportedContent, setReportedContent] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, approvalsRes, reportsRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/statistics").then(r => r.json()),
        fetch("/api/admin/pending-approvals").then(r => r.json()),
        fetch("/api/admin/reported-content").then(r => r.json()),
        fetch("/api/admin/recent-transactions").then(r => r.json()),
      ])

      setStats(statsRes)
      setPendingApprovals(approvalsRes.items || [])
      setReportedContent(reportsRes.items || [])
      setRecentTransactions(transactionsRes.items || [])
    } catch (error) {
      console.error("Failed to load admin data:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          {isArabic ? "🔐 لوحة تحكم الإدارة" : "🔐 Admin Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isArabic
            ? "إدارة كاملة للمنصة - المستخدمين، المحتوى، المالية، الإحصائيات"
            : "Complete platform management - Users, Content, Finance, Statistics"}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isArabic ? "إجمالي المستخدمين" : "Total Users"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              +{stats?.newUsersToday || 0} {isArabic ? "اليوم" : "today"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {isArabic ? "إجمالي الإيرادات" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.totalRevenue?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +{stats?.revenueToday?.toLocaleString() || 0} {isArabic ? "اليوم" : "today"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {isArabic ? "العمليات النشطة" : "Active Transactions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.activeTransactions || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? "عبر جميع الأسواق" : "Across all markets"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {isArabic ? "بانتظار المراجعة" : "Pending Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats?.pendingItems || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? "يتطلب إجراء" : "Requires action"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="approvals">
            <AlertCircle className="h-4 w-4 mr-2" />
            {isArabic ? "الموافقات" : "Approvals"}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {isArabic ? "المستخدمون" : "Users"}
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "المحتوى" : "Content"}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            {isArabic ? "البلاغات" : "Reports"}
          </TabsTrigger>
          <TabsTrigger value="finance">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isArabic ? "المالية" : "Finance"}
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "العناصر بانتظار الموافقة" : "Items Pending Approval"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                    <TableHead>{isArabic ? "العنوان" : "Title"}</TableHead>
                    <TableHead>{isArabic ? "المستخدم" : "User"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد عناصر بانتظار الموافقة" : "No items pending approval"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApprovals.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {isArabic ? "موافقة" : "Approve"}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              {isArabic ? "رفض" : "Reject"}
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isArabic ? "إدارة المستخدمين" : "User Management"}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {isArabic ? "تصدير" : "Export"}
                  </Button>
                  <Button variant="outline" size="sm">
                    {isArabic ? "فلتر" : "Filter"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats?.activeSellers || 0}</div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "بائعون نشطون" : "Active Sellers"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats?.activeBuyers || 0}</div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "مشترون نشطون" : "Active Buyers"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">{stats?.bannedUsers || 0}</div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "محظورون" : "Banned"}</p>
                    </CardContent>
                  </Card>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? "المستخدم" : "User"}</TableHead>
                      <TableHead>{isArabic ? "البريد الإلكتروني" : "Email"}</TableHead>
                      <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "قم بالبحث عن مستخدم للبدء" : "Search for a user to begin"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Moderation Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إدارة المحتوى" : "Content Moderation"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                    <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "منتجات" : "Products"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{stats?.totalServices || 0}</div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "خدمات" : "Services"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FolderKanban className="h-8 w-8 mx-auto mb-2 text-fuchsia-600" />
                    <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "مشاريع" : "Projects"}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reported Content Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "البلاغات المقدمة" : "Reported Content"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                    <TableHead>{isArabic ? "السبب" : "Reason"}</TableHead>
                    <TableHead>{isArabic ? "المُبلّغ" : "Reporter"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportedContent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد بلاغات" : "No reports"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportedContent.map((report: any) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="destructive">{report.contentType}</Badge>
                        </TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "التقارير المالية" : "Financial Reports"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "عمولة المنصة (25%)" : "Platform Commission (25%)"}
                    </p>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.platformCommission?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "رسوم بوابة الدفع (5%)" : "Gateway Fees (5%)"}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.gatewayFees?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "مدفوعات البائعين" : "Seller Payouts"}
                    </p>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.sellerPayouts?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "صافي الربح" : "Net Profit"}
                    </p>
                    <div className="text-2xl font-bold text-emerald-600">
                      {stats?.netProfit?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المعاملة" : "Transaction"}</TableHead>
                    <TableHead>{isArabic ? "المبلغ" : "Amount"}</TableHead>
                    <TableHead>{isArabic ? "العمولة" : "Commission"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد معاملات حديثة" : "No recent transactions"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.title}</TableCell>
                        <TableCell>{transaction.amount?.toLocaleString()} SAR</TableCell>
                        <TableCell>{transaction.commission?.toLocaleString()} SAR</TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">{isArabic ? "مكتمل" : "Completed"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Button variant="outline" className="h-24" asChild>
          <Link href={`/${locale}/admin/settings`}>
            <div className="text-center">
              <Settings className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-semibold">{isArabic ? "الإعدادات" : "Settings"}</p>
            </div>
          </Link>
        </Button>
        <Button variant="outline" className="h-24">
          <div className="text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{isArabic ? "التقارير" : "Reports"}</p>
          </div>
        </Button>
        <Button variant="outline" className="h-24">
          <div className="text-center">
            <FileText className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{isArabic ? "السجلات" : "Logs"}</p>
          </div>
        </Button>
        <Button variant="outline" className="h-24">
          <div className="text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{isArabic ? "التحليلات" : "Analytics"}</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
