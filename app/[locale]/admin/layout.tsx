"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  FolderKanban,
  ShoppingCart,
  DollarSign,
  Settings,
  FileText,
  AlertTriangle,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  const pathname = usePathname()
  const isRTL = locale === 'ar'

  const navItems = [
    {
      id: "overview",
      titleAr: "لوحة القيادة",
      titleEn: "Dashboard",
      href: `/${locale}/admin/dashboard`,
      icon: LayoutDashboard,
    },
    {
      id: "users",
      titleAr: "إدارة المستخدمين",
      titleEn: "User Management",
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      id: "products",
      titleAr: "إدارة المنتجات",
      titleEn: "Products",
      href: `/${locale}/admin/products`,
      icon: Package,
    },
    {
      id: "services",
      titleAr: "إدارة الخدمات",
      titleEn: "Services",
      href: `/${locale}/admin/services`,
      icon: Briefcase,
    },
    {
      id: "projects",
      titleAr: "إدارة المشاريع",
      titleEn: "Projects",
      href: `/${locale}/admin/projects`,
      icon: FolderKanban,
    },
    {
      id: "orders",
      titleAr: "إدارة الطلبات",
      titleEn: "Orders",
      href: `/${locale}/admin/orders`,
      icon: ShoppingCart,
    },
    {
      id: "payments",
      titleAr: "المدفوعات والعمولات",
      titleEn: "Payments & Fees",
      href: `/${locale}/admin/payments`,
      icon: DollarSign,
    },
    {
      id: "reports",
      titleAr: "التقارير والتحليلات",
      titleEn: "Reports & Analytics",
      href: `/${locale}/admin/reports`,
      icon: BarChart3,
    },
    {
      id: "disputes",
      titleAr: "النزاعات والشكاوى",
      titleEn: "Disputes",
      href: `/${locale}/admin/disputes`,
      icon: AlertTriangle,
    },
    {
      id: "content",
      titleAr: "إدارة المحتوى",
      titleEn: "Content",
      href: `/${locale}/admin/content`,
      icon: FileText,
    },
    {
      id: "settings",
      titleAr: "الإعدادات",
      titleEn: "Settings",
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ]

  return (
    <div className={cn("min-h-screen bg-muted/10", isRTL ? "rtl" : "ltr")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 bottom-0 z-40 w-64 bg-gradient-to-b from-[#846F9C] to-[#4691A9] border-r transition-all duration-300",
            isRTL ? "right-0" : "left-0"
          )}
        >
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Home className="h-5 w-5 text-white" />
              <span className="text-white font-bold text-xl">OSDM Admin</span>
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
                        "w-full justify-start gap-3 text-white hover:bg-white/20",
                        isActive && "bg-white/30 text-white hover:bg-white/40"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{isRTL ? item.titleAr : item.titleEn}</span>
                    </Button>
                  </Link>
                )
              })}

              <div className="pt-4 mt-4 border-t border-white/10">
                <Link href={`/${locale}/dashboard`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-white hover:bg-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{isRTL ? "العودة للوحة المستخدم" : "Back to User Dashboard"}</span>
                  </Button>
                </Link>
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
