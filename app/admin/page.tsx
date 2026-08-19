'use client';

// app/admin/page.tsx
// Tableau de bord analytique + aperçu du contenu du site.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* ---------- Types renvoyes par l'API ---------- */

interface Bucket {
  label: string;
  count: number;
  avgDuration?: number;
}

interface Analytics {
  days: number;
  totals: {
    pageviews: number;
    confirmed: number;
    visitors: number;
    sessions: number;
    avgDuration: number;
    engagementRate: number;
  };
  daily: { date: string; pageviews: number; visitors: number }[];
  hourly: { hour: number; count: number }[];
  countries: Bucket[];
  cities: Bucket[];
  sources: Bucket[];
  referrers: Bucket[];
  devices: Bucket[];
  browsers: Bucket[];
  systems: Bucket[];
  languages: Bucket[];
  screens: Bucket[];
  pages: Bucket[];
  events: Bucket[];
  recent: {
    createdAt: string;
    path: string;
    country: string | null;
    city: string | null;
    region: string | null;
    source: string;
    referrer: string | null;
    device: string;
    os: string | null;
    browser: string | null;
    language: string | null;
    screen: string | null;
    durationSec: number;
    visitorHash: string;
    eventCount: number;
  }[];
}

/* ---------- Helpers d'affichage ---------- */

const RANGES = [
  { days: 7, label: '7 j' },
  { days: 30, label: '30 j' },
  { days: 90, label: '90 j' },
  { days: 365, label: '1 an' },
];

const COUNTRY_NAMES = new Intl.DisplayNames(['fr'], { type: 'region' });

function countryLabel(code: string) {
  try {
    return `${code} — ${COUNTRY_NAMES.of(code)}`;
  } catch {
    return code;
  }
}

