"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"
import { toast } from "sonner"
import Link from "next/link"

interface CartItem {
  id: string
  productId: string
  product: {
    titleAr: string
    titleEn: string
    thumbnail: string
    price: number
    seller: {
      name: string
    }
  }
  quantity: number
}

interface ShoppingCartProps {
  isArabic?: boolean
}

export function ShoppingCart({ isArabic = true }: ShoppingCartProps) {
  const { isRTL } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    type: 'PERCENTAGE' | 'FIXED'
    value: number
  } | null>(null)
  const [processingDiscount, setProcessingDiscount] = useState(false)

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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        await loadCart()
      }
    } catch (error) {
      toast.error(isArabic ? "فشل تحديث الكمية" : "Failed to update quantity")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(isArabic ? "تم الحذف من السلة" : "Removed from cart")
        await loadCart()
      }
    } catch (error) {
      toast.error(isArabic ? "فشل الحذف" : "Failed to remove")
    }
  }

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error(isArabic ? "أدخل كود الخصم" : "Enter discount code")
      return
    }

    setProcessingDiscount(true)
    try {
      const response = await fetch('/api/cart/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAppliedDiscount(data.discount)
        toast.success(isArabic ? "تم تطبيق الخصم" : "Discount applied")
      } else {
        toast.error(data.error || (isArabic ? "كود خصم غير صالح" : "Invalid discount code"))
      }
    } catch (error) {
      toast.error(isArabic ? "فشل تطبيق الخصم" : "Failed to apply discount")
    } finally {
      setProcessingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
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

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return Math.max(0, subtotal - discount)
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
                ? "لم تقم بإضافة أي منتجات بعد"
                : "You haven't added any products yet"}
            </p>
          </div>
          <Link href="/ar/marketplace/ready-products">
            <Button>
              {isArabic ? "تصفح المنتجات" : "Browse Products"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {isArabic ? "سلة التسوق" : "Shopping Cart"} ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {item.product.thumbnail ? (
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.titleEn}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-2">
                      {isArabic ? item.product.titleAr : item.product.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? "البائع:" : "Seller:"} {item.product.seller.name}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {(item.product.price * item.quantity).toLocaleString()} ر.س
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {item.product.price.toLocaleString()} ر.س {isArabic ? "لكل واحد" : "each"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              {/* Discount Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {isArabic ? "كود الخصم" : "Discount Code"}
                </label>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <Badge className="bg-green-600">
                      {appliedDiscount.code}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeDiscount}
                      className="h-6 text-xs"
                    >
                      {isArabic ? "إزالة" : "Remove"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={isArabic ? "أدخل الكود" : "Enter code"}
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Button
                      onClick={applyDiscount}
                      disabled={processingDiscount}
                      size="sm"
                    >
                      {isArabic ? "تطبيق" : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span className="font-medium">
                    {calculateSubtotal().toLocaleString()} ر.س
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">
                      {isArabic ? "الخصم" : "Discount"} ({appliedDiscount.code})
                    </span>
                    <span className="font-medium text-green-600">
                      -{calculateDiscount().toLocaleString()} ر.س
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {isArabic ? "الإجمالي" : "Total"}
                  </span>
                  <span className="font-bold text-2xl text-green-600">
                    {calculateTotal().toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <Separator />

              {/* Checkout Button */}
              <Link href="/ar/checkout">
                <Button className="w-full gap-2" size="lg">
                  {isArabic ? "إتمام الشراء" : "Proceed to Checkout"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                {isArabic
                  ? "الدفع آمن ومشفر بالكامل"
                  : "Secure & encrypted payment"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
