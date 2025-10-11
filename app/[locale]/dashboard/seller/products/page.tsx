import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { SellerProductsDashboard } from "@/components/dashboard/seller-products-dashboard"

export default async function SellerProductsPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user's products with statistics
  const products = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    include: {
      category: true,
      orders: {
        where: { status: 'COMPLETED' }
      },
      reviews: true,
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate statistics
  const totalRevenue = products.reduce((sum, product) => {
    const productRevenue = product.orders.reduce((orderSum, order) =>
      orderSum + Number(order.sellerEarning), 0
    )
    return sum + productRevenue
  }, 0)

  const totalSales = products.reduce((sum, product) =>
    sum + product.orders.length, 0
  )

  const activeProducts = products.filter(p => p.status === 'APPROVED').length
  const pendingProducts = products.filter(p => p.status === 'PENDING').length

  const stats = {
    totalRevenue,
    totalSales,
    activeProducts,
    pendingProducts,
    totalProducts: products.length
  }

  return (
    <SellerProductsDashboard
      products={products}
      stats={stats}
      locale={locale}
      translations={t}
    />
  )
}
