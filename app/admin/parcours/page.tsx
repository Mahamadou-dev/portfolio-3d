'use client';

// app/admin/parcours/page.tsx
// Gestion de la frise du parcours (formation / experience) : creation,
// edition, publication, suppression.
import { useEffect, useState } from 'react';
import { Button, Field, TextArea, TextInput, Toggle } from '../../../components/admin/Field';
import { invalidateContentCache } from '../../../hooks/useContent';
import type { ParcoursDoc } from '../../../lib/db/types';

function blank(): ParcoursDoc {
  const year = new Date().getFullYear();
  return {
    slug: '',
    type: 'education',
    title: { fr: '', en: '', ha: '' },
    institution: { fr: '', en: '', ha: '' },
    location: { fr: '', en: '', ha: '' },
    description: { fr: '', en: '', ha: '' },
    achievements: { fr: '' },
    subjects: { fr: '' },
    technologies: { fr: '' },
    start: year,
    end: null,
    published: true,
    order: 999,
    createdAt: '',
    updatedAt: '',
  };
}

export default function AdminParcoursPage() {
  const [items, setItems] = useState<ParcoursDoc[]>([]);
  const [editing, setEditing] = useState<ParcoursDoc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/parcours?all=1', { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Chargement impossible');
      setItems((data.items ?? []).sort((a: ParcoursDoc, b: ParcoursDoc) => a.start - b.start));
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
      isNew ? '/api/content/parcours' : `/api/content/parcours/${editing.slug}`,
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

  const remove = async (milestone: ParcoursDoc) => {
    if (!confirm(`Supprimer définitivement « ${milestone.title.fr} » ?`)) return;
    const res = await fetch(`/api/content/parcours/${milestone.slug}`, {
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

  const togglePublished = async (milestone: ParcoursDoc) => {
    await fetch(`/api/content/parcours/${milestone.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ published: !milestone.published }),
    });
    invalidateContentCache();
    await reload();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Parcours</h1>
          <p className="text-sm text-gray-500">{items.length} étape(s)</p>
        </div>
        <Button
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
        >
          + Nouvelle étape
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
        <div className="grid gap-3">
          {items.map((milestone) => (
            <article
              key={milestone.slug}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5
                         bg-white p-4 dark:border-white/10 dark:bg-gray-900"
            >
              <div className="w-16 shrink-0 text-right text-sm font-mono text-gray-500">
                {milestone.start}
                {milestone.end ? `–${milestone.end}` : milestone.end === null ? ' →' : ''}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{milestone.title.fr}</h2>
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] capitalize text-gray-500 dark:bg-white/10">
                    {milestone.type === 'education' ? 'Formation' : 'Expérience'}
                  </span>
                  {!milestone.published && (
                    <span className="rounded-full bg-gray-500/15 px-2 py-0.5 text-[11px] text-gray-500">
                      brouillon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                  {milestone.institution.fr} · {milestone.location.fr}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => togglePublished(milestone)}>
                  {milestone.published ? 'Dépublier' : 'Publier'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing({
                      ...milestone,
                      title: { ...milestone.title },
                      institution: { ...milestone.institution },
                      location: { ...milestone.location },
                      description: { ...milestone.description },
                      achievements: { ...milestone.achievements },
                      subjects: { ...milestone.subjects },
                      technologies: { ...milestone.technologies },
                    });
                    setIsNew(false);
                  }}
                >
                  Modifier
                </Button>
                <Button variant="danger" onClick={() => remove(milestone)}>
                  Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
        >
          <div
            className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">
              {isNew ? 'Nouvelle étape' : `Modifier « ${editing.title.fr} »`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Type">
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value as ParcoursDoc['type'] })
                  }
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                >
                  <option value="education" className="dark:bg-gray-900">Formation</option>
                  <option value="experience" className="dark:bg-gray-900">Expérience</option>
                </select>
              </Field>

              <Field label="Année de début">
                <TextInput
                  type="number"
                  value={editing.start}
                  onChange={(e) => setEditing({ ...editing, start: Number(e.target.value) })}
                />
              </Field>

              <Field label="Année de fin" hint="Vide = toujours en cours.">
                <TextInput
                  type="number"
                  value={editing.end ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, end: e.target.value === '' ? null : Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre">
                <TextInput
                  value={editing.title.fr}
                  onChange={(e) => setEditing({ ...editing, title: { ...editing.title, fr: e.target.value } })}
                />
              </Field>
              <Field label="Établissement / structure">
                <TextInput
                  value={editing.institution.fr}
                  onChange={(e) =>
                    setEditing({ ...editing, institution: { ...editing.institution, fr: e.target.value } })
                  }
                />
              </Field>
              <Field label="Lieu">
                <TextInput
                  value={editing.location.fr}
                  onChange={(e) =>
                    setEditing({ ...editing, location: { ...editing.location, fr: e.target.value } })
                  }
                />
              </Field>
              <Field label="Slug" hint="Laisser vide pour le générer.">
                <TextInput
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  disabled={!isNew}
                />
              </Field>
            </div>

            <Field label="Description">
              <TextArea
                rows={3}
                value={editing.description.fr}
                onChange={(e) =>
                  setEditing({ ...editing, description: { ...editing.description, fr: e.target.value } })
                }
              />
            </Field>

            <Field label="Réalisations" hint="Une par ligne.">
              <TextArea
                rows={3}
                value={editing.achievements.fr}
                onChange={(e) =>
                  setEditing({ ...editing, achievements: { ...editing.achievements, fr: e.target.value } })
                }
              />
            </Field>

            {editing.type === 'education' ? (
              <Field label="Matières" hint="Une par ligne.">
                <TextArea
                  rows={3}
                  value={editing.subjects.fr}
                  onChange={(e) =>
                    setEditing({ ...editing, subjects: { ...editing.subjects, fr: e.target.value } })
                  }
                />
              </Field>
            ) : (
              <Field label="Technologies" hint="Une par ligne.">
                <TextArea
                  rows={3}
                  value={editing.technologies.fr}
                  onChange={(e) =>
                    setEditing({ ...editing, technologies: { ...editing.technologies, fr: e.target.value } })
                  }
                />
              </Field>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <Field label="Ordre" hint="Départage les étapes d'une même année.">
                <TextInput
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                />
              </Field>
              <Toggle
                label="Publié"
                checked={editing.published}
                onChange={(published) => setEditing({ ...editing, published })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button onClick={save} disabled={!editing.title.fr.trim() || !editing.institution.fr.trim()}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
