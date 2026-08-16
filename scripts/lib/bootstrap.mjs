// scripts/lib/bootstrap.mjs
// Chargement de .env.local + ouverture d'une connexion Atlas, pour les scripts
// lances en ligne de commande (hors runtime Next).
import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';

const ROOT = path.resolve(process.cwd());

/** Mini-parseur .env : suffisant, evite une dependance de plus. */
export function loadEnv(file = '.env.local') {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;

  for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function buildUri() {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    console.error(
      '\n MONGODB_URI est vide.\n' +
        '   Renseigne MONGODB_URI, MONGODB_USERNAME et MONGODB_PASSWORD dans .env.local,\n' +
        '   puis relance la commande.\n'
    );
    process.exit(1);
  }

  const user = process.env.MONGODB_USERNAME;
  const pass = process.env.MONGODB_PASSWORD;
  let uri = raw.trim();

  if (user) uri = uri.replace('<username>', encodeURIComponent(user)).replace('<db_username>', encodeURIComponent(user));
  if (pass) uri = uri.replace('<password>', encodeURIComponent(pass)).replace('<db_password>', encodeURIComponent(pass));
  if (user && pass && !/\/\/[^/]*@/.test(uri)) {
    uri = uri.replace('://', `://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`);
  }
  return uri;
}

export async function connect() {
  loadEnv();
  const client = new MongoClient(buildUri(), { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'portfolio');
  return { client, db };
}

export function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
