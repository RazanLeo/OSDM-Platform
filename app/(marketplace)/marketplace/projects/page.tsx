import { AppLayout } from "@/components/layout/app-layout"
import { ProjectsMarketplace } from "@/components/marketplace/projects-marketplace"

export default function ProjectsMarketplacePage() {
  return (
    <AppLayout showMarketTabs>
      <ProjectsMarketplace />
    </AppLayout>
  )
}
