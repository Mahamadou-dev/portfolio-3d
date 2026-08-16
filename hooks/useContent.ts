'use client';

// hooks/useContent.ts
// Acces au contenu editorial (projets / certifications) servi par l'API.
// Un cache module evite de refaire l'appel a chaque navigation entre onglets.
import { useCallback, useEffect, useState } from 'react';
import type { ProjectDoc, CertificationDoc, LocalizedText } from '../lib/db/types';

type Kind = 'projects' | 'certifications';

interface CacheEntry<T> {
  items: T[];
  source: string;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry<any>>();

async function load<T>(kind: Kind, all: boolean): Promise<CacheEntry<T>> {
  const key = `${kind}:${all ? 'all' : 'public'}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit;

  const res = await fetch(`/api/content/${kind}${all ? '?all=1' : ''}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`Chargement ${kind} impossible (${res.status})`);

  const data = await res.json();
  const entry: CacheEntry<T> = {
    items: data.items ?? [],
    source: data.source ?? 'db',
    fetchedAt: Date.now(),
  };
  cache.set(key, entry);
  return entry;
}

/** Vide le cache : a appeler apres une ecriture depuis le tableau de bord. */
export function invalidateContentCache() {
  cache.clear();
}

export function useContent<T = ProjectDoc>(kind: Kind, options: { all?: boolean } = {}) {
  const all = options.all ?? false;
  const [items, setItems] = useState<T[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (force = false) => {
      if (force) invalidateContentCache();
      setLoading(true);
      setError(null);
      try {
        const entry = await load<T>(kind, all);
        setItems(entry.items);
        setSource(entry.source);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    },
    [kind, all]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const entry = await load<T>(kind, all);
        if (cancelled) return;
        setItems(entry.items);
        setSource(entry.source);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, all]);

  return { items, source, loading, error, refresh };
}

export const useProjects = (all = false) => useContent<ProjectDoc>('projects', { all });
export const useCertifications = (all = false) =>
  useContent<CertificationDoc>('certifications', { all });

/** Choisit la bonne langue avec repli sur le francais puis l'anglais. */
export function pickLocale(text: LocalizedText | string | undefined, locale: string): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  const byLocale = text as unknown as Record<string, string | undefined>;
  return byLocale[locale] || text.fr || text.en || '';
}
