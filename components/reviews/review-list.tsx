import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  reviewer: {
    username: string
    avatar: string | null
  }
  sellerResponse: string | null
  respondedAt: Date | null
}

interface ReviewListProps {
  reviews: Review[]
  locale: string
}

export function ReviewList({ reviews, locale }: ReviewListProps) {
  const isArabic = locale === 'ar'

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArabic ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          {/* Reviewer info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar>
              <AvatarImage src={review.reviewer.avatar || undefined} />
              <AvatarFallback>
                {review.reviewer.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.reviewer.username}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                    locale: isArabic ? ar : enUS
                  })}
                </span>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{review.rating}.0</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-foreground leading-relaxed mt-2 ml-12">
              {review.comment}
            </p>
          )}

          {/* Seller response */}
          {review.sellerResponse && (
            <div className="mt-4 ml-12 bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">
                  {isArabic ? 'رد البائع' : 'Seller response'}
                </p>
                {review.respondedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.respondedAt), {
                      addSuffix: true,
                      locale: isArabic ? ar : enUS
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{review.sellerResponse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
