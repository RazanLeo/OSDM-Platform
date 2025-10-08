"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface LoginFormProps {
  locale: string
  translations: {
    loginTitle: string
    platformTagline: string
    emailOrUsername: string
    password: string
    rememberMe: string
    forgotPassword: string
    loginButton: string
    dontHaveAccount: string
    registerHere: string
    invalidCredentials: string
    accountSuspended: string
    loginError: string
  }
}

export function LoginForm({ locale, translations: t }: LoginFormProps) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "Account suspended") {
          setError(t.accountSuspended)
        } else {
          setError(t.invalidCredentials)
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Fetch user role to redirect appropriately
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (session?.user?.role === "ADMIN") {
          router.push(`/${locale}/dashboard/admin`)
        } else {
          // All regular users go to unified dashboard
          router.push(`/${locale}/dashboard`)
        }

        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(t.loginError)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
          {t.loginTitle}
        </CardTitle>
        <CardDescription>{t.platformTagline}</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="identifier">{t.emailOrUsername}</Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Razan@OSDM أو razan@osdm.sa"
              required
              disabled={isLoading}
              className="border-2"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                {t.rememberMe}
              </Label>
            </div>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm text-[#4691A9] hover:underline"
            >
              {t.forgotPassword}
            </Link>
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
                {locale === "ar" ? "جاري تسجيل الدخول..." : "Logging in..."}
              </>
            ) : (
              t.loginButton
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {t.dontHaveAccount}{" "}
            <Link
              href={`/${locale}/auth/register`}
              className="text-[#4691A9] hover:underline font-medium"
            >
              {t.registerHere}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
