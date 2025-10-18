"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Lock,
  ShoppingCart,
  Check,
  AlertCircle,
  Package,
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  product: {
    titleAr: string
    titleEn: string
    price: number
    thumbnail: string
  }
  quantity: number
}

interface CheckoutPageProps {
  isArabic?: boolean
}

export function CheckoutPage({ isArabic = true }: CheckoutPageProps) {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    type: string
    value: number
  } | null>(null)

  // Billing Information
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Saudi Arabia",
    city: "",
    address: "",
  })

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()

      if (response.ok && data.success) {
        setCartItems(data.data || [])
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0
    const subtotal = calculateSubtotal()

    if (appliedDiscount.type === 'PERCENTAGE') {
      return subtotal * (appliedDiscount.value / 100)
    } else {
      return appliedDiscount.value
    }
  }

  const calculatePlatformFee = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const afterDiscount = subtotal - discount
    return afterDiscount * 0.25 // 25% platform commission
  }

  const calculatePaymentFee = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const afterDiscount = subtotal - discount
    return afterDiscount * 0.05 // 5% payment gateway fee
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return Math.max(0, subtotal - discount)
  }

  const handleCheckout = async () => {
    // Validate billing info
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.phone) {
      toast.error(isArabic ? "الرجاء إكمال جميع الحقول المطلوبة" : "Please fill all required fields")
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingInfo,
          discountCode: appliedDiscount?.code,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to Stripe Checkout
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          toast.success(isArabic ? "تم إتمام الطلب بنجاح" : "Order completed successfully")
          router.push(`/ar/orders/${data.orderId}`)
        }
      } else {
        throw new Error(data.error || 'Checkout failed')
      }
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل إتمام الدفع" : "Checkout failed"))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {isArabic ? "السلة فارغة" : "Cart is Empty"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic
                ? "لا يمكنك إتمام الطلب مع سلة فارغة"
                : "You cannot checkout with an empty cart"}
            </p>
          </div>
          <Button onClick={() => router.push('/ar/marketplace/ready-products')}>
            {isArabic ? "تصفح المنتجات" : "Browse Products"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">
          {isArabic ? "إتمام الشراء" : "Checkout"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {isArabic ? "معلومات الفوترة" : "Billing Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {isArabic ? "الاسم الكامل" : "Full Name"} *
                  </Label>
                  <Input
                    id="fullName"
                    value={billingInfo.fullName}
                    onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isArabic ? "البريد الإلكتروني" : "Email"} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isArabic ? "رقم الجوال" : "Phone Number"} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={billingInfo.phone}
                    onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    {isArabic ? "الدولة" : "Country"}
                  </Label>
                  <Input
                    id="country"
                    value={billingInfo.country}
                    onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    {isArabic ? "المدينة" : "City"}
                  </Label>
                  <Input
                    id="city"
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {isArabic ? "العنوان" : "Address"}
                  </Label>
                  <Input
                    id="address"
                    value={billingInfo.address}
                    onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                {isArabic ? "طريقة الدفع" : "Payment Method"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                <CreditCard className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">{isArabic ? "بطاقة ائتمان/مدى" : "Credit/Debit Card"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? "معالجة آمنة عبر Stripe" : "Secure processing via Stripe"}
                  </p>
                </div>
                <Badge className="bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  {isArabic ? "آمن" : "Secure"}
                </Badge>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  {isArabic
                    ? "سيتم توجيهك إلى صفحة الدفع الآمنة من Stripe لإكمال عملية الشراء"
                    : "You will be redirected to Stripe's secure payment page to complete your purchase"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>
                {isArabic ? "ملخص الطلب" : "Order Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {item.product.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.titleEn}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {isArabic ? item.product.titleAr : item.product.titleEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "الكمية:" : "Qty:"} {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(item.product.price * item.quantity).toLocaleString()} ر.س
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span>{calculateSubtotal().toLocaleString()} ر.س</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{isArabic ? "الخصم" : "Discount"}</span>
                    <span>-{calculateDiscount().toLocaleString()} ر.س</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>{isArabic ? "الإجمالي" : "Total"}</span>
                  <span className="text-green-600">
                    {calculateTotal().toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <Separator />

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full gap-2"
                size="lg"
              >
                <Lock className="h-4 w-4" />
                {processing
                  ? (isArabic ? "جاري المعالجة..." : "Processing...")
                  : (isArabic ? "الدفع الآن" : "Pay Now")
                }
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isArabic
                  ? "بالنقر على 'الدفع الآن'، أنت توافق على شروط الخدمة وسياسة الخصوصية"
                  : "By clicking 'Pay Now', you agree to our Terms of Service and Privacy Policy"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
