// app/api/admin/site-content/route.ts
//
// GET  → renvoie les overrides i18n stockés en base (ou {} si aucun)
// PUT  → sauvegarde de nouveaux overrides
//
// Structure stockée dans la collection `site_content` :
//   { _id: 'main', fr: { "hero.name": "...", ... }, en: {...}, ha: {...} }
//
// Ces overrides sont fusionnés côté client avec les traductions statiques :
// la base de données est prioritaire sur les fichiers JSON.
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/guard';
import { getDb } from '../../../../lib/db/mongodb';

const COLLECTION = 'site_content';
const DOC_ID = 'main';

async function getSiteContentCol() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const col = await getSiteContentCol();
    const doc = await col.findOne({ _id: DOC_ID as unknown as never });
    if (!doc) return NextResponse.json({ fr: {}, en: {}, ha: {} });
    const { _id, ...rest } = doc;
    return NextResponse.json(rest);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const body = await req.json();
    const { fr = {}, en = {}, ha = {} } = body as {
      fr?: Record<string, string>;
      en?: Record<string, string>;
      ha?: Record<string, string>;
    };

    const col = await getSiteContentCol();
    await col.updateOne(
      { _id: DOC_ID as unknown as never },
      { $set: { fr, en, ha, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
