"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Key } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Failed to create admin',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup/create-admin')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Failed to check admin',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Key className="h-16 w-16 text-purple-600" />
          </div>
          <CardTitle className="text-3xl">OSDM Platform Setup</CardTitle>
          <CardDescription className="text-lg mt-2">
            Initial Admin Account Creation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Instructions:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200 text-sm">
              <li>Click "Check Admin Status" to see if admin exists</li>
              <li>If no admin exists, click "Create Admin User"</li>
              <li>Use the credentials below to login</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={checkAdmin}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Check Admin Status
            </Button>

            <Button
              onClick={createAdmin}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Admin User
            </Button>
          </div>

          {result && (
            <div className={`rounded-lg p-4 ${
              result.success || result.exists
                ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.success || result.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-2">
                  <p className={`font-semibold ${
                    result.success || result.exists ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.message || 'Operation completed'}
                  </p>

                  {result.credentials && (
                    <div className="bg-white dark:bg-gray-800 rounded p-3 mt-3 space-y-2">
                      <h4 className="font-semibold text-sm">🔑 Login Credentials:</h4>
                      <div className="font-mono text-sm space-y-1">
                        <div><strong>Username:</strong> {result.credentials.username}</div>
                        <div><strong>Password:</strong> {result.credentials.password}</div>
                        <div><strong>Email:</strong> {result.credentials.email}</div>
                      </div>
                      <Button
                        asChild
                        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <a href={result.loginUrl || '/ar/auth/login'}>
                          Go to Login Page →
                        </a>
                      </Button>
                    </div>
                  )}

                  {result.admin && (
                    <div className="bg-white dark:bg-gray-800 rounded p-3 mt-3 space-y-1 text-sm">
                      <h4 className="font-semibold">✓ Existing Admin:</h4>
                      <div><strong>Username:</strong> {result.admin.username}</div>
                      <div><strong>Email:</strong> {result.admin.email}</div>
                      <div><strong>Role:</strong> {result.admin.role}</div>
                      <Button
                        asChild
                        className="w-full mt-3"
                      >
                        <a href="/ar/auth/login">
                          Go to Login Page →
                        </a>
                      </Button>
                    </div>
                  )}

                  {result.error && (
                    <div className="text-red-700 dark:text-red-300 text-sm mt-2">
                      <strong>Error:</strong> {result.details || result.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠️ Security Note:
            </h3>
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              This setup page should be disabled or protected in production.
              It's only meant for initial deployment setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
