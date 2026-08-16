// lib/auth/guard.ts
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './session';

/**
 * Garde pour les routes API d'administration.
 * Retourne `null` si l'appelant est authentifie, sinon la reponse 401 a renvoyer.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  }
  return null;
}
