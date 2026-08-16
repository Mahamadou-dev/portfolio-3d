// app/api/content/certifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { certificationsCol } from '../../../../lib/db/collections';
import { isDbConfigured } from '../../../../lib/db/mongodb';
import { fallbackCertifications } from '../../../../lib/content/fallback';
import { normalizeCertification, ValidationError } from '../../../../lib/content/validate';
import { requireAdmin } from '../../../../lib/auth/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const includeUnpublished = req.nextUrl.searchParams.get('all') === '1';

  if (includeUnpublished) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: fallbackCertifications(), source: 'fallback' });
  }

  try {
    const col = await certificationsCol();
    const filter = includeUnpublished ? {} : { published: true };
    const items = await col
      .find(filter, { projection: { _id: 0 } })
      .sort({ order: 1, date: -1 })
      .toArray();

    if (items.length === 0 && !includeUnpublished) {
      return NextResponse.json({ items: fallbackCertifications(), source: 'fallback' });
    }
    return NextResponse.json({ items, source: 'db' });
  } catch (error) {
    console.error('[certifications] lecture DB impossible, fallback JSON', error);
    return NextResponse.json({ items: fallbackCertifications(), source: 'fallback' });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const doc = normalizeCertification(await req.json());
    const col = await certificationsCol();
    if (await col.findOne({ slug: doc.slug })) {
      return NextResponse.json(
        { error: `Une certification avec le slug "${doc.slug}" existe deja.` },
        { status: 409 }
      );
    }
    await col.insertOne(doc as any);
    return NextResponse.json({ item: { ...doc, _id: undefined } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[certifications] creation echouee', error);
    return NextResponse.json({ error: 'Creation impossible' }, { status: 500 });
  }
}
