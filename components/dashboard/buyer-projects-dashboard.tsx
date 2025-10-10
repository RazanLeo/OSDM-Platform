"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/language-provider"
import { FolderKanban, Users, DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface Contract {
  id: string
  project: {
    id: string
    titleAr: string
    titleEn: string
  }
  freelancer: {
    id: string
    name: string
    avatar?: string
  }
  budget: number
  milestones: {
    id: string
    titleAr: string
    titleEn: string
    amount: number
    status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "APPROVED" | "REJECTED"
    dueDate: string
  }[]
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  startedAt: string
  completedAt?: string
  totalPaid: number
  progress: number
}

export function BuyerProjectsDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedContracts: 0,
    totalSpent: 0,
    pendingMilestones: 0,
  })

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockContracts: Contract[] = [
        {
          id: "c1",
          project: {
            id: "pr1",
            titleAr: "تطوير تطبيق جوال للتجارة الإلكترونية",
            titleEn: "E-commerce Mobile App Development",
          },
          freelancer: {
            id: "f1",
            name: "خالد المطور",
            avatar: "/placeholder.jpg",
          },
          budget: 15000,
          milestones: [
            {
              id: "m1",
              titleAr: "تصميم واجهة المستخدم",
              titleEn: "UI/UX Design",
              amount: 3000,
              status: "APPROVED",
              dueDate: "2025-10-15T00:00:00Z",
            },
            {
              id: "m2",
              titleAr: "تطوير الواجهة الأمامية",
              titleEn: "Frontend Development",
              amount: 5000,
              status: "IN_PROGRESS",
              dueDate: "2025-10-25T00:00:00Z",
            },
            {
              id: "m3",
              titleAr: "تطوير Backend والAPI",
              titleEn: "Backend & API Development",
              amount: 5000,
              status: "PENDING",
              dueDate: "2025-11-05T00:00:00Z",
            },
            {
              id: "m4",
              titleAr: "الاختبار والنشر",
              titleEn: "Testing & Deployment",
              amount: 2000,
              status: "PENDING",
              dueDate: "2025-11-15T00:00:00Z",
            },
          ],
          status: "ACTIVE",
          startedAt: "2025-10-01T00:00:00Z",
          totalPaid: 3000,
          progress: 25,
        },
        {
          id: "c2",
          project: {
            id: "pr2",
            titleAr: "كتابة محتوى موقع شركة",
            titleEn: "Corporate Website Content Writing",
          },
          freelancer: {
            id: "f2",
            name: "نورة الكاتبة",
          },
          budget: 3500,
          milestones: [
            {
              id: "m5",
              titleAr: "صفحة الرئيسية وعن الشركة",
              titleEn: "Homepage & About Us",
              amount: 1500,
              status: "APPROVED",
              dueDate: "2025-09-20T00:00:00Z",
            },
            {
              id: "m6",
              titleAr: "صفحات الخدمات والمدونة",
              titleEn: "Services Pages & Blog",
              amount: 2000,
              status: "APPROVED",
              dueDate: "2025-09-30T00:00:00Z",
            },
          ],
          status: "COMPLETED",
          startedAt: "2025-09-10T00:00:00Z",
          completedAt: "2025-10-01T00:00:00Z",
          totalPaid: 3500,
          progress: 100,
        },
      ]

      setContracts(mockContracts)
      const pendingMilestonesCount = mockContracts.reduce(
        (sum, c) => sum + c.milestones.filter((m) => m.status === "DELIVERED").length,
        0
      )

      setStats({
        activeContracts: mockContracts.filter((c) => c.status === "ACTIVE").length,
        completedContracts: mockContracts.filter((c) => c.status === "COMPLETED").length,
        totalSpent: mockContracts.reduce((sum, c) => sum + c.totalPaid, 0),
        pendingMilestones: pendingMilestonesCount,
      })
      setLoading(false)
    }

    if (session) {
      fetchContracts()
    }
  }, [session])

  const getMilestoneStatusColor = (status: Contract["milestones"][0]["status"]) => {
    switch (status) {
      case "APPROVED":
        return "default"
      case "DELIVERED":
        return "secondary"
      case "IN_PROGRESS":
        return "outline"
      case "REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderKanban className="h-8 w-8" />
          {isRTL ? "عقودي - المشاريع" : "My Contracts - Projects"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "جميع عقود المشاريع والمعالم الخاصة بك"
            : "All your project contracts and milestones"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "عقود نشطة" : "Active Contracts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "عقود مكتملة" : "Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedContracts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "تم الانتهاء" : "Finished"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي المدفوع" : "Total Paid"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "على جميع المشاريع" : "Across all projects"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "معالم معلقة" : "Pending Milestones"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMilestones}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              {isRTL ? "يحتاج مراجعة" : "Needs review"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="space-y-6">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد عقود بعد" : "No contracts yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL
                  ? "ابدأ بتصفح المشاريع واختر مستقل لتنفيذ مشروعك"
                  : "Start browsing projects and hire a freelancer"}
              </p>
              <Button asChild>
                <Link href="/marketplace/projects">{isRTL ? "تصفح المشاريع" : "Browse Projects"}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {isRTL ? contract.project.titleAr : contract.project.titleEn}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isRTL ? "المستقل:" : "Freelancer:"} {contract.freelancer.name}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={contract.status === "COMPLETED" ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {contract.status === "ACTIVE"
                      ? isRTL
                        ? "نشط"
                        : "Active"
                      : isRTL
                      ? "مكتمل"
                      : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contract Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "الميزانية الكلية" : "Total Budget"}</p>
                    <p className="font-bold text-lg">{contract.budget.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "المدفوع" : "Paid"}</p>
                    <p className="font-bold text-lg text-green-600">
                      {contract.totalPaid.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "المتبقي" : "Remaining"}</p>
                    <p className="font-bold text-lg">
                      {(contract.budget - contract.totalPaid).toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "التقدم" : "Progress"}</p>
                    <p className="font-bold text-lg">{contract.progress}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isRTL ? "التقدم الكلي:" : "Overall Progress:"}
                    </span>
                    <span className="font-medium">{contract.progress}%</span>
                  </div>
                  <Progress value={contract.progress} className="h-2" />
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {isRTL ? "المعالم" : "Milestones"} ({contract.milestones.length})
                  </h4>
                  <div className="space-y-3">
                    {contract.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {index + 1}. {isRTL ? milestone.titleAr : milestone.titleEn}
                            </span>
                            <Badge variant={getMilestoneStatusColor(milestone.status)} className="text-xs">
                              {milestone.status === "APPROVED"
                                ? isRTL
                                  ? "مقبول"
                                  : "Approved"
                                : milestone.status === "DELIVERED"
                                ? isRTL
                                  ? "تم التسليم"
                                  : "Delivered"
                                : milestone.status === "IN_PROGRESS"
                                ? isRTL
                                  ? "قيد التنفيذ"
                                  : "In Progress"
                                : isRTL
                                ? "معلق"
                                : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {milestone.amount.toLocaleString()} ر.س
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(milestone.dueDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                            </span>
                          </div>
                        </div>
                        {milestone.status === "DELIVERED" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              {isRTL ? "طلب تعديل" : "Request Revision"}
                            </Button>
                            <Button size="sm">
                              {isRTL ? "قبول وإطلاق الدفع" : "Approve & Release"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    {isRTL ? "التواصل مع المستقل" : "Contact Freelancer"}
                  </Button>
                  <Button variant="outline">
                    {isRTL ? "عرض التفاصيل" : "View Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
