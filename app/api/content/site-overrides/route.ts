// app/api/content/site-overrides/route.ts
//
// Route publique (sans authentification) pour récupérer les overrides i18n
// depuis MongoDB. Appelée par le I18nProvider au montage.
//
// Cache 60 secondes côté CDN pour ne pas marteler la base à chaque vue.
import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db/mongodb';

export const revalidate = 60;

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection('site_content').findOne({ _id: 'main' as unknown as never });
    if (!doc) return NextResponse.json({ fr: {}, en: {}, ha: {} });
    const { _id, updatedAt, ...rest } = doc as Record<string, unknown>;
    return NextResponse.json(rest, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    });
  } catch {
    // En cas d'erreur DB, on renvoie des overrides vides : le site garde
    // ses traductions statiques et ne tombe pas en erreur.
    return NextResponse.json({ fr: {}, en: {}, ha: {} });
  }
}
