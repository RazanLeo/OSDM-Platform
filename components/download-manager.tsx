"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, FileText, Clock, Search, Filter, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface ProductOrder {
  id: string
  orderNumber: string
  productPrice: number
  downloadUrl: string | null
  downloadCount: number
  downloadExpiresAt: string | null
  createdAt: string
  Product: {
    id: string
    titleAr: string
    titleEn: string
    thumbnail: string
  }
}

interface DownloadManagerProps {
  isArabic: boolean
}

export function DownloadManager({ isArabic }: DownloadManagerProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoadingData(true)
    try {
      const response = await fetch('/api/product-orders?buyerId=me&status=COMPLETED')
      const data = await response.json()

      if (response.ok && data.success) {
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const generateDownloadLink = async (orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/product-orders/${orderId}/download`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download link')
      }

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
        toast.success(isArabic ? 'تم إنشاء رابط التحميل' : 'Download link generated')
        await loadOrders()
      }
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل إنشاء رابط التحميل' : 'Failed to generate download link'))
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const title = isArabic ? order.Product.titleAr : order.Product.titleEn
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-purple-600" />
          {isArabic ? "مدير التنزيلات - Gumroad Download Manager" : "Download Manager - Gumroad Style"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "جميع منتجاتك الرقمية الجاهزة للتحميل" : "All your purchased digital products ready to download"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "ابحث عن منتج..." : "Search products..."}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي المنتجات" : "Total Products"}</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "التنزيلات" : "Downloads"}</p>
                    <p className="text-2xl font-bold">
                      {orders.reduce((sum, o) => sum + o.downloadCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "متاح للتحميل" : "Available"}</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => !o.downloadExpiresAt || new Date(o.downloadExpiresAt) > new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isArabic ? "لا توجد منتجات" : "No products found"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isExpired = order.downloadExpiresAt && new Date(order.downloadExpiresAt) < new Date()
                const canDownload = !isExpired

                return (
                  <Card key={order.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={order.Product.thumbnail}
                          alt={order.Product.titleEn}
                          className="h-20 w-20 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {isArabic ? order.Product.titleAr : order.Product.titleEn}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "رقم الطلب:" : "Order #"} {order.orderNumber}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Download className="h-3 w-3" />
                              <span>{order.downloadCount} {isArabic ? "تنزيل" : "downloads"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            {order.downloadExpiresAt && (
                              <Badge variant={isExpired ? "destructive" : "outline"} className="text-xs">
                                {isExpired
                                  ? (isArabic ? "منتهي" : "Expired")
                                  : `${isArabic ? "ينتهي" : "Expires"} ${format(new Date(order.downloadExpiresAt), "MMM d")}`}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => generateDownloadLink(order.id)}
                            disabled={loading || !canDownload}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {isArabic ? "تحميل" : "Download"}
                          </Button>
                          {order.downloadUrl && canDownload && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(order.downloadUrl!, '_blank')}
                            >
                              {isArabic ? "فتح الرابط" : "Open Link"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
