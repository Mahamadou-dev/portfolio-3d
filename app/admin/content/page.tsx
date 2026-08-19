'use client';

// app/admin/content/page.tsx
//
// Éditeur de contenu dynamique du site.
// Permet de modifier les textes affichés dans chaque section sans toucher
// au code source. Les valeurs éditées sont stockées dans MongoDB et
// fusionnées avec les traductions statiques côté client.
import { useEffect, useState, useCallback } from 'react';

type Locale = 'fr' | 'en' | 'ha';
type OverrideMap = Record<string, string>;
type AllOverrides = Record<Locale, OverrideMap>;

// Groupes de clés éditables, classées par section
const SECTIONS: {
  label: string;
  icon: string;
  keys: { key: string; label: string; multiline?: boolean }[];
}[] = [
  {
    label: 'Hero',
    icon: '🏠',
    keys: [
      { key: 'hero.greeting', label: 'Salutation (ex: "Barka dey, moi c\'est")' },
      { key: 'hero.name', label: 'Nom affiché' },
      { key: 'hero.description', label: 'Description courte (supporte <strong>)', multiline: true },
      { key: 'hero.buttons.viewWork', label: 'Bouton — Voir mes projets' },
      { key: 'hero.buttons.contact', label: 'Bouton — Me contacter' },
    ],
  },
  {
    label: 'À propos',
    icon: '👤',
    keys: [
      { key: 'about.title', label: 'Titre de section' },
      { key: 'about.introduction', label: 'Phrase d\'introduction' },
      { key: 'about.a_young_student', label: 'Accroche (ex: Un jeune ingénieur)' },
      { key: 'about.niger', label: 'Nationalité en majuscule' },
      { key: 'about.residing_in_tunisia_and_it_passionated', label: 'Suite de l\'accroche', multiline: true },
      { key: 'about.currently_studies', label: 'Paragraph formation', multiline: true },
      { key: 'about.also_the_founder_and_ceo_of', label: 'Intro fondateur' },
      { key: 'about.tiamtech_description', label: 'Description GremahTech / TiamTech', multiline: true },
      { key: 'about.anest_post', label: 'Poste ANEST', multiline: true },
      { key: 'about.download_my_resume_button_text', label: 'Bouton CV' },
      { key: 'about.personalInfo.age.value', label: 'Âge (utiliser {age} pour dynamique)' },
      { key: 'about.personalInfo.nationality.value', label: 'Nationalité' },
      { key: 'about.personalInfo.location.value', label: 'Localisation' },
      { key: 'about.personalInfo.availability.value', label: 'Disponibilité' },
    ],
  },
  {
    label: 'Contact',
    icon: '📬',
    keys: [
      { key: 'contact.title', label: 'Titre de section' },
      { key: 'contact.subtitle', label: 'Sous-titre' },
      { key: 'contact.workTogether.title', label: 'Titre "Travaillons ensemble"' },
      { key: 'contact.workTogether.description', label: 'Description "Travaillons ensemble"', multiline: true },
      { key: 'contact.info.email.value', label: 'Adresse e-mail affichée' },
      { key: 'contact.info.email.href', label: 'Lien mailto:' },
      { key: 'contact.info.location.value', label: 'Localisation affichée' },
      { key: 'contact.info.phone1.value', label: 'Téléphone 1' },
      { key: 'contact.info.phone1.href', label: 'Lien tel: (Téléphone 1)' },
      { key: 'contact.info.phone2.value', label: 'Téléphone 2' },
      { key: 'contact.info.phone2.href', label: 'Lien tel: (Téléphone 2)' },
    ],
  },
  {
    label: 'Compétences',
    icon: '🛠️',
    keys: [
      { key: 'skills.title', label: 'Titre de section' },
      { key: 'skills.lead', label: 'Paragraphe intro', multiline: true },
      { key: 'skills.recent_technologies_intro', label: 'Intro technologies récentes', multiline: true },
      { key: 'skills.strengthsTitle', label: 'Titre "Points forts"' },
    ],
  },
  {
    label: 'Expérience',
    icon: '🎓',
    keys: [
      { key: 'experience.title', label: 'Titre de section' },
      { key: 'experience.subtitle', label: 'Sous-titre', multiline: true },
    ],
  },
  {
    label: 'Portfolio',
    icon: '🗂️',
    keys: [
      { key: 'portfolio.title', label: 'Eyebrow (ex: "04")' },
      { key: 'portfolio.subtitle', label: 'Titre principal' },
      { key: 'portfolio.search', label: 'Placeholder recherche' },
      { key: 'portfolio.noResults', label: 'Message aucun résultat' },
      { key: 'portfolio.techUsed', label: 'Label "Technologies utilisées"' },
    ],
  },
  {
    label: 'Navigation & Footer',
    icon: '🧭',
    keys: [
      { key: 'header.nav.home', label: 'Nav — Accueil' },
      { key: 'header.nav.about', label: 'Nav — À propos' },
      { key: 'header.nav.skills', label: 'Nav — Compétences' },
      { key: 'header.nav.education', label: 'Nav — Éducation' },
      { key: 'header.nav.portfolio', label: 'Nav — Portfolio' },
      { key: 'header.nav.contact', label: 'Nav — Contact' },
      { key: 'footer.copyright', label: 'Copyright ({{year}} disponible)' },
      { key: 'footer.builtWith', label: 'Construit avec' },
    ],
  },
];

