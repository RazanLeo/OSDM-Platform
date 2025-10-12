import Link from "next/link"
import { ShoppingBag, Wrench, Briefcase, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export async function ThreeGateways({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale)

  const gateways = [
    {
      icon: ShoppingBag,
      title: t.gateway1Title,
      description: t.gateway1Desc,
      href: `/${locale}/marketplace/ready-products`,
      gradient: "from-[#846F9C] to-[#4691A9]",
    },
    {
      icon: Wrench,
      title: t.gateway2Title,
      description: t.gateway2Desc,
      href: `/${locale}/marketplace/services`,
      gradient: "from-[#4691A9] to-[#89A58F]",
    },
    {
      icon: Briefcase,
      title: t.gateway3Title,
      description: t.gateway3Desc,
      href: `/${locale}/marketplace/projects`,
      gradient: "from-[#89A58F] to-[#846F9C]",
    },
  ]

  return (
    <section id="gateways" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {gateways.map((gateway, index) => {
            const Icon = gateway.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#4691A9] overflow-hidden flex flex-col"
              >
                <CardHeader className="flex-1">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${gateway.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{gateway.title}</CardTitle>
                  <CardDescription className="text-base">{gateway.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className={`w-full bg-gradient-to-r ${gateway.gradient} hover:opacity-90 group`} asChild>
                    <Link href={gateway.href} className="flex items-center justify-center gap-2">
                      {t.enterMarket}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
