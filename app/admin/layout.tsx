'use client';

// app/admin/layout.tsx
// Coquille du tableau de bord : navigation laterale + deconnexion.
// L'authentification est deja verifiee par middleware.ts.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Statistiques', icon: '📊' },
  { href: '/admin/skills', label: 'Compétences', icon: '🛠️' },
  { href: '/admin/parcours', label: 'Parcours', icon: '🎓' },
  { href: '/admin/about', label: 'À propos', icon: '👤' },
  { href: '/admin/projects', label: 'Projets', icon: '🗂️' },
  { href: '/admin/certifications', label: 'Certifications', icon: '🏅' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // La page de connexion a son propre plein ecran, sans la coquille.
  if (pathname?.startsWith('/admin/login')) return <>{children}</>;

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="sticky top-6 space-y-4">
            <Link href="/" className="block text-lg font-bold">
              Gremah<span className="text-blue-500">.admin</span>
            </Link>

            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5'
                    }`}
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden space-y-2 lg:block">
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
              >
                ← Voir le site
              </Link>
              <button
                onClick={logout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
