import type { Locale } from "@/lib/i18n/config"
import { HeroSection } from "@/components/hero-section"
import { ThreeGateways } from "@/components/three-gateways"
import { WhyChooseOSDM } from "@/components/why-choose-osdm"
import { WhatYouNeed } from "@/components/what-you-need"

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  return (
    <>
      <HeroSection locale={locale} />
      <ThreeGateways locale={locale} />
      <WhyChooseOSDM locale={locale} />
      <WhatYouNeed locale={locale} />
    </>
  )
}
