// lib/db/types.ts
// Modeles partages entre le site public, les routes API et le tableau de bord.

/** Texte multilingue. `fr` est la langue de reference (toujours remplie). */
export interface LocalizedText {
  fr: string;
  en?: string;
  ha?: string;
}

export interface TechTag {
  title: string;
  /** Cle d'icone (voir lib/tech-icons.tsx) — ex: "react", "nextjs". */
  icon: string;
  color: string;
}

export interface ProjectDoc {
  _id?: string;
  /** Identifiant lisible et stable, ex: "gremah-electro". */
  slug: string;
  title: string;
  description: LocalizedText;
  technologies: TechTag[];
  image: string;
  github: string;
  liveUrl: string;
  /** Categorie libre : "web", "mobile", "ai", "desktop", "backend"... */
  category: string;
  /** Mis en avant en tete de liste. */
  featured: boolean;
  /** Masque du site public sans etre supprime. */
  published: boolean;
  /** Ordre d'affichage croissant. */
  order: number;
  stars: number;
  forks: number;
  /** Metadonnees synchronisees depuis GitHub. */
  github_meta?: {
    repo: string;
    language: string | null;
    topics: string[];
    pushedAt: string;
    syncedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CertificationDoc {
  _id?: string;
  slug: string;
  title: string;
  issuer: string;
  description: LocalizedText;
  /** Annee ou "MM/YYYY". */
  date: string;
  image: string;
  credentialUrl: string;
  skills: string[];
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Un evenement de visite (une page vue). */
export interface VisitDoc {
  _id?: string;
  /** Identifiant de session anonyme (cookie 1re partie, 30 min). */
  sessionId: string;
  /** Empreinte IP salee + hachee — jamais l'IP en clair. */
  visitorHash: string;
  path: string;
  referrer: string | null;
  /** Source deduite : "direct", "google", "linkedin", "github"... */
  source: string;
  /** Parametres de campagne si presents. */
  utm: { source?: string; medium?: string; campaign?: string };
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string | null;
  browser: string | null;
  browserVersion: string | null;
  screen: string | null;
  /** Duree passee sur la page en secondes (mise a jour au depart). */
  durationSec: number;
  /** Evenements d'interaction agreges pour cette vue. */
  events: { name: string; value?: string; at: string }[];
  isBot: boolean;
  createdAt: string;
}
