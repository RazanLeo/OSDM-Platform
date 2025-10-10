import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { AppLayout } from "@/components/layout/app-layout"
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout>
      <OverviewDashboard />
    </AppLayout>
  )
}
