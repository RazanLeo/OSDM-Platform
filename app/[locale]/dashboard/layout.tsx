"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-provider"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Briefcase,
  FolderKanban,
  ShoppingCart,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  const { dir, isRTL } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    {
      id: "overview",
      titleAr: "لوحة التحكم",
      titleEn: "Dashboard",
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      id: "seller",
      titleAr: "لوحة البائع",
      titleEn: "Seller Dashboard",
      href: `/${locale}/dashboard/seller`,
      icon: Package,
    },
    {
      id: "buyer",
      titleAr: "لوحة المشتري",
      titleEn: "Buyer Dashboard",
      href: `/${locale}/dashboard/buyer`,
      icon: ShoppingCart,
    },
    {
      id: "admin",
      titleAr: "لوحة الإدارة",
      titleEn: "Admin Dashboard",
      href: `/${locale}/dashboard/admin`,
      icon: Settings,
    },
    {
      id: "profile",
      titleAr: "الملف الشخصي",
      titleEn: "Profile",
      href: `/${locale}/dashboard/user`,
      icon: User,
    },
  ]

  return (
    <div className={cn("min-h-screen bg-muted/10", dir)} dir={dir}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 bottom-0 z-40 w-64 bg-card border-r transition-all duration-300",
            isRTL ? "right-0 border-l" : "left-0 border-r"
          )}
        >
          <div className="flex h-16 items-center border-b px-6">
            <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl">
              <span className="text-primary">OSDM</span>
            </Link>
          </div>

          <ScrollArea className="h-[calc(100vh-4rem)] py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.id} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{isRTL ? item.titleAr : item.titleEn}</span>
                    </Button>
                  </Link>
                )
              })}

              <div className="pt-4 mt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>
                </Button>
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            isRTL ? "mr-64" : "ml-64"
          )}
        >
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
