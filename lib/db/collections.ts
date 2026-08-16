// lib/db/collections.ts
import type { Collection } from 'mongodb';
import { getDb } from './mongodb';
import type { ProjectDoc, CertificationDoc, VisitDoc } from './types';

export const COLLECTIONS = {
  projects: 'projects',
  certifications: 'certifications',
  visits: 'visits',
} as const;

export async function projectsCol(): Promise<Collection<ProjectDoc>> {
  const db = await getDb();
  return db.collection<ProjectDoc>(COLLECTIONS.projects);
}

export async function certificationsCol(): Promise<Collection<CertificationDoc>> {
  const db = await getDb();
  return db.collection<CertificationDoc>(COLLECTIONS.certifications);
}

export async function visitsCol(): Promise<Collection<VisitDoc>> {
  const db = await getDb();
  return db.collection<VisitDoc>(COLLECTIONS.visits);
}

/**
 * Cree les index attendus. Idempotent — appele par `pnpm db:setup`.
 */
export async function ensureIndexes(): Promise<string[]> {
  const created: string[] = [];
  const projects = await projectsCol();
  const certifications = await certificationsCol();
  const visits = await visitsCol();

  await projects.createIndex({ slug: 1 }, { unique: true });
  await projects.createIndex({ published: 1, order: 1 });
  created.push('projects.slug (unique)', 'projects.published+order');

  await certifications.createIndex({ slug: 1 }, { unique: true });
  await certifications.createIndex({ published: 1, order: 1 });
  created.push('certifications.slug (unique)', 'certifications.published+order');

  await visits.createIndex({ createdAt: -1 });
  await visits.createIndex({ sessionId: 1, path: 1 });
  await visits.createIndex({ visitorHash: 1 });
  created.push('visits.createdAt', 'visits.sessionId+path', 'visits.visitorHash');

  return created;
}
