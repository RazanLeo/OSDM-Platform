import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "OSDM - السوق الرقمي ذو المحطة الواحدة",
  description: "منصة سعودية رقمية شاملة تجمع 3 أسواق تحت سقف واحد: المنتجات الرقمية، الخدمات المتخصصة، وفرص العمل الحر",
  keywords: ["OSDM", "سوق رقمي", "منتجات رقمية", "خدمات", "عمل حر", "فريلانس", "السعودية"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${cairo.variable}`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
