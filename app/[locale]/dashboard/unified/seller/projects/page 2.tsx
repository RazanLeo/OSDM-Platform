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
  FolderKanban,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  Send,
  CheckCircle,
  Timer,
  Briefcase,
  Target,
  Brain,
  Plus,
} from "lucide-react"

export default function SellerProjectsDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [activeProjects, setActiveProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, bidsRes, projectsRes] = await Promise.all([
        fetch("/api/analytics/seller/projects").then(r => r.json()),
        fetch("/api/project-bids?freelancerId=me").then(r => r.json()),
        fetch("/api/projects?freelancerId=me").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setBids(bidsRes.bids || [])
      setActiveProjects(projectsRes.projects || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Upwork + Mostaql + Bahr Style */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            {isArabic
              ? "🟢 لوحة تحكم المستقل - سوق فرص العمل الحر الرقمي عن بعد"
              : "🟢 Freelancer Dashboard - Remote Freelance Work Opportunities Market"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "إدارة مشاريعك وعقودك وعروضك | Upwork + Mostaql + Bahr"
              : "Manage your projects, contracts, and proposals | Upwork + Mostaql + Bahr"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild className="bg-fuchsia-600 hover:bg-fuchsia-700">
            <Link href={`/${locale}/marketplace/freelance-jobs`}>
              <Target className="h-4 w-4 mr-2" />
              {isArabic ? "تصفح المشاريع" : "Browse Projects"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Freelancer Profile Stats - Upwork Style */}
      <Card className="border-2 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Award className="h-10 w-10 text-fuchsia-600" />
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "نسبة النجاح" : "Success Rate"}</p>
                <p className="text-2xl font-bold text-fuchsia-600">
                  {analytics?.summary?.successRate || 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي الأرباح" : "Total Earnings"}</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.summary?.totalEarnings?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "مشاريع مكتملة" : "Completed Projects"}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.summary?.completedProjects || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Timer className="h-10 w-10 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "رصيد الاتصالات" : "Connects Balance"}</p>
                <p className="text-2xl font-bold text-orange-600">45</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "عروض مرسلة" : "Proposals Sent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">{analytics?.summary?.totalBids || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "هذا الشهر" : "This month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "عروض مقبولة" : "Accepted Proposals"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.summary?.acceptedBids || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              {isArabic ? "نسبة القبول" : "Acceptance rate"}: {analytics?.summary?.successRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "مشاريع نشطة" : "Active Projects"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.summary?.openProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "متوسط سعر العرض" : "Avg Bid Amount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.summary?.avgBidAmount?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active-bids" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="active-bids">
            <Send className="h-4 w-4 mr-2" />
            {isArabic ? "عروضي" : "My Proposals"}
          </TabsTrigger>
          <TabsTrigger value="active-contracts">
            <Briefcase className="h-4 w-4 mr-2" />
            {isArabic ? "عقودي" : "My Contracts"}
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            <FolderKanban className="h-4 w-4 mr-2" />
            {isArabic ? "معرض الأعمال" : "Portfolio"}
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Award className="h-4 w-4 mr-2" />
            {isArabic ? "المهارات" : "Skills"}
          </TabsTrigger>
          <TabsTrigger value="ai-proposals">
            <Brain className="h-4 w-4 mr-2" />
            {isArabic ? "Uma AI" : "Uma AI"}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "القوالب" : "Templates"}
          </TabsTrigger>
        </TabsList>

        {/* My Proposals Tab */}
        <TabsContent value="active-bids" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "عروضي المرسلة - Upwork Proposals" : "My Sent Proposals - Upwork Style"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "تتبع حالة عروضك المرسلة للمشاريع"
                      : "Track the status of your project proposals"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المشروع" : "Project"}</TableHead>
                    <TableHead>{isArabic ? "سعر العرض" : "Bid Amount"}</TableHead>
                    <TableHead>{isArabic ? "مدة التسليم" : "Delivery"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {isArabic
                          ? "لم ترسل أي عروض بعد. ابدأ بتصفح المشاريع!"
                          : "No proposals sent yet. Start browsing projects!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {isArabic ? bid.Project.titleAr : bid.Project.titleEn}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bid.Project.budget} {isArabic ? "ر.س" : "SAR"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {bid.bidAmount} {isArabic ? "ر.س" : "SAR"}
                        </TableCell>
                        <TableCell>{bid.deliveryDays} {isArabic ? "يوم" : "days"}</TableCell>
                        <TableCell>
                          {bid.status === "ACCEPTED" ? (
                            <Badge className="bg-green-600">{isArabic ? "مقبول" : "Accepted"}</Badge>
                          ) : bid.status === "REJECTED" ? (
                            <Badge variant="destructive">{isArabic ? "مرفوض" : "Rejected"}</Badge>
                          ) : bid.isShortlisted ? (
                            <Badge className="bg-blue-600">{isArabic ? "في القائمة المختصرة" : "Shortlisted"}</Badge>
                          ) : (
                            <Badge variant="outline">{isArabic ? "قيد المراجعة" : "Pending"}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(bid.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {isArabic ? "عرض" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Contracts Tab */}
        <TabsContent value="active-contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "عقودي النشطة - Upwork Contracts" : "My Active Contracts - Upwork Style"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "إدارة عقودك مع العملاء - تتبع الساعات، المعالم، المدفوعات"
                  : "Manage your client contracts - Track hours, milestones, payments"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic
                  ? "لا توجد عقود نشطة حالياً"
                  : "No active contracts currently"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab - Mostaql Feature */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "معرض أعمالي - Mostaql Portfolio" : "My Portfolio - Mostaql Style"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "اعرض أعمالك السابقة لجذب المزيد من العملاء"
                      : "Showcase your previous work to attract more clients"}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة عمل" : "Add Work"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic
                  ? "معرض أعمالك فارغ. ابدأ بإضافة مشاريعك المكتملة!"
                  : "Your portfolio is empty. Start adding your completed projects!"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab - Mostaql Skill Verification */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "مهاراتي المعتمدة - Mostaql Skills" : "My Verified Skills - Mostaql"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "تحقق من مهاراتك لزيادة فرصك في الفوز بالمشاريع"
                      : "Verify your skills to increase your chances of winning projects"}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة مهارة" : "Add Skill"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic
                  ? "لم تضف مهارات معتمدة بعد"
                  : "No verified skills added yet"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Proposals Tab - Uma AI Clone */}
        <TabsContent value="ai-proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>{isArabic ? "مساعد Uma AI للعروض - Upwork Uma AI Clone" : "Uma AI Proposal Assistant - Upwork Clone"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "استخدم الذكاء الاصطناعي لكتابة عروض احترافية تلقائياً"
                      : "Use AI to write professional proposals automatically"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900">
                    {isArabic
                      ? "💡 Uma AI يمكنه مساعدتك في كتابة عروض مخصصة لكل مشروع بناءً على خبرتك ومهاراتك"
                      : "💡 Uma AI can help you write customized proposals for each project based on your experience and skills"}
                  </p>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Brain className="h-4 w-4 mr-2" />
                  {isArabic ? "جرب Uma AI الآن" : "Try Uma AI Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proposal Templates Tab - Upwork Feature */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "قوالب العروض - Upwork Templates" : "Proposal Templates - Upwork"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "احفظ قوالب جاهزة لإعادة استخدامها في العروض"
                      : "Save ready templates to reuse in proposals"}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة قالب" : "Add Template"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic
                  ? "لا توجد قوالب محفوظة"
                  : "No saved templates"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
