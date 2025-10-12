'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Package, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface ServicePackage {
  id: string
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

interface Service {
  id: string
  titleAr: string
  titleEn: string
  thumbnail: string
  seller: {
    id: string
    username: string
    fullName: string
    profilePicture: string | null
    isVerified: boolean
  }
}

interface ServiceCheckoutFormProps {
  service: Service
  packages: ServicePackage[]
  buyerId: string
  locale: string
  dict: any
}

export function ServiceCheckoutForm({
  service,
  packages,
  buyerId,
  locale,
  dict
}: ServiceCheckoutFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isArabic = locale === 'ar'

  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '')
  const [requirements, setRequirements] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPackage = packages.find((p) => p.id === selectedPackageId)

  // Calculate fees (10% platform fee)
  const subtotal = selectedPackage?.price || 0
  const platformFee = subtotal * 0.1
  const total = subtotal + platformFee

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return isArabic ? 'أساسية' : 'Basic'
      case 'STANDARD':
        return isArabic ? 'متوسطة' : 'Standard'
      case 'PREMIUM':
        return isArabic ? 'متقدمة' : 'Premium'
      default:
        return tier
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'STANDARD':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PREMIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSubmit = async () => {
    if (!selectedPackageId) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى اختيار باقة' : 'Please select a package',
        variant: 'destructive'
      })
      return
    }

    if (!requirements.trim()) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى إدخال متطلبات الطلب' : 'Please enter order requirements',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/checkout/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          packageId: selectedPackageId,
          sellerId: service.seller.id,
          requirements: requirements.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const data = await response.json()

      toast({
        title: isArabic ? 'نجح' : 'Success',
        description: isArabic ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully'
      })

      // Redirect to payment or order page
      router.push(`/${locale}/dashboard/buyer/orders/${data.order.id}`)
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description:
          error instanceof Error ? error.message : (isArabic ? 'فشل إنشاء الطلب' : 'Failed to create order'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Service Info & Package Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'تفاصيل الخدمة' : 'Service Details'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={service.thumbnail}
                  alt={isArabic ? service.titleAr : service.titleEn}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {isArabic ? service.titleAr : service.titleEn}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{service.seller.fullName}</span>
                  {service.seller.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      {isArabic ? 'موثق' : 'Verified'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'اختر الباقة المناسبة' : 'Select Your Package'}</CardTitle>
            <CardDescription>
              {isArabic
                ? 'اختر الباقة التي تناسب احتياجاتك'
                : 'Choose the package that fits your needs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPackageId} onValueChange={setSelectedPackageId}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="relative">
                    <RadioGroupItem
                      value={pkg.id}
                      id={pkg.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={pkg.id}
                      className={`flex flex-col h-full cursor-pointer rounded-lg border-2 p-4 hover:bg-accent transition-colors ${
                        selectedPackageId === pkg.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getTierColor(pkg.tier)}>
                          {getTierLabel(pkg.tier)}
                        </Badge>
                        {selectedPackageId === pkg.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-lg mb-2">
                        {isArabic ? pkg.nameAr : pkg.nameEn}
                      </h4>

                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {isArabic ? pkg.descriptionAr : pkg.descriptionEn}
                      </p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {pkg.deliveryDays} {isArabic ? 'يوم' : 'days'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {pkg.revisions} {isArabic ? 'مراجعات' : 'revisions'}
                          </span>
                        </div>
                      </div>

                      {pkg.features && pkg.features.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                          {pkg.features.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{pkg.features.length - 3} {isArabic ? 'المزيد' : 'more'}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="text-2xl font-bold text-primary">
                        {pkg.price.toFixed(2)} {isArabic ? 'ر.س' : 'SAR'}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'متطلبات الطلب' : 'Order Requirements'}</CardTitle>
            <CardDescription>
              {isArabic
                ? 'حدد متطلباتك بوضوح لضمان الحصول على أفضل نتيجة'
                : 'Clearly specify your requirements to ensure the best outcome'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={
                isArabic
                  ? 'اشرح متطلباتك بالتفصيل...'
                  : 'Explain your requirements in detail...'
              }
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic
                ? 'كلما كانت المتطلبات أوضح، كانت النتيجة أفضل'
                : 'The clearer the requirements, the better the outcome'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPackage ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isArabic ? 'الباقة' : 'Package'}
                    </span>
                    <span className="font-medium">
                      {isArabic ? selectedPackage.nameAr : selectedPackage.nameEn}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isArabic ? 'مدة التسليم' : 'Delivery time'}
                    </span>
                    <span className="font-medium">
                      {selectedPackage.deliveryDays} {isArabic ? 'يوم' : 'days'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isArabic ? 'عدد المراجعات' : 'Revisions'}
                    </span>
                    <span className="font-medium">{selectedPackage.revisions}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isArabic ? 'سعر الخدمة' : 'Service price'}
                    </span>
                    <span>{subtotal.toFixed(2)} {isArabic ? 'ر.س' : 'SAR'}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isArabic ? 'رسوم المنصة (10%)' : 'Platform fee (10%)'}
                    </span>
                    <span>{platformFee.toFixed(2)} {isArabic ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{isArabic ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-primary">
                    {total.toFixed(2)} {isArabic ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !requirements.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting
                    ? (isArabic ? 'جاري المعالجة...' : 'Processing...')
                    : (isArabic ? 'تأكيد الطلب' : 'Confirm Order')}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      {isArabic
                        ? 'سيتم تحويلك إلى صفحة الدفع بعد تأكيد الطلب'
                        : 'You will be redirected to the payment page after confirming the order'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isArabic ? 'يرجى اختيار باقة' : 'Please select a package'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
