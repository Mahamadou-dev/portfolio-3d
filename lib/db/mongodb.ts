// lib/db/mongodb.ts
// Connexion MongoDB Atlas mutualisee (une seule instance reutilisee entre les
// rechargements a chaud de Next et entre les invocations serverless).
import { MongoClient, Db } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'portfolio';

/**
 * Construit l'URI de connexion.
 * On accepte deux facons de configurer Atlas :
 *  1. MONGODB_URI complet (avec identifiants dedans)
 *  2. MONGODB_URI avec les placeholders <username> / <password> (ou sans
 *     identifiants du tout) + MONGODB_USERNAME et MONGODB_PASSWORD separes.
 */
function buildUri(): string {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    throw new Error(
      'MONGODB_URI est absent. Renseigne-le dans .env.local (voir .env.example).'
    );
  }

  const user = process.env.MONGODB_USERNAME;
  const pass = process.env.MONGODB_PASSWORD;

  let uri = raw.trim();

  // Remplacement des placeholders classiques fournis par l'UI d'Atlas.
  if (user) {
    uri = uri.replace('<username>', encodeURIComponent(user)).replace('<db_username>', encodeURIComponent(user));
  }
  if (pass) {
    uri = uri.replace('<password>', encodeURIComponent(pass)).replace('<db_password>', encodeURIComponent(pass));
  }

  // Si l'URI n'a aucun identifiant mais qu'on en a fourni, on les injecte.
  if (user && pass && !/\/\/[^/]*@/.test(uri)) {
    uri = uri.replace('://', `://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`);
  }

  return uri;
}

type Cached = { client: MongoClient | null; promise: Promise<MongoClient> | null };

// En dev, Next recharge les modules : on stocke sur globalThis pour ne pas
// ouvrir un nouveau pool a chaque HMR.
const globalForMongo = globalThis as unknown as { __mongo?: Cached };
const cached: Cached = globalForMongo.__mongo ?? { client: null, promise: null };
globalForMongo.__mongo = cached;

export async function getClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;

  if (!cached.promise) {
    cached.promise = new MongoClient(buildUri(), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    }).connect();
  }

  cached.client = await cached.promise;
  return cached.client;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

/** true si la configuration Atlas est presente (permet un fallback propre). */
export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
