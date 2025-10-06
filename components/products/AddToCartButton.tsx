'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  productId: string
  className?: string
}

export default function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (status === 'unauthenticated') {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push(`/auth/login?callbackUrl=/products/${productId}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تمت إضافة المنتج إلى السلة')
        router.push('/cart')
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إضافة المنتج')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      size="lg"
      className={`w-full ${className}`}
    >
      <ShoppingCart className="h-5 w-5 ml-2" />
      {isLoading ? 'جاري الإضافة...' : 'شراء الآن'}
    </Button>
  )
}
