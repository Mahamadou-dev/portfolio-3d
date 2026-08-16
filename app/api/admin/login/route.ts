// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  createSessionToken,
  safeEqual,
  sessionCookieOptions,
} from '../../../../lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Limitation simple en memoire des tentatives par IP. Suffisant pour un
// portfolio mono-utilisateur ; l'etat est perdu au redemarrage, c'est voulu.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 6;
const LOCK_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const record = attempts.get(ip);
  if (record && record.count >= MAX_ATTEMPTS && Date.now() < record.until) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessaie dans quelques minutes.' },
      { status: 429 }
    );
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { error: 'ADMIN_USERNAME / ADMIN_PASSWORD ne sont pas configures.' },
      { status: 500 }
    );
  }

  let username = '';
  let password = '';
  try {
    const body = await req.json();
    username = String(body?.username ?? '');
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 });
  }

  const ok = safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
  if (!ok) {
    const next = record && Date.now() < record.until ? record.count + 1 : 1;
    attempts.set(ip, { count: next, until: Date.now() + LOCK_MS });
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
  }

  attempts.delete(ip);
  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
