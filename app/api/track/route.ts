// app/api/track/route.ts
// Collecte analytique 1re partie : une ligne par page vue, enrichie cote
// serveur. Aucune IP n'est stockee en clair (hachage sale uniquement).
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { visitsCol } from '../../../lib/db/collections';
import { isDbConfigured } from '../../../lib/db/mongodb';
import {
  clientIp,
  geoFromHeaders,
  hashIp,
  parseUserAgent,
  trafficSource,
} from '../../../lib/analytics/enrich';
import type { VisitDoc } from '../../../lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_EVENTS_PER_VISIT = 50;

function str(v: unknown, max = 300): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  // Sans base configuree, on accepte silencieusement : le site ne doit jamais
  // casser a cause du tracking.
  if (!isDbConfigured()) return NextResponse.json({ ok: true, stored: false });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 });
  }

  try {
    const col = await visitsCol();
    const type = str(body.type) ?? 'pageview';

    // --- Mise a jour d'une vue existante (duree passee, interactions) ---
    if (type === 'update') {
      const visitId = str(body.visitId, 40);
      if (!visitId || !ObjectId.isValid(visitId)) {
        return NextResponse.json({ ok: true, stored: false });
      }

      const duration = Math.min(Math.max(Number(body.durationSec) || 0, 0), 4 * 3600);
      const update: Record<string, unknown> = { $max: { durationSec: duration } };

      const eventName = str(body.event, 60);
      if (eventName) {
        update.$push = {
          events: {
            $each: [{ name: eventName, value: str(body.value, 200) ?? undefined, at: new Date().toISOString() }],
            $slice: -MAX_EVENTS_PER_VISIT,
          },
        };
      }

      await col.updateOne({ _id: new ObjectId(visitId) as any }, update);
      return NextResponse.json({ ok: true, stored: true });
    }

    // --- Nouvelle page vue ---
    const ua = req.headers.get('user-agent') || '';
    const { device, os, browser, browserVersion, isBot } = parseUserAgent(ua);
    const geo = geoFromHeaders(req.headers);
    const referrer = str(body.referrer, 500);
    const host = req.headers.get('host');

    const doc: VisitDoc = {
      sessionId: str(body.sessionId, 64) ?? 'inconnu',
      visitorHash: hashIp(clientIp(req.headers)),
      path: str(body.path, 300) ?? '/',
      referrer,
      source: trafficSource(referrer, host),
      utm: {
        source: str(body.utmSource, 100) ?? undefined,
        medium: str(body.utmMedium, 100) ?? undefined,
        campaign: str(body.utmCampaign, 100) ?? undefined,
      },
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone ?? str(body.timezone, 60),
      language: str(body.language, 20) ?? req.headers.get('accept-language')?.split(',')[0] ?? null,
      device,
      os,
      browser,
      browserVersion,
      screen: str(body.screen, 20),
      durationSec: 0,
      events: [],
      isBot,
      createdAt: new Date().toISOString(),
    };

    const result = await col.insertOne(doc as any);
    return NextResponse.json({ ok: true, stored: true, visitId: result.insertedId.toString() });
  } catch (error) {
    console.error('[track] enregistrement echoue', error);
    // On repond 200 : une panne analytique ne doit pas polluer la console du visiteur.
    return NextResponse.json({ ok: true, stored: false });
  }
}
