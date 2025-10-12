import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function WhyChooseOSDM({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale)

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc },
    { title: t.feature2Title, desc: t.feature2Desc },
    { title: t.feature3Title, desc: t.feature3Desc },
    { title: t.feature4Title, desc: t.feature4Desc },
    { title: t.feature5Title, desc: t.feature5Desc },
    { title: t.feature6Title, desc: t.feature6Desc },
    { title: t.feature7Title, desc: t.feature7Desc },
    { title: t.feature8Title, desc: t.feature8Desc },
    { title: t.feature9Title, desc: t.feature9Desc },
    { title: t.feature10Title, desc: t.feature10Desc },
    { title: t.feature11Title, desc: t.feature11Desc },
    { title: t.feature12Title, desc: t.feature12Desc },
    { title: t.feature13Title, desc: t.feature13Desc },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
          {t.whyChooseTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#4691A9]">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
