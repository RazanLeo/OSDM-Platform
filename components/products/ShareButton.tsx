'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  url: string
  title: string
  className?: string
}

export default function ShareButton({ url, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('تم نسخ الرابط')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('فشل نسخ الرابط')
    }
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="h-4 w-4 ml-2" />
          مشاركة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4 ml-2" /> : <Share2 className="h-4 w-4 ml-2" />}
          {copied ? 'تم النسخ!' : 'نسخ الرابط'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          واتساب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          تويتر (X)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          فيسبوك
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')}>
          تيليجرام
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          لينكد إن
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
