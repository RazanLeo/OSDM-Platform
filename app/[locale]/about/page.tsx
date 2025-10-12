import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Target, Lightbulb, Users } from "lucide-react"

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = getDictionary(locale)
  const isArabic = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
        {isArabic ? "من نحن" : "About Us"}
      </h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "عن OSDM" : "About OSDM"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "منصة OSDM (السوق الرقمي ذو المحطة الواحدة) هي منصة سعودية رائدة تجمع تحت سقف واحد ثلاثة أسواق رقمية متكاملة: سوق المنتجات الرقمية الجاهزة، سوق الخدمات المخصصة، وسوق فرص العمل الحر."
                : "OSDM (One Stop Digital Market) is a leading Saudi platform that brings together three integrated digital markets under one roof: Ready-Made Digital Products Market, Custom Services Market, and Freelance Opportunities Market."}
            </p>
            <p>
              {isArabic
                ? "نحن نؤمن بأن التحول الرقمي هو المستقبل، ونسعى لتمكين الأفراد والشركات في المملكة العربية السعودية من الاستفادة من الفرص الرقمية اللامحدودة."
                : "We believe that digital transformation is the future, and we strive to empower individuals and companies in Saudi Arabia to benefit from unlimited digital opportunities."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "رؤيتنا" : "Our Vision"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "أن نكون المنصة الرقمية الرائدة في المملكة العربية السعودية والمنطقة، التي تربط المواهب بالفرص وتحول الأفكار إلى واقع ملموس."
                : "To be the leading digital platform in Saudi Arabia and the region, connecting talents with opportunities and transforming ideas into tangible reality."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "رسالتنا" : "Our Mission"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "توفير بيئة رقمية آمنة وموثوقة تمكّن البائعين من عرض منتجاتهم وخدماتهم، والمشترين من الوصول إلى حلول رقمية متنوعة وعالية الجودة، والمستقلين من إيجاد فرص عمل تناسب مهاراتهم."
                : "Providing a safe and reliable digital environment that empowers sellers to showcase their products and services, buyers to access diverse and high-quality digital solutions, and freelancers to find job opportunities that match their skills."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "قيمنا" : "Our Values"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#4691A9] mt-1">•</span>
                <div>
                  <strong>{isArabic ? "الشفافية:" : "Transparency:"}</strong>{" "}
                  {isArabic
                    ? "نلتزم بالوضوح في جميع تعاملاتنا"
                    : "We commit to clarity in all our dealings"}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4691A9] mt-1">•</span>
                <div>
                  <strong>{isArabic ? "الجودة:" : "Quality:"}</strong>{" "}
                  {isArabic
                    ? "نسعى دائماً لتقديم أفضل تجربة ممكنة"
                    : "We always strive to provide the best possible experience"}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4691A9] mt-1">•</span>
                <div>
                  <strong>{isArabic ? "الابتكار:" : "Innovation:"}</strong>{" "}
                  {isArabic
                    ? "نحرص على مواكبة أحدث التقنيات"
                    : "We strive to keep up with the latest technologies"}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4691A9] mt-1">•</span>
                <div>
                  <strong>{isArabic ? "الثقة:" : "Trust:"}</strong>{" "}
                  {isArabic
                    ? "نبني علاقات طويلة الأمد مع مستخدمينا"
                    : "We build long-term relationships with our users"}
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
