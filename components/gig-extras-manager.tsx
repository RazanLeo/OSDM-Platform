"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Zap } from "lucide-react"
import { toast } from "sonner"

interface GigExtra {
  id: string
  titleAr: string
  titleEn: string
  price: number
  deliveryDays: number
}

interface GigExtrasManagerProps {
  serviceId: string
  isArabic: boolean
}

export function GigExtrasManager({ serviceId, isArabic }: GigExtrasManagerProps) {
  const [loading, setLoading] = useState(false)
  const [extras, setExtras] = useState<GigExtra[]>([])
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [price, setPrice] = useState("")
  const [deliveryDays, setDeliveryDays] = useState("")

  useEffect(() => {
    loadExtras()
  }, [serviceId])

  const loadExtras = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/extras`)
      const data = await response.json()
      if (response.ok) setExtras(data.data || [])
    } catch (error) {
      console.error("Error loading extras:", error)
    }
  }

  const addExtra = async () => {
    if (!titleAr || !titleEn || !price) {
      toast.error(isArabic ? "جميع الحقول مطلوبة" : "All fields required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/services/${serviceId}/extras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr,
          titleEn,
          price: parseFloat(price),
          deliveryDays: parseInt(deliveryDays) || 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to add extra')

      toast.success(isArabic ? 'تمت الإضافة' : 'Extra added')
      setTitleAr("")
      setTitleEn("")
      setPrice("")
      setDeliveryDays("")
      await loadExtras()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteExtra = async (extraId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${serviceId}/extras/${extraId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success(isArabic ? 'تم الحذف' : 'Deleted')
      await loadExtras()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          {isArabic ? "إدارة الإضافات - Gig Extras" : "Gig Extras Manager"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "أضف خدمات إضافية اختيارية لزيادة الإيرادات" : "Add optional extras to increase revenue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>{isArabic ? "العنوان (عربي)" : "Title (AR)"}</Label>
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "العنوان (إنجليزي)" : "Title (EN)"}</Label>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"}</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "أيام إضافية" : "Extra Days"}</Label>
            <Input type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} />
          </div>
        </div>
        <Button onClick={addExtra} disabled={loading} className="gap-2">
          <Plus className="h-4 w-4" />
          {isArabic ? "إضافة" : "Add Extra"}
        </Button>

        <div className="space-y-2">
          {extras.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{isArabic ? extra.titleAr : extra.titleEn}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{extra.price} {isArabic ? "ر.س" : "SAR"}</Badge>
                  {extra.deliveryDays > 0 && (
                    <Badge variant="outline">+{extra.deliveryDays} {isArabic ? "يوم" : "days"}</Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteExtra(extra.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
