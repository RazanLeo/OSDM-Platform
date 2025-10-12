import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { SearchBar } from "@/components/search/SearchBar"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

export async function Header({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale)
  const isArabic = locale === "ar"
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className={`container mx-auto ${isArabic ? "pr-0 pl-4" : "pl-0 pr-4"}`}>
        <div className="flex h-20 items-center gap-4">
          {/* Logo and Platform Name */}
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12">
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

          {/* Search Bar - Real Component */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchBar locale={locale} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher currentLocale={locale} />

            {/* Notification Bell - Real Component (only for logged in users) */}
            {session && <NotificationBell locale={locale} />}

            {!session ? (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/auth/login`}>{t.login}</Link>
                </Button>

                <Button className="bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90" asChild>
                  <Link href={`/${locale}/auth/register`}>{t.createAccount}</Link>
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/dashboard/${session.user.role.toLowerCase()}`}>
                  {isArabic ? "لوحة التحكم" : "Dashboard"}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search - Real Component */}
        <div className="md:hidden pb-4">
          <SearchBar locale={locale} />
        </div>
      </div>
    </header>
  )
}
