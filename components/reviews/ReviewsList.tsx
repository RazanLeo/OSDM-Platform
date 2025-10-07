"use client"

import { useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  buyer: {
    id: string
    fullName: string
    profileImage?: string
  }
  helpful: number
}

interface ReviewsListProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  canReview?: boolean
  onSubmitReview?: (rating: number, comment: string) => Promise<void>
  locale: "ar" | "en"
}

export function ReviewsList({
  reviews,
  averageRating,
  totalReviews,
  canReview = false,
  onSubmitReview,
  locale,
}: ReviewsListProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRTL = locale === "ar"

  const t = {
    reviews: isRTL ? "التقييمات" : "Reviews",
    writeReview: isRTL ? "اكتب تقييمك" : "Write a review",
    yourRating: isRTL ? "تقييمك" : "Your rating",
    yourComment: isRTL ? "تعليقك" : "Your comment",
    submit: isRTL ? "إرسال" : "Submit",
    helpful: isRTL ? "مفيد" : "Helpful",
    stars: isRTL ? "نجوم" : "stars",
    noReviews: isRTL ? "لا توجد تقييمات بعد" : "No reviews yet",
    beFirst: isRTL ? "كن أول من يقيّم" : "Be the first to review",
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { star, count, percentage }
  })

  const handleSubmit = async () => {
    if (!onSubmitReview || rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmitReview(rating, comment)
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalReviews} {t.reviews}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm w-12">
                {star} {t.stars}
              </span>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review */}
      {canReview && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">{t.writeReview}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.yourRating}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.yourComment}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isRTL
                      ? "شاركنا رأيك في المنتج..."
                      : "Share your thoughts about the product..."
                  }
                  rows={4}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting
                  ? isRTL
                    ? "جاري الإرسال..."
                    : "Submitting..."
                  : t.submit}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t.reviews}</h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noReviews}</p>
              {canReview && <p className="text-sm text-muted-foreground mt-1">{t.beFirst}</p>}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.buyer.profileImage} />
                    <AvatarFallback>
                      {review.buyer.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">{review.buyer.fullName}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm mb-3">{review.comment}</p>

                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      {t.helpful} ({review.helpful || 0})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
