// app/api/content/projects/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { projectsCol } from '../../../../../lib/db/collections';
import { normalizeProject, ValidationError } from '../../../../../lib/content/validate';
import { requireAdmin } from '../../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { slug: string } };

/** PATCH — mise a jour partielle (admin). */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await projectsCol();
    const existing = await col.findOne({ slug: params.slug });
    if (!existing) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    const body = await req.json();
    // On fusionne pour permettre un PATCH partiel (ex: juste `published`).
    const doc = normalizeProject({ ...existing, ...body }, existing);

    // Un changement de slug ne doit pas ecraser un autre document.
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
    console.error('[projects] mise a jour echouee', error);
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  }
}

/** DELETE — suppression definitive (admin). */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const col = await projectsCol();
    const result = await col.deleteOne({ slug: params.slug });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[projects] suppression echouee', error);
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
  }
}
