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
  const [adminCreated, setAdminCreated] = useState(false)

  const handleVerify = () => {
    if (code === SECRET_CODE) {
      setVerified(true)
      setMessage("✅ تم التحقق بنجاح")
    } else {
      setMessage("❌ الكود السري خاطئ")
    }
  }

  const handleCreateAdmin = async () => {
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch('/api/setup/create-admin', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success || res.ok) {
        setAdminCreated(true)
        setMessage("✅ تم إنشاء حساب المدير بنجاح!")
      } else {
        setMessage(data.message || "المدير موجود بالفعل")
      }
    } catch (err: any) {
      setMessage("❌ خطأ: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🔒 إعداد الإدارة</CardTitle>
          <CardDescription>صفحة سرية - أدخلي الكود</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!verified ? (
            <>
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-sm text-red-800">⚠️ صفحة محمية - الكود لديكِ فقط</p>
              </div>

              <div>
                <Label>الكود السري</Label>
                <Input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخلي الكود السري"
                />
              </div>

              <Button onClick={handleVerify} className="w-full">
                تحقق من الكود
              </Button>
            </>
          ) : !adminCreated ? (
            <>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-800">✅ تم التحقق</p>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء حساب المدير"}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded space-y-2">
                <p className="font-bold text-green-800">✅ تم إنشاء المدير بنجاح!</p>
                <div className="text-sm space-y-1 mt-3">
                  <p className="font-semibold">بيانات الدخول:</p>
                  <p>Username: <code className="bg-white px-2 py-1 rounded">Razan@OSDM</code></p>
                  <p>Password: <code className="bg-white px-2 py-1 rounded">RazanOSDM@056300</code></p>
                </div>
              </div>

              <Button
                onClick={() => router.push('/ar/auth/login')}
                className="w-full"
              >
                الذهاب لتسجيل الدخول →
              </Button>
            </>
          )}

          {message && (
            <div className="text-center text-sm p-2 bg-gray-100 rounded">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
