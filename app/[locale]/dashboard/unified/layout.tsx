"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  ShoppingBag,
  Briefcase,
  FolderKanban,
  ArrowUpCircle,
  ArrowDownCircle,
  LayoutDashboard,
  ChevronDown,
  Globe,
  User,
} from "lucide-react"
import { useLocale } from "next-intl"

export default function UnifiedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const isRTL = locale === "ar"

  // State for mode (seller/buyer) and market
  const [userMode, setUserMode] = useState<"seller" | "buyer">("seller")
  const [activeMarket, setActiveMarket] = useState<"products" | "services" | "projects">("products")

  const toggleMode = () => {
    const newMode = userMode === "seller" ? "buyer" : "seller"
    setUserMode(newMode)
    router.push(`/${locale}/dashboard/unified/${newMode}/${activeMarket}`)
  }

  const switchMarket = (market: "products" | "services" | "projects") => {
    setActiveMarket(market)
    router.push(`/${locale}/dashboard/unified/${userMode}/${market}`)
  }

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar"
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Level 1: Top Bar - Always Fixed */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              OSDM
            </span>
          </Link>

          {/* Center: Mode Toggle */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleMode}
              variant="outline"
              className="gap-2 font-semibold"
              size="lg"
            >
              {userMode === "seller" ? (
                <>
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  {locale === "ar" ? "بائع" : "Seller"}
                  <ChevronDown className="h-4 w-4" />
                  <Briefcase className="h-5 w-5 text-blue-600 opacity-50" />
                  {locale === "ar" ? "مشتري" : "Buyer"}
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5 text-green-600 opacity-50" />
                  {locale === "ar" ? "بائع" : "Seller"}
                  <ChevronDown className="h-4 w-4" />
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  {locale === "ar" ? "مشتري" : "Buyer"}
                </>
              )}
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="font-semibold">{locale === "ar" ? "🇸🇦 AR" : "🇺🇸 EN"}</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                5
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{session?.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {locale === "ar" ? "حسابي" : "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  {locale === "ar" ? "الملف الشخصي" : "Profile"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  {locale === "ar" ? "الإعدادات" : "Settings"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/api/auth/signout")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Level 2: Market Tabs Bar */}
      <div className="sticky top-16 z-40 border-b bg-white/90 backdrop-blur-md dark:bg-gray-800/90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-2 py-3">
            {/* Main Dashboard Link */}
            <Link href={`/${locale}/dashboard/unified/overview`}>
              <Button
                variant={pathname.includes("/overview") ? "default" : "ghost"}
                className="gap-2"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden md:inline">
                  {locale === "ar" ? "الملخص العام" : "Overview"}
                </span>
              </Button>
            </Link>

            {/* Market Tabs */}
            <div className="flex flex-1 justify-center gap-2">
              <Button
                onClick={() => switchMarket("products")}
                variant={activeMarket === "products" ? "default" : "outline"}
                className={`gap-2 ${activeMarket === "products" ? "bg-violet-600 hover:bg-violet-700" : ""}`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden md:inline">
                  {locale === "ar" ? "المنتجات الجاهزة" : "Ready Products"}
                </span>
              </Button>

              <Button
                onClick={() => switchMarket("services")}
                variant={activeMarket === "services" ? "default" : "outline"}
                className={`gap-2 ${activeMarket === "services" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                <Briefcase className="h-5 w-5" />
                <span className="hidden md:inline">
                  {locale === "ar" ? "الخدمات المتخصصة" : "Custom Services"}
                </span>
              </Button>

              <Button
                onClick={() => switchMarket("projects")}
                variant={activeMarket === "projects" ? "default" : "outline"}
                className={`gap-2 ${activeMarket === "projects" ? "bg-fuchsia-600 hover:bg-fuchsia-700" : ""}`}
              >
                <FolderKanban className="h-5 w-5" />
                <span className="hidden md:inline">
                  {locale === "ar" ? "فرص العمل الحر" : "Freelance Jobs"}
                </span>
              </Button>
            </div>

            {/* Home Button */}
            <Link href={`/${locale}`}>
              <Button variant="ghost" className="gap-2">
                <Home className="h-5 w-5" />
                <span className="hidden md:inline">
                  {locale === "ar" ? "الرئيسية" : "Home"}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Scroll Buttons - Fixed */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
        <Button
          onClick={scrollToTop}
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg hover:shadow-xl"
        >
          <ArrowUpCircle className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg hover:shadow-xl"
        >
          <ArrowDownCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
