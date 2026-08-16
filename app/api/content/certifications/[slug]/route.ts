// app/api/content/certifications/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { certificationsCol } from '../../../../../lib/db/collections';
import { normalizeCertification, ValidationError } from '../../../../../lib/content/validate';
import { requireAdmin } from '../../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { slug: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await certificationsCol();
    const existing = await col.findOne({ slug: params.slug });
    if (!existing) {
      return NextResponse.json({ error: 'Certification introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const doc = normalizeCertification({ ...existing, ...body }, existing);

    if (doc.slug !== existing.slug && (await col.findOne({ slug: doc.slug }))) {
      return NextResponse.json({ error: `Le slug "${doc.slug}" est deja pris.` }, { status: 409 });
    }

    await col.updateOne({ slug: params.slug }, { $set: doc });
    return NextResponse.json({ item: doc });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[certifications] mise a jour echouee', error);
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await certificationsCol();
    const result = await col.deleteOne({ slug: params.slug });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Certification introuvable' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[certifications] suppression echouee', error);
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
  }
}
