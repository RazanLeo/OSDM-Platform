'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Star, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface Proposal {
  id: string
  coverLetter: string
  proposedAmount: number
  proposedDuration: string
  status: string
  createdAt: Date
  freelancer: {
    id: string
    username: string
    fullName: string
    avatar: string | null
    sellerLevel: string | null
    averageRating: number | null
    totalReviews: number
  }
}

interface ProjectProposalsProps {
  projectId: string
  proposals: Proposal[]
  projectStatus: string
}

export default function ProjectProposals({
  projectId,
  proposals,
  projectStatus
}: ProjectProposalsProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price)
  }

  const handleAcceptProposal = async (proposalId: string) => {
    setProcessingId(proposalId)

    try {
      const response = await fetch(`/api/projects/${projectId}/proposals/${proposalId}/accept`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم قبول العرض بنجاح')
        router.refresh()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء قبول العرض')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء قبول العرض')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>العروض المقدمة ({proposals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لم يتم تقديم أي عروض بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal, index) => (
              <div key={proposal.id}>
                {index > 0 && <Separator className="mb-6" />}

                <div className="space-y-4">
                  {/* Freelancer Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={proposal.freelancer.avatar || undefined} />
                      <AvatarFallback>{proposal.freelancer.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{proposal.freelancer.fullName}</h4>
                            {proposal.freelancer.sellerLevel && (
                              <Badge variant="secondary" className="text-xs">
                                {proposal.freelancer.sellerLevel}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{proposal.freelancer.username}</p>
                          {proposal.freelancer.averageRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">
                                {proposal.freelancer.averageRating.toFixed(1)}
                              </span>
                              {proposal.freelancer.totalReviews > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({proposal.freelancer.totalReviews})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            proposal.status === 'ACCEPTED'
                              ? 'default'
                              : proposal.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {proposal.status === 'PENDING' && 'قيد المراجعة'}
                          {proposal.status === 'ACCEPTED' && 'مقبول'}
                          {proposal.status === 'REJECTED' && 'مرفوض'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="mr-16 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">المبلغ المقترح: </span>
                        <span className="font-bold text-primary">{formatPrice(proposal.proposedAmount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">المدة المقترحة: </span>
                        <span className="font-semibold">{proposal.proposedDuration}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      قُدم {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true, locale: ar })}
                    </p>

                    {/* Action Buttons */}
                    {proposal.status === 'PENDING' && projectStatus === 'OPEN' && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={() => handleAcceptProposal(proposal.id)}
                          disabled={processingId === proposal.id}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          قبول العرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`/seller/${proposal.freelancer.username}`}>
                            عرض الملف الشخصي
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
