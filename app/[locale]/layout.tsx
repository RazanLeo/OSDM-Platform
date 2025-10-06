import type React from "react"
import type { Metadata } from "next"
import { locales, type Locale } from "@/lib/i18n/config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "@/app/globals.css"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: "OSDM - السوق الرقمي ذو المحطة الواحدة | One Stop Digital Market",
  description:
    "منصة سعودية رقمية شاملة للمنتجات والخدمات وفرص العمل الرقمية | Saudi comprehensive digital marketplace for products, services, and freelance opportunities",
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  const { locale } = params
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header locale={locale} />
        <main className="min-h-screen">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  )
}
