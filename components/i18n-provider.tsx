"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Locale = "en" | "fr" | "ha"

export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

// Traductions statiques (fichiers JSON compilés)
import enTranslations from "../lib/i18n/locales/en.json"
import frTranslations from "../lib/i18n/locales/fr.json"
import haTranslations from "../lib/i18n/locales/ha.json"

const staticTranslations: Record<Locale, Record<string, unknown>> = {
  en: enTranslations as Record<string, unknown>,
  fr: frTranslations as Record<string, unknown>,
  ha: haTranslations as Record<string, unknown>,
}

// Overrides chargés depuis MongoDB (clé pointée "hero.name" → valeur)
type OverrideMap = Record<string, string>
type AllOverrides = Record<Locale, OverrideMap>

// Fusionne les overrides plats (dot notation) dans l'objet de traductions.
// Les overrides ont priorité sur les JSON statiques.
function applyOverrides(
  base: Record<string, unknown>,
  overrides: OverrideMap
): Record<string, unknown> {
  // Copie profonde légère via JSON
  const merged = JSON.parse(JSON.stringify(base)) as Record<string, unknown>
  for (const [dotKey, value] of Object.entries(overrides)) {
    const parts = dotKey.split('.')
    let cursor: Record<string, unknown> = merged
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cursor[parts[i]] !== 'object' || cursor[parts[i]] === null) {
        cursor[parts[i]] = {}
      }
      cursor = cursor[parts[i]] as Record<string, unknown>
    }
    cursor[parts[parts.length - 1]] = value
  }
  return merged
}

// Lecture d'une valeur par dot notation dans un objet imbriqué
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const result = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
  return typeof result === 'string' ? result : path
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
  const [overrides, setOverrides] = useState<AllOverrides>({ fr: {}, en: {}, ha: {} })

  // Charge la locale depuis localStorage / navigateur
  useEffect(() => {
    const storedLocale = localStorage.getItem("locale") as Locale | null
    const browserLocale = (navigator.language.slice(0, 2) as Locale) || "en"
    const initialLocale: Locale =
      storedLocale || (["en", "fr", "ha"].includes(browserLocale) ? browserLocale : "en")
    setLocale(initialLocale)
  }, [])

  // Charge les overrides depuis MongoDB (une seule fois au montage)
  useEffect(() => {
    fetch('/api/content/site-overrides')
      .then((r) => r.ok ? r.json() : { fr: {}, en: {}, ha: {} })
      .then((data: AllOverrides) => setOverrides(data))
      .catch(() => { /* on garde les overrides vides */ })
  }, [])

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }, [])

  // Traductions effectives = statiques + overrides MongoDB
  const merged = applyOverrides(staticTranslations[locale], overrides[locale] ?? {})

  const t = useCallback((key: string): string => {
    return getNestedValue(merged, key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, overrides])

  const value: I18nContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
