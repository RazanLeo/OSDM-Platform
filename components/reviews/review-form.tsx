'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface ReviewFormProps {
  orderId: string
  productId?: string
  serviceId?: string
  sellerId: string
  onSuccess?: () => void
  locale: string
}

export function ReviewForm({
  orderId,
  productId,
  serviceId,
  sellerId,
  onSuccess,
  locale
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isArabic = locale === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى اختيار تقييم' : 'Please select a rating',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productId,
          serviceId,
          sellerId,
          rating,
          comment: comment.trim() || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      toast({
        title: isArabic ? 'نجح' : 'Success',
        description: isArabic ? 'تم إرسال التقييم بنجاح' : 'Review submitted successfully'
      })

      setRating(0)
      setComment('')
      onSuccess?.()
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error instanceof Error ? error.message : (isArabic ? 'فشل إرسال التقييم' : 'Failed to submit review'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {isArabic ? 'التقييم' : 'Rating'}
        </label>
        <div className="flex gap-1">
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
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {rating} {isArabic ? 'نجوم' : 'stars'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {isArabic ? 'التعليق (اختياري)' : 'Comment (optional)'}
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isArabic ? 'شارك تجربتك مع هذا المنتج/الخدمة...' : 'Share your experience with this product/service...'}
          maxLength={500}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {comment.length}/500
        </p>
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? (isArabic ? 'جاري الإرسال...' : 'Submitting...')
          : (isArabic ? 'إرسال التقييم' : 'Submit Review')
        }
      </Button>
    </form>
  )
}
