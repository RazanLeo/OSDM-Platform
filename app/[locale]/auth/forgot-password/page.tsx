"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export default function ForgotPasswordPage() {
  const params = useParams()
  const locale = params.locale as Locale
  const t = getDictionary(locale)
  const isArabic = locale === "ar"

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: isArabic
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
            : 'Password reset link sent to your email'
        })
        setEmail("")
      } else {
        setMessage({
          type: 'error',
          text: data.error || (isArabic ? 'حدث خطأ' : 'An error occurred')
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: isArabic ? 'حدث خطأ في الاتصال' : 'Connection error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
            {isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"
              : "Enter your email to reset your password"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  required
                  disabled={isLoading}
                  className="border-2 pr-10"
                  dir={isArabic ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {isArabic
                  ? "سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
                  : "A password reset link will be sent to your email"}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isArabic ? "جاري الإرسال..." : "Sending..."}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {isArabic ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                </>
              )}
            </Button>

            <Link
              href={`/${locale}/auth/login`}
              className="flex items-center justify-center text-sm text-[#4691A9] hover:underline font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isArabic ? "العودة لتسجيل الدخول" : "Back to Login"}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
