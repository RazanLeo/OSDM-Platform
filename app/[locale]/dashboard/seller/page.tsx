import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import type { Locale } from "@/lib/i18n/config"
import { SellerDashboardClient } from "@/components/seller/SellerDashboardClient"

async function getSellerStats() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/seller/stats`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

async function getProducts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/seller/products?limit=10`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { products: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  }

  return res.json()
}

async function getServices() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/seller/services?limit=10`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { services: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  }

  return res.json()
}

async function getWallet() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/seller/wallet`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { wallet: {}, transactions: [] }
  }

  return res.json()
}

export default async function SellerDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is a seller
  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role !== "SELLER") {
    redirect(`/${locale}/dashboard/${session.user.role.toLowerCase()}`)
  }

  // Fetch all data in parallel
  const [statsData, productsData, servicesData, walletData] = await Promise.all([
    getSellerStats(),
    getProducts(),
    getServices(),
    getWallet(),
  ])

  // If stats failed to load, show error
  if (!statsData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">
            Failed to load seller statistics. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <SellerDashboardClient
      locale={locale}
      statsData={statsData}
      productsData={productsData}
      servicesData={servicesData}
      walletData={walletData}
    />
  )
}
