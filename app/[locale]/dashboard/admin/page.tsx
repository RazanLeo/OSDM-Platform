import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import type { Locale } from "@/lib/i18n/config"
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient"

async function getAdminStats() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/stats`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

async function getUsers() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/users?limit=10`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { users: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  }

  return res.json()
}

async function getProducts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/products?limit=10`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { products: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  }

  return res.json()
}

async function getOrders() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/orders?limit=10`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { orders: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  }

  return res.json()
}

async function getDisputes() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/disputes`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return { disputes: [] }
  }

  return res.json()
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/dashboard/${session.user.role.toLowerCase()}`)
  }

  // Fetch all data in parallel
  const [statsData, usersData, productsData, ordersData, disputesData] = await Promise.all([
    getAdminStats(),
    getUsers(),
    getProducts(),
    getOrders(),
    getDisputes(),
  ])

  // If stats failed to load, show error
  if (!statsData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">
            Failed to load admin statistics. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboardClient
      locale={locale}
      statsData={statsData}
      usersData={usersData}
      productsData={productsData}
      ordersData={ordersData}
      disputesData={disputesData}
    />
  )
}
