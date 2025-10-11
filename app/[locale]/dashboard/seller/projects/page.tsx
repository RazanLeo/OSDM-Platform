import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { SellerProjectsDashboard } from "@/components/dashboard/seller-projects-dashboard"

export default async function SellerProjectsPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const t = getDictionary(locale)

  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/dashboard/admin`)
  }

  // Get user's proposals and contracts (as freelancer)
  const proposals = await prisma.proposal.findMany({
    where: { freelancerId: session.user.id },
    include: {
      project: {
        include: {
          category: true,
          client: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              username: true
            }
          }
        }
      },
      contract: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const contracts = await prisma.contract.findMany({
    where: { freelancerId: session.user.id },
    include: {
      project: {
        include: {
          category: true
        }
      },
      client: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          username: true
        }
      },
      milestones: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate statistics
  const totalEarnings = contracts
    .filter(c => c.status === 'COMPLETED')
    .reduce((sum, contract) => sum + Number(contract.freelancerEarning), 0)

  const activeContracts = contracts.filter(c => c.status === 'IN_PROGRESS').length
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED').length
  const pendingProposals = proposals.filter(p => p.status === 'PENDING').length

  const stats = {
    totalEarnings,
    activeContracts,
    completedContracts,
    pendingProposals,
    totalProposals: proposals.length
  }

  return (
    <SellerProjectsDashboard
      proposals={proposals}
      contracts={contracts}
      stats={stats}
      locale={locale}
      translations={t}
    />
  )
}
