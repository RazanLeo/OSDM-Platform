import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { UnifiedDashboard } from "@/components/dashboard/UnifiedDashboard"

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const session = await getServerSession(authOptions)
  const { locale } = await params
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  // ADMIN goes to admin dashboard
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user data with all relations
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      products: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            where: { status: 'COMPLETED' }
          }
        }
      },
      services: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            where: { status: 'COMPLETED' }
          }
        }
      },
      projectsAsClient: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      productOrdersAsBuyer: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      serviceOrdersAsBuyer: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      productOrdersAsSeller: {
        where: { status: 'COMPLETED' }
      },
      serviceOrdersAsSeller: {
        where: { status: 'COMPLETED' }
      },
      reviewsReceived: true,
      wallet: true,
      subscription: true
    }
  })

  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  // Calculate statistics
  const productEarnings = user.productOrdersAsSeller.reduce((sum, order) =>
    sum + Number(order.sellerEarning), 0
  )
  const serviceEarnings = user.serviceOrdersAsSeller.reduce((sum, order) =>
    sum + Number(order.sellerEarning), 0
  )
  const totalEarnings = productEarnings + serviceEarnings

  const totalSales = user.productOrdersAsSeller.length + user.serviceOrdersAsSeller.length
  const totalPurchases = user.productOrdersAsBuyer.length + user.serviceOrdersAsBuyer.length

  const averageRating = user.reviewsReceived.length > 0
    ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / user.reviewsReceived.length
    : 0
  const totalReviews = user.reviewsReceived.length

  const balance = user.wallet?.balance ? Number(user.wallet.balance) : 0

  // Prepare user data with computed fields
  const userData = {
    ...user,
    totalEarnings,
    totalSales,
    totalPurchases,
    averageRating,
    totalReviews,
    balance,
    readyProducts: user.products,
    customServices: user.services,
    projects: user.projectsAsClient
  }

  return <UnifiedDashboard user={userData} locale={locale} translations={t} />
}
