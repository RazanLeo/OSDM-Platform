"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, TrendingUp, Clock, Upload, DollarSign, Eye } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import type { Locale } from "@/lib/i18n/config"

interface SellerProjectsDashboardProps {
  proposals: any[]
  contracts: any[]
  stats: {
    totalProposals: number
    acceptedProposals: number
    activeContracts: number
    totalEarnings: number
    pendingPayments: number
  }
  locale: Locale
  translations: any
}

export function SellerProjectsDashboard({
  proposals,
  contracts,
  stats,
  locale,
  translations: t
}: SellerProjectsDashboardProps) {
  const isArabic = locale === "ar"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="h-8 w-8 text-[#89A58F]" />
            {isArabic ? "مشاريعي - عمل حر" : "My Projects - Freelance"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "عروضك وعقودك ومشاريعك النشطة (Upwork + Mostaql)"
              : "Your proposals, contracts and active projects (Upwork + Mostaql)"}
          </p>
        </div>
        <Button size="lg" className="gap-2 bg-gradient-to-r from-[#89A58F] to-[#846F9C]" asChild>
          <Link href={`/${locale}/marketplace/projects`}>
            <Eye className="h-5 w-5" />
            {isArabic ? "تصفح المشاريع" : "Browse Projects"}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "العروض المقدمة" : "Proposals Sent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.acceptedProposals} {isArabic ? "مقبول" : "accepted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "عقود نشطة" : "Active Contracts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {isArabic ? "قيد التنفيذ" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "الأرباح المستلمة" : "Earnings Received"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalEarnings.toFixed(2)} {t.sar}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {isArabic ? "صافي الأرباح" : "net earnings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? "مدفوعات معلقة" : "Pending Payments"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments.toFixed(2)} {t.sar}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "قيد الضمان" : "In escrow"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#89A58F] to-[#846F9C] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              {isArabic ? "معدل القبول" : "Acceptance Rate"}
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
              {isArabic ? "من العروض المقدمة" : "Of submitted proposals"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "العقود النشطة" : "Active Contracts"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "المشاريع التي تعمل عليها حاليًا"
              : "Projects you're currently working on"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? "لا توجد عقود نشطة" : "No active contracts"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "تصفح المشاريع وقدم عروضك للحصول على عقود"
                  : "Browse projects and submit proposals to get contracts"}
              </p>
              <Button asChild>
                <Link href="/marketplace/projects">
                  {isArabic ? "تصفح المشاريع" : "Browse Projects"}
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
                          {isArabic ? contract.project.titleAr : contract.project.titleEn}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {isArabic ? "العميل:" : "Client:"} {contract.client.name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{isArabic ? "نشط" : "Active"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contract Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? "المبلغ الكلي" : "Total Amount"}
                        </p>
                        <p className="font-bold text-lg">
                          {contract.totalAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? "المدفوع" : "Paid"}
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          {contract.paidAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? "المتبقي" : "Remaining"}
                        </p>
                        <p className="font-bold text-lg">
                          {contract.remainingAmount.toLocaleString()} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? "التقدم" : "Progress"}
                        </p>
                        <p className="font-bold text-lg">{contract.progress}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isArabic ? "التقدم الكلي:" : "Overall Progress:"}
                        </span>
                        <span className="font-medium">{contract.progress}%</span>
                      </div>
                      <Progress value={contract.progress} className="h-2" />
                    </div>

                    {/* Milestones */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        {isArabic ? "المعالم" : "Milestones"} ({contract.milestones.length})
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
                                  {index + 1}. {isArabic ? milestone.titleAr : milestone.titleEn}
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
                                    ? isArabic
                                      ? "مقبول ✓"
                                      : "Approved ✓"
                                    : milestone.status === "IN_PROGRESS"
                                    ? isArabic
                                      ? "قيد العمل"
                                      : "In Progress"
                                    : milestone.status === "DELIVERED"
                                    ? isArabic
                                      ? "تم التسليم"
                                      : "Delivered"
                                    : isArabic
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
                                {isArabic ? "تسليم" : "Deliver"}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline">
                        {isArabic ? "التواصل مع العميل" : "Contact Client"}
                      </Button>
                      <Button variant="outline">{isArabic ? "عرض التفاصيل" : "View Details"}</Button>
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
          <CardTitle>{isArabic ? "العروض المقدمة" : "Submitted Proposals"}</CardTitle>
          <CardDescription>
            {isArabic
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
                        {isArabic ? proposal.project.titleAr : proposal.project.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "العميل:" : "Client:"} {proposal.project.client.name}
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
                        ? isArabic
                          ? "مقبول ✓"
                          : "Accepted ✓"
                        : proposal.status === "REJECTED"
                        ? isArabic
                          ? "مرفوض"
                          : "Rejected"
                        : isArabic
                        ? "قيد المراجعة"
                        : "Under Review"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "ميزانية العميل" : "Client Budget"}
                      </p>
                      <p className="font-medium">
                        {proposal.project.budget.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "عرضك" : "Your Proposal"}
                      </p>
                      <p className="font-medium text-green-600">
                        {proposal.proposedAmount.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "المدة المقترحة" : "Proposed Duration"}
                      </p>
                      <p className="font-medium">
                        {proposal.proposedDuration} {isArabic ? "يوم" : "days"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {isArabic ? "عرض التفاصيل" : "View Details"}
                    </Button>
                    {proposal.status === "PENDING" && (
                      <Button size="sm" variant="outline">
                        {isArabic ? "تعديل العرض" : "Edit Proposal"}
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
