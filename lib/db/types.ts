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

export type SkillDomain = 'ai' | 'security' | 'engineering';
export type SkillCategory =
  | 'machine_learning'
  | 'cybersecurity'
  | 'backend'
  | 'frontend'
  | 'mobile'
  | 'tools'
  | 'design';
export type SkillTier = 'core' | 'working' | 'learning';

export interface SkillDoc {
  _id?: string;
  slug: string;
  name: string;
  /** Cle d'icone (voir lib/skill-icons.tsx) — ex: "react", "python". */
  icon: string;
  color: string;
  domain: SkillDomain;
  category: SkillCategory;
  tier: SkillTier;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParcoursDoc {
  _id?: string;
  slug: string;
  type: 'education' | 'experience';
  title: LocalizedText;
  institution: LocalizedText;
  location: LocalizedText;
  description: LocalizedText;
  /** Une ligne par element. */
  achievements: LocalizedText;
  /** Education uniquement. */
  subjects: LocalizedText;
  /** Experience uniquement (education utilise `subjects`). */
  technologies: LocalizedText;
  /** Annee de debut : determine l'ordre de la frise. */
  start: number;
  /** Annee de fin, ou null si l'etape est toujours en cours. */
  end: number | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AboutFact {
  label: LocalizedText;
  /** Peut contenir le jeton {age}, remplace cote client par l'age reel. */
  value: LocalizedText;
}

export interface AboutDoc {
  _id?: string;
  name: string;
  image: string;
  captionLocation: string;
  captionYear: string;
  /**
   * Paragraphes du recit, dans l'ordre. Le jeton {gremahtech} dans un
   * paragraphe est remplace par un lien vers `gremahtechUrl`.
   */
  story: LocalizedText[];
  gremahtechUrl: string;
  resumeUrl: string;
  facts: AboutFact[];
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
  /**
   * true une fois que le navigateur a donne signe de vie (quelques secondes
   * sur la page, ou une interaction). Distingue un vrai visiteur d'un scanner
   * qui charge et repart — sans jamais se fier a l'IP.
   */
  confirmed: boolean;
  createdAt: string;
}
