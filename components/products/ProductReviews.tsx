'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: Date
  buyer: {
    username: string
    fullName: string
    avatar: string | null
  }
  sellerResponse?: string | null
  sellerResponseAt?: Date | null
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews
}: ProductReviewsProps) {
  const [displayCount, setDisplayCount] = useState(5)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  const displayedReviews = reviews.slice(0, displayCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>التقييمات والآراء</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-right space-y-2">
            <div className="text-5xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= averageRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              بناءً على {totalReviews} تقييم
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{rating}</span>
                </div>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12 text-left">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {displayedReviews.length > 0 ? (
          <div className="space-y-6 mt-8">
            {displayedReviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.buyer.avatar || undefined} />
                    <AvatarFallback>{review.buyer.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{review.buyer.fullName}</h4>
                        <p className="text-sm text-muted-foreground">@{review.buyer.username}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ar })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Seller Response */}
                    {review.sellerResponse && (
                      <div className="mt-4 mr-8 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">رد البائع</span>
                          {review.sellerResponseAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.sellerResponseAt), { addSuffix: true, locale: ar })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.sellerResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {reviews.length > displayCount && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDisplayCount(prev => prev + 5)}
              >
                عرض المزيد من التقييمات
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="text-sm text-muted-foreground mt-2">
              كن أول من يقيم هذا المنتج
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
