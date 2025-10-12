import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { BuyerServicesDashboard } from "@/components/dashboard/buyer-services-dashboard"

export default async function BuyerServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const session = await getServerSession(authOptions)
  const locale = (await params).locale
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user's service orders
  const orders = await prisma.serviceOrder.findMany({
    where: { buyerId: session.user.id },
    include: {
      service: {
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              username: true
            }
          }
        }
      },
      payment: true,
      milestones: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate statistics
  const totalSpent = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, order) => sum + Number(order.totalAmount), 0)

  const activeOrders = orders.filter(o => o.status === 'IN_PROGRESS').length
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  const stats = {
    totalSpent,
    activeOrders,
    completedOrders,
    pendingOrders,
    totalOrders: orders.length
  }

  return (
    <BuyerServicesDashboard
      orders={orders}
      stats={stats}
      locale={locale}
      translations={t}
    />
  )
}
