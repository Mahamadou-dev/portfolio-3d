// lib/content/validate.ts
// Validation/normalisation des payloads du tableau de bord. Volontairement
// sans dependance externe : les formes sont simples et stables.
import type {
  ProjectDoc,
  CertificationDoc,
  LocalizedText,
  TechTag,
  SkillDoc,
  SkillDomain,
  SkillCategory,
  SkillTier,
  ParcoursDoc,
  AboutDoc,
  AboutFact,
} from '../db/types';
import { slugify } from './fallback';

export class ValidationError extends Error {}

function str(value: unknown, field: string, { required = false, max = 2000 } = {}): string {
  if (value == null) {
    if (required) throw new ValidationError(`Champ requis manquant : ${field}`);
    return '';
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} doit etre du texte`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new ValidationError(`Champ requis vide : ${field}`);
  if (trimmed.length > max) throw new ValidationError(`${field} depasse ${max} caracteres`);
  return trimmed;
}

function localized(value: unknown, field: string): LocalizedText {
  if (typeof value === 'string') return { fr: str(value, field, { required: true }) };
  if (!value || typeof value !== 'object') {
    throw new ValidationError(`${field} doit etre du texte ou un objet {fr,en,ha}`);
  }
  const v = value as Record<string, unknown>;
  const out: LocalizedText = { fr: str(v.fr, `${field}.fr`, { required: true }) };
  const en = str(v.en, `${field}.en`);
  const ha = str(v.ha, `${field}.ha`);
  if (en) out.en = en;
  if (ha) out.ha = ha;
  return out;
}

function url(value: unknown, field: string): string {
  const raw = str(value, field, { max: 500 });
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw) && !raw.startsWith('/')) {
    throw new ValidationError(`${field} doit etre une URL http(s) ou un chemin /public`);
  }
  return raw;
}

function techs(value: unknown): TechTag[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((raw, i) => {
    const t = (raw ?? {}) as Record<string, unknown>;
    const title = str(t.title, `technologies[${i}].title`, { required: true, max: 40 });
    return {
      title,
      icon: slugify(str(t.icon, `technologies[${i}].icon`) || title),
      color: str(t.color, `technologies[${i}].color`, { max: 32 }) || '#6b7280',
    };
  });
}

export function normalizeProject(body: unknown, existing?: ProjectDoc): ProjectDoc {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = str(b.title, 'title', { required: true, max: 120 });
  const stamp = new Date().toISOString();

  return {
    slug: slugify(str(b.slug, 'slug') || existing?.slug || title),
    title,
    description: localized(b.description ?? existing?.description, 'description'),
    technologies: techs(b.technologies ?? existing?.technologies ?? []),
    image: url(b.image ?? existing?.image, 'image'),
    github: url(b.github ?? existing?.github, 'github'),
    liveUrl: url(b.liveUrl ?? existing?.liveUrl, 'liveUrl'),
    category: str(b.category, 'category', { max: 40 }) || existing?.category || 'web',
    featured: Boolean(b.featured ?? existing?.featured ?? false),
    published: Boolean(b.published ?? existing?.published ?? true),
    order: Number.isFinite(Number(b.order)) ? Number(b.order) : (existing?.order ?? 999),
    stars: Math.max(0, Number(b.stars ?? existing?.stars ?? 0) || 0),
    forks: Math.max(0, Number(b.forks ?? existing?.forks ?? 0) || 0),
    github_meta: (b.github_meta as ProjectDoc['github_meta']) ?? existing?.github_meta,
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}

const SKILL_DOMAINS: SkillDomain[] = ['ai', 'security', 'engineering'];
const SKILL_CATEGORIES: SkillCategory[] = [
  'machine_learning',
  'cybersecurity',
  'backend',
  'frontend',
  'mobile',
  'tools',
  'design',
];
const SKILL_TIERS: SkillTier[] = ['core', 'working', 'learning'];

function oneOf<T extends string>(value: unknown, allowed: T[], field: string, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError(`${field} doit etre l'une de : ${allowed.join(', ')}`);
  }
  return value as T;
}

