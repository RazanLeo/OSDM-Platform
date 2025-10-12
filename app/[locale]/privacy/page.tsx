import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const isArabic = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "جمع المعلومات" : "Information Collection"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "نقوم بجمع المعلومات التي تقدمها لنا عند التسجيل واستخدام خدماتنا، بما في ذلك الاسم والبريد الإلكتروني ومعلومات الدفع."
                : "We collect information you provide when registering and using our services, including name, email, and payment information."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "استخدام المعلومات" : "Use of Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li>• {isArabic ? "تحسين خدماتنا وتطويرها" : "Improving and developing our services"}</li>
              <li>• {isArabic ? "معالجة المعاملات المالية" : "Processing financial transactions"}</li>
              <li>• {isArabic ? "التواصل معك بشأن حسابك" : "Communicating with you about your account"}</li>
              <li>• {isArabic ? "حماية المنصة من الاحتيال" : "Protecting the platform from fraud"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "حماية البيانات" : "Data Protection"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "نستخدم تقنيات تشفير متقدمة لحماية بياناتك الشخصية والمالية."
                : "We use advanced encryption technologies to protect your personal and financial data."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "مشاركة المعلومات" : "Information Sharing"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلومات محدودة مع شركائنا الموثوقين لمعالجة المدفوعات فقط."
                : "We do not sell or rent your personal information to third parties. We may share limited information with trusted partners for payment processing only."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "ملفات تعريف الارتباط (Cookies)" : "Cookies"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة وتذكر تفضيلاتك."
                : "We use cookies to improve your experience on the platform and remember your preferences."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "حقوقك" : "Your Rights"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li>• {isArabic ? "الوصول إلى بياناتك الشخصية" : "Access your personal data"}</li>
              <li>• {isArabic ? "تصحيح المعلومات غير الدقيقة" : "Correct inaccurate information"}</li>
              <li>• {isArabic ? "حذف حسابك وبياناتك" : "Delete your account and data"}</li>
              <li>• {isArabic ? "الاعتراض على معالجة بياناتك" : "Object to processing your data"}</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              {isArabic ? "آخر تحديث: 2024" : "Last updated: 2024"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
