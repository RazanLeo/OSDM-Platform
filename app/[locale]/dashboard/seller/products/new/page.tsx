"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Loader2, ImageIcon, FileIcon, Tag } from "lucide-react"
import { useParams } from "next/navigation"

export default function AddProductPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const params = useParams()
  const locale = params.locale as string
  const isArabic = locale === "ar"

  const [loading, setLoading] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [productFiles, setProductFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    categoryId: "",
    price: "",
    originalPrice: "",
    demoUrl: "",
    metaTitleAr: "",
    metaTitleEn: "",
    metaDescAr: "",
    metaDescEn: "",
    status: "DRAFT" as "DRAFT" | "PENDING",
  })

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login`)
    return null
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يمكنك إضافة 5 صور كحد أقصى" : "You can add up to 5 images",
        variant: "destructive",
      })
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: `${file.name}: ${isArabic ? "حجم الصورة كبير جداً" : "Image size too large"}`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setImages([...images, ...validFiles])
    setImagePreviews([
      ...imagePreviews,
      ...validFiles.map(file => URL.createObjectURL(file)),
    ])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleProductFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setProductFiles([...productFiles, ...files])
  }

  const removeProductFile = (index: number) => {
    setProductFiles(productFiles.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for file upload
      const data = new FormData()

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString())
      })

      // Set status based on action
      data.set("status", isDraft ? "DRAFT" : "PENDING")

      // Add thumbnail
      if (thumbnail) {
        data.append("thumbnail", thumbnail)
      } else {
        throw new Error(isArabic ? "الرجاء اختيار صورة رئيسية" : "Please select a thumbnail image")
      }

      // Add additional images
      images.forEach(image => {
        data.append("images", image)
      })

      // Add product files
      if (productFiles.length === 0) {
        throw new Error(isArabic ? "الرجاء إضافة ملفات المنتج" : "Please add product files")
      }
      productFiles.forEach(file => {
        data.append("productFiles", file)
      })

      // Add tags
      data.append("tags", JSON.stringify(tags))

      const response = await fetch(`/${locale}/api/products`, {
        method: "POST",
        body: data,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product")
      }

      toast({
        title: isArabic ? "نجح!" : "Success!",
        description: isDraft
          ? isArabic
            ? "تم حفظ المنتج كمسودة"
            : "Product saved as draft"
          : isArabic
          ? "تم إرسال المنتج للمراجعة"
          : "Product submitted for review",
      })

      router.push(`/${locale}/dashboard/seller/products`)
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message || (isArabic ? "حدث خطأ أثناء إضافة المنتج" : "An error occurred while adding the product"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? "إضافة منتج رقمي جديد" : "Add New Digital Product"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic
            ? "قم بملء المعلومات التالية لإضافة منتجك الرقمي"
            : "Fill in the following information to add your digital product"}
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "المعلومات الأساسية" : "Basic Information"}</CardTitle>
            <CardDescription>
              {isArabic ? "أدخل معلومات المنتج بالعربية والإنجليزية" : "Enter product information in Arabic and English"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleAr">{isArabic ? "العنوان (عربي)" : "Title (Arabic)"} *</Label>
                <Input
                  id="titleAr"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  required
                  placeholder={isArabic ? "مثال: قالب موقع احترافي" : "Example: Professional Website Template"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleEn">{isArabic ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                  placeholder="Example: Professional Website Template"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">{isArabic ? "الوصف (عربي)" : "Description (Arabic)"} *</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                required
                rows={5}
                placeholder={isArabic ? "اكتب وصفاً مفصلاً للمنتج..." : "Write a detailed description of the product..."}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{isArabic ? "الوصف (إنجليزي)" : "Description (English)"} *</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                required
                rows={5}
                placeholder="Write a detailed description of the product..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">{isArabic ? "التصنيف" : "Category"} *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر التصنيف" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">{isArabic ? "تصميم جرافيكي" : "Graphic Design"}</SelectItem>
                  <SelectItem value="cat2">{isArabic ? "برمجة وتطوير" : "Programming & Development"}</SelectItem>
                  <SelectItem value="cat3">{isArabic ? "كتابة ومحتوى" : "Writing & Content"}</SelectItem>
                  {/* Add more categories from database */}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "التسعير" : "Pricing"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{isArabic ? "السعر (ريال)" : "Price (SAR)"} *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder={isArabic ? "مثال: 299" : "Example: 299"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">{isArabic ? "السعر الأصلي (اختياري)" : "Original Price (Optional)"}</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder={isArabic ? "لعرض الخصم" : "For discount display"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoUrl">{isArabic ? "رابط المعاينة (اختياري)" : "Demo URL (Optional)"}</Label>
              <Input
                id="demoUrl"
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                placeholder="https://demo.example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "الصور" : "Images"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>{isArabic ? "الصورة الرئيسية" : "Thumbnail Image"} *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img src={thumbnailPreview} alt="Thumbnail" className="max-h-48 rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setThumbnail(null)
                        setThumbnailPreview("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "انقر لاختيار الصورة الرئيسية" : "Click to select thumbnail image"}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (max 5MB)</p>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Images */}
            <div className="space-y-2">
              <Label>{isArabic ? "صور إضافية (حتى 5 صور)" : "Additional Images (up to 5)"}</Label>
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label htmlFor="images" className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Files */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "ملفات المنتج" : "Product Files"} *</CardTitle>
            <CardDescription>
              {isArabic ? "قم بإضافة الملفات الرقمية التي سيحصل عليها المشتري" : "Add the digital files that the buyer will receive"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6">
              <label htmlFor="productFiles" className="cursor-pointer block text-center">
                <FileIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {isArabic ? "انقر لاختيار ملفات المنتج" : "Click to select product files"}
                </p>
                <p className="text-xs text-muted-foreground">ZIP, PDF, PSD, AI, etc.</p>
                <Input
                  id="productFiles"
                  type="file"
                  multiple
                  onChange={handleProductFilesChange}
                  className="hidden"
                />
              </label>
            </div>

            {productFiles.length > 0 && (
              <div className="space-y-2">
                {productFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProductFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "الوسوم" : "Tags"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder={isArabic ? "أضف وسم..." : "Add tag..."}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "تحسين محركات البحث (اختياري)" : "SEO (Optional)"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitleAr">{isArabic ? "عنوان SEO (عربي)" : "SEO Title (Arabic)"}</Label>
                <Input
                  id="metaTitleAr"
                  value={formData.metaTitleAr}
                  onChange={(e) => setFormData({ ...formData, metaTitleAr: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaTitleEn">{isArabic ? "عنوان SEO (إنجليزي)" : "SEO Title (English)"}</Label>
                <Input
                  id="metaTitleEn"
                  value={formData.metaTitleEn}
                  onChange={(e) => setFormData({ ...formData, metaTitleEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescAr">{isArabic ? "وصف SEO (عربي)" : "SEO Description (Arabic)"}</Label>
                <Textarea
                  id="metaDescAr"
                  value={formData.metaDescAr}
                  onChange={(e) => setFormData({ ...formData, metaDescAr: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescEn">{isArabic ? "وصف SEO (إنجليزي)" : "SEO Description (English)"}</Label>
                <Textarea
                  id="metaDescEn"
                  value={formData.metaDescEn}
                  onChange={(e) => setFormData({ ...formData, metaDescEn: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            {isArabic ? "نشر المنتج" : "Publish Product"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1"
          >
            {isArabic ? "حفظ كمسودة" : "Save as Draft"}
          </Button>
        </div>
      </form>
    </div>
  )
}
