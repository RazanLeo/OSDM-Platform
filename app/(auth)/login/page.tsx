"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("بيانات الدخول غير صحيحة. الرجاء المحاولة مرة أخرى.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  // Quick login buttons for testing
  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        identifier: userEmail,
        password: userPassword,
        redirect: false,
      })

      if (result?.error) {
        setError("بيانات الدخول غير صحيحة. الرجاء المحاولة مرة أخرى.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#846F9C]/10 via-[#4691A9]/10 to-[#89A58F]/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#846F9C] via-[#4691A9] to-[#89A58F] flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">OSDM</span>
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            مرحباً بك في منصة OSDM - السوق الرقمي ذو المحطة الواحدة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@osdm.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                dir="ltr"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                أو استخدم حساب تجريبي
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => quickLogin("razan@osdm.sa", "RazanOSDM@056300")}
              disabled={isLoading}
            >
              <div className="flex flex-col items-start w-full">
                <span className="font-semibold">رزان - المدير الرئيسي</span>
                <span className="text-xs text-muted-foreground">razan@osdm.sa</span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => quickLogin("admin@osdm.sa", "123456")}
              disabled={isLoading}
            >
              <div className="flex flex-col items-start w-full">
                <span className="font-semibold">مدير - حساب تجريبي</span>
                <span className="text-xs text-muted-foreground">admin@osdm.sa / 123456</span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => quickLogin("Guest@osdm.sa", "123456")}
              disabled={isLoading}
            >
              <div className="flex flex-col items-start w-full">
                <span className="font-semibold">ضيف - مستخدم عادي</span>
                <span className="text-xs text-muted-foreground">Guest@osdm.sa / 123456</span>
              </div>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>ليس لديك حساب؟{" "}
              <a href="/register" className="text-primary hover:underline">
                سجل الآن
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
