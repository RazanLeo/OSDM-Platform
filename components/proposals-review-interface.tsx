"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Proposal {
  id: string
  coverLetter: string
  proposedAmount: number
  deliveryDays: number
  attachments: string[]
  status: string
  createdAt: string
  User: {
    id: string
    username: string
    fullName: string
    avatar: string | null
  }
}

interface ProposalsReviewInterfaceProps {
  projectId: string
  projectTitle: string
  isArabic: boolean
  onProposalAccepted?: () => void
}

export function ProposalsReviewInterface({
  projectId,
  projectTitle,
  isArabic,
  onProposalAccepted
}: ProposalsReviewInterfaceProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")

  useEffect(() => {
    loadProposals()
  }, [projectId])

  const loadProposals = async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/proposals?projectId=${projectId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setProposals(data.data || [])
      }
    } catch (error) {
      console.error("Error loading proposals:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const acceptProposal = async (proposalId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept proposal")
      }

      toast.success(isArabic ? "تم قبول العرض بنجاح" : "Proposal accepted successfully")
      await loadProposals()
      if (onProposalAccepted) onProposalAccepted()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل قبول العرض" : "Failed to accept proposal"))
    } finally {
      setLoading(false)
    }
  }

  const rejectProposal = async (proposalId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/reject`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject proposal")
      }

      toast.success(isArabic ? "تم رفض العرض" : "Proposal rejected")
      await loadProposals()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل رفض العرض" : "Failed to reject proposal"))
    } finally {
      setLoading(false)
    }
  }

  const filteredProposals = proposals.filter(p => {
    if (filter === "all") return true
    if (filter === "pending") return p.status === "PENDING"
    if (filter === "accepted") return p.status === "ACCEPTED"
    if (filter === "rejected") return p.status === "REJECTED"
    return true
  })

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          {isArabic ? "مراجعة عروض المستقلين - Upwork Style" : "Review Freelancer Proposals - Upwork Style"}
        </CardTitle>
        <CardDescription>
          {isArabic ? `المشروع: ${projectTitle}` : `Project: ${projectTitle}`}
        </CardDescription>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline">
            {proposals.length} {isArabic ? "عرض" : "proposals"}
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            {proposals.filter(p => p.status === "PENDING").length} {isArabic ? "بانتظار المراجعة" : "pending"}
          </Badge>
          <Badge variant="outline" className="text-green-600">
            {proposals.filter(p => p.status === "ACCEPTED").length} {isArabic ? "مقبول" : "accepted"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              {isArabic ? "الكل" : "All"}
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-1" />
              {isArabic ? "قيد المراجعة" : "Pending"}
            </TabsTrigger>
            <TabsTrigger value="accepted">
              <CheckCircle className="h-4 w-4 mr-1" />
              {isArabic ? "مقبول" : "Accepted"}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-1" />
              {isArabic ? "مرفوض" : "Rejected"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-6">
            {filteredProposals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {isArabic ? "لا توجد عروض" : "No proposals"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <Card key={proposal.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      {/* Freelancer Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={proposal.User.avatar || undefined} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {proposal.User.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{proposal.User.fullName}</h3>
                            <p className="text-sm text-muted-foreground">@{proposal.User.username}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">4.8</span>
                                <span className="text-muted-foreground">(42 {isArabic ? "تقييم" : "reviews"})</span>
                              </div>
                              <Badge variant="outline" className="text-green-600">
                                <Award className="h-3 w-3 mr-1" />
                                {isArabic ? "مستقل محترف" : "Top Rated"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {proposal.status === "PENDING" && (
                          <Badge variant="outline" className="text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {isArabic ? "بانتظار المراجعة" : "Pending Review"}
                          </Badge>
                        )}
                        {proposal.status === "ACCEPTED" && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {isArabic ? "مقبول" : "Accepted"}
                          </Badge>
                        )}
                        {proposal.status === "REJECTED" && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {isArabic ? "مرفوض" : "Rejected"}
                          </Badge>
                        )}
                      </div>

                      <Separator />

                      {/* Proposal Details */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? "المبلغ المقترح" : "Proposed Amount"}
                            </p>
                            <p className="font-bold text-lg">
                              {proposal.proposedAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? "مدة التسليم" : "Delivery Time"}
                            </p>
                            <p className="font-bold text-lg">
                              {proposal.deliveryDays} {isArabic ? "يوم" : "days"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? "تاريخ التقديم" : "Submitted"}
                            </p>
                            <p className="font-medium">
                              {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Cover Letter */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {isArabic ? "الخطاب التعريفي" : "Cover Letter"}
                        </h4>
                        <p className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                          {proposal.coverLetter}
                        </p>
                      </div>

                      {/* Attachments */}
                      {proposal.attachments && proposal.attachments.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {isArabic ? "المرفقات" : "Attachments"}
                            </h4>
                            <div className="space-y-2">
                              {proposal.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                  <Download className="h-4 w-4" />
                                  {isArabic ? `مرفق ${index + 1}` : `Attachment ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      {proposal.status === "PENDING" && (
                        <>
                          <Separator />
                          <div className="flex gap-3">
                            <Button
                              onClick={() => acceptProposal(proposal.id)}
                              disabled={loading}
                              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {isArabic ? "قبول العرض وبدء التعاقد" : "Accept & Hire"}
                            </Button>
                            <Button
                              onClick={() => rejectProposal(proposal.id)}
                              disabled={loading}
                              variant="outline"
                              className="flex-1 gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              {isArabic ? "رفض العرض" : "Decline"}
                            </Button>
                            <Button variant="outline" className="gap-2">
                              <MessageSquare className="h-4 w-4" />
                              {isArabic ? "مراسلة" : "Message"}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
