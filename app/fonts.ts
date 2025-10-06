// Custom fonts configuration for OSDM
// DIN NEXT Arabic and Latin

import localFont from 'next/font/local'

// DIN NEXT Arabic
export const dinNextArabic = localFont({
  src: [
    {
      path: '../public/fonts/DINNextLTArabic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/DINNextLTArabic-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/DINNextLTArabic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-din-arabic',
  display: 'swap',
})

// DIN NEXT Latin
export const dinNextLatin = localFont({
  src: [
    {
      path: '../public/fonts/DINNextLTPro-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/DINNextLTPro-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/DINNextLTPro-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-din-latin',
  display: 'swap',
})