function duration(seconds: number) {
  const total = Math.round(seconds || 0);
  if (total < 60) return `${total} s`;
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, '0')} s`;
}

function dateLabel(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------- Briques d'interface ---------- */

const card =
  'rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900';

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={card}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/**
 * Palmares en barres horizontales. Une seule serie -> une seule teinte
 * (bleu sequentiel) ; la valeur est ecrite en toutes lettres a cote, donc la
 * couleur n'est jamais le seul porteur d'information.
 */
function TopList({
  title,
  items,
  format,
  empty = 'Aucune donnée',
}: {
  title: string;
  items: Bucket[];
  format?: (label: string) => string;
  empty?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <section className={card}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-gray-700 dark:text-gray-300" title={item.label}>
                  {format ? format(item.label) : item.label}
                </span>
                <span className="shrink-0 tabular-nums text-gray-500">{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.count / max) * 100}%`, background: '#2a78d6' }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Page ---------- */

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  // Par défaut on ne montre que les visites confirmées : c'est le chiffre
  // honnête, débarrassé des scanners qui chargent la page et repartent.
  const [confirmedOnly, setConfirmedOnly] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/analytics?days=${days}${confirmedOnly ? '&confirmed=1' : ''}`, {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Lecture impossible');
        return json as Analytics;
      })
      .then((json) => !cancelled && setData(json))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [days, confirmedOnly]);

  // Recharts n'aime pas les series vides : on garantit au moins un point.
  const series = useMemo(() => data?.daily ?? [], [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistiques de visite</h1>
          <p className="text-sm text-gray-500">
            Données collectées par le site, stockées dans MongoDB Atlas. Les IP sont hachées,
            jamais conservées en clair.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={confirmedOnly}
              onChange={(e) => setConfirmedOnly(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Visites confirmées seulement
          </label>

          <div className="inline-flex rounded-lg border border-black/10 p-1 dark:border-white/10">
            {RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setDays(range.days)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                days === range.days
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
            >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-medium">{error}</p>
          <p className="mt-1">
            Vérifie <code>MONGODB_URI</code>, <code>MONGODB_USERNAME</code> et{' '}
            <code>MONGODB_PASSWORD</code> dans <code>.env.local</code>, et que ton adresse IP est
            autorisée dans Atlas (Network Access).
          </p>
        </div>
      )}

      {/* Raccourcis rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/content"
          className={`${card} flex items-center gap-4 transition-shadow hover:shadow-md`}
        >
          <span className="text-3xl">✏️</span>
          <div>
            <p className="font-semibold">Contenu du site</p>
            <p className="text-xs text-gray-500">Textes, coordonnées, descriptions…</p>
          </div>
        </Link>
        <Link
          href="/admin/projects"
          className={`${card} flex items-center gap-4 transition-shadow hover:shadow-md`}
        >
          <span className="text-3xl">🗂️</span>
          <div>
            <p className="font-semibold">Projets</p>
            <p className="text-xs text-gray-500">Ajouter, modifier, publier</p>
          </div>
        </Link>
        <Link
          href="/admin/certifications"
          className={`${card} flex items-center gap-4 transition-shadow hover:shadow-md`}
        >
          <span className="text-3xl">🎓</span>
          <div>
            <p className="font-semibold">Certifications</p>
            <p className="text-xs text-gray-500">Gérer vos diplômes et badges</p>
          </div>
        </Link>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${card} h-24 animate-pulse`} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Indicateurs cles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile label="Pages vues" value={data.totals.pageviews.toLocaleString('fr-FR')} />
            <StatTile
              label="Visiteurs uniques"
              value={data.totals.visitors.toLocaleString('fr-FR')}
              hint="Empreintes IP distinctes"
            />
            <StatTile
              label="Visites confirmées"
              value={(data.totals.confirmed ?? 0).toLocaleString('fr-FR')}
              hint="Signe de vie du navigateur"
            />
            <StatTile label="Temps moyen / page" value={duration(data.totals.avgDuration)} />
            <StatTile
              label="Visites engagées"
              value={`${Math.round(data.totals.engagementRate * 100)} %`}
              hint="≥ 15 s sur la page"
            />
          </div>

          {/* Evolution */}
          <section className={card}>
            <h3 className="mb-4 text-sm font-semibold">Fréquentation dans le temps</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2a78d6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#eb6834" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#eb6834" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) => value.slice(5)}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    name="Pages vues"
                    stroke="#2a78d6"
                    strokeWidth={2}
                    fill="url(#fillViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Visiteurs uniques"
                    stroke="#eb6834"
                    strokeWidth={2}
                    fill="url(#fillVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Heures d'affluence */}
          <section className={card}>
            <h3 className="mb-1 text-sm font-semibold">Heures d’affluence</h3>
            <p className="mb-4 text-xs text-gray-500">Pages vues par heure (UTC)</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.04 }}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Pages vues" fill="#2a78d6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Palmares */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TopList title="Pays" items={data.countries} format={countryLabel} />
            <TopList title="Villes" items={data.cities} />
            <TopList title="Sources de trafic" items={data.sources} />
            <TopList title="Pages les plus vues" items={data.pages} />
            <TopList title="Appareils" items={data.devices} />
            <TopList title="Navigateurs" items={data.browsers} />
            <TopList title="Systèmes d’exploitation" items={data.systems} />
            <TopList title="Langues" items={data.languages} />
            <TopList title="Résolutions d’écran" items={data.screens} />
            <TopList
              title="Interactions"
              items={data.events}
              empty="Aucune interaction enregistrée"
            />
            <TopList title="Sites référents" items={data.referrers} empty="Aucun référent" />
          </div>

          {/* Journal detaille */}
          <section className={`${card} overflow-hidden p-0`}>
            <h3 className="border-b border-black/5 p-5 text-sm font-semibold dark:border-white/10">
              Dernières visites
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Localisation</th>
                    <th className="px-4 py-3 font-medium">Page</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Appareil</th>
                    <th className="px-4 py-3 font-medium">Navigateur</th>
                    <th className="px-4 py-3 font-medium">Écran</th>
                    <th className="px-4 py-3 font-medium">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((visit, i) => (
                    <tr
                      key={`${visit.visitorHash}-${visit.createdAt}-${i}`}
                      className="border-t border-black/5 dark:border-white/5"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                        {dateLabel(visit.createdAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        {[visit.city, visit.region, visit.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2.5" title={visit.path}>
                        {visit.path}
                      </td>
                      <td className="px-4 py-2.5" title={visit.referrer ?? ''}>
                        {visit.source}
                      </td>
                      <td className="px-4 py-2.5">
                        {visit.device}
                        {visit.os ? ` · ${visit.os}` : ''}
                      </td>
                      <td className="px-4 py-2.5">{visit.browser ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{visit.screen ?? '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums">{duration(visit.durationSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.recent.length === 0 && (
              <p className="p-5 text-sm text-gray-500">
                Aucune visite enregistrée pour l’instant.
              </p>
            )}
          </section>

          <p className="text-xs text-gray-500">
            La géolocalisation (pays / ville / région) provient des en-têtes fournis par
            l’hébergeur : elle apparaît une fois le site déployé sur Vercel, pas en développement
            local.
          </p>
        </>
      ) : null}
    </div>
  );
}