export function normalizeSkill(body: unknown, existing?: SkillDoc): SkillDoc {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, 'name', { required: true, max: 60 });
  const stamp = new Date().toISOString();

  return {
    slug: slugify(str(b.slug, 'slug') || existing?.slug || name),
    name,
    icon: slugify(str(b.icon, 'icon') || existing?.icon || name),
    color: str(b.color, 'color', { max: 32 }) || existing?.color || '#6b7280',
    domain: oneOf(b.domain ?? existing?.domain, SKILL_DOMAINS, 'domain', 'engineering'),
    category: oneOf(b.category ?? existing?.category, SKILL_CATEGORIES, 'category', 'tools'),
    tier: oneOf(b.tier ?? existing?.tier, SKILL_TIERS, 'tier', 'working'),
    published: Boolean(b.published ?? existing?.published ?? true),
    order: Number.isFinite(Number(b.order)) ? Number(b.order) : (existing?.order ?? 999),
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}

export function normalizeParcours(body: unknown, existing?: ParcoursDoc): ParcoursDoc {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = localized(b.title ?? existing?.title, 'title');
  const stamp = new Date().toISOString();
  const type = oneOf(b.type ?? existing?.type, ['education', 'experience'], 'type', 'education');

  const rawEnd = b.end ?? existing?.end ?? null;
  const end = rawEnd === null || rawEnd === '' || rawEnd === undefined ? null : Number(rawEnd);
  if (end !== null && !Number.isFinite(end)) throw new ValidationError('end doit etre un nombre ou vide');

  return {
    slug: slugify(str(b.slug, 'slug') || existing?.slug || `${type}-${title.fr}`),
    type,
    title,
    institution: localized(b.institution ?? existing?.institution, 'institution'),
    location: localized(b.location ?? existing?.location, 'location'),
    description: localized(b.description ?? existing?.description, 'description'),
    achievements: localized(b.achievements ?? existing?.achievements ?? { fr: '' }, 'achievements'),
    subjects: localized(b.subjects ?? existing?.subjects ?? { fr: '' }, 'subjects'),
    technologies: localized(b.technologies ?? existing?.technologies ?? { fr: '' }, 'technologies'),
    start: Number.isFinite(Number(b.start)) ? Number(b.start) : (existing?.start ?? new Date().getFullYear()),
    end,
    published: Boolean(b.published ?? existing?.published ?? true),
    order: Number.isFinite(Number(b.order)) ? Number(b.order) : (existing?.order ?? 999),
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}

function facts(value: unknown): AboutFact[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((raw, i) => {
    const f = (raw ?? {}) as Record<string, unknown>;
    return {
      label: localized(f.label, `facts[${i}].label`),
      value: localized(f.value, `facts[${i}].value`),
    };
  });
}

function paragraphs(value: unknown): LocalizedText[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((raw, i) => localized(raw, `story[${i}]`));
}

export function normalizeAbout(body: unknown, existing?: AboutDoc): AboutDoc {
  const b = (body ?? {}) as Record<string, unknown>;
  const stamp = new Date().toISOString();

  return {
    name: str(b.name, 'name', { required: true, max: 120 }) || existing?.name || '',
    image: url(b.image ?? existing?.image, 'image'),
    captionLocation: str(b.captionLocation, 'captionLocation', { max: 120 }) || existing?.captionLocation || '',
    captionYear: str(b.captionYear, 'captionYear', { max: 20 }) || existing?.captionYear || '',
    story: paragraphs(b.story ?? existing?.story ?? []),
    gremahtechUrl: url(b.gremahtechUrl ?? existing?.gremahtechUrl, 'gremahtechUrl'),
    resumeUrl: url(b.resumeUrl ?? existing?.resumeUrl, 'resumeUrl'),
    facts: facts(b.facts ?? existing?.facts ?? []),
    updatedAt: stamp,
  };
}

export function normalizeCertification(
  body: unknown,
  existing?: CertificationDoc
): CertificationDoc {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = str(b.title, 'title', { required: true, max: 160 });
  const issuer = str(b.issuer, 'issuer', { required: true, max: 120 });
  const stamp = new Date().toISOString();

  return {
    slug: slugify(str(b.slug, 'slug') || existing?.slug || `${title}-${issuer}`),
    title,
    issuer,
    description: localized(b.description ?? existing?.description, 'description'),
    date: str(b.date, 'date', { max: 20 }) || existing?.date || '',
    image: url(b.image ?? existing?.image, 'image'),
    credentialUrl: url(b.credentialUrl ?? existing?.credentialUrl, 'credentialUrl'),
    skills: Array.isArray(b.skills)
      ? (b.skills as unknown[]).slice(0, 20).map((s, i) => str(s, `skills[${i}]`, { max: 60 })).filter(Boolean)
      : (existing?.skills ?? []),
    published: Boolean(b.published ?? existing?.published ?? true),
    order: Number.isFinite(Number(b.order)) ? Number(b.order) : (existing?.order ?? 999),
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}
