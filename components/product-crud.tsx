"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Package, Upload, Eye } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface Product {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  thumbnail: string
  categoryId: string
  status: string
  downloadCount: number
  averageRating: number
  createdAt: string
}

export function ProductCRUD({ isArabic = true }: { isArabic?: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    price: "",
    categoryId: "",
    thumbnail: "",
    licenseType: "PERSONAL",
    isExclusive: false,
    allowReselling: false,
    tags: "",
    fileFormat: "",
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/seller/products')
      const data = await response.json()
      if (response.ok && data.success) {
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=READY_PRODUCT')
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.titleAr || !formData.titleEn || !formData.price || !formData.categoryId) {
      toast.error(isArabic ? "الرجاء إكمال الحقول المطلوبة" : "Please fill required fields")
      return
    }

    setSubmitting(true)
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(isArabic ? "تم الحفظ بنجاح" : "Saved successfully")
        setIsDialogOpen(false)
        resetForm()
        await loadProducts()
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل الحفظ" : "Failed to save"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
      price: product.price.toString(),
      categoryId: product.categoryId,
      thumbnail: product.thumbnail,
      licenseType: "PERSONAL",
      isExclusive: false,
      allowReselling: false,
      tags: "",
      fileFormat: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "هل تريد حذف هذا المنتج؟" : "Delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success(isArabic ? "تم الحذف" : "Deleted")
        await loadProducts()
      }
    } catch (error) {
      toast.error(isArabic ? "فشل الحذف" : "Failed to delete")
    }
  }

  const resetForm = () => {
    setFormData({
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      price: "",
      categoryId: "",
      thumbnail: "",
      licenseType: "PERSONAL",
      isExclusive: false,
      allowReselling: false,
      tags: "",
      fileFormat: "",
    })
    setEditingProduct(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isArabic ? "إدارة المنتجات" : "Manage Products"}</h2>
          <p className="text-muted-foreground">{isArabic ? "أضف وعدّل منتجاتك الرقمية" : "Add and edit your digital products"}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isArabic ? "منتج جديد" : "New Product"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? (isArabic ? "تعديل المنتج" : "Edit Product")
                  : (isArabic ? "منتج جديد" : "New Product")
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? "العنوان (عربي)" : "Title (Arabic)"} *</Label>
                  <Input value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                  <Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? "الوصف (عربي)" : "Description (Arabic)"} *</Label>
                  <Textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الوصف (إنجليزي)" : "Description (English)"} *</Label>
                  <Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={4} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"} *</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "التصنيف" : "Category"} *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "اختر التصنيف" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {isArabic ? cat.nameAr : cat.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "نوع الرخصة" : "License Type"}</Label>
                  <Select value={formData.licenseType} onValueChange={(value) => setFormData({ ...formData, licenseType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONAL">{isArabic ? "شخصي" : "Personal"}</SelectItem>
                      <SelectItem value="COMMERCIAL">{isArabic ? "تجاري" : "Commercial"}</SelectItem>
                      <SelectItem value="EXTENDED">{isArabic ? "موسع" : "Extended"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isArabic ? "رابط الصورة المصغرة" : "Thumbnail URL"}</Label>
                <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label>{isArabic ? "الوسوم (مفصولة بفاصلة)" : "Tags (comma-separated)"}</Label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="design, template, ui" />
              </div>

              <div className="space-y-2">
                <Label>{isArabic ? "صيغة الملفات" : "File Format"}</Label>
                <Input value={formData.fileFormat} onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })} placeholder="PSD, AI, PDF" />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="exclusive" checked={formData.isExclusive} onCheckedChange={(checked) => setFormData({ ...formData, isExclusive: !!checked })} />
                  <label htmlFor="exclusive" className="text-sm cursor-pointer">{isArabic ? "حقوق حصرية" : "Exclusive Rights"}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="reselling" checked={formData.allowReselling} onCheckedChange={(checked) => setFormData({ ...formData, allowReselling: !!checked })} />
                  <label htmlFor="reselling" className="text-sm cursor-pointer">{isArabic ? "يسمح بإعادة البيع" : "Allow Reselling"}</label>
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ المنتج" : "Save Product")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{isArabic ? "لم تقم بإضافة أي منتجات بعد" : "You haven't added any products yet"}</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.titleEn} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{isArabic ? product.titleAr : product.titleEn}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {isArabic ? product.descriptionAr : product.descriptionEn}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {product.status === 'ACTIVE' ? (isArabic ? "نشط" : "Active") : (isArabic ? "غير نشط" : "Inactive")}
                      </Badge>
                      <span className="text-sm font-bold text-green-600">{product.price} ر.س</span>
                      <span className="text-xs text-muted-foreground">{product.downloadCount} {isArabic ? "تحميل" : "downloads"}</span>
                      <span className="text-xs text-muted-foreground">⭐ {product.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
