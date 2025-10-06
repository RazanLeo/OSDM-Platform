"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as Locale
  const t = getDictionary(locale)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Check for admin credentials
    if (username === "Razan@OSDM" && password === "RazanOSDM@056300") {
      console.log("[v0] Admin login successful")
      router.push(`/${locale}/dashboard/admin`)
      return
    }

    // Regular user login logic would go here
    console.log("[v0] User login attempt:", { username, rememberMe })
    router.push(`/${locale}/dashboard/user`)
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
            {t.loginTitle}
          </CardTitle>
          <CardDescription>{t.platformTagline}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t.username}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-2"
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
                className="border-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {t.rememberMe}
                </Label>
              </div>
              <Link href="#" className="text-sm text-[#4691A9] hover:underline">
                {t.forgotPassword}
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90"
            >
              {t.loginButton}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t.dontHaveAccount}{" "}
              <Link href={`/${locale}/auth/register`} className="text-[#4691A9] hover:underline font-medium">
                {t.registerHere}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
