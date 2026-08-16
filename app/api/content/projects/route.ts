// app/api/content/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { projectsCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { fallbackProjects } from '../../../../lib/content/fallback';
import { normalizeProject, ValidationError } from '../../../../lib/content/validate';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/content/projects?all=1 — liste publique (ou complete pour l'admin). */
export async function GET(req: NextRequest) {
  const includeUnpublished = req.nextUrl.searchParams.get('all') === '1';

  // Le parametre `all` expose les brouillons : reserve a l'admin.
  if (includeUnpublished) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: fallbackProjects(), source: 'fallback' });
  }

  try {
    const col = await projectsCol();
    const filter = includeUnpublished ? {} : { published: true };
    const items = await col
      .find(filter, { projection: { _id: 0 } })
      .sort({ featured: -1, order: 1, updatedAt: -1 })
      .toArray();

    // Base vide (pas encore seedee) : on sert quand meme le contenu existant.
    if (items.length === 0 && !includeUnpublished) {
      return NextResponse.json({ items: fallbackProjects(), source: 'fallback' });
    }
    return NextResponse.json({ items, source: 'db' });
  } catch (error) {
    console.error('[projects] lecture DB impossible, fallback JSON', error);
    return NextResponse.json({ items: fallbackProjects(), source: 'fallback' });
  }
}

/** POST /api/content/projects — creation (admin). */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const doc = normalizeProject(await req.json());
    const col = await projectsCol();
    const existing = await col.findOne({ slug: doc.slug });
    if (existing) {
      return NextResponse.json(
        { error: `Un projet avec le slug "${doc.slug}" existe deja.` },
        { status: 409 }
      );
    }
    await col.insertOne(doc as any);
    return NextResponse.json({ item: { ...doc, _id: undefined } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[projects] creation echouee', error);
    return NextResponse.json({ error: 'Creation impossible' }, { status: 500 });
  }
}
