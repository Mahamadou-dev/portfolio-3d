// app/api/content/about/route.ts
// Contenu singleton (un seul document, id fixe "main").
import { NextRequest, NextResponse } from 'next/server';
import { aboutCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { fallbackAbout } from '../../../../lib/content/fallback';
import { normalizeAbout, ValidationError } from '../../../../lib/content/validate';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DOC_ID = 'main';

/** GET /api/content/about — contenu public, pas d'authentification requise. */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ item: fallbackAbout(), source: 'fallback' });
  }

  try {
    const col = await aboutCol();
    const doc = await col.findOne({ _id: DOC_ID as unknown as never }, { projection: { _id: 0 } });
    if (!doc) {
      return NextResponse.json({ item: fallbackAbout(), source: 'fallback' });
    }
    return NextResponse.json({ item: doc, source: 'db' });
  } catch (error) {
    console.error('[about] lecture DB impossible, fallback JSON', error);
    return NextResponse.json({ item: fallbackAbout(), source: 'fallback' });
  }
}

/** PUT /api/content/about — remplace le contenu (admin). */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await aboutCol();
    const existing = await col.findOne({ _id: DOC_ID as unknown as never });
    const doc = normalizeAbout(await req.json(), existing ?? undefined);

    await col.updateOne(
      { _id: DOC_ID as unknown as never },
      { $set: doc },
      { upsert: true }
    );
    return NextResponse.json({ item: doc });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[about] mise a jour echouee', error);
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  }
}
