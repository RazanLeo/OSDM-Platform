"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Download,
  Package,
  Shield,
  Clock,
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  PlayCircle
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"
import { toast } from "sonner"
import { format } from "date-fns"

interface ProductFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
}

interface ProductImage {
  id: string
  imageUrl: string
}

interface ProductReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  User: {
    fullName: string
    username: string
    avatar: string | null
  }
  sellerResponse: string | null
}

interface Product {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  thumbnail: string
  averageRating: number
  reviewCount: number
  downloadCount: number
  ProductFile: ProductFile[]
  ProductImage: ProductImage[]
  ProductReview: ProductReview[]
  User: {
    id: string
    fullName: string
    username: string
    avatar: string | null
  }
  ProductCategory: {
    nameAr: string
    nameEn: string
  }
  tags: string[]
  licenseType: string | null
  isExclusive: boolean
  allowReselling: boolean
  fileFormat: string | null
  createdAt: string
  updatedAt: string
}

interface ProductDetailViewProps {
  productId: string
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { isRTL } = useLanguage()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setProduct(data.data)
        setSelectedImage(data.data.thumbnail)
      } else {
        toast.error(isRTL ? "فشل تحميل المنتج" : "Failed to load product")
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast.error(isRTL ? "حدث خطأ" : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      // Add to cart or direct checkout
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          quantity: 1,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isRTL ? "تمت الإضافة إلى السلة" : "Added to cart")
        // Redirect to checkout
        window.location.href = '/ar/checkout'
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || (isRTL ? "فشل الشراء" : "Purchase failed"))
    } finally {
      setPurchasing(false)
    }
  }

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast.success(isRTL ? "تمت الإضافة إلى السلة" : "Added to cart")
      }
    } catch (error) {
      toast.error(isRTL ? "فشل الإضافة" : "Failed to add")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {isRTL ? "المنتج غير موجود" : "Product not found"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{isRTL ? "الرئيسية" : "Home"}</span>
        <span>/</span>
        <span>{isRTL ? product.ProductCategory.nameAr : product.ProductCategory.nameEn}</span>
        <span>/</span>
        <span className="text-foreground">{isRTL ? product.titleAr : product.titleEn}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} alt={product.titleEn} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Gallery */}
          {product.ProductImage.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <div
                onClick={() => setSelectedImage(product.thumbnail)}
                className={`aspect-video bg-muted rounded cursor-pointer border-2 ${
                  selectedImage === product.thumbnail ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={product.thumbnail} alt="Thumbnail" className="w-full h-full object-cover rounded" />
              </div>
              {product.ProductImage.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`aspect-video bg-muted rounded cursor-pointer border-2 ${
                    selectedImage === img.imageUrl ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img.imageUrl} alt="Preview" className="w-full h-full object-cover rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Tabs: Description, Reviews */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                {isRTL ? "الوصف" : "Description"}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                {isRTL ? "التقييمات" : "Reviews"} ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "الملفات" : "Files"} ({product.ProductFile.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {isRTL ? product.descriptionAr : product.descriptionEn}
                  </p>

                  {product.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-4">
              {product.ProductReview.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {isRTL ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </CardContent>
                </Card>
              ) : (
                product.ProductReview.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {review.User.avatar ? (
                              <img src={review.User.avatar} alt={review.User.fullName} className="w-full h-full rounded-full" />
                            ) : (
                              <span>{review.User.fullName[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{review.User.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}

                      {review.sellerResponse && (
                        <div className="bg-muted p-3 rounded-lg mt-2">
                          <p className="text-xs font-semibold mb-1">
                            {isRTL ? "رد البائع:" : "Seller Response:"}
                          </p>
                          <p className="text-sm">{review.sellerResponse}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  {product.ProductFile.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      {isRTL ? "سيتم توفير الملفات بعد الشراء" : "Files will be available after purchase"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {product.ProductFile.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{file.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.fileType}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6 space-y-4">
              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {product.price.toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>{product.downloadCount}</span>
                </div>
              </div>

              <Separator />

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {purchasing
                    ? (isRTL ? "جاري المعالجة..." : "Processing...")
                    : (isRTL ? "شراء الآن" : "Buy Now")
                  }
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  {isRTL ? "إضافة إلى السلة" : "Add to Cart"}
                </Button>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{isRTL ? "تحميل فوري بعد الدفع" : "Instant download after payment"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>
                    {product.licenseType || (isRTL ? "رخصة استخدام شخصي" : "Personal Use License")}
                  </span>
                </div>
                {product.isExclusive && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span>{isRTL ? "حقوق حصرية" : "Exclusive Rights"}</span>
                  </div>
                )}
                {product.allowReselling && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{isRTL ? "يسمح بإعادة البيع" : "Reselling Allowed"}</span>
                  </div>
                )}
                {product.fileFormat && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span>{product.fileFormat}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Seller Info */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">{isRTL ? "البائع" : "Seller"}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {product.User.avatar ? (
                      <img src={product.User.avatar} alt={product.User.fullName} className="w-full h-full rounded-full" />
                    ) : (
                      <span>{product.User.fullName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.User.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{product.User.username}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  {isRTL ? "عرض الملف الشخصي" : "View Profile"}
                </Button>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Heart className="h-4 w-4" />
                  {isRTL ? "حفظ" : "Save"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Share2 className="h-4 w-4" />
                  {isRTL ? "مشاركة" : "Share"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
