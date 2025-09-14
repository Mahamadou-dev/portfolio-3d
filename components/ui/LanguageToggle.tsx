'use client';

import { useState } from 'react';

export default function LanguageToggle() {
  const [isFrench, setIsFrench] = useState(false);

  const toggleLanguage = () => {
    setIsFrench(!isFrench);
    // Ici vous intégrerez la logique i18n complète
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-full glass-effect text-sm font-medium transition-all duration-300 hover:scale-105"
      aria-label="Toggle language"
    >
      {isFrench ? 'EN' : 'FR'}
    </button>
  );
}