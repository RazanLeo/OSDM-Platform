"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Locale, defaultLocale } from "./config"
import { getDictionary } from "./get-dictionary"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getDictionary>
  isRTL: boolean
  dir: "rtl" | "ltr"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get locale from localStorage or default
    const savedLocale = (localStorage.getItem("locale") as Locale) || defaultLocale
    setLocaleState(savedLocale)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save to localStorage
      localStorage.setItem("locale", locale)

      // Update document attributes
      document.documentElement.lang = locale
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    }
  }, [locale, mounted])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  const t = getDictionary(locale)
  const isRTL = locale === "ar"
  const dir = isRTL ? "rtl" : "ltr"

  if (!mounted) {
    // Return a basic context during SSR
    return (
      <LanguageContext.Provider
        value={{
          locale: defaultLocale,
          setLocale: () => {},
          t: getDictionary(defaultLocale),
          isRTL: defaultLocale === "ar",
          dir: defaultLocale === "ar" ? "rtl" : "ltr",
        }}
      >
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
