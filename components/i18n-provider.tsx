"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Locale = "en" | "fr" | "ha"

export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  /**
   * Lecture d'une valeur de type liste.
   *
   * `t` ne renvoie que des chaines : toute autre valeur retombe sur la cle
   * elle-meme. C'est un bon garde-fou — il rend visible une cle manquante
   * au lieu d'afficher « [object Object] » — mais il rend du meme coup les
   * tableaux du fichier de traductions inatteignables.
   *
   * Or il y en a, et ils portent du contenu reel : les specialites du
   * hero (`hero.typewriterPhrases`), et pour chaque etape du parcours ses
   * realisations, ses matieres et ses technologies. Sans cet accesseur,
   * le hero affichait la chaine « hero.typewriterPhrases » a la place de
   * la liste, et les etapes du parcours s'ouvraient sur des sections
   * vides.
   */
  tList: (key: string) => string[]
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

// Lecture brute d'une valeur par dot notation dans un objet imbriqué
const getNestedRaw = (obj: Record<string, unknown>, path: string): unknown =>
  path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)

// Valeur texte. Une clé absente, ou qui pointe sur autre chose qu'une
// chaîne, se signale en affichant son propre chemin : c'est visible en
// relecture, contrairement à une chaîne vide.
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const result = getNestedRaw(obj, path)
  return typeof result === 'string' ? result : path
}

// Valeur liste. Une clé absente donne une liste vide plutôt que le chemin :
// afficher « experience.work.anest.achievements » comme une puce de liste
// serait pire que de n'afficher aucune puce.
const getNestedList = (obj: Record<string, unknown>, path: string): string[] => {
  const result = getNestedRaw(obj, path)
  return Array.isArray(result) ? result.filter((item): item is string => typeof item === 'string') : []
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

  const tList = useCallback((key: string): string[] => {
    return getNestedList(merged, key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, overrides])

  const value: I18nContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
    tList,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
