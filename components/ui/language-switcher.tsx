'use client';

// components/ui/language-switcher.tsx
//
// Le selecteur de langue.
//
// Le fichier contenait, avant le composant lui-meme, une copie complete
// d'un bouton shadcn/ui (`cva` avec sept variantes, `Slot` de Radix) dont
// une seule variante etait utilisee — et dont toutes les couleurs
// (`bg-primary`, `bg-accent`, `border-border`) venaient de l'ancien
// systeme de tokens. Ce bouton n'etait importe nulle part ailleurs. Il
// laisse place a un bouton simple, et le composant perd deux dependances.
//
// Le bouton portait aussi la classe `animate-glow` : une pulsation
// lumineuse infinie sur le selecteur de langue de l'en-tete, c'est-a-dire
// un clignotement permanent dans le champ de vision, en haut de chaque
// page.
import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, type Locale } from '../i18n-provider';

const languages: Record<Locale, { name: string; code: string }> = {
  en: { name: 'English', code: 'EN' },
  fr: { name: 'Français', code: 'FR' },
  ha: { name: 'Hausa', code: 'HA' },
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // Fermeture au clic exterieur et a la touche Echap. Sans cela, le menu
  // restait ouvert jusqu'a ce qu'on reclique sur le bouton — y compris
  // pendant qu'on faisait defiler la page.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!container.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Changer de langue"
        className="flex items-center gap-1.5 rounded-md px-2 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Globe size={17} aria-hidden="true" />
        {/* Le code de langue est affiche a cote du globe : un globe seul
            n'indique pas quelle langue est active. */}
        <span className="font-mono text-xs">{languages[locale]?.code ?? 'FR'}</span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-e3"
        >
          {(Object.keys(languages) as Locale[]).map((code) => {
            const active = locale === code;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                    active ? 'font-medium text-ink' : 'text-muted'
                  }`}
                >
                  <span>{languages[code].name}</span>
                  {active ? (
                    <Check size={14} className="text-accent" aria-hidden="true" />
                  ) : (
                    <span className="font-mono text-xs text-faint">{languages[code].code}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
