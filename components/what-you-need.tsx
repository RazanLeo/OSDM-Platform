import { Laptop, Wifi, Lightbulb, Store } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function WhatYouNeed({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale)

  const needs = [
    { icon: Laptop, title: t.need1Title, desc: t.need1Desc, color: "text-[#846F9C]" },
    { icon: Wifi, title: t.need2Title, desc: t.need2Desc, color: "text-[#4691A9]" },
    { icon: Lightbulb, title: t.need3Title, desc: t.need3Desc, color: "text-[#89A58F]" },
    { icon: Store, title: t.need4Title, desc: t.need4Desc, color: "text-[#846F9C]" },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
          {t.whatYouNeedTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {needs.map((need, index) => {
            const Icon = need.icon
            return (
              <Card key={index} className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className={`w-8 h-8 ${need.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{need.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{need.desc}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
