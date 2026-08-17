'use client';

// components/HtmlLang.tsx
// Le layout racine est statique : il ne peut pas connaitre la langue choisie,
// qui vit dans le contexte i18n cote client. Ce composant se contente de
// reporter la langue courante sur <html lang>. C'est ce que lisent les lecteurs
// d'ecran pour choisir leur voix et les moteurs de recherche pour indexer.
import { useEffect } from 'react';
import { useI18n } from './i18n-provider';

export default function HtmlLang() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
