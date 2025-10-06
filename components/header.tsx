import Link from "next/link"
import Image from "next/image"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LocaleSwitcher } from "@/components/locale-switcher"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export async function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const isArabic = locale === "ar"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className={`container mx-auto ${isArabic ? "pr-0 pl-4" : "pl-0 pr-4"}`}>
        <div className="flex h-20 items-center gap-4">
          {/* Logo and Platform Name */}
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12 animate-pulse">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OSDM%20Logo%20for%20Ai%20coding%20tool-XlsiIYM3mjmom8MgX4ru1WQ5b12j8J.png"
                alt="OSDM Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h3
                className="text-2xl font-bold text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #846F9C 0%, #846F9C 20%, #4691A9 50%, #89A58F 80%, #89A58F 100%)",
                }}
              >
                {t.platformName}
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t.platformTagline}</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`}
              />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                className={`w-full h-11 border-2 focus-visible:ring-[#4691A9] ${isArabic ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher currentLocale={locale} />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/${locale}/auth/login`}>{t.login}</Link>
            </Button>

            <Button className="bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90" asChild>
              <Link href={`/${locale}/auth/register`}>{t.createAccount}</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`}
            />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className={`w-full h-11 border-2 ${isArabic ? "pr-10 pl-4" : "pl-10 pr-4"}`}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
