// lib/auth/session.ts
// Session admin minimaliste : un JWT signe (HS256) stocke dans un cookie
// httpOnly. Pas de base utilisateurs — un seul compte, defini par variables
// d'environnement.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'gremah_admin';
/** Pose sur le navigateur du proprietaire : ses visites ne sont pas comptees. */
export const NO_TRACK_COOKIE = 'gremah_notrack';
const MAX_AGE_SEC = 60 * 60 * 8; // 8 h

function secret(): Uint8Array {
  const value = process.env.ADMIN_JWT_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      'ADMIN_JWT_SECRET manquant ou trop court (32+ caracteres recommandes).'
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<{ username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== 'admin' || typeof payload.sub !== 'string') return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SEC,
  };
}

/** Comparaison a temps constant pour eviter les attaques temporelles. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
