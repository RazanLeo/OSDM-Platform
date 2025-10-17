"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface PackageFeature {
  id: string
  text: string
}

interface PackageData {
  tier: "BASIC" | "STANDARD" | "PREMIUM"
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  deliveryDays: number
  revisions: number
  isUnlimited: boolean
  features: string[]
  extras: string[]
  quickDelivery: boolean
  quickDeliveryFee: number
}

interface ServicePackagesEditorProps {
  serviceId: string
  locale: string
  isArabic: boolean
  onSave?: () => void
}

export function ServicePackagesEditor({
  serviceId,
  locale,
  isArabic,
  onSave
}: ServicePackagesEditorProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [existingPackages, setExistingPackages] = useState<Record<string, any>>({})
  const [packages, setPackages] = useState<Record<string, PackageData>>({
    BASIC: {
      tier: "BASIC",
      nameAr: "الباقة الأساسية",
      nameEn: "Basic Package",
      descriptionAr: "",
      descriptionEn: "",
      price: 0,
      deliveryDays: 3,
      revisions: 1,
      isUnlimited: false,
      features: [],
      extras: [],
      quickDelivery: false,
      quickDeliveryFee: 0,
    },
    STANDARD: {
      tier: "STANDARD",
      nameAr: "الباقة القياسية",
      nameEn: "Standard Package",
      descriptionAr: "",
      descriptionEn: "",
      price: 0,
      deliveryDays: 5,
      revisions: 2,
      isUnlimited: false,
      features: [],
      extras: [],
      quickDelivery: false,
      quickDeliveryFee: 0,
    },
    PREMIUM: {
      tier: "PREMIUM",
      nameAr: "الباقة المميزة",
      nameEn: "Premium Package",
      descriptionAr: "",
      descriptionEn: "",
      price: 0,
      deliveryDays: 7,
      revisions: 5,
      isUnlimited: false,
      features: [],
      extras: [],
      quickDelivery: false,
      quickDeliveryFee: 0,
    },
  })

  const [newFeature, setNewFeature] = useState<Record<string, string>>({
    BASIC: "",
    STANDARD: "",
    PREMIUM: "",
  })

  const [newExtra, setNewExtra] = useState<Record<string, string>>({
    BASIC: "",
    STANDARD: "",
    PREMIUM: "",
  })

  useEffect(() => {
    loadPackages()
  }, [serviceId])

  const loadPackages = async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/services/${serviceId}/packages`)
      const data = await response.json()

      if (data.packages && data.packages.length > 0) {
        const packagesMap: Record<string, any> = {}
        const updatedPackages: Record<string, PackageData> = { ...packages }

        data.packages.forEach((pkg: any) => {
          packagesMap[pkg.tier] = pkg
          updatedPackages[pkg.tier] = {
            tier: pkg.tier,
            nameAr: pkg.nameAr,
            nameEn: pkg.nameEn,
            descriptionAr: pkg.descriptionAr,
            descriptionEn: pkg.descriptionEn,
            price: parseFloat(pkg.price),
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            isUnlimited: pkg.isUnlimited,
            features: pkg.features || [],
            extras: pkg.extras || [],
            quickDelivery: pkg.quickDelivery,
            quickDeliveryFee: pkg.quickDeliveryFee ? parseFloat(pkg.quickDeliveryFee) : 0,
          }
        })

        setExistingPackages(packagesMap)
        setPackages(updatedPackages)
      }
    } catch (error) {
      console.error("Error loading packages:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const addFeature = (tier: string) => {
    if (!newFeature[tier]?.trim()) return

    setPackages(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        features: [...prev[tier].features, newFeature[tier].trim()]
      }
    }))

    setNewFeature(prev => ({ ...prev, [tier]: "" }))
  }

  const removeFeature = (tier: string, index: number) => {
    setPackages(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        features: prev[tier].features.filter((_, i) => i !== index)
      }
    }))
  }

  const addExtra = (tier: string) => {
    if (!newExtra[tier]?.trim()) return

    setPackages(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        extras: [...prev[tier].extras, newExtra[tier].trim()]
      }
    }))

    setNewExtra(prev => ({ ...prev, [tier]: "" }))
  }

  const removeExtra = (tier: string, index: number) => {
    setPackages(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        extras: prev[tier].extras.filter((_, i) => i !== index)
      }
    }))
  }

  const updatePackage = (tier: string, field: string, value: any) => {
    setPackages(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value
      }
    }))
  }

  const savePackage = async (tier: string) => {
    setLoading(true)
    try {
      const packageData = packages[tier]

      // Validation
      if (!packageData.nameAr || !packageData.nameEn) {
        toast.error(isArabic ? "اسم الباقة مطلوب" : "Package name required")
        return
      }
      if (!packageData.descriptionAr || !packageData.descriptionEn) {
        toast.error(isArabic ? "وصف الباقة مطلوب" : "Package description required")
        return
      }
      if (packageData.price < 5) {
        toast.error(isArabic ? "السعر يجب أن يكون 5 ريال على الأقل" : "Price must be at least 5 SAR")
        return
      }

      const existingPackage = existingPackages[tier]
      let response

      if (existingPackage) {
        // Update existing package
        response = await fetch(`/api/services/${serviceId}/packages/${existingPackage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packageData),
        })
      } else {
        // Create new package
        response = await fetch(`/api/services/${serviceId}/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packageData),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save package")
      }

      toast.success(
        isArabic
          ? `تم حفظ باقة ${tier === "BASIC" ? "الأساسية" : tier === "STANDARD" ? "القياسية" : "المميزة"}`
          : `${tier} package saved successfully`
      )

      // Reload packages to get updated data
      await loadPackages()

      if (onSave) onSave()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل الحفظ" : "Failed to save"))
    } finally {
      setLoading(false)
    }
  }

  const renderPackageForm = (tier: "BASIC" | "STANDARD" | "PREMIUM") => {
    const pkg = packages[tier]
    const tierColors = {
      BASIC: "bg-blue-500",
      STANDARD: "bg-purple-500",
      PREMIUM: "bg-amber-500"
    }

    if (loadingData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${tierColors[tier]} text-white`}>
              {isArabic ? pkg.nameAr : pkg.nameEn}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {tier}
            </span>
            {existingPackages[tier] && (
              <Badge variant="outline" className="text-green-600">
                {isArabic ? "محفوظة" : "Saved"}
              </Badge>
            )}
          </div>
          <Button
            onClick={() => savePackage(tier)}
            disabled={loading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isArabic ? "حفظ الباقة" : "Save Package"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{isArabic ? "اسم الباقة (عربي)" : "Package Name (Arabic)"}</Label>
            <Input
              value={pkg.nameAr}
              onChange={(e) => updatePackage(tier, "nameAr", e.target.value)}
              placeholder={isArabic ? "مثال: باقة تصميم شعار احترافي" : "Example: Professional Logo Design"}
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "اسم الباقة (إنجليزي)" : "Package Name (English)"}</Label>
            <Input
              value={pkg.nameEn}
              onChange={(e) => updatePackage(tier, "nameEn", e.target.value)}
              placeholder="Example: Professional Logo Design Package"
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
            <Textarea
              value={pkg.descriptionAr}
              onChange={(e) => updatePackage(tier, "descriptionAr", e.target.value)}
              placeholder={isArabic ? "وصف تفصيلي للباقة..." : "Detailed package description..."}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
            <Textarea
              value={pkg.descriptionEn}
              onChange={(e) => updatePackage(tier, "descriptionEn", e.target.value)}
              placeholder="Detailed package description..."
              rows={3}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>{isArabic ? "السعر (ر.س)" : "Price (SAR)"}</Label>
            <Input
              type="number"
              min="5"
              value={pkg.price}
              onChange={(e) => updatePackage(tier, "price", parseFloat(e.target.value) || 0)}
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "مدة التسليم (أيام)" : "Delivery Days"}</Label>
            <Input
              type="number"
              min="1"
              value={pkg.deliveryDays}
              onChange={(e) => updatePackage(tier, "deliveryDays", parseInt(e.target.value) || 1)}
              placeholder="3"
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "عدد التعديلات" : "Revisions"}</Label>
            <Input
              type="number"
              min="0"
              value={pkg.revisions}
              onChange={(e) => updatePackage(tier, "revisions", parseInt(e.target.value) || 0)}
              placeholder="2"
              disabled={pkg.isUnlimited}
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "تعديلات غير محدودة" : "Unlimited Revisions"}</Label>
            <div className="flex items-center h-10">
              <Switch
                checked={pkg.isUnlimited}
                onCheckedChange={(checked) => updatePackage(tier, "isUnlimited", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">
              {isArabic ? "مميزات الباقة" : "Package Features"}
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic ? "أضف المميزات المتضمنة في هذه الباقة" : "Add features included in this package"}
            </p>

            <div className="flex gap-2 mb-3">
              <Input
                value={newFeature[tier]}
                onChange={(e) => setNewFeature(prev => ({ ...prev, [tier]: e.target.value }))}
                placeholder={isArabic ? "مميزة جديدة..." : "New feature..."}
                onKeyPress={(e) => e.key === "Enter" && addFeature(tier)}
              />
              <Button onClick={() => addFeature(tier)} size="sm" type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="flex-1">{feature}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(tier, index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">
              {isArabic ? "إضافات الباقة (Gig Extras)" : "Package Extras"}
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic ? "أضف خدمات إضافية اختيارية" : "Add optional extra services"}
            </p>

            <div className="flex gap-2 mb-3">
              <Input
                value={newExtra[tier]}
                onChange={(e) => setNewExtra(prev => ({ ...prev, [tier]: e.target.value }))}
                placeholder={isArabic ? "إضافة جديدة..." : "New extra..."}
                onKeyPress={(e) => e.key === "Enter" && addExtra(tier)}
              />
              <Button onClick={() => addExtra(tier)} size="sm" type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {pkg.extras.map((extra, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="flex-1">{extra}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExtra(tier, index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">
                  {isArabic ? "التسليم السريع" : "Quick Delivery"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "تفعيل خيار التسليم السريع مقابل رسوم إضافية" : "Enable fast delivery for extra fee"}
                </p>
              </div>
              <Switch
                checked={pkg.quickDelivery}
                onCheckedChange={(checked) => updatePackage(tier, "quickDelivery", checked)}
              />
            </div>

            {pkg.quickDelivery && (
              <div className="mt-3 space-y-2">
                <Label>{isArabic ? "رسوم التسليم السريع (ر.س)" : "Quick Delivery Fee (SAR)"}</Label>
                <Input
                  type="number"
                  min="0"
                  value={pkg.quickDeliveryFee}
                  onChange={(e) => updatePackage(tier, "quickDeliveryFee", parseFloat(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {isArabic ? "إدارة باقات الخدمة - Service Packages (Fiverr Style)" : "Service Packages Manager - Fiverr Style"}
        </CardTitle>
        <CardDescription>
          {isArabic
            ? "قم بإنشاء وإدارة الباقات الثلاثة للخدمة (أساسي، قياسي، مميز)"
            : "Create and manage three service tiers (Basic, Standard, Premium)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="BASIC" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="BASIC" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              {isArabic ? "أساسي" : "Basic"}
            </TabsTrigger>
            <TabsTrigger value="STANDARD" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              {isArabic ? "قياسي" : "Standard"}
            </TabsTrigger>
            <TabsTrigger value="PREMIUM" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              {isArabic ? "مميز" : "Premium"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="BASIC">
            {renderPackageForm("BASIC")}
          </TabsContent>

          <TabsContent value="STANDARD">
            {renderPackageForm("STANDARD")}
          </TabsContent>

          <TabsContent value="PREMIUM">
            {renderPackageForm("PREMIUM")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
