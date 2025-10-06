'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectProposalFormProps {
  projectId: string
  existingProposal: any
}

export default function ProjectProposalForm({
  projectId,
  existingProposal
}: ProjectProposalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: existingProposal?.coverLetter || '',
    proposedAmount: existingProposal?.proposedAmount || '',
    proposedDuration: existingProposal?.proposedDuration || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.coverLetter.trim()) {
      toast.error('يرجى كتابة رسالة التغطية')
      return
    }

    if (!formData.proposedAmount || parseFloat(formData.proposedAmount) <= 0) {
      toast.error('يرجى إدخال المبلغ المقترح')
      return
    }

    if (!formData.proposedDuration.trim()) {
      toast.error('يرجى إدخال المدة المقترحة')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: formData.coverLetter,
          proposedAmount: parseFloat(formData.proposedAmount),
          proposedDuration: formData.proposedDuration
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم تقديم العرض بنجاح')
        router.refresh()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء تقديم العرض')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تقديم العرض')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user already submitted a proposal
  if (existingProposal) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>تم تقديم عرضك</CardTitle>
          </div>
          <CardDescription>
            قدمت عرضاً على هذا المشروع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">المبلغ المقترح</Label>
            <p className="text-xl font-bold text-primary">
              {new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR'
              }).format(existingProposal.proposedAmount)} ريال
            </p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">المدة المقترحة</Label>
            <p className="font-semibold">{existingProposal.proposedDuration}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">الحالة</Label>
            <div className="mt-1">
              <Badge
                variant={
                  existingProposal.status === 'ACCEPTED'
                    ? 'default'
                    : existingProposal.status === 'REJECTED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {existingProposal.status === 'PENDING' && 'قيد المراجعة'}
                {existingProposal.status === 'ACCEPTED' && 'مقبول'}
                {existingProposal.status === 'REJECTED' && 'مرفوض'}
              </Badge>
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href={`/dashboard/proposals`}>
              عرض جميع عروضي
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>قدم عرضك</CardTitle>
        <CardDescription>
          اشرح كيف يمكنك إنجاز هذا المشروع وحدد سعرك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              رسالة التغطية <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="اشرح خبرتك في هذا المجال وكيف ستنفذ المشروع..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              rows={6}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              اكتب رسالة مقنعة توضح خبرتك وأسلوب عملك
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposedAmount">
                المبلغ المقترح (ريال) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="proposedAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="5000"
                value={formData.proposedAmount}
                onChange={(e) => setFormData({ ...formData, proposedAmount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedDuration">
                المدة المقترحة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="proposedDuration"
                type="text"
                placeholder="أسبوعين"
                value={formData.proposedDuration}
                onChange={(e) => setFormData({ ...formData, proposedDuration: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">ملاحظات مهمة:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• سيتم خصم 25% من المبلغ كعمولة للمنصة</li>
              <li>• تأكد من قراءة تفاصيل المشروع بعناية</li>
              <li>• التزم بالمواعيد المحددة في عرضك</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            <Send className="h-5 w-5 ml-2" />
            {isSubmitting ? 'جاري الإرسال...' : 'تقديم العرض'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
