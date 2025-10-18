"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  comment: string | null
  sellerResponse: string | null
  respondedAt: string | null
  createdAt: string
  User_ProductReview_reviewerIdToUser: {
    id: string
    username: string
    fullName: string
    avatar: string | null
  }
}

interface ReviewsRatingSystemProps {
  productId?: string
  serviceId?: string
  orderId?: string
  sellerId?: string
  marketType: "product" | "service"
  isArabic: boolean
  canReview?: boolean
  isSeller?: boolean
  onReviewSubmitted?: () => void
}

export function ReviewsRatingSystem({
  productId,
  serviceId,
  orderId,
  sellerId,
  marketType,
  isArabic,
  canReview = false,
  isSeller = false,
  onReviewSubmitted
}: ReviewsRatingSystemProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)

  // Review form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)

  // Seller response
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [sellerResponse, setSellerResponse] = useState("")

  useEffect(() => {
    loadReviews()
  }, [productId, serviceId, sellerId])

  const loadReviews = async () => {
    setLoadingData(true)
    try {
      let url = "/api/product-reviews?"
      if (productId) url += `productId=${productId}&`
      if (sellerId) url += `sellerId=${sellerId}&`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok && data.success) {
        setReviews(data.data || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error(isArabic ? "التعليق مطلوب" : "Comment required")
      return
    }

    if (!orderId) {
      toast.error(isArabic ? "معرف الطلب مطلوب" : "Order ID required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/product-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId,
          rating,
          comment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast.success(isArabic ? "تم إضافة التقييم بنجاح" : "Review submitted successfully")
      setComment("")
      setRating(5)
      await loadReviews()
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل إضافة التقييم" : "Failed to submit review"))
    } finally {
      setLoading(false)
    }
  }

  const submitSellerResponse = async (reviewId: string) => {
    if (!sellerResponse.trim()) {
      toast.error(isArabic ? "الرد مطلوب" : "Response required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/product-reviews/${reviewId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: sellerResponse,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit response")
      }

      toast.success(isArabic ? "تم إضافة الرد بنجاح" : "Response submitted successfully")
      setSellerResponse("")
      setSelectedReviewId(null)
      await loadReviews()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل إضافة الرد" : "Failed to submit response"))
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? (hoverRating || rating) : currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    )
  }

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
    <div className="space-y-6">
      {/* Rating Overview */}
      {stats && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              {isArabic ? "نظرة عامة على التقييمات" : "Rating Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {stats.averageRating?.toFixed(1) || "0.0"}
                </div>
                {renderStars(Math.round(stats.averageRating || 0))}
                <p className="text-sm text-muted-foreground mt-2">
                  {reviews.length} {isArabic ? "تقييم" : "reviews"}
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution?.[star] || 0
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm w-4">{star}</span>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Review Form */}
      {canReview && !isSeller && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              {isArabic ? "أضف تقييمك" : "Write a Review"}
            </CardTitle>
            <CardDescription>
              {isArabic ? "شارك رأيك لمساعدة الآخرين" : "Share your feedback to help others"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isArabic ? "التقييم" : "Rating"}
              </label>
              {renderStars(rating, true)}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {isArabic ? "التعليق" : "Comment"}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isArabic ? "اكتب تجربتك مع هذا المنتج..." : "Share your experience with this product..."}
                rows={4}
              />
            </div>

            <Button onClick={submitReview} disabled={loading} className="w-full">
              {isArabic ? "إرسال التقييم" : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            {isArabic ? "آراء العملاء - Customer Reviews" : "Customer Reviews"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isArabic ? "لا توجد تقييمات بعد" : "No reviews yet"}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.User_ProductReview_reviewerIdToUser.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {review.User_ProductReview_reviewerIdToUser.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.User_ProductReview_reviewerIdToUser.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm bg-muted p-3 rounded-lg">{review.comment}</p>
                  )}

                  {/* Seller Response */}
                  {review.sellerResponse && (
                    <div className="ml-12 bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border-l-4 border-purple-600">
                      <p className="text-sm font-medium mb-1">
                        {isArabic ? "رد البائع:" : "Seller's Response:"}
                      </p>
                      <p className="text-sm">{review.sellerResponse}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {review.respondedAt && format(new Date(review.respondedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Seller Response Form */}
                  {isSeller && !review.sellerResponse && (
                    <div className="ml-12">
                      {selectedReviewId === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={sellerResponse}
                            onChange={(e) => setSellerResponse(e.target.value)}
                            placeholder={isArabic ? "اكتب ردك..." : "Write your response..."}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => submitSellerResponse(review.id)}
                              disabled={loading}
                            >
                              {isArabic ? "إرسال الرد" : "Submit Response"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReviewId(null)
                                setSellerResponse("")
                              }}
                            >
                              {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReviewId(review.id)}
                        >
                          {isArabic ? "الرد على التقييم" : "Respond to Review"}
                        </Button>
                      )}
                    </div>
                  )}

                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
