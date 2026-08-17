'use client';

// components/analytics/VisitorTracker.tsx
// Traceur 1re partie : envoie une page vue a /api/track, puis met a jour la
// duree de lecture quand l'onglet est quitte. Volontairement silencieux.
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'gremah_sid';
const NO_TRACK_COOKIE = 'gremah_notrack';
const NO_TRACK_STORAGE = 'gremah_notrack';

/**
 * Deux façons de ne jamais être compté :
 *  - le cookie posé automatiquement à la connexion sur /admin ;
 *  - une visite unique sur `https://…/?notrack=1`, qui pose une marque
 *    permanente dans ce navigateur. Utile sur un téléphone ou une machine
 *    où l'on ne se connecte jamais au tableau de bord.
 * Pour redevenir un visiteur ordinaire : `?notrack=0`.
 */
function isOwner(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.cookie.includes(`${NO_TRACK_COOKIE}=1`)) return true;
  try {
    return localStorage.getItem(NO_TRACK_STORAGE) === '1';
  } catch {
    return false;
  }
}

/** Applique `?notrack=1` / `?notrack=0` s'il est présent dans l'URL. */
function applyOptOutParam(): void {
  try {
    const value = new URLSearchParams(window.location.search).get('notrack');
    if (value === '1') localStorage.setItem(NO_TRACK_STORAGE, '1');
    else if (value === '0') localStorage.removeItem(NO_TRACK_STORAGE);
  } catch {
    /* navigation privée : on ignore, le cookie prend le relais */
  }
}

/** Identifiant de session anonyme, valable le temps de l'onglet. */
function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

/** Envoi resistant a la fermeture de page. */
function send(payload: Record<string, unknown>, useBeacon = false) {
  const body = JSON.stringify(payload);
  if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    return Promise.resolve(null);
  }
  return fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
    .then((r) => r.json())
    .catch(() => null);
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const visitId = useRef<string | null>(null);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    // Le tableau de bord n'est pas du trafic visiteur, et le propriétaire ne
    // doit pas gonfler ses propres chiffres.
    applyOptOutParam();
    if (pathname?.startsWith('/admin') || isOwner()) return;

    visitId.current = null;
    startedAt.current = Date.now();

    const params = new URLSearchParams(window.location.search);
    send({
      type: 'pageview',
      sessionId: sessionId(),
      path: pathname || window.location.pathname,
      referrer: document.referrer || null,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    }).then((res: any) => {
      if (res?.visitId) visitId.current = res.visitId;
    });

    const flush = (useBeacon: boolean) => {
      if (!visitId.current) return;
      send(
        {
          type: 'update',
          visitId: visitId.current,
          durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        },
        useBeacon
      );
    };

    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };

    // Un evenement personnalise permet a n'importe quel composant de tracer
    // une interaction : window.dispatchEvent(new CustomEvent('gremah:track', {
    //   detail: { name: 'cv_download' } }))
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      if (!visitId.current || !detail.name) return;
      send({
        type: 'update',
        visitId: visitId.current,
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        event: String(detail.name),
        value: detail.value ? String(detail.value) : undefined,
      });
    };

    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', () => flush(true));
    window.addEventListener('gremah:track', onCustom as EventListener);

    return () => {
      flush(false);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('gremah:track', onCustom as EventListener);
    };
  }, [pathname]);

  return null;
}

/** Helper a appeler depuis n'importe quel composant client. */
export function trackEvent(name: string, value?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('gremah:track', { detail: { name, value } }));
}
