"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FolderKanban, Plus, Clock, CheckCircle, Users, DollarSign, FileText } from "lucide-react"
import Link from "next/link"

export default function BuyerProjectsDashboard() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [analytics, setAnalytics] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, projectsRes] = await Promise.all([
        fetch("/api/analytics/buyer/projects").then(r => r.json()),
        fetch("/api/projects?clientId=me").then(r => r.json()),
      ])

      setAnalytics(analyticsRes)
      setProjects(projectsRes.projects || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            {isArabic
              ? "🔵 لوحة تحكم العميل - سوق فرص العمل الحر الرقمي عن بعد"
              : "🔵 Client Dashboard - Remote Freelance Work Opportunities Market"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "مشاريعك، عروض المستقلين، العقود، المدفوعات"
              : "Your projects, freelancer proposals, contracts, payments"}
          </p>
        </div>

        <Button asChild className="bg-fuchsia-600 hover:bg-fuchsia-700">
          <Link href={`/${locale}/dashboard/buyer/projects/new`}>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? "نشر مشروع" : "Post Project"}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "المشاريع المنشورة" : "Posted Projects"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-600">{analytics?.summary?.totalPosted || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "المشاريع النشطة" : "Active Projects"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.summary?.activeProjects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "العروض المستلمة" : "Proposals Received"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.summary?.totalBidsReceived || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الإنفاق" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.summary?.totalSpent?.toLocaleString() || 0} {isArabic ? "ر.س" : "SAR"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            <Clock className="h-4 w-4 mr-2" />
            {isArabic ? "النشطة" : "Active"}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            {isArabic ? "المكتملة" : "Completed"}
          </TabsTrigger>
          <TabsTrigger value="proposals">
            <Users className="h-4 w-4 mr-2" />
            {isArabic ? "العروض" : "Proposals"}
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "العقود" : "Contracts"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "مشاريعي النشطة - Upwork Projects" : "My Active Projects - Upwork Style"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المشروع" : "Project"}</TableHead>
                    <TableHead>{isArabic ? "الميزانية" : "Budget"}</TableHead>
                    <TableHead>{isArabic ? "العروض" : "Proposals"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? "لا توجد مشاريع نشطة" : "No active projects"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {isArabic ? project.titleAr : project.titleEn}
                            </p>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {project.budget} {isArabic ? "ر.س" : "SAR"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.proposalCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-600">{isArabic ? "مفتوح" : "Open"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            {isArabic ? "عرض العروض" : "View Proposals"}
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

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "عروض المستقلين - Bids & Proposals" : "Freelancer Proposals - Bids"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد عروض بعد" : "No proposals yet"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
