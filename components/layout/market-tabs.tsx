"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/i18n/language-provider"
import { useRouter, usePathname } from "next/navigation"
import { Package, Briefcase, FolderKanban } from "lucide-react"

export function MarketTabs() {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  const markets = [
    {
      value: "products",
      label: t.products,
      icon: Package,
      href: "/marketplace/products",
    },
    {
      value: "services",
      label: t.services,
      icon: Briefcase,
      href: "/marketplace/services",
    },
    {
      value: "projects",
      label: t.projects,
      icon: FolderKanban,
      href: "/marketplace/projects",
    },
  ]

  // Determine current market from pathname
  const getCurrentMarket = () => {
    if (pathname.includes("/products")) return "products"
    if (pathname.includes("/services")) return "services"
    if (pathname.includes("/projects")) return "projects"
    return "products" // default
  }

  const handleMarketChange = (value: string) => {
    const market = markets.find((m) => m.value === value)
    if (market) {
      router.push(market.href)
    }
  }

  return (
    <Tabs
      value={getCurrentMarket()}
      onValueChange={handleMarketChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 h-auto">
        {markets.map((market) => (
          <TabsTrigger
            key={market.value}
            value={market.value}
            className="flex items-center gap-2 py-3"
          >
            <market.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{market.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
