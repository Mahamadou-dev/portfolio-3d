// lib/analytics/enrich.ts
// Enrichissement cote serveur d'un evenement de visite : geo (headers de
// l'hebergeur), user-agent, source de trafic, hachage de l'IP.
import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';

const BOT_RE =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headlesschrome|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|axios|node-fetch|go-http|java\/|okhttp|scrapy|phantomjs|puppeteer|playwright|semrush|ahrefs|mj12|dotbot|petalbot|dataforseo|censys|masscan|zgrab|expanse|paloalto/i;

/**
 * Beaucoup de scanners se presentent avec un User-Agent Chrome parfaitement
 * normal : la chaine ne suffit pas toujours a les demasquer.
 *
 * On a d'abord essaye de les reperer au comportement — une meme empreinte IP
 * ouvrant plusieurs sessions en quelques secondes. C'est une mauvaise idee :
 * derriere le CGNAT des operateurs mobiles (tres repandu en Afrique de
 * l'Ouest), des centaines de visiteurs legitimes partagent une seule IP et
 * seraient tous classes robots.
 *
 * Le signal retenu ne depend donc pas de l'IP : une visite n'est « confirmee »
 * que lorsque le navigateur renvoie un signe de vie — au moins quelques
 * secondes passees sur la page, ou une interaction. Un scanner charge la page
 * et repart : il n'envoie jamais cette seconde requete.
 */
export const CONFIRM_AFTER_SECONDS = 3;

export function isHumanSignal(durationSec: number, hasEvent: boolean): boolean {
  return hasEvent || durationSec >= CONFIRM_AFTER_SECONDS;
}

/** Hache l'IP avec un sel serveur : identifiant stable, non reversible. */
export function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || 'gremah-default-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '0.0.0.0'
  );
}

/** Geo fourni gratuitement par Vercel / Cloudflare via les en-tetes. */
export function geoFromHeaders(headers: Headers) {
  const dec = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  return {
    country: headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || null,
    region: dec(headers.get('x-vercel-ip-country-region')) || null,
    city: dec(headers.get('x-vercel-ip-city')) || null,
    timezone: headers.get('x-vercel-ip-timezone') || null,
  };
}

export function parseUserAgent(ua: string) {
  const parsed = UAParser(ua);
  const rawType = parsed.device.type;
  const device: 'desktop' | 'mobile' | 'tablet' | 'unknown' =
    rawType === 'mobile' || rawType === 'tablet'
      ? rawType
      : ua
        ? 'desktop'
        : 'unknown';

  return {
    device,
    os: parsed.os.name ? `${parsed.os.name}${parsed.os.version ? ' ' + parsed.os.version : ''}` : null,
    browser: parsed.browser.name || null,
    browserVersion: parsed.browser.version || null,
    isBot: BOT_RE.test(ua),
  };
}

/** Deduit une source de trafic lisible depuis le referrer. */
export function trafficSource(referrer: string | null, host: string | null): string {
  if (!referrer) return 'direct';
  let hostname: string;
  try {
    hostname = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (host && hostname === host.replace(/^www\./, '')) return 'interne';

  const known: Record<string, string> = {
    'google.com': 'Google',
    'bing.com': 'Bing',
    'duckduckgo.com': 'DuckDuckGo',
    'linkedin.com': 'LinkedIn',
    'lnkd.in': 'LinkedIn',
    'github.com': 'GitHub',
    'facebook.com': 'Facebook',
    'l.facebook.com': 'Facebook',
    't.co': 'X / Twitter',
    'x.com': 'X / Twitter',
    'youtube.com': 'YouTube',
    'web.whatsapp.com': 'WhatsApp',
    'instagram.com': 'Instagram',
  };
  for (const [domain, label] of Object.entries(known)) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) return label;
  }
  return hostname;
}
