"use client"

import type React from "react"

import { useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { readyProductsCategories } from "@/lib/data/marketplace-categories"
import { Upload, Loader2 } from "lucide-react"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
}

export function AddProductDialog({ open, onOpenChange, locale }: AddProductDialogProps) {
  const isArabic = locale === "ar"
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    file: null as File | null,
  })

  const selectedCategoryData = readyProductsCategories.find((cat) => cat.id === selectedCategory)
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find((sub) => sub.id === selectedSubcategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Product data:", {
      ...formData,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      type: selectedType,
    })

    setLoading(false)
    onOpenChange(false)

    // Reset form
    setFormData({ title: "", description: "", price: "", file: null })
    setSelectedCategory("")
    setSelectedSubcategory("")
    setSelectedType("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isArabic ? "إضافة منتج جديد" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isArabic
              ? "املأ التفاصيل أدناه لإضافة منتجك الرقمي"
              : "Fill in the details below to add your digital product"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">{isArabic ? "التصنيف الرئيسي" : "Main Category"}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "اختر التصنيف" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {readyProductsCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {isArabic ? category.nameAr : category.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Selection */}
          {selectedCategory && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">{isArabic ? "التصنيف الفرعي" : "Subcategory"}</Label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر التصنيف الفرعي" : "Select subcategory"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategoryData?.subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {isArabic ? subcategory.nameAr : subcategory.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type Selection */}
          {selectedSubcategory && (
            <div className="space-y-2">
              <Label htmlFor="type">{isArabic ? "النوع" : "Type"}</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر النوع" : "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubcategoryData?.types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {isArabic ? type.nameAr : type.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Product Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{isArabic ? "عنوان المنتج" : "Product Title"}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isArabic ? "أدخل عنوان المنتج" : "Enter product title"}
              required
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{isArabic ? "وصف المنتج" : "Product Description"}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isArabic ? "أدخل وصف المنتج" : "Enter product description"}
              rows={4}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">{isArabic ? "السعر" : "Price"}</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder={isArabic ? "0.00" : "0.00"}
              required
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">{isArabic ? "ملف المنتج" : "Product File"}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {isArabic ? "اسحب وأفلت الملف هنا أو انقر للتحميل" : "Drag and drop file here or click to upload"}
              </p>
              <Input
                id="file"
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file")?.click()}
              >
                {isArabic ? "اختر ملف" : "Choose File"}
              </Button>
              {formData.file && <p className="text-sm mt-2 text-primary">{formData.file.name}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isArabic ? "إضافة المنتج" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
