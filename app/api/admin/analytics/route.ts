// app/api/admin/analytics/route.ts
// Agregation des visites pour le tableau de bord. Tout est calcule cote
// MongoDB en une seule requete ($facet) pour rester rapide.
import { NextRequest, NextResponse } from 'next/server';
import { visitsCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Groupement "top N" reutilisable. */
function topBy(field: string, limit = 10) {
  return [
    { $match: { [field]: { $nin: [null, ''] } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 as const, _id: 1 as const } },
    { $limit: limit },
    { $project: { _id: 0, label: '$_id', count: 1 } },
  ];
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'MongoDB non configure — renseigne MONGODB_URI dans .env.local.' },
      { status: 503 }
    );
  }

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days')) || 30, 1), 365);
  const includeBots = req.nextUrl.searchParams.get('bots') === '1';
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  try {
    const col = await visitsCol();
    const match: Record<string, unknown> = { createdAt: { $gte: since } };
    if (!includeBots) match.isBot = false;

    const [result] = await col
      .aggregate([
        { $match: match },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  pageviews: { $sum: 1 },
                  visitors: { $addToSet: '$visitorHash' },
                  sessions: { $addToSet: '$sessionId' },
                  totalDuration: { $sum: '$durationSec' },
                  engaged: { $sum: { $cond: [{ $gte: ['$durationSec', 15] }, 1, 0] } },
                },
              },
              {
                $project: {
                  _id: 0,
                  pageviews: 1,
                  visitors: { $size: '$visitors' },
                  sessions: { $size: '$sessions' },
                  avgDuration: {
                    $cond: [
                      { $gt: ['$pageviews', 0] },
                      { $divide: ['$totalDuration', '$pageviews'] },
                      0,
                    ],
                  },
                  engagementRate: {
                    $cond: [{ $gt: ['$pageviews', 0] }, { $divide: ['$engaged', '$pageviews'] }, 0],
                  },
                },
              },
            ],
            daily: [
              {
                $group: {
                  _id: { $substr: ['$createdAt', 0, 10] },
                  pageviews: { $sum: 1 },
                  visitors: { $addToSet: '$visitorHash' },
                },
              },
              {
                $project: {
                  _id: 0,
                  date: '$_id',
                  pageviews: 1,
                  visitors: { $size: '$visitors' },
                },
              },
              { $sort: { date: 1 } },
            ],
            hourly: [
              {
                $group: {
                  _id: { $toInt: { $substr: ['$createdAt', 11, 2] } },
                  count: { $sum: 1 },
                },
              },
              { $project: { _id: 0, hour: '$_id', count: 1 } },
              { $sort: { hour: 1 } },
            ],
            countries: topBy('country', 12),
            cities: topBy('city', 12),
            sources: topBy('source', 10),
            referrers: topBy('referrer', 10),
            devices: topBy('device', 5),
            browsers: topBy('browser', 8),
            systems: topBy('os', 8),
            languages: topBy('language', 8),
            screens: topBy('screen', 8),
            pages: [
              { $group: { _id: '$path', count: { $sum: 1 }, avgDuration: { $avg: '$durationSec' } } },
              { $sort: { count: -1 } },
              { $limit: 15 },
              { $project: { _id: 0, label: '$_id', count: 1, avgDuration: 1 } },
            ],
            events: [
              { $unwind: '$events' },
              { $group: { _id: '$events.name', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 15 },
              { $project: { _id: 0, label: '$_id', count: 1 } },
            ],
            recent: [
              { $sort: { createdAt: -1 } },
              { $limit: 60 },
              {
                $project: {
                  _id: 0,
                  createdAt: 1,
                  path: 1,
                  country: 1,
                  city: 1,
                  region: 1,
                  source: 1,
                  referrer: 1,
                  device: 1,
                  os: 1,
                  browser: 1,
                  language: 1,
                  screen: 1,
                  durationSec: 1,
                  visitorHash: 1,
                  eventCount: { $size: { $ifNull: ['$events', []] } },
                },
              },
            ],
            botCount: [{ $count: 'n' }],
          },
        },
      ])
      .toArray();

    const totals = result?.totals?.[0] ?? {
      pageviews: 0,
      visitors: 0,
      sessions: 0,
      avgDuration: 0,
      engagementRate: 0,
    };

    // `totals` doit venir APRES le spread : sinon le tableau brut renvoye par
    // $facet ecrase l'objet aplati calcule juste au-dessus.
    return NextResponse.json({ ...result, days, totals });
  } catch (error) {
    console.error('[analytics] agregation echouee', error);
    return NextResponse.json(
      { error: 'Impossible de lire les statistiques. Verifie la connexion Atlas.' },
      { status: 500 }
    );
  }
}
