// app/api/content/parcours/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parcoursCol } from '../../../../../lib/db/collections';
import { normalizeParcours, ValidationError } from '../../../../../lib/content/validate';
import { requireAdmin } from '../../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { slug: string } };

/** PATCH — mise a jour partielle (admin). */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await parcoursCol();
    const existing = await col.findOne({ slug: params.slug });
    if (!existing) {
      return NextResponse.json({ error: 'Etape introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const doc = normalizeParcours({ ...existing, ...body }, existing);

    if (doc.slug !== existing.slug) {
      const clash = await col.findOne({ slug: doc.slug });
      if (clash) {
        return NextResponse.json(
          { error: `Le slug "${doc.slug}" est deja pris.` },
          { status: 409 }
        );
      }
    }

    await col.updateOne({ slug: params.slug }, { $set: doc });
    return NextResponse.json({ item: doc });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[parcours] mise a jour echouee', error);
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  }
}

/** DELETE — suppression definitive (admin). */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await parcoursCol();
    const result = await col.deleteOne({ slug: params.slug });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Etape introuvable' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[parcours] suppression echouee', error);
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
  }
}
