import { Suspense } from "react"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { LoginForm } from "@/components/auth/LoginForm"
import { Loader2 } from "lucide-react"

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale
  const t = getDictionary(locale)

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4691A9]" />
          </div>
        }
      >
        <LoginForm
          locale={locale}
          translations={{
            loginTitle: t.loginTitle,
            platformTagline: t.platformTagline,
            emailOrUsername: t.emailOrUsername,
            password: t.password,
            rememberMe: t.rememberMe,
            forgotPassword: t.forgotPassword,
            loginButton: t.loginButton,
            dontHaveAccount: t.dontHaveAccount,
            registerHere: t.registerHere,
            invalidCredentials: t.invalidCredentials,
            accountSuspended: t.accountSuspended,
            loginError: t.loginError,
          }}
        />
      </Suspense>
    </div>
  )
}
