// lib/content/validate.ts
// Validation/normalisation des payloads du tableau de bord. Volontairement
// sans dependance externe : les formes sont simples et stables.
import type { ProjectDoc, CertificationDoc, LocalizedText, TechTag } from '../db/types';
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
