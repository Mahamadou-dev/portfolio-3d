'use client';

// app/admin/projects/page.tsx
// Gestion des projets : creation, edition, publication, suppression.
// Aucune modification de code n'est necessaire pour ajouter un projet.
import { useEffect, useState } from 'react';
import { Button, Field, TextArea, TextInput, Toggle } from '../../../components/admin/Field';
import { TECH_REGISTRY } from '../../../lib/tech-icons';
import type { ProjectDoc } from '../../../lib/db/types';

const CATEGORIES = ['web', 'mobile', 'ia', 'backend', 'desktop', 'systeme'];

/** Projet vierge : les valeurs par defaut d'un nouvel enregistrement. */
function blank(): ProjectDoc {
  return {
    slug: '',
    title: '',
    description: { fr: '', en: '', ha: '' },
    technologies: [],
    image: '',
    github: '',
    liveUrl: '',
    category: 'web',
    featured: false,
    published: true,
    order: 999,
    stars: 0,
    forks: 0,
    createdAt: '',
    updatedAt: '',
  };
}

export default function AdminProjectsPage() {
  const [items, setItems] = useState<ProjectDoc[]>([]);
  const [editing, setEditing] = useState<ProjectDoc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/projects?all=1', { credentials: 'same-origin' });
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

    // Les technologies sont saisies en texte libre : on convertit en tags.
    const payload = { ...editing };

    const res = await fetch(
      isNew ? '/api/content/projects' : `/api/content/projects/${editing.slug}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Enregistrement impossible');
      setStatus(null);
      return;
    }

    setStatus('Enregistré ✓');
    setEditing(null);
    await reload();
    setTimeout(() => setStatus(null), 2500);
  };

  const remove = async (project: ProjectDoc) => {
    if (!confirm(`Supprimer définitivement « ${project.title} » ?`)) return;
    const res = await fetch(`/api/content/projects/${project.slug}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Suppression impossible');
      return;
    }
    await reload();
  };

  const togglePublished = async (project: ProjectDoc) => {
    await fetch(`/api/content/projects/${project.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ published: !project.published }),
    });
    await reload();
  };

  /** Saisie des technologies : une liste de cles separees par des virgules. */
  const techValue = editing?.technologies.map((t) => t.icon).join(', ') ?? '';
  const setTechValue = (raw: string) => {
    if (!editing) return;
    const technologies = raw
      .split(',')
      .map((chunk) => chunk.trim().toLowerCase())
      .filter(Boolean)
      .map((key) => ({
        title: TECH_REGISTRY[key]?.label ?? key,
        icon: key,
        color: TECH_REGISTRY[key]?.color ?? '#6b7280',
      }));
    setEditing({ ...editing, technologies });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projets</h1>
          <p className="text-sm text-gray-500">{items.length} enregistrement(s)</p>
        </div>
        <Button
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
        >
          + Nouveau projet
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
          {items.map((project) => (
            <article
              key={project.slug}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5
                         bg-white p-4 dark:border-white/10 dark:bg-gray-900"
            >
              <img
                src={project.image || '/logo2.png'}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{project.title}</h2>
                  {project.featured && (
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-600 dark:text-blue-300">
                      mis en avant
                    </span>
                  )}
                  {!project.published && (
                    <span className="rounded-full bg-gray-500/15 px-2 py-0.5 text-[11px] text-gray-500">
                      brouillon
                    </span>
                  )}
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] capitalize text-gray-500 dark:bg-white/10">
                    {project.category}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                  {project.description?.fr}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {project.slug} · ★ {project.stars} · ⑂ {project.forks}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => togglePublished(project)}>
                  {project.published ? 'Dépublier' : 'Publier'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing({ ...project, description: { ...project.description } });
                    setIsNew(false);
                  }}
                >
                  Modifier
                </Button>
                <Button variant="danger" onClick={() => remove(project)}>
                  Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Formulaire */}
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
              {isNew ? 'Nouveau projet' : `Modifier « ${editing.title} »`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre">
                <TextInput
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>

              <Field label="Slug" hint="Laisser vide pour le générer depuis le titre.">
                <TextInput
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  disabled={!isNew}
                />
              </Field>
            </div>

            <Field label="Description (français)">
              <TextArea
                rows={3}
                value={editing.description.fr}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: { ...editing.description, fr: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Description (anglais)" hint="Facultatif — repli sur le français.">
              <TextArea
                rows={3}
                value={editing.description.en ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: { ...editing.description, en: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Description (haoussa)" hint="Facultatif.">
              <TextArea
                rows={2}
                value={editing.description.ha ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: { ...editing.description, ha: e.target.value },
                  })
                }
              />
            </Field>

            <Field
              label="Technologies"
              hint={`Clés séparées par des virgules. Disponibles : ${Object.keys(TECH_REGISTRY)
                .slice(0, 14)
                .join(', ')}…`}
            >
              <TextInput value={techValue} onChange={(e) => setTechValue(e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Image" hint="Chemin dans /public (ex : /Electro.png) ou URL.">
                <TextInput
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </Field>

              <Field label="Catégorie">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="dark:bg-gray-900">
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Dépôt GitHub" hint="Laisser vide si le dépôt est privé.">
                <TextInput
                  value={editing.github}
                  onChange={(e) => setEditing({ ...editing, github: e.target.value })}
                />
              </Field>

              <Field label="Démo en ligne">
                <TextInput
                  value={editing.liveUrl}
                  onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                />
              </Field>

              <Field label="Ordre d’affichage" hint="Plus petit = affiché en premier.">
                <TextInput
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                />
              </Field>

              <div className="flex items-end gap-5 pb-2">
                <Toggle
                  label="Mis en avant"
                  checked={editing.featured}
                  onChange={(featured) => setEditing({ ...editing, featured })}
                />
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
              <Button onClick={save} disabled={!editing.title.trim() || !editing.description.fr.trim()}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
