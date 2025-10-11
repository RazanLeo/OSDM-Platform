"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Shield,
  CreditCard,
  Lock,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProductCheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const params = useParams()
  const locale = params.locale as string
  const productId = params.id as string
  const isArabic = locale === "ar"

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("MADA")

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login?callbackUrl=/${locale}/checkout/product/${productId}`)
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch product
        const productRes = await fetch(`/api/products/${productId}`)
        if (!productRes.ok) throw new Error("Product not found")
        const productData = await productRes.json()

        // Fetch revenue settings
        const settingsRes = await fetch("/api/admin/revenue-settings")
        if (!settingsRes.ok) throw new Error("Settings not found")
        const settingsData = await settingsRes.json()

        setProduct(productData.data)
        setSettings(settingsData.data)
      } catch (error: any) {
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: error.message,
          variant: "destructive",
        })
        router.push(`/${locale}/marketplace/ready-products`)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, productId, locale, isArabic, toast, router])

  const handleCheckout = async () => {
    setProcessing(true)

    try {
      const response = await fetch(`/${locale}/api/checkout/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          paymentMethod,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Checkout failed")
      }

      toast({
        title: isArabic ? "تم الشراء بنجاح!" : "Purchase Successful!",
        description: isArabic
          ? "يمكنك الآن تحميل المنتج من طلباتك"
          : "You can now download the product from your orders",
      })

      // Redirect to order page or download page
      router.push(`/${locale}/dashboard/buyer/orders/${result.data.orderId}`)
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!product || !settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isArabic ? "المنتج غير موجود" : "Product not found"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if user is trying to buy their own product
  if (product.sellerId === session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isArabic ? "لا يمكنك شراء منتجك الخاص" : "You cannot buy your own product"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate fees
  const productPrice = Number(product.price)
  const platformFee = (productPrice * Number(settings.platformCommission)) / 100
  const paymentFee = (productPrice * Number(settings.paymentGatewayFee)) / 100
  const totalAmount = productPrice + platformFee + paymentFee
  const sellerEarning = productPrice - platformFee - paymentFee

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const title = isArabic ? product.titleAr : product.titleEn

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? "إتمام الشراء" : "Complete Purchase"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? "راجع طلبك واختر طريقة الدفع" : "Review your order and select payment method"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={product.thumbnail}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {isArabic ? "من" : "By"}: {product.User?.fullName || product.User?.username}
                  </p>
                  <Badge variant="secondary">
                    <Download className="h-3 w-3 mr-1" />
                    {isArabic ? "تحميل فوري" : "Instant Download"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "طريقة الدفع" : "Payment Method"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "اختر طريقة الدفع المناسبة لك"
                  : "Choose your preferred payment method"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="MADA" id="mada" />
                    <Label htmlFor="mada" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold">
                          {isArabic ? "مدى" : "Mada"}
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="VISA" id="visa" />
                    <Label htmlFor="visa" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold">Visa</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="MASTERCARD" id="mastercard" />
                    <Label htmlFor="mastercard" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold">Mastercard</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="APPLE_PAY" id="apple-pay" />
                    <Label htmlFor="apple-pay" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold">Apple Pay</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    {isArabic ? "دفع آمن ومضمون" : "Secure Payment"}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      {isArabic
                        ? "✓ جميع المدفوعات مشفرة ومؤمنة"
                        : "✓ All payments are encrypted and secured"}
                    </li>
                    <li>
                      {isArabic
                        ? "✓ نظام حماية المشتري"
                        : "✓ Buyer protection system"}
                    </li>
                    <li>
                      {isArabic
                        ? "✓ ضمان استرجاع الأموال"
                        : "✓ Money-back guarantee"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Price Breakdown */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{isArabic ? "تفاصيل السعر" : "Price Breakdown"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "سعر المنتج" : "Product Price"}
                  </span>
                  <span className="font-semibold">{formatPrice(productPrice)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "رسوم المنصة" : "Platform Fee"} (
                    {Number(settings.platformCommission)}%)
                  </span>
                  <span className="font-semibold">{formatPrice(platformFee)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "رسوم الدفع" : "Payment Fee"} (
                    {Number(settings.paymentGatewayFee)}%)
                  </span>
                  <span className="font-semibold">{formatPrice(paymentFee)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">{isArabic ? "المجموع" : "Total"}</span>
                  <span className="font-bold text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Separator />

              <Button
                className="w-full"
                size="lg"
                disabled={processing}
                onClick={handleCheckout}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    {isArabic ? "جاري المعالجة..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 ml-2" />
                    {isArabic ? "إتمام الدفع" : "Complete Payment"}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isArabic
                  ? "بالنقر على 'إتمام الدفع'، أنت توافق على شروط الاستخدام"
                  : "By clicking 'Complete Payment', you agree to our terms of service"}
              </p>

              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{isArabic ? "تحميل فوري بعد الدفع" : "Instant download after payment"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{isArabic ? "دعم فني مجاني" : "Free technical support"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{isArabic ? "ضمان استرجاع 7 أيام" : "7-day money-back guarantee"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
