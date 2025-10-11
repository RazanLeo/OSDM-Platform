import { AppLayout } from "@/components/layout/app-layout"
import { ServicesMarketplace } from "@/components/marketplace/services-marketplace"

export default function ServicesMarketplacePage() {
  return (
    <AppLayout showMarketTabs>
      <ServicesMarketplace />
    </AppLayout>
  )
}
