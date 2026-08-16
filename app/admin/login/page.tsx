'use client';

// app/admin/login/page.tsx
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Connexion impossible');
      router.replace(params.get('next') || '/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/80
                 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/80"
    >
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">Accès réservé.</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Identifiant</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm
                     outline-none focus:border-blue-500 dark:border-white/15"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm
                     outline-none focus:border-blue-500 dark:border-white/15"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-2.5
                   text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
