"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, CheckCircle, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Milestone {
  id: string
  title: string
  description: string | null
  amount: number
  status: string
  deliveryFiles: string[]
  deliveryNote: string | null
  deliveredAt: string | null
  acceptedAt: string | null
  createdAt: string
}

interface ContractMilestonesProps {
  contractId: string
  isFreelancer: boolean
  isClient: boolean
  isArabic: boolean
}

export function ContractMilestones({ contractId, isFreelancer, isClient, isArabic }: ContractMilestonesProps) {
  const [loading, setLoading] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    loadMilestones()
  }, [contractId])

  const loadMilestones = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/milestones`)
      const data = await response.json()
      if (response.ok) setMilestones(data.data || [])
    } catch (error) {
      console.error("Error loading milestones:", error)
    }
  }

  const addMilestone = async () => {
    if (!title || !amount) {
      toast.error(isArabic ? "العنوان والمبلغ مطلوبان" : "Title and amount required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/contracts/${contractId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          amount: parseFloat(amount),
        }),
      })

      if (!response.ok) throw new Error('Failed to add milestone')

      toast.success(isArabic ? 'تمت الإضافة' : 'Milestone added')
      setTitle("")
      setDescription("")
      setAmount("")
      await loadMilestones()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = milestones.reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0)
  const completedAmount = milestones
    .filter(m => m.status === 'COMPLETED')
    .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0)
  const progress = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {isArabic ? "المعالم المالية - Upwork Milestones" : "Contract Milestones - Upwork Style"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{isArabic ? "التقدم الكلي" : "Overall Progress"}</span>
            <span className="font-bold">{completedAmount.toLocaleString()} / {totalAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {isClient && (
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">{isArabic ? "إضافة معلم جديد" : "Add New Milestone"}</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{isArabic ? "العنوان" : "Title"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "المبلغ (ر.س)" : "Amount (SAR)"}</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "الوصف" : "Description"}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <Button onClick={addMilestone} disabled={loading} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {isArabic ? "إضافة معلم" : "Add Milestone"}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">{parseFloat(milestone.amount.toString()).toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  {milestone.status === 'COMPLETED' ? (
                    <Badge className="bg-green-600 mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {isArabic ? "مكتمل" : "Completed"}
                    </Badge>
                  ) : milestone.status === 'DELIVERED' ? (
                    <Badge className="bg-blue-600 mt-1">{isArabic ? "تم التسليم" : "Delivered"}</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1">{isArabic ? "قيد التنفيذ" : "In Progress"}</Badge>
                  )}
                </div>
              </div>
              {milestone.deliveredAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? "تم التسليم:" : "Delivered:"} {format(new Date(milestone.deliveredAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
