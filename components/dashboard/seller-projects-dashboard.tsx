"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/language-provider"
import { FolderKanban, Send, TrendingUp, Clock, Upload, DollarSign, Eye } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface Proposal {
  id: string
  project: {
    id: string
    titleAr: string
    titleEn: string
    budget: number
    client: {
      name: string
    }
  }
  proposedAmount: number
  proposedDuration: number
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  submittedAt: string
  coverLetter: string
}

interface ActiveContract {
  id: string
  project: {
    titleAr: string
    titleEn: string
  }
  client: {
    name: string
  }
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  progress: number
  status: "ACTIVE" | "COMPLETED"
  milestones: {
    id: string
    titleAr: string
    titleEn: string
    amount: number
    status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "APPROVED"
  }[]
}

export function SellerProjectsDashboard() {
  const { t, isRTL } = useLanguage()
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [contracts, setContracts] = useState<ActiveContract[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProposals: 0,
    acceptedProposals: 0,
    activeContracts: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockProposals: Proposal[] = [
        {
          id: "pr1",
          project: {
            id: "p1",
            titleAr: "تطوير متجر إلكتروني متكامل",
            titleEn: "Complete E-commerce Store Development",
            budget: 25000,
            client: {
              name: "شركة التقنية",
            },
          },
          proposedAmount: 23000,
          proposedDuration: 30,
          status: "PENDING",
          submittedAt: "2025-10-10T10:00:00Z",
          coverLetter: "لدي خبرة 5 سنوات...",
        },
        {
          id: "pr2",
          project: {
            id: "p2",
            titleAr: "كتابة محتوى موقع شركة",
            titleEn: "Corporate Website Content",
            budget: 5000,
            client: {
              name: "أحمد محمد",
            },
          },
          proposedAmount: 4500,
          proposedDuration: 14,
          status: "ACCEPTED",
          submittedAt: "2025-10-08T14:00:00Z",
          coverLetter: "سأقدم لك محتوى احترافي...",
        },
      ]

      const mockContracts: ActiveContract[] = [
        {
          id: "c1",
          project: {
            titleAr: "تطوير تطبيق جوال",
            titleEn: "Mobile App Development",
          },
          client: {
            name: "شركة الابتكار",
          },
          totalAmount: 18000,
          paidAmount: 6000,
          remainingAmount: 12000,
          progress: 40,
          status: "ACTIVE",
          milestones: [
            {
              id: "m1",
              titleAr: "التصميم والUI",
              titleEn: "Design & UI",
              amount: 4000,
              status: "APPROVED",
            },
            {
              id: "m2",
              titleAr: "تطوير Frontend",
              titleEn: "Frontend Development",
              amount: 6000,
              status: "IN_PROGRESS",
            },
            {
              id: "m3",
              titleAr: "Backend والAPI",
              titleEn: "Backend & API",
              amount: 6000,
              status: "PENDING",
            },
            {
              id: "m4",
              titleAr: "الاختبار والنشر",
              titleEn: "Testing & Deployment",
              amount: 2000,
              status: "PENDING",
            },
          ],
        },
      ]

      setProposals(mockProposals)
      setContracts(mockContracts)

      const totalPaid = mockContracts.reduce((sum, c) => sum + c.paidAmount, 0)
      const totalRemaining = mockContracts.reduce((sum, c) => sum + c.remainingAmount, 0)

      setStats({
        totalProposals: mockProposals.length,
        acceptedProposals: mockProposals.filter((p) => p.status === "ACCEPTED").length,
        activeContracts: mockContracts.filter((c) => c.status === "ACTIVE").length,
        totalEarnings: totalPaid,
        pendingPayments: totalRemaining,
      })
      setLoading(false)
    }

    if (session) {
      fetchData()
    }
  }, [session])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="h-8 w-8" />
            {isRTL ? "مشاريعي - عمل حر" : "My Projects - Freelance"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL
              ? "عروضك وعقودك ومشاريعك النشطة"
              : "Your proposals, contracts and active projects"}
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/marketplace/projects">
            <Eye className="h-5 w-5" />
            {isRTL ? "تصفح المشاريع" : "Browse Projects"}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "العروض المقدمة" : "Proposals Sent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.acceptedProposals} {isRTL ? "مقبول" : "accepted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "عقود نشطة" : "Active Contracts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {isRTL ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "الأرباح المستلمة" : "Earnings Received"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalEarnings.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isRTL ? "+20% هذا الشهر" : "+20% this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "مدفوعات معلقة" : "Pending Payments"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "قيد الضمان" : "In escrow"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#89A58F] to-[#846F9C] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isRTL ? "معدل القبول" : "Acceptance Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProposals > 0
                ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-white/80 mt-1">
              {isRTL ? "من العروض المقدمة" : "Of submitted proposals"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "العقود النشطة" : "Active Contracts"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "المشاريع التي تعمل عليها حاليًا"
              : "Projects you're currently working on"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد عقود نشطة" : "No active contracts"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL
                  ? "تصفح المشاريع وقدم عروضك للحصول على عقود"
                  : "Browse projects and submit proposals to get contracts"}
              </p>
              <Button asChild>
                <Link href="/marketplace/projects">
                  {isRTL ? "تصفح المشاريع" : "Browse Projects"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {isRTL ? contract.project.titleAr : contract.project.titleEn}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {isRTL ? "العميل:" : "Client:"} {contract.client.name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{isRTL ? "نشط" : "Active"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contract Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "المبلغ الكلي" : "Total Amount"}
                        </p>
                        <p className="font-bold text-lg">
                          {contract.totalAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "المدفوع" : "Paid"}
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          {contract.paidAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "المتبقي" : "Remaining"}
                        </p>
                        <p className="font-bold text-lg">
                          {contract.remainingAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "التقدم" : "Progress"}
                        </p>
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
                      <h4 className="font-semibold mb-3">
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
                                <Badge
                                  variant={
                                    milestone.status === "APPROVED"
                                      ? "default"
                                      : milestone.status === "IN_PROGRESS"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {milestone.status === "APPROVED"
                                    ? isRTL
                                      ? "مقبول ✓"
                                      : "Approved ✓"
                                    : milestone.status === "IN_PROGRESS"
                                    ? isRTL
                                      ? "قيد العمل"
                                      : "In Progress"
                                    : milestone.status === "DELIVERED"
                                    ? isRTL
                                      ? "تم التسليم"
                                      : "Delivered"
                                    : isRTL
                                    ? "معلق"
                                    : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {milestone.amount.toLocaleString()} ر.س
                              </p>
                            </div>
                            {milestone.status === "IN_PROGRESS" && (
                              <Button size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                {isRTL ? "تسليم" : "Deliver"}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline">
                        {isRTL ? "التواصل مع العميل" : "Contact Client"}
                      </Button>
                      <Button variant="outline">{isRTL ? "عرض التفاصيل" : "View Details"}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "العروض المقدمة" : "Submitted Proposals"}</CardTitle>
          <CardDescription>
            {isRTL
              ? "العروض التي قدمتها على المشاريع"
              : "Proposals you've submitted on projects"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {isRTL ? proposal.project.titleAr : proposal.project.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "العميل:" : "Client:"} {proposal.project.client.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        proposal.status === "ACCEPTED"
                          ? "default"
                          : proposal.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {proposal.status === "ACCEPTED"
                        ? isRTL
                          ? "مقبول ✓"
                          : "Accepted ✓"
                        : proposal.status === "REJECTED"
                        ? isRTL
                          ? "مرفوض"
                          : "Rejected"
                        : isRTL
                        ? "قيد المراجعة"
                        : "Under Review"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "ميزانية العميل" : "Client Budget"}
                      </p>
                      <p className="font-medium">
                        {proposal.project.budget.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "عرضك" : "Your Proposal"}
                      </p>
                      <p className="font-medium text-green-600">
                        {proposal.proposedAmount.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "المدة المقترحة" : "Proposed Duration"}
                      </p>
                      <p className="font-medium">
                        {proposal.proposedDuration} {isRTL ? "يوم" : "days"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </Button>
                    {proposal.status === "PENDING" && (
                      <Button size="sm" variant="outline">
                        {isRTL ? "تعديل العرض" : "Edit Proposal"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
