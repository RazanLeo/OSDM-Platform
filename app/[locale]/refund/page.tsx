import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default async function RefundPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const isArabic = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
        {isArabic ? "سياسة الاسترجاع والاسترداد" : "Refund Policy"}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-[#4691A9]" />
              {isArabic ? "شروط الاسترداد" : "Refund Conditions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              {isArabic
                ? "يمكنك طلب استرداد الأموال خلال 7 أيام من تاريخ الشراء إذا كان المنتج لا يعمل كما هو موصوف أو به عيوب تقنية."
                : "You can request a refund within 7 days of purchase if the product does not work as described or has technical defects."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "حالات الاسترداد المقبولة" : "Acceptable Refund Cases"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li>• {isArabic ? "المنتج تالف أو لا يعمل" : "Product is damaged or not working"}</li>
              <li>• {isArabic ? "المنتج لا يطابق الوصف" : "Product does not match description"}</li>
              <li>• {isArabic ? "لم يتم تسليم المنتج" : "Product was not delivered"}</li>
              <li>• {isArabic ? "المنتج يحتوي على محتوى مقرصن" : "Product contains pirated content"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "حالات عدم قبول الاسترداد" : "Non-Refundable Cases"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="space-y-3">
              <li>• {isArabic ? "تغيير الرأي بعد التحميل" : "Change of mind after download"}</li>
              <li>• {isArabic ? "عدم معرفة كيفية استخدام المنتج" : "Not knowing how to use the product"}</li>
              <li>• {isArabic ? "المنتج لا يتوافق مع احتياجاتك" : "Product does not meet your needs"}</li>
              <li>• {isArabic ? "مرور أكثر من 7 أيام على الشراء" : "More than 7 days have passed since purchase"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "إجراءات طلب الاسترداد" : "Refund Request Process"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ol className="space-y-3">
              <li>1. {isArabic ? "تقديم طلب استرداد من لوحة التحكم" : "Submit refund request from dashboard"}</li>
              <li>2. {isArabic ? "تقديم دليل على المشكلة (لقطات شاشة، إلخ)" : "Provide proof of issue (screenshots, etc.)"}</li>
              <li>3. {isArabic ? "مراجعة الطلب من قبل الإدارة (3-5 أيام عمل)" : "Request review by administration (3-5 business days)"}</li>
              <li>4. {isArabic ? "إذا تمت الموافقة، يتم إرجاع المبلغ خلال 7-14 يوم عمل" : "If approved, amount refunded within 7-14 business days"}</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              {isArabic ? "آخر تحديث: 2024" : "Last updated: 2024"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
