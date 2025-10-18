"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Briefcase } from "lucide-react"
import { toast } from "sonner"

export function ServiceCRUD({ isArabic = true }: { isArabic?: boolean }) {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "",
    categoryId: "", thumbnail: "", deliveryDays: "3",
    basicPrice: "", basicNameAr: "باقة أساسية", basicNameEn: "Basic",
    basicDeliveryDays: "3", basicFeaturesAr: "", basicFeaturesEn: "",
    standardPrice: "", standardNameAr: "باقة قياسية", standardNameEn: "Standard",
    standardDeliveryDays: "5", standardFeaturesAr: "", standardFeaturesEn: "",
    premiumPrice: "", premiumNameAr: "باقة متميزة", premiumNameEn: "Premium",
    premiumDeliveryDays: "7", premiumFeaturesAr: "", premiumFeaturesEn: "",
  })

  useEffect(() => {
    loadServices()
    loadCategories()
  }, [])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/seller/services')
      const data = await response.json()
      if (response.ok && data.success) setServices(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=CUSTOM_SERVICE')
      const data = await response.json()
      if (response.ok && data.success) setCategories(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.titleAr || !formData.titleEn || !formData.basicPrice) {
      toast.error(isArabic ? "الحقول المطلوبة ناقصة" : "Required fields missing")
      return
    }

    setSubmitting(true)
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: formData.titleAr,
          titleEn: formData.titleEn,
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn,
          categoryId: formData.categoryId,
          thumbnail: formData.thumbnail,
          deliveryDays: parseInt(formData.deliveryDays),
          packages: [
            {
              tier: 'BASIC',
              nameAr: formData.basicNameAr,
              nameEn: formData.basicNameEn,
              price: parseFloat(formData.basicPrice),
              deliveryDays: parseInt(formData.basicDeliveryDays),
              featuresAr: formData.basicFeaturesAr.split('\n').filter(Boolean),
              featuresEn: formData.basicFeaturesEn.split('\n').filter(Boolean),
            },
            ...(formData.standardPrice ? [{
              tier: 'STANDARD',
              nameAr: formData.standardNameAr,
              nameEn: formData.standardNameEn,
              price: parseFloat(formData.standardPrice),
              deliveryDays: parseInt(formData.standardDeliveryDays),
              featuresAr: formData.standardFeaturesAr.split('\n').filter(Boolean),
              featuresEn: formData.standardFeaturesEn.split('\n').filter(Boolean),
            }] : []),
            ...(formData.premiumPrice ? [{
              tier: 'PREMIUM',
              nameAr: formData.premiumNameAr,
              nameEn: formData.premiumNameEn,
              price: parseFloat(formData.premiumPrice),
              deliveryDays: parseInt(formData.premiumDeliveryDays),
              featuresAr: formData.premiumFeaturesAr.split('\n').filter(Boolean),
              featuresEn: formData.premiumFeaturesEn.split('\n').filter(Boolean),
            }] : []),
          ],
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast.success(isArabic ? "تم الحفظ" : "Saved")
        setIsDialogOpen(false)
        resetForm()
        await loadServices()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "حذف الخدمة؟" : "Delete service?")) return
    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success(isArabic ? "تم الحذف" : "Deleted")
        await loadServices()
      }
    } catch (error) {
      toast.error(isArabic ? "فشل الحذف" : "Failed")
    }
  }

  const resetForm = () => {
    setFormData({
      titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "",
      categoryId: "", thumbnail: "", deliveryDays: "3",
      basicPrice: "", basicNameAr: "باقة أساسية", basicNameEn: "Basic",
      basicDeliveryDays: "3", basicFeaturesAr: "", basicFeaturesEn: "",
      standardPrice: "", standardNameAr: "باقة قياسية", standardNameEn: "Standard",
      standardDeliveryDays: "5", standardFeaturesAr: "", standardFeaturesEn: "",
      premiumPrice: "", premiumNameAr: "باقة متميزة", premiumNameEn: "Premium",
      premiumDeliveryDays: "7", premiumFeaturesAr: "", premiumFeaturesEn: "",
    })
    setEditingService(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isArabic ? "إدارة الخدمات" : "Manage Services"}</h2>
          <p className="text-muted-foreground">{isArabic ? "خدماتك المخصصة مع الباقات" : "Your custom services with packages"}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />{isArabic ? "خدمة جديدة" : "New Service"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingService ? (isArabic ? "تعديل الخدمة" : "Edit Service") : (isArabic ? "خدمة جديدة" : "New Service")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{isArabic ? "العنوان (عربي)" : "Title (AR)"} *</Label><Input value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isArabic ? "العنوان (إنجليزي)" : "Title (EN)"} *</Label><Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{isArabic ? "الوصف (عربي)" : "Description (AR)"}</Label><Textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} rows={3} /></div>
                <div className="space-y-2"><Label>{isArabic ? "الوصف (إنجليزي)" : "Description (EN)"}</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? "التصنيف" : "Category"}</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger><SelectValue placeholder={isArabic ? "اختر" : "Select"} /></SelectTrigger>
                    <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{isArabic ? cat.nameAr : cat.nameEn}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{isArabic ? "رابط الصورة" : "Thumbnail URL"}</Label><Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} /></div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">{isArabic ? "أساسية" : "Basic"}</TabsTrigger>
                  <TabsTrigger value="standard">{isArabic ? "قياسية" : "Standard"}</TabsTrigger>
                  <TabsTrigger value="premium">{isArabic ? "متميزة" : "Premium"}</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"} *</Label><Input type="number" value={formData.basicPrice} onChange={(e) => setFormData({ ...formData, basicPrice: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "أيام التسليم" : "Delivery Days"}</Label><Input type="number" value={formData.basicDeliveryDays} onChange={(e) => setFormData({ ...formData, basicDeliveryDays: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (عربي)" : "Features (AR)"}</Label><Textarea value={formData.basicFeaturesAr} onChange={(e) => setFormData({ ...formData, basicFeaturesAr: e.target.value })} rows={4} placeholder={isArabic ? "ميزة واحدة في كل سطر" : "One feature per line"} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (إنجليزي)" : "Features (EN)"}</Label><Textarea value={formData.basicFeaturesEn} onChange={(e) => setFormData({ ...formData, basicFeaturesEn: e.target.value })} rows={4} placeholder="One feature per line" /></div>
                  </div>
                </TabsContent>
                <TabsContent value="standard" className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"}</Label><Input type="number" value={formData.standardPrice} onChange={(e) => setFormData({ ...formData, standardPrice: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "أيام التسليم" : "Delivery Days"}</Label><Input type="number" value={formData.standardDeliveryDays} onChange={(e) => setFormData({ ...formData, standardDeliveryDays: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (عربي)" : "Features (AR)"}</Label><Textarea value={formData.standardFeaturesAr} onChange={(e) => setFormData({ ...formData, standardFeaturesAr: e.target.value })} rows={4} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (إنجليزي)" : "Features (EN)"}</Label><Textarea value={formData.standardFeaturesEn} onChange={(e) => setFormData({ ...formData, standardFeaturesEn: e.target.value })} rows={4} /></div>
                  </div>
                </TabsContent>
                <TabsContent value="premium" className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"}</Label><Input type="number" value={formData.premiumPrice} onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "أيام التسليم" : "Delivery Days"}</Label><Input type="number" value={formData.premiumDeliveryDays} onChange={(e) => setFormData({ ...formData, premiumDeliveryDays: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (عربي)" : "Features (AR)"}</Label><Textarea value={formData.premiumFeaturesAr} onChange={(e) => setFormData({ ...formData, premiumFeaturesAr: e.target.value })} rows={4} /></div>
                    <div className="space-y-2"><Label>{isArabic ? "المميزات (إنجليزي)" : "Features (EN)"}</Label><Textarea value={formData.premiumFeaturesEn} onChange={(e) => setFormData({ ...formData, premiumFeaturesEn: e.target.value })} rows={4} /></div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">{submitting ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ الخدمة" : "Save Service")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><Briefcase className="h-16 w-16 text-muted-foreground mb-4" /><p className="text-muted-foreground">{isArabic ? "لا توجد خدمات" : "No services yet"}</p></CardContent></Card>
        ) : (
          services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {service.thumbnail ? <img src={service.thumbnail} alt={service.titleEn} className="w-full h-full object-cover rounded" /> : <Briefcase className="h-12 w-12 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{isArabic ? service.titleAr : service.titleEn}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{isArabic ? service.descriptionAr : service.descriptionEn}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge>{service.status === 'ACTIVE' ? (isArabic ? "نشط" : "Active") : (isArabic ? "غير نشط" : "Inactive")}</Badge>
                      <span className="text-sm font-bold text-green-600">{isArabic ? "من" : "From"} {service.basePrice} ر.س</span>
                      <span className="text-xs text-muted-foreground">{service.orderCount} {isArabic ? "طلب" : "orders"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(service.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
