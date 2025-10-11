import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { UnifiedDashboard } from "@/components/dashboard/UnifiedDashboard"

export default async function DashboardPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
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
        orderBy: { createdAt: 'desc' }
      },
      services: {
        take: 5,
        orderBy: { createdAt: 'desc' }
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
      wallet: true,
      subscription: true
    }
  })

  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  return <UnifiedDashboard user={user} locale={locale} translations={t} />
}
