'use client';

// app/admin/skills/page.tsx
// Gestion des competences : creation, edition, publication, suppression.
import { useEffect, useState } from 'react';
import { Button, Field, TextInput, Toggle } from '../../../components/admin/Field';
import { TECH_REGISTRY } from '../../../lib/tech-icons';
import { invalidateContentCache } from '../../../hooks/useContent';
import type { SkillDoc, SkillDomain, SkillCategory, SkillTier } from '../../../lib/db/types';

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  ai: 'Intelligence artificielle',
  security: 'Sécurité des systèmes',
  engineering: 'Ingénierie logicielle',
};

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  machine_learning: 'Machine learning',
  cybersecurity: 'Cybersécurité',
  backend: 'Backend',
  frontend: 'Frontend',
  mobile: 'Mobile',
  tools: 'Outils',
  design: 'Design',
};

const TIER_LABELS: Record<SkillTier, string> = {
  core: 'Courant',
  working: 'Opérationnel',
  learning: 'En apprentissage',
};

function blank(): SkillDoc {
  return {
    slug: '',
    name: '',
    icon: '',
    color: '#6b7280',
    domain: 'engineering',
    category: 'frontend',
    tier: 'working',
    published: true,
    order: 999,
    createdAt: '',
    updatedAt: '',
  };
}

export default function AdminSkillsPage() {
  const [items, setItems] = useState<SkillDoc[]>([]);
  const [editing, setEditing] = useState<SkillDoc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/skills?all=1', { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Chargement impossible');
      setItems(data.items ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const save = async () => {
    if (!editing) return;
    setStatus('Enregistrement…');
    setError(null);

    const res = await fetch(
      isNew ? '/api/content/skills' : `/api/content/skills/${editing.slug}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(editing),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Enregistrement impossible');
      setStatus(null);
      return;
    }

    invalidateContentCache();
    setStatus('Enregistré ✓');
    setEditing(null);
    await reload();
    setTimeout(() => setStatus(null), 2500);
  };

  const remove = async (skill: SkillDoc) => {
    if (!confirm(`Supprimer définitivement « ${skill.name} » ?`)) return;
    const res = await fetch(`/api/content/skills/${skill.slug}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Suppression impossible');
      return;
    }
    invalidateContentCache();
    await reload();
  };

  const togglePublished = async (skill: SkillDoc) => {
    await fetch(`/api/content/skills/${skill.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ published: !skill.published }),
    });
    invalidateContentCache();
    await reload();
  };

  const grouped = items.reduce<Record<string, SkillDoc[]>>((acc, skill) => {
    (acc[skill.domain] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Compétences</h1>
          <p className="text-sm text-gray-500">{items.length} enregistrement(s)</p>
        </div>
        <Button
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
        >
          + Nouvelle compétence
        </Button>
      </header>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {status && (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {status}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <div className="space-y-6">
          {(Object.keys(DOMAIN_LABELS) as SkillDomain[]).map((domain) => {
            const domainItems = (grouped[domain] ?? []).sort((a, b) => a.order - b.order);
            if (domainItems.length === 0) return null;
            return (
              <div key={domain}>
                <h2 className="mb-2 text-sm font-semibold text-gray-500">{DOMAIN_LABELS[domain]}</h2>
                <div className="grid gap-2">
                  {domainItems.map((skill) => {
                    const meta = TECH_REGISTRY[skill.icon];
                    const Icon = meta?.Icon;
                    return (
                      <article
                        key={skill.slug}
                        className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5
                                   bg-white p-3 dark:border-white/10 dark:bg-gray-900"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${skill.color}1a` }}
                        >
                          {Icon ? <Icon className="text-lg" /> : null}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{skill.name}</h3>
                            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-white/10">
                              {CATEGORY_LABELS[skill.category]}
                            </span>
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-600 dark:text-blue-300">
                              {TIER_LABELS[skill.tier]}
                            </span>
                            {!skill.published && (
                              <span className="rounded-full bg-gray-500/15 px-2 py-0.5 text-[11px] text-gray-500">
                                brouillon
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={() => togglePublished(skill)}>
                            {skill.published ? 'Dépublier' : 'Publier'}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditing({ ...skill });
                              setIsNew(false);
                            }}
                          >
                            Modifier
                          </Button>
                          <Button variant="danger" onClick={() => remove(skill)}>
                            Supprimer
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
        >
          <div
            className="my-8 w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">
              {isNew ? 'Nouvelle compétence' : `Modifier « ${editing.name} »`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom">
                <TextInput
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>

              <Field
                label="Icône"
                hint={`Clé du registre. Ex : ${Object.keys(TECH_REGISTRY).slice(0, 10).join(', ')}…`}
              >
                <TextInput
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value.toLowerCase() })}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Domaine">
                <select
                  value={editing.domain}
                  onChange={(e) => setEditing({ ...editing, domain: e.target.value as SkillDomain })}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                >
                  {(Object.keys(DOMAIN_LABELS) as SkillDomain[]).map((d) => (
                    <option key={d} value={d} className="dark:bg-gray-900">
                      {DOMAIN_LABELS[d]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Rubrique">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as SkillCategory })}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                >
                  {(Object.keys(CATEGORY_LABELS) as SkillCategory[]).map((c) => (
                    <option key={c} value={c} className="dark:bg-gray-900">
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Palier">
                <select
                  value={editing.tier}
                  onChange={(e) => setEditing({ ...editing, tier: e.target.value as SkillTier })}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                >
                  {(Object.keys(TIER_LABELS) as SkillTier[]).map((tr) => (
                    <option key={tr} value={tr} className="dark:bg-gray-900">
                      {TIER_LABELS[tr]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Couleur" hint="Couleur de marque, ex : #61DAFB">
                <TextInput
                  value={editing.color}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                />
              </Field>

              <Field label="Ordre" hint="Plus petit = affiché en premier.">
                <TextInput
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                />
              </Field>

              <div className="flex items-end pb-2">
                <Toggle
                  label="Publié"
                  checked={editing.published}
                  onChange={(published) => setEditing({ ...editing, published })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button onClick={save} disabled={!editing.name.trim()}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
