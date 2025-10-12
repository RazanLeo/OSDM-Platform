'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  nameAr: string
  nameEn: string
}

interface ServicePackage {
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM'
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  deliveryDays: number
  revisions: number
  features: string[]
}

interface AddServiceFormProps {
  categories: Category[]
  locale: string
  dict: any
}

export function AddServiceForm({ categories, locale, dict }: AddServiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isArabic = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic service info
  const [titleAr, setTitleAr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Packages
  const [packages, setPackages] = useState<ServicePackage[]>([
    {
      tier: 'BASIC',
      nameAr: 'الباقة الأساسية',
      nameEn: 'Basic Package',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      deliveryDays: 3,
      revisions: 1,
      features: []
    },
    {
      tier: 'STANDARD',
      nameAr: 'الباقة المتوسطة',
      nameEn: 'Standard Package',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      deliveryDays: 5,
      revisions: 2,
      features: []
    },
    {
      tier: 'PREMIUM',
      nameAr: 'الباقة المتقدمة',
      nameEn: 'Premium Package',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      deliveryDays: 7,
      revisions: 3,
      features: []
    }
  ])

  const [featureInputs, setFeatureInputs] = useState<{ [key: string]: string }>({
    BASIC: '',
    STANDARD: '',
    PREMIUM: ''
  })

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddFeature = (tier: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
    const feature = featureInputs[tier].trim()
    if (feature) {
      setPackages(
        packages.map((pkg) =>
          pkg.tier === tier ? { ...pkg, features: [...pkg.features, feature] } : pkg
        )
      )
      setFeatureInputs({ ...featureInputs, [tier]: '' })
    }
  }

  const handleRemoveFeature = (tier: 'BASIC' | 'STANDARD' | 'PREMIUM', index: number) => {
    setPackages(
      packages.map((pkg) =>
        pkg.tier === tier
          ? { ...pkg, features: pkg.features.filter((_, i) => i !== index) }
          : pkg
      )
    )
  }

  const updatePackage = (
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM',
    field: keyof ServicePackage,
    value: any
  ) => {
    setPackages(packages.map((pkg) => (pkg.tier === tier ? { ...pkg, [field]: value } : pkg)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!titleAr || !titleEn || !descriptionAr || !descriptionEn || !categoryId || !thumbnail) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive'
      })
      return
    }

    // Validate packages
    for (const pkg of packages) {
      if (!pkg.descriptionAr || !pkg.descriptionEn || pkg.price <= 0 || pkg.features.length === 0) {
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description:
            isArabic
              ? `يرجى إكمال بيانات الباقة ${pkg.nameAr}`
              : `Please complete ${pkg.nameEn} data`,
          variant: 'destructive'
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr,
          titleEn,
          descriptionAr,
          descriptionEn,
          categoryId,
          thumbnail,
          videoUrl: videoUrl || null,
          tags,
          packages
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create service')
      }

      const data = await response.json()

      toast({
        title: isArabic ? 'نجح' : 'Success',
        description: isArabic ? 'تم إنشاء الخدمة بنجاح' : 'Service created successfully'
      })

      router.push(`/${locale}/dashboard/seller/services`)
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description:
          error instanceof Error ? error.message : (isArabic ? 'فشل إنشاء الخدمة' : 'Failed to create service'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
          <CardDescription>
            {isArabic ? 'أدخل معلومات الخدمة الأساسية' : 'Enter basic service information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleAr">
                {isArabic ? 'العنوان بالعربية' : 'Title in Arabic'} *
              </Label>
              <Input
                id="titleAr"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={isArabic ? 'أدخل عنوان الخدمة بالعربية' : 'Enter service title in Arabic'}
                required
              />
            </div>

            <div>
              <Label htmlFor="titleEn">
                {isArabic ? 'العنوان بالإنجليزية' : 'Title in English'} *
              </Label>
              <Input
                id="titleEn"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder={isArabic ? 'أدخل عنوان الخدمة بالإنجليزية' : 'Enter service title in English'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="descriptionAr">
                {isArabic ? 'الوصف بالعربية' : 'Description in Arabic'} *
              </Label>
              <Textarea
                id="descriptionAr"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={isArabic ? 'اشرح خدمتك بالتفصيل بالعربية' : 'Describe your service in detail in Arabic'}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="descriptionEn">
                {isArabic ? 'الوصف بالإنجليزية' : 'Description in English'} *
              </Label>
              <Textarea
                id="descriptionEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder={isArabic ? 'اشرح خدمتك بالتفصيل بالإنجليزية' : 'Describe your service in detail in English'}
                rows={4}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{isArabic ? 'التصنيف' : 'Category'} *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {isArabic ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="thumbnail">
                {isArabic ? 'رابط الصورة المصغرة' : 'Thumbnail URL'} *
              </Label>
              <Input
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="videoUrl">{isArabic ? 'رابط الفيديو (اختياري)' : 'Video URL (optional)'}</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
            />
          </div>

          <div>
            <Label>{isArabic ? 'الوسوم' : 'Tags'}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder={isArabic ? 'أضف وسماً' : 'Add a tag'}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'الباقات' : 'Packages'}</CardTitle>
          <CardDescription>
            {isArabic
              ? 'قم بإنشاء 3 باقات مختلفة لخدمتك'
              : 'Create 3 different packages for your service'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="BASIC">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="BASIC">
                {isArabic ? 'أساسية' : 'Basic'}
              </TabsTrigger>
              <TabsTrigger value="STANDARD">
                {isArabic ? 'متوسطة' : 'Standard'}
              </TabsTrigger>
              <TabsTrigger value="PREMIUM">
                {isArabic ? 'متقدمة' : 'Premium'}
              </TabsTrigger>
            </TabsList>

            {packages.map((pkg) => (
              <TabsContent key={pkg.tier} value={pkg.tier} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{isArabic ? 'الوصف بالعربية' : 'Description in Arabic'} *</Label>
                    <Textarea
                      value={pkg.descriptionAr}
                      onChange={(e) =>
                        updatePackage(pkg.tier, 'descriptionAr', e.target.value)
                      }
                      placeholder={isArabic ? 'وصف الباقة بالعربية' : 'Package description in Arabic'}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label>{isArabic ? 'الوصف بالإنجليزية' : 'Description in English'} *</Label>
                    <Textarea
                      value={pkg.descriptionEn}
                      onChange={(e) =>
                        updatePackage(pkg.tier, 'descriptionEn', e.target.value)
                      }
                      placeholder={isArabic ? 'وصف الباقة بالإنجليزية' : 'Package description in English'}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{isArabic ? 'السعر (ر.س)' : 'Price (SAR)'} *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={pkg.price || ''}
                      onChange={(e) =>
                        updatePackage(pkg.tier, 'price', parseFloat(e.target.value) || 0)
                      }
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <Label>{isArabic ? 'مدة التسليم (أيام)' : 'Delivery Days'} *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={pkg.deliveryDays || ''}
                      onChange={(e) =>
                        updatePackage(pkg.tier, 'deliveryDays', parseInt(e.target.value) || 1)
                      }
                      placeholder="3"
                      required
                    />
                  </div>

                  <div>
                    <Label>{isArabic ? 'عدد المراجعات' : 'Revisions'} *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={pkg.revisions || ''}
                      onChange={(e) =>
                        updatePackage(pkg.tier, 'revisions', parseInt(e.target.value) || 0)
                      }
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>{isArabic ? 'المزايا' : 'Features'} *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={featureInputs[pkg.tier]}
                      onChange={(e) =>
                        setFeatureInputs({ ...featureInputs, [pkg.tier]: e.target.value })
                      }
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleAddFeature(pkg.tier))
                      }
                      placeholder={isArabic ? 'أضف ميزة' : 'Add a feature'}
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddFeature(pkg.tier)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {pkg.features.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <span className="text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(pkg.tier, idx)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
            : (isArabic ? 'حفظ الخدمة' : 'Save Service')}
        </Button>
      </div>
    </form>
  )
}
