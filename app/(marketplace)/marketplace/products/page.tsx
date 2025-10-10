import { AppLayout } from "@/components/layout/app-layout"
import { ProductsMarketplace } from "@/components/marketplace/products-marketplace"

export default function ProductsMarketplacePage() {
  return (
    <AppLayout showMarketTabs>
      <ProductsMarketplace />
    </AppLayout>
  )
}
