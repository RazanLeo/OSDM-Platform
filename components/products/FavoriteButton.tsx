'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  productId: string
  initialFavorited: boolean
  className?: string
}

export default function FavoriteButton({ productId, initialFavorited, className }: FavoriteButtonProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFavorite = async () => {
    if (status === 'unauthenticated') {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push(`/auth/login?callbackUrl=/products/${productId}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/products/${productId}/favorite`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setIsFavorited(data.data.isFavorited)
        toast.success(data.data.isFavorited ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة')
        router.refresh()
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث المفضلة')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      variant="outline"
      className={className}
    >
      <Heart
        className={`h-4 w-4 ml-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
      />
      {isFavorited ? 'مفضل' : 'إضافة للمفضلة'}
    </Button>
  )
}
