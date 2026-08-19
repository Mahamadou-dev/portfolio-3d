// contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Le theme reellement en vigueur, lu de la meme facon que le script
 * synchrone de app/layout.tsx : preference enregistree si elle existe,
 * sinon reglage du systeme.
 *
 * Cette fonction corrige deux defauts de la version precedente :
 *
 *   - L'etat partait de `'dark'` en dur, et un `useEffect` ne le corrigeait
 *     qu'apres le montage. Une personne dont le systeme est en clair et qui
 *     n'avait jamais choisi voyait donc le site en sombre — l'ancien code
 *     ne testait `prefers-color-scheme` que pour confirmer le sombre, jamais
 *     pour revenir au clair.
 *   - Le second effet ecrivait `theme` dans localStorage des le premier
 *     rendu. Ce choix par defaut se trouvait donc grave immediatement, et
 *     le site cessait definitivement de suivre le reglage du systeme.
 *
 * Ici, la lecture est synchrone (initialiseur paresseux de useState), donc
 * l'etat React est d'emblee d'accord avec la classe posee sur <html> par le
 * script du layout : aucun flash, aucune correction apres coup.
 */
function readTheme(): Theme {
  // Rendu serveur : on n'a acces ni au stockage ni aux medias. La valeur
  // n'est jamais peinte telle quelle — le script du layout tranche avant.
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Stockage indisponible (navigation privee stricte) : on retombe sur
    // la preference systeme plutot que de planter.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Le theme suit le systeme tant que la personne n'a pas choisi
  // explicitement. Sans cet ecouteur, basculer son OS en mode sombre le
  // soir laissait le site en clair jusqu'au prochain rechargement.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('theme')) return; // choix explicite : on n'y touche pas
      } catch {
        /* stockage indisponible : on suit le systeme */
      }
      setTheme(e.matches ? 'dark' : 'light');
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // L'ecriture n'a lieu qu'ici, sur une action deliberee : c'est le clic
  // qui grave la preference, pas le simple fait d'avoir visite la page.
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* stockage indisponible : le theme vaut pour la session */
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
