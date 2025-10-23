import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const session = await getServerSession(authOptions)
  const { locale } = await params

  if (!session || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`)
  }

  const isArabic = locale === 'ar'

  // Simple stats for now
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {isArabic ? "لوحة تحكم الإدارة" : "Admin Dashboard"}
        </h1>
        <p className="text-white/70 mt-2">
          {isArabic ? "إدارة منصة OSDM بالكامل" : "Complete OSDM Platform Management"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="text-sm text-white/70">{isArabic ? "إجمالي المستخدمين" : "Total Users"}</div>
          <div className="text-3xl font-bold text-white mt-2">1,234</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="text-sm text-white/70">{isArabic ? "إجمالي المنتجات" : "Total Products"}</div>
          <div className="text-3xl font-bold text-white mt-2">567</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="text-sm text-white/70">{isArabic ? "إجمالي الخدمات" : "Total Services"}</div>
          <div className="text-3xl font-bold text-white mt-2">890</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="text-sm text-white/70">{isArabic ? "إجمالي المشاريع" : "Total Projects"}</div>
          <div className="text-3xl font-bold text-white mt-2">345</div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-lg p-6 border border-green-500/30">
          <div className="text-sm text-white/70">{isArabic ? "إجمالي الإيرادات" : "Total Revenue"}</div>
          <div className="text-3xl font-bold text-white mt-2">1,500,000 {isArabic ? "ر.س" : "SAR"}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-lg p-6 border border-blue-500/30">
          <div className="text-sm text-white/70">{isArabic ? "عمولة المنصة (25%)" : "Platform Fee (25%)"}</div>
          <div className="text-3xl font-bold text-white mt-2">375,000 {isArabic ? "ر.س" : "SAR"}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/30">
          <div className="text-sm text-white/70">{isArabic ? "رسوم الدفع (5%)" : "Payment Fee (5%)"}</div>
          <div className="text-3xl font-bold text-white mt-2">75,000 {isArabic ? "ر.س" : "SAR"}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">
          {isArabic ? "إجراءات سريعة" : "Quick Actions"}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg transition">
            {isArabic ? "مراجعة المنتجات المعلقة" : "Review Pending Products"}
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg transition">
            {isArabic ? "مراجعة الخدمات المعلقة" : "Review Pending Services"}
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg transition">
            {isArabic ? "إدارة المستخدمين" : "Manage Users"}
          </button>
        </div>
      </div>
    </div>
  )
}
