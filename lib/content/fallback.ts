// lib/content/fallback.ts
// Contenu de secours : si MongoDB n'est pas encore configure (ou injoignable),
// le site public continue de fonctionner avec les donnees des fichiers i18n.
import fr from '../i18n/locales/fr.json';
import en from '../i18n/locales/en.json';
import ha from '../i18n/locales/ha.json';
import type { ProjectDoc, CertificationDoc } from '../db/types';

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type RawProject = {
  id: number;
  title: string;
  description: string;
  technologies: { title: string; icon: string; color: string }[];
  image: string;
  github: string;
  liveUrl: string;
  numberOfBranches: number;
  numberOfLikes: number;
};

type RawCert = {
  id: number;
  title: string;
  issuer: string;
  description: string;
  date: string;
  image: string;
  credentialUrl: string;
  skills: string[];
};

const now = new Date(0).toISOString();

function byId<T extends { id: number }>(list: T[], id: number): T | undefined {
  return list.find((x) => x.id === id);
}

export function fallbackProjects(): ProjectDoc[] {
  const base = (fr as any).portfolio.projects as RawProject[];
  const enList = (en as any).portfolio.projects as RawProject[];
  const haList = (ha as any).portfolio.projects as RawProject[];

  return base.map((p, index) => ({
    slug: slugify(p.title),
    title: p.title,
    description: {
      fr: p.description,
      en: byId(enList, p.id)?.description,
      ha: byId(haList, p.id)?.description,
    },
    technologies: p.technologies.map((t) => ({
      title: t.title,
      icon: slugify(t.icon || t.title),
      color: t.color,
    })),
    image: p.image,
    github: p.github,
    liveUrl: p.liveUrl,
    category: 'web',
    featured: index < 3,
    published: true,
    order: index,
    stars: p.numberOfLikes ?? 0,
    forks: p.numberOfBranches ?? 0,
    createdAt: now,
    updatedAt: now,
  }));
}

export function fallbackCertifications(): CertificationDoc[] {
  const base = (fr as any).portfolio.certifications as RawCert[];
  const enList = (en as any).portfolio.certifications as RawCert[];
  const haList = (ha as any).portfolio.certifications as RawCert[];

  return base.map((c, index) => ({
    slug: slugify(`${c.title}-${c.issuer}`),
    title: c.title,
    issuer: c.issuer,
    description: {
      fr: c.description,
      en: byId(enList, c.id)?.description,
      ha: byId(haList, c.id)?.description,
    },
    date: c.date,
    image: c.image,
    credentialUrl: c.credentialUrl,
    skills: c.skills,
    published: true,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));
}
