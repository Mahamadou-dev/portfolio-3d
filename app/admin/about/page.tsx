'use client';

// app/admin/about/page.tsx
// Gestion du contenu de la section A propos (portrait, recit, informations
// personnelles). Contenu singleton : un seul enregistrement a modifier.
import { useEffect, useState } from 'react';
import { Button, Field, TextArea, TextInput } from '../../../components/admin/Field';
import { invalidateAboutCache } from '../../../hooks/useContent';
import type { AboutDoc } from '../../../lib/db/types';

function blank(): AboutDoc {
  return {
    name: '',
    image: '',
    captionLocation: '',
    captionYear: '',
    story: [{ fr: '' }, { fr: '' }, { fr: '' }, { fr: '' }],
    gremahtechUrl: '',
    resumeUrl: '',
    facts: [
      { label: { fr: '' }, value: { fr: '' } },
      { label: { fr: '' }, value: { fr: '' } },
      { label: { fr: '' }, value: { fr: '' } },
      { label: { fr: '' }, value: { fr: '' } },
    ],
    updatedAt: '',
  };
}

export default function AdminAboutPage() {
  const [doc, setDoc] = useState<AboutDoc>(blank());
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/content/about', { credentials: 'same-origin' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Chargement impossible');
        const item = data.item as AboutDoc;
        // Complete a 4 paragraphes / 4 faits si le contenu existant en a moins.
        while (item.story.length < 4) item.story.push({ fr: '' });
        while (item.facts.length < 4) item.facts.push({ label: { fr: '' }, value: { fr: '' } });
        setDoc(item);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chargement impossible');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setStatus('Enregistrement…');
    setError(null);
    const res = await fetch('/api/content/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(doc),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Enregistrement impossible');
      setStatus(null);
      return;
    }
    invalidateAboutCache();
    setStatus('Enregistré ✓');
    setTimeout(() => setStatus(null), 2500);
  };

  const setStory = (i: number, fr: string) => {
    const story = [...doc.story];
    story[i] = { ...story[i], fr };
    setDoc({ ...doc, story });
  };

  const setFact = (i: number, field: 'label' | 'value', fr: string) => {
    const facts = [...doc.facts];
    facts[i] = { ...facts[i], [field]: { ...facts[i][field], fr } };
    setDoc({ ...doc, facts });
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">À propos</h1>
          <p className="text-sm text-gray-500">Portrait, récit et informations personnelles.</p>
        </div>
        <Button onClick={save}>{status ?? 'Enregistrer'}</Button>
      </header>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
        <h2 className="font-semibold">Portrait</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom affiché">
            <TextInput value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} />
          </Field>
          <Field label="Image" hint="Chemin dans /public ou URL.">
            <TextInput value={doc.image} onChange={(e) => setDoc({ ...doc, image: e.target.value })} />
          </Field>
          <Field label="Légende — lieu">
            <TextInput
              value={doc.captionLocation}
              onChange={(e) => setDoc({ ...doc, captionLocation: e.target.value })}
            />
          </Field>
          <Field label="Légende — année">
            <TextInput
              value={doc.captionYear}
              onChange={(e) => setDoc({ ...doc, captionYear: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
        <h2 className="font-semibold">Récit</h2>
        <p className="text-xs text-gray-500">
          4 paragraphes affichés dans l'ordre. Utilisez le jeton <code>{'{gremahtech}'}</code> à
          l'endroit où le lien vers GremahTech doit apparaître.
        </p>
        {doc.story.map((p, i) => (
          <Field key={i} label={`Paragraphe ${i + 1}`}>
            <TextArea rows={2} value={p.fr} onChange={(e) => setStory(i, e.target.value)} />
          </Field>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lien GremahTech">
            <TextInput
              value={doc.gremahtechUrl}
              onChange={(e) => setDoc({ ...doc, gremahtechUrl: e.target.value })}
            />
          </Field>
          <Field label="Lien CV">
            <TextInput
              value={doc.resumeUrl}
              onChange={(e) => setDoc({ ...doc, resumeUrl: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
        <h2 className="font-semibold">Informations personnelles</h2>
        <p className="text-xs text-gray-500">
          Le jeton <code>{'{age}'}</code> dans une valeur est remplacé par l'âge calculé automatiquement.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {doc.facts.map((fact, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-black/5 p-3 dark:border-white/10">
              <Field label="Étiquette">
                <TextInput value={fact.label.fr} onChange={(e) => setFact(i, 'label', e.target.value)} />
              </Field>
              <Field label="Valeur">
                <TextInput value={fact.value.fr} onChange={(e) => setFact(i, 'value', e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save}>{status ?? 'Enregistrer'}</Button>
      </div>
    </div>
  );
}
