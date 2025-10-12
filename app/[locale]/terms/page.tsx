import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const isArabic = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
        {isArabic ? "شروط الاستخدام" : "Terms of Service"}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "قبول الشروط" : "Acceptance of Terms"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "باستخدامك لمنصة OSDM، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة."
                : "By using the OSDM platform, you agree to comply with these terms and conditions. If you do not agree to these terms, please do not use the platform."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "حقوق والتزامات المستخدم" : "User Rights and Obligations"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li>• {isArabic ? "يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام المنصة" : "You must be at least 18 years old to use the platform"}</li>
              <li>• {isArabic ? "يجب تقديم معلومات صحيحة ودقيقة عند التسجيل" : "You must provide accurate and truthful information during registration"}</li>
              <li>• {isArabic ? "أنت مسؤول عن الحفاظ على سرية حسابك" : "You are responsible for maintaining the confidentiality of your account"}</li>
              <li>• {isArabic ? "يحظر استخدام المنصة لأي أغراض غير قانونية" : "Using the platform for any illegal purposes is prohibited"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "المحتوى والملكية الفكرية" : "Content and Intellectual Property"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "جميع المحتويات المنشورة على المنصة محمية بحقوق الملكية الفكرية. البائعون مسؤولون عن ضمان امتلاكهم لجميع الحقوق اللازمة للمحتوى الذي يبيعونه."
                : "All content published on the platform is protected by intellectual property rights. Sellers are responsible for ensuring they own all necessary rights to the content they sell."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "المدفوعات والرسوم" : "Payments and Fees"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "تحتفظ OSDM بنسبة عمولة من كل عملية بيع تتم عبر المنصة. يتم توضيح الرسوم بشكل واضح قبل إتمام أي معاملة."
                : "OSDM retains a commission percentage from each sale made through the platform. Fees are clearly stated before completing any transaction."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "إنهاء الحساب" : "Account Termination"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "نحتفظ بالحق في إيقاف أو إنهاء أي حساب ينتهك شروط الاستخدام أو يشارك في أنشطة احتيالية."
                : "We reserve the right to suspend or terminate any account that violates the terms of use or engages in fraudulent activities."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "تحديث الشروط" : "Updates to Terms"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "قد نقوم بتحديث هذه الشروط من وقت لآخر. سيتم إشعارك بأي تغييرات جوهرية."
                : "We may update these terms from time to time. You will be notified of any material changes."}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {isArabic ? "آخر تحديث: 2024" : "Last updated: 2024"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
