import type { Locale } from "@/lib/i18n/config"

export default function UserDashboard({ params }: { params: { locale: Locale } }) {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
        لوحة التحكم
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border-2 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">منتجاتي</h3>
          <p className="text-3xl font-bold text-[#846F9C]">0</p>
        </div>
        <div className="p-6 border-2 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">مبيعاتي</h3>
          <p className="text-3xl font-bold text-[#4691A9]">0 ريال</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-2 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">منتجاتي وخدماتي</h2>
          <p className="text-muted-foreground">قريباً...</p>
        </div>

        <div className="border-2 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">طلباتي</h2>
          <p className="text-muted-foreground">قريباً...</p>
        </div>

        <div className="border-2 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">الإحصائيات</h2>
          <p className="text-muted-foreground">قريباً...</p>
        </div>
      </div>
    </div>
  )
}
