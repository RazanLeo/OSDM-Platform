import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/lib/i18n/config"

export async function HeroSection({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar"

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OSDM%20HeroSection%20Background%20v1-VUU85SOPsGOsqPm2BpQylNVbW8zesB.jpg)",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#846F9C]/30 via-[#4691A9]/30 to-[#89A58F]/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="mb-12 space-y-10">
          <h1
            className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, #846F9C 0%, #846F9C 20%, #4691A9 50%, #89A58F 80%, #89A58F 100%)",
            }}
          >
            OSDM
          </h1>
          {isArabic ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
                السوق الرقمي ذو المحطة الواحدة
              </h2>
              <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent max-w-4xl mx-auto leading-relaxed">
                منصة سعودية رائدة تجمع كل ماتحتاجه من منتجات وخدمات وفرص عمل رقمية تحت سقف واحد
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
                One Stop Digital Market
              </h2>
              <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent max-w-4xl mx-auto leading-relaxed">
                A leading Saudi platform that brings together all the products, services, and digital job opportunities
                you need under one roof
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-6 justify-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90 text-lg px-8"
            asChild
          >
            <Link href={`/${locale}#gateways`}>{isArabic ? "استكشف الآن" : "Explore Now"}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-[#4691A9] text-[#4691A9] hover:bg-[#4691A9] hover:text-white text-lg px-8 bg-transparent"
            asChild
          >
            <Link href={`/${locale}/auth/register`}>{isArabic ? "ابدأ البيع" : "Start Selling"}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
