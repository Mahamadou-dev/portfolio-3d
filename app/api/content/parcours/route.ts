// app/api/content/parcours/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parcoursCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { fallbackParcours } from '../../../../lib/content/fallback';
import { normalizeParcours, ValidationError } from '../../../../lib/content/validate';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/content/parcours?all=1 — liste publique (ou complete pour l'admin). */
export async function GET(req: NextRequest) {
  const includeUnpublished = req.nextUrl.searchParams.get('all') === '1';

  if (includeUnpublished) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: fallbackParcours(), source: 'fallback' });
  }

  try {
    const col = await parcoursCol();
    const filter = includeUnpublished ? {} : { published: true };
    const items = await col
      .find(filter, { projection: { _id: 0 } })
      .sort({ start: 1, order: 1 })
      .toArray();

    if (items.length === 0 && !includeUnpublished) {
      return NextResponse.json({ items: fallbackParcours(), source: 'fallback' });
    }
    return NextResponse.json({ items, source: 'db' });
  } catch (error) {
    console.error('[parcours] lecture DB impossible, fallback JSON', error);
    return NextResponse.json({ items: fallbackParcours(), source: 'fallback' });
  }
}

/** POST /api/content/parcours — creation (admin). */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const doc = normalizeParcours(await req.json());
    const col = await parcoursCol();
    const existing = await col.findOne({ slug: doc.slug });
    if (existing) {
      return NextResponse.json(
        { error: `Une etape avec le slug "${doc.slug}" existe deja.` },
        { status: 409 }
      );
    }
    await col.insertOne(doc as any);
    return NextResponse.json({ item: { ...doc, _id: undefined } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[parcours] creation echouee', error);
    return NextResponse.json({ error: 'Creation impossible' }, { status: 500 });
  }
}
