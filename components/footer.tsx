import Link from "next/link"
import Image from "next/image"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale)
  const isArabic = locale === "ar"

  const paymentMethods = [
    { name: "Mada", icon: "💳" },
    { name: "Visa", icon: "💳" },
    { name: "MasterCard", icon: "💳" },
    { name: "Apple Pay", icon: "🍎" },
    { name: "STC Pay", icon: "📱" },
    { name: "PayPal", icon: "💰" },
  ]

  const socialLinks = [
    { name: "Snapchat", icon: "👻", url: "#" },
    { name: "Instagram", icon: "📷", url: "#" },
    { name: "TikTok", icon: "🎵", url: "#" },
    { name: "Telegram", icon: "✈️", url: "#" },
    { name: "Twitter", icon: "🐦", url: "#" },
    { name: "LinkedIn", icon: "💼", url: "#" },
  ]

  return (
    <footer className="bg-white border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 mb-12">
          {/* Logo Section - Large on the side */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="relative w-64 h-64 mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OSDM%20Logo%20for%20Ai%20coding%20tool-XlsiIYM3mjmom8MgX4ru1WQ5b12j8J.png"
                alt="OSDM Logo"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent mb-4 text-center">
              {t.platformName}
            </h3>
            <p className="text-lg font-medium text-muted-foreground text-center leading-relaxed">{t.footerTagline}</p>
          </div>

          {/* Quick Links Grid */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#846F9C]">{t.company}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.vision}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.mission}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.servicesGoals}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.events}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.blogNews}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.media}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.careers}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform & Legal Combined */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#4691A9]">{t.platform}</h4>
              <ul className="space-y-2 text-sm mb-6">
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.features}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.fees}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.userGuide}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.faq}
                  </Link>
                </li>
              </ul>

              <h4 className="font-bold text-lg mb-4 text-[#89A58F]">{t.legalPolicies}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.termsOfUse}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.security}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.compliance}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.intellectualProperty}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.paymentRefund}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#4691A9] transition-colors">
                    {t.otherPolicies}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#846F9C]">{t.contactSupport}</h4>
              <ul className="space-y-2 text-sm">
                <li className="font-semibold">{t.office}:</li>
                <li>{t.officeLocation}</li>
                <li className="font-semibold mt-3">{t.email}:</li>
                <li>
                  <a href="mailto:app.osdm@gmail.com" className="hover:text-[#4691A9] transition-colors">
                    app.osdm@gmail.com
                  </a>
                </li>
                <li className="font-semibold mt-3">{t.phone}:</li>
                <li>
                  <a href="tel:+966544827213" className="hover:text-[#4691A9] transition-colors" dir="ltr">
                    +966 544 827 213
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t pt-8 mb-8">
          <h4 className="font-bold text-center mb-4">{t.paymentMethods}</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method) => (
              <div key={method.name} className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                <span className="text-2xl">{method.icon}</span>
                <span className="text-sm font-medium">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.url}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                aria-label={social.name}
              >
                <span className="text-2xl">{social.icon}</span>
                <span className="text-sm font-medium">{social.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>© OSDM 2025</span>
            <span>•</span>
            <span>{t.allRightsReserved}</span>
            <span>•</span>
            <span className="flex items-center gap-2">
              {t.madeInSaudi} <span className="text-lg">🇸🇦</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