const LOCALE_LABELS: Record<Locale, string> = { fr: '🇫🇷 Français', en: '🇬🇧 English', ha: '🇳🇪 Haoussa' };

const card = 'rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900';

export default function ContentPage() {
  const [locale, setLocale] = useState<Locale>('fr');
  const [overrides, setOverrides] = useState<AllOverrides>({ fr: {}, en: {}, ha: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>('Hero');

  // Charge les overrides existants
  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/site-content', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data: AllOverrides) => setOverrides(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const setValue = useCallback((key: string, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
    setSaved(false);
  }, [locale]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(overrides),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (key: string) => {
    setOverrides((prev) => {
      const next = { ...prev[locale] };
      delete next[key];
      return { ...prev, [locale]: next };
    });
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} h-24 animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contenu du site</h1>
          <p className="mt-1 text-sm text-gray-500">
            Modifiez les textes affichés sur le site sans toucher au code.
            Les changements sont appliqués en temps réel après sauvegarde.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de langue */}
          <div className="inline-flex rounded-lg border border-black/10 p-1 dark:border-white/10">
            {(['fr', 'en', 'ha'] as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  locale === loc
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>Astuce :</strong> Laissez un champ vide pour utiliser la traduction par défaut du fichier JSON.
        Les overrides que vous saisissez ici ont priorité sur les traductions statiques.
      </div>

      {/* Sections accordéon */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openSection === section.label;
          // Compte les overrides actifs dans cette section pour cette locale
          const activeCount = section.keys.filter(
            ({ key }) => (overrides[locale]?.[key] ?? '') !== ''
          ).length;

          return (
            <div key={section.label} className={card}>
              {/* En-tête de section */}
              <button
                onClick={() => setOpenSection(isOpen ? '' : section.label)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>{section.icon}</span>
                  <span className="font-semibold">{section.label}</span>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {activeCount} modifié{activeCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span
                  className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                  ▼
                </span>
              </button>

              {/* Champs */}
              {isOpen && (
                <div className="mt-5 space-y-4 border-t border-black/5 pt-5 dark:border-white/10">
                  {section.keys.map(({ key, label, multiline }) => {
                    const currentValue = overrides[locale]?.[key] ?? '';
                    const isModified = currentValue !== '';
                    return (
                      <div key={key}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </label>
                          <div className="flex items-center gap-2">
                            {isModified && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                Modifié
                              </span>
                            )}
                            {isModified && (
                              <button
                                onClick={() => handleReset(key)}
                                title="Supprimer l'override (revenir au défaut)"
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                Réinitialiser
                              </button>
                            )}
                          </div>
                        </div>
                        <code className="mb-1 block text-[10px] text-gray-400">{key}</code>
                        {multiline ? (
                          <textarea
                            value={currentValue}
                            onChange={(e) => setValue(key, e.target.value)}
                            rows={3}
                            placeholder="Laisser vide pour utiliser la valeur par défaut…"
                            className={`w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-blue-500 dark:bg-gray-800 dark:placeholder:text-gray-600 ${
                              isModified
                                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                : 'border-black/10 bg-white dark:border-white/10'
                            }`}
                          />
                        ) : (
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => setValue(key, e.target.value)}
                            placeholder="Laisser vide pour utiliser la valeur par défaut…"
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-blue-500 dark:bg-gray-800 dark:placeholder:text-gray-600 ${
                              isModified
                                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                : 'border-black/10 bg-white dark:border-white/10'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bouton de sauvegarde flottant */}
      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          {saving ? '⏳ Sauvegarde en cours…' : saved ? '✅ Changements sauvegardés' : '💾 Sauvegarder tous les changements'}
        </button>
      </div>
    </div>
  );
}
