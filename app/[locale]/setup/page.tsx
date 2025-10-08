"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const SECRET_CODE = "OSDM_ADMIN_2025_RAZAN"

export default function SetupPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleVerify = () => {
    if (code === SECRET_CODE) {
      setVerified(true)
      setMessage("✅ تم التحقق! يمكنك إنشاء المدير الآن")
    } else {
      setMessage("❌ الكود خاطئ")
    }
  }

  const handleCreateAdmin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()

      if (data.success) {
        setMessage("✅ تم إنشاء المدير! جاري التحويل...")
        setTimeout(() => router.push('/ar/auth/login'), 2000)
      } else {
        setMessage("❌ " + (data.message || "خطأ"))
      }
    } catch (err) {
      setMessage("❌ خطأ في الاتصال")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🔒 إعداد المدير</CardTitle>
          <CardDescription>صفحة سرية - للإدارة فقط</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!verified ? (
            <>
              <div className="bg-amber-50 p-3 rounded">
                <p className="text-sm">الكود السري:</p>
                <code className="text-xs bg-white px-2 py-1 rounded">
                  OSDM_ADMIN_2025_RAZAN
                </code>
              </div>

              <div>
                <Label>أدخل الكود السري</Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="OSDM_ADMIN_2025_RAZAN"
                />
              </div>

              <Button
                onClick={handleVerify}
                className="w-full"
              >
                تحقق من الكود
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-800">✅ تم التحقق بنجاح</p>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء حساب المدير"}
              </Button>

              <div className="bg-blue-50 p-3 rounded text-xs">
                <p>بيانات الدخول:</p>
                <p>Username: Razan@OSDM</p>
                <p>Password: RazanOSDM@056300</p>
              </div>
            </>
          )}

          {message && (
            <div className="text-center text-sm p-2 bg-gray-50 rounded">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
