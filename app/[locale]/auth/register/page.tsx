"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as Locale
  const t = getDictionary(locale)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    accountType: "individual",
  })

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Registration attempt:", formData)
    // Registration logic would go here
    router.push(`/${locale}/auth/login`)
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
            {t.registerTitle}
          </CardTitle>
          <CardDescription>{t.platformTagline}</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t.username}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.accountType}</Label>
              <RadioGroup
                value={formData.accountType}
                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer">
                    {t.individual}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company" className="cursor-pointer">
                    {t.companyType}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] hover:opacity-90"
            >
              {t.registerButton}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t.alreadyHaveAccount}{" "}
              <Link href={`/${locale}/auth/login`} className="text-[#4691A9] hover:underline font-medium">
                {t.loginHere}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
