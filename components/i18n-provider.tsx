"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Locale = "en" | "fr"|"ha"

export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

// Import translation files
import enTranslations from "../lib/i18n/locales/en.json"
import frTranslations from "../lib/i18n/locales/fr.json"
import haTranslations from "../lib/i18n/locales/ha.json"

// Combine translations into a single object


const translations = {
  en: enTranslations,
  fr: frTranslations,
  ha: haTranslations,
}

// Helper function to get nested object values by dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    // Get locale from localStorage or browser language
    const storedLocale = localStorage.getItem("locale") as Locale | null
    const browserLocale = (navigator.language.slice(0, 2) as Locale) || "en"
    const initialLocale: Locale = storedLocale || (["en", "fr", "ha"].includes(browserLocale) ? browserLocale : "en")
    setLocale(initialLocale)
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  const t = (key: string): string => {
    return getNestedValue(translations[locale], key)
  }

  const value: I18nContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
