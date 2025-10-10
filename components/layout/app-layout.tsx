"use client"

import { TopBar } from "./top-bar"
import { MarketTabs } from "./market-tabs"
import { useLanguage } from "@/lib/i18n/language-provider"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  showMarketTabs?: boolean
}

export function AppLayout({ children, showMarketTabs = false }: AppLayoutProps) {
  const { dir, isRTL } = useLanguage()
  const pathname = usePathname()

  // Check if current page is marketplace
  const isMarketplace = pathname?.startsWith("/marketplace")

  return (
    <div className={cn("min-h-screen bg-background", `direction-${dir}`)} dir={dir}>
      <TopBar />

      {(showMarketTabs || isMarketplace) && (
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <MarketTabs />
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 OSDM. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="/about" className="hover:text-foreground">
                About
              </a>
              <a href="/privacy" className="hover:text-foreground">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground">
                Terms
              </a>
              <a href="/contact" className="hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
