// app/api/content/skills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { skillsCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { fallbackSkills } from '../../../../lib/content/fallback';
import { normalizeSkill, ValidationError } from '../../../../lib/content/validate';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/content/skills?all=1 — liste publique (ou complete pour l'admin). */
export async function GET(req: NextRequest) {
  const includeUnpublished = req.nextUrl.searchParams.get('all') === '1';

  if (includeUnpublished) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: fallbackSkills(), source: 'fallback' });
  }

  try {
    const col = await skillsCol();
    const filter = includeUnpublished ? {} : { published: true };
    const items = await col
      .find(filter, { projection: { _id: 0 } })
      .sort({ domain: 1, category: 1, order: 1 })
      .toArray();

    if (items.length === 0 && !includeUnpublished) {
      return NextResponse.json({ items: fallbackSkills(), source: 'fallback' });
    }
    return NextResponse.json({ items, source: 'db' });
  } catch (error) {
    console.error('[skills] lecture DB impossible, fallback JSON', error);
    return NextResponse.json({ items: fallbackSkills(), source: 'fallback' });
  }
}

/** POST /api/content/skills — creation (admin). */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const doc = normalizeSkill(await req.json());
    const col = await skillsCol();
    const existing = await col.findOne({ slug: doc.slug });
    if (existing) {
      return NextResponse.json(
        { error: `Une competence avec le slug "${doc.slug}" existe deja.` },
        { status: 409 }
      );
    }
    await col.insertOne(doc as any);
    return NextResponse.json({ item: { ...doc, _id: undefined } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[skills] creation echouee', error);
    return NextResponse.json({ error: 'Creation impossible' }, { status: 500 });
  }
}
