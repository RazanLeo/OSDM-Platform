'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Clock, RefreshCw, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface Package {
  name: 'BASIC' | 'STANDARD' | 'PREMIUM'
  price: number
  deliveryDays: number
  revisions: number
  features: string[]
}

interface ServicePackagesProps {
  serviceId: string
  packages: Package[]
  sellerId: string
  currentUserId?: string
}

export default function ServicePackages({
  serviceId,
  packages,
  sellerId,
  currentUserId
}: ServicePackagesProps) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC')
  const [requirements, setRequirements] = useState('')
  const [notes, setNotes] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)

  // Find selected package
  const activePackage = packages.find(p => p.name === selectedPackage) || packages[0]

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  // Get package label
  const getPackageLabel = (name: string) => {
    const labels: Record<string, string> = {
      BASIC: 'الباقة الأساسية',
      STANDARD: 'الباقة المميزة',
      PREMIUM: 'الباقة الشاملة'
    }
    return labels[name] || name
  }

  const handleOrder = async () => {
    if (!currentUserId) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push(`/auth/login?callbackUrl=/services/${serviceId}`)
      return
    }

    if (currentUserId === sellerId) {
      toast.error('لا يمكنك طلب خدمتك الخاصة')
      return
    }

    if (!requirements.trim()) {
      toast.error('يرجى كتابة متطلبات الخدمة')
      return
    }

    setIsOrdering(true)

    try {
      const response = await fetch(`/api/services/${serviceId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: selectedPackage,
          requirements,
          notes
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم إنشاء الطلب بنجاح')
        router.push(`/orders/${data.data.orderId}`)
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إنشاء الطلب')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>اختر الباقة المناسبة</CardTitle>
        <CardDescription>قارن بين الباقات واختر ما يناسب احتياجاتك</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedPackage}
          onValueChange={(value) => setSelectedPackage(value as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            {packages.map((pkg) => (
              <TabsTrigger key={pkg.name} value={pkg.name}>
                {getPackageLabel(pkg.name).split(' ')[1]}
              </TabsTrigger>
            ))}
          </TabsList>

          {packages.map((pkg) => (
            <TabsContent key={pkg.name} value={pkg.name} className="space-y-6 mt-6">
              {/* Package Header */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{getPackageLabel(pkg.name)}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(pkg.price)}
                  </span>
                </div>
              </div>

              {/* Package Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">مدة التنفيذ</p>
                    <p className="font-semibold">{pkg.deliveryDays} أيام</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">التعديلات</p>
                    <p className="font-semibold">
                      {pkg.revisions === -1 ? 'غير محدودة' : pkg.revisions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Package Features */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">مميزات الباقة:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Order Form */}
        <div className="space-y-4 mt-6 pt-6 border-t">
          <div className="space-y-2">
            <Label htmlFor="requirements">
              متطلبات الخدمة <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder="اشرح بالتفصيل ما تحتاجه من هذه الخدمة..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              كلما كانت التفاصيل أوضح، كانت النتيجة أفضل
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات أخرى تود إضافتها..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleOrder}
            disabled={isOrdering || !requirements.trim()}
            size="lg"
            className="w-full"
          >
            <Zap className="h-5 w-5 ml-2" />
            {isOrdering ? 'جاري الطلب...' : `اطلب الآن (${formatPrice(activePackage.price)})`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            سيتم إنشاء طلب وإرساله للبائع للموافقة عليه
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
