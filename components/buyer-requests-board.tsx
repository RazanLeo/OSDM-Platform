"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Plus, DollarSign, Clock, Send } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface BuyerRequest {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  budget: number
  deadline: string | null
  category: string
  offersCount: number
  createdAt: string
  User: {
    id: string
    username: string
    fullName: string
  }
}

interface BuyerRequestsBoardProps {
  isArabic: boolean
  isSeller?: boolean
}

export function BuyerRequestsBoard({ isArabic, isSeller = false }: BuyerRequestsBoardProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New request form
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [budget, setBudget] = useState("")
  const [category, setCategory] = useState("")

  // Offer form
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [offerDeliveryDays, setOfferDeliveryDays] = useState("")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoadingData(true)
    try {
      const response = await fetch('/api/buyer-requests')
      const data = await response.json()

      if (response.ok && data.success) {
        setRequests(data.data || [])
      }
    } catch (error) {
      console.error("Error loading requests:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const submitRequest = async () => {
    if (!titleAr || !titleEn || !descriptionAr || !descriptionEn || !budget) {
      toast.error(isArabic ? "جميع الحقول مطلوبة" : "All fields required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/buyer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr,
          titleEn,
          descriptionAr,
          descriptionEn,
          budget: parseFloat(budget),
          category,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request')
      }

      toast.success(isArabic ? 'تم نشر الطلب بنجاح' : 'Request posted successfully')
      setIsDialogOpen(false)
      setTitleAr("")
      setTitleEn("")
      setDescriptionAr("")
      setDescriptionEn("")
      setBudget("")
      setCategory("")
      await loadRequests()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل نشر الطلب' : 'Failed to post request'))
    } finally {
      setLoading(false)
    }
  }

  const submitOffer = async (requestId: string) => {
    if (!offerAmount || !offerMessage || !offerDeliveryDays) {
      toast.error(isArabic ? 'جميع الحقول مطلوبة' : 'All fields required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/buyer-requests/${requestId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(offerAmount),
          message: offerMessage,
          deliveryDays: parseInt(offerDeliveryDays),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit offer')
      }

      toast.success(isArabic ? 'تم تقديم عرضك بنجاح' : 'Offer submitted successfully')
      setSelectedRequestId(null)
      setOfferAmount("")
      setOfferMessage("")
      setOfferDeliveryDays("")
      await loadRequests()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل تقديم العرض' : 'Failed to submit offer'))
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              {isArabic ? "طلبات المشترين - Fiverr Buyer Requests" : "Buyer Requests Board - Fiverr Style"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "المشترون ينشرون احتياجاتهم والمستقلون يقدمون عروضهم"
                : "Buyers post their needs, freelancers submit offers"}
            </CardDescription>
          </div>
          {!isSeller && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {isArabic ? "نشر طلب" : "Post Request"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{isArabic ? "نشر طلب جديد" : "Post New Request"}</DialogTitle>
                  <DialogDescription>
                    {isArabic ? "اشرح احتياجاتك وسيقدم المستقلون عروضهم" : "Describe your needs and freelancers will submit offers"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{isArabic ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                      <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? "العنوان (إنجليزي)" : "Title (English)"}</Label>
                      <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{isArabic ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                      <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                      <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={4} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{isArabic ? "الميزانية (ر.س)" : "Budget (SAR)"}</Label>
                      <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? "التصنيف" : "Category"}</Label>
                      <Input value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={submitRequest} disabled={loading} className="w-full">
                    {isArabic ? "نشر الطلب" : "Post Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isArabic ? "لا توجد طلبات حالياً" : "No requests available"}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {isArabic ? request.titleAr : request.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isArabic ? "بواسطة" : "by"} {request.User.fullName} • {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline">{request.category}</Badge>
                  </div>

                  <p className="text-sm">
                    {isArabic ? request.descriptionAr : request.descriptionEn}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{request.budget.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    {request.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{format(new Date(request.deadline), "MMM d")}</span>
                      </div>
                    )}
                    <Badge variant="outline">
                      {request.offersCount} {isArabic ? "عرض" : "offers"}
                    </Badge>
                  </div>

                  {isSeller && (
                    <>
                      {selectedRequestId === request.id ? (
                        <div className="border-t pt-4 space-y-3">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>{isArabic ? "المبلغ (ر.س)" : "Amount (SAR)"}</Label>
                              <Input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>{isArabic ? "مدة التسليم (أيام)" : "Delivery (days)"}</Label>
                              <Input type="number" value={offerDeliveryDays} onChange={(e) => setOfferDeliveryDays(e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? "رسالة العرض" : "Offer Message"}</Label>
                            <Textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} rows={3} />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => submitOffer(request.id)} disabled={loading} className="gap-2">
                              <Send className="h-4 w-4" />
                              {isArabic ? "إرسال العرض" : "Submit Offer"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedRequestId(null)}>
                              {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button onClick={() => setSelectedRequestId(request.id)} className="gap-2">
                          <Send className="h-4 w-4" />
                          {isArabic ? "تقديم عرض" : "Send Offer"}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
