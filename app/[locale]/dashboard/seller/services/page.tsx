import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { SellerServicesDashboard } from "@/components/dashboard/seller-services-dashboard"

export default async function SellerServicesPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user's services with statistics
  const services = await prisma.service.findMany({
    where: { sellerId: session.user.id },
    include: {
      category: true,
      packages: true,
      orders: {
        where: { status: 'COMPLETED' }
      },
      _count: {
        select: {
          orders: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate statistics
  const totalRevenue = services.reduce((sum, service) => {
    const serviceRevenue = service.orders.reduce((orderSum, order) =>
      orderSum + Number(order.sellerEarning), 0
    )
    return sum + serviceRevenue
  }, 0)

  const totalOrders = services.reduce((sum, service) =>
    sum + service.orders.length, 0
  )

  const activeServices = services.filter(s => s.status === 'ACTIVE').length
  const pausedServices = services.filter(s => s.status === 'PAUSED').length

  const stats = {
    totalRevenue,
    totalOrders,
    activeServices,
    pausedServices,
    totalServices: services.length
  }

  return (
    <SellerServicesDashboard
      services={services}
      stats={stats}
      locale={locale}
      translations={t}
    />
  )
}
