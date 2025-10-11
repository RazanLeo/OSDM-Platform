import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { BuyerProductsDashboard } from "@/components/dashboard/buyer-products-dashboard"

export default async function BuyerProductsPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user's product purchases
  const purchases = await prisma.productOrder.findMany({
    where: { buyerId: session.user.id },
    include: {
      product: {
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
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate statistics
  const totalSpent = purchases
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, purchase) => sum + Number(purchase.totalAmount), 0)

  const completedPurchases = purchases.filter(p => p.status === 'COMPLETED').length
  const pendingPurchases = purchases.filter(p => p.status === 'PENDING').length

  const stats = {
    totalSpent,
    completedPurchases,
    pendingPurchases,
    totalPurchases: purchases.length
  }

  return (
    <BuyerProductsDashboard
      purchases={purchases}
      stats={stats}
      locale={locale}
      translations={t}
    />
  )
}
