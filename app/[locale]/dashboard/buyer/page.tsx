import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import type { Locale } from "@/lib/i18n/config"
import { BuyerDashboardClient } from "@/components/buyer/BuyerDashboardClient"

async function getBuyerStats() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/buyer/stats`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

async function getPurchases() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/buyer/purchases?limit=10`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return {
      purchases: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    }
  }

  return res.json()
}

async function getOrders() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/buyer/orders?limit=10`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return {
      orders: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    }
  }

  return res.json()
}

async function getFavorites() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/buyer/favorites?limit=12`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return {
      favorites: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
    }
  }

  return res.json()
}

export default async function BuyerDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is a buyer
  if (!session) {
    redirect(`/${params.locale}/auth/login`)
  }

  if (session.user.role !== "BUYER") {
    redirect(`/${params.locale}/dashboard/${session.user.role.toLowerCase()}`)
  }

  // Fetch all data in parallel
  const [statsData, purchasesData, ordersData, favoritesData] =
    await Promise.all([
      getBuyerStats(),
      getPurchases(),
      getOrders(),
      getFavorites(),
    ])

  // If stats failed to load, show error
  if (!statsData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">
            Failed to load buyer statistics. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <BuyerDashboardClient
      locale={params.locale}
      statsData={statsData}
      purchasesData={purchasesData}
      ordersData={ordersData}
      favoritesData={favoritesData}
    />
  )
}
