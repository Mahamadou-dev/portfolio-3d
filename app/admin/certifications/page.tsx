'use client';

// app/admin/certifications/page.tsx
import { useEffect, useState } from 'react';
import { Button, Field, TextArea, TextInput, Toggle } from '../../../components/admin/Field';
import type { CertificationDoc } from '../../../lib/db/types';

function blank(): CertificationDoc {
  return {
    slug: '',
    title: '',
    issuer: '',
    description: { fr: '', en: '', ha: '' },
    date: String(new Date().getFullYear()),
    image: '',
    credentialUrl: '',
    skills: [],
    published: true,
    order: 999,
    createdAt: '',
    updatedAt: '',
  };
}

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<CertificationDoc[]>([]);
  const [editing, setEditing] = useState<CertificationDoc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/certifications?all=1', { credentials: 'same-origin' });
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
      isNew ? '/api/content/certifications' : `/api/content/certifications/${editing.slug}`,
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

    setStatus('Enregistré ✓');
    setEditing(null);
    await reload();
    setTimeout(() => setStatus(null), 2500);
  };

  const remove = async (cert: CertificationDoc) => {
    if (!confirm(`Supprimer définitivement « ${cert.title} » ?`)) return;
    await fetch(`/api/content/certifications/${cert.slug}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    await reload();
  };

  const togglePublished = async (cert: CertificationDoc) => {
    await fetch(`/api/content/certifications/${cert.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ published: !cert.published }),
    });
    await reload();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Certifications</h1>
          <p className="text-sm text-gray-500">{items.length} enregistrement(s)</p>
        </div>
        <Button
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
        >
          + Nouvelle certification
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
          {items.map((cert) => (
            <article
              key={cert.slug}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5
                         bg-white p-4 dark:border-white/10 dark:bg-gray-900"
            >
              <img
                src={cert.image || '/logo2.png'}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{cert.title}</h2>
                  {!cert.published && (
                    <span className="rounded-full bg-gray-500/15 px-2 py-0.5 text-[11px] text-gray-500">
                      brouillon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {cert.issuer} · {cert.date}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {cert.skills.slice(0, 5).join(' · ')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => togglePublished(cert)}>
                  {cert.published ? 'Dépublier' : 'Publier'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing({ ...cert, description: { ...cert.description } });
                    setIsNew(false);
                  }}
                >
                  Modifier
                </Button>
                <Button variant="danger" onClick={() => remove(cert)}>
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
              {isNew ? 'Nouvelle certification' : `Modifier « ${editing.title} »`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Intitulé">
                <TextInput
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>

              <Field label="Organisme émetteur">
                <TextInput
                  value={editing.issuer}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                />
              </Field>

              <Field label="Date" hint="Année ou MM/AAAA.">
                <TextInput
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                />
              </Field>

              <Field label="Slug" hint="Généré automatiquement si vide.">
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

            <Field label="Description (anglais)" hint="Facultatif.">
              <TextArea
                rows={2}
                value={editing.description.en ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: { ...editing.description, en: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Compétences" hint="Séparées par des virgules.">
              <TextInput
                value={editing.skills.join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    skills: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Image" hint="Chemin dans /public ou URL.">
                <TextInput
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </Field>

              <Field label="Lien du justificatif">
                <TextInput
                  value={editing.credentialUrl}
                  onChange={(e) => setEditing({ ...editing, credentialUrl: e.target.value })}
                />
              </Field>

              <Field label="Ordre d’affichage">
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
              <Button
                onClick={save}
                disabled={
                  !editing.title.trim() || !editing.issuer.trim() || !editing.description.fr.trim()
                }
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
