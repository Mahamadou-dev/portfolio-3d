// scripts/sync-github.mjs
//
//   pnpm sync:github
//
// Pousse dans MongoDB Atlas le catalogue de projets (scripts/data/projects-catalog.mjs)
// enrichi des metriques live de GitHub (etoiles, forks, langage, topics).
//
// Les champs edites depuis /admin (image, ordre, mise en avant, publication)
// sont PRESERVES : la synchro ne remplace que ce qui vient de GitHub, plus les
// champs encore vides.
import { execFileSync } from 'node:child_process';
import { connect, loadEnv } from './lib/bootstrap.mjs';
import { techTag } from './lib/tech-labels.mjs';
import { CATALOG } from './data/projects-catalog.mjs';

// Les identifiants doivent etre lus avant toute utilisation de GITHUB_*.
loadEnv();
const OWNER = process.env.GITHUB_USERNAME || 'Mahamadou-dev';

/** Interroge l'API GitHub via `gh` (deja authentifie) ou via un token. */
function ghApi(endpoint) {
  if (process.env.GITHUB_TOKEN) {
    // Chemin sans `gh` : utile en CI.
    return fetch(`https://api.github.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    }).then((r) => (r.ok ? r.json() : null));
  }
  try {
    const out = execFileSync('gh', ['api', endpoint], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return Promise.resolve(JSON.parse(out));
  } catch {
    return Promise.resolve(null);
  }
}

async function fetchRepo(name) {
  if (!name) return null;
  const data = await ghApi(`repos/${OWNER}/${name}`);
  if (!data || data.message) return null;
  return {
    repo: data.full_name,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    language: data.language ?? null,
    topics: data.topics ?? [],
    pushedAt: data.pushed_at ?? new Date().toISOString(),
    htmlUrl: data.html_url,
    homepage: data.homepage || '',
    isPrivate: data.private === true,
  };
}

async function main() {
  const { client, db } = await connect();
  const col = db.collection('projects');

  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ published: 1, order: 1 });

  let created = 0;
  let updated = 0;
  let offline = 0;

  for (const [index, entry] of CATALOG.entries()) {
    const gh = await fetchRepo(entry.repo);
    if (entry.repo && !gh) offline++;

    const existing = await col.findOne({ slug: entry.slug });
    const now = new Date().toISOString();

    // Un depot prive ne doit jamais exposer de lien GitHub cliquable.
    const isPrivate = entry.private === true || gh?.isPrivate === true;
    const githubUrl = isPrivate ? '' : gh?.htmlUrl || (entry.repo ? `https://github.com/${OWNER}/${entry.repo}` : '');

    const fromGithub = {
      stars: gh?.stars ?? existing?.stars ?? 0,
      forks: gh?.forks ?? existing?.forks ?? 0,
      github: githubUrl,
      github_meta: gh
        ? {
            repo: gh.repo,
            language: gh.language,
            topics: gh.topics,
            pushedAt: gh.pushedAt,
            syncedAt: now,
          }
        : existing?.github_meta,
    };

    // Champs "editoriaux" : la valeur du tableau de bord l'emporte si elle
    // existe deja, sinon on prend celle du catalogue.
    const doc = {
      slug: entry.slug,
      title: existing?.title || entry.title,
      description: existing?.description ?? entry.description,
      technologies:
        existing?.technologies?.length ? existing.technologies : entry.tech.map(techTag),
      image: existing?.image || entry.image || '',
      liveUrl: existing?.liveUrl || entry.liveUrl || gh?.homepage || '',
      category: existing?.category || entry.category,
      featured: existing ? existing.featured : Boolean(entry.featured),
      published: existing ? existing.published : true,
      order: existing?.order ?? index,
      ...fromGithub,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await col.updateOne({ slug: entry.slug }, { $set: doc }, { upsert: true });
    if (existing) updated++;
    else created++;

    const stat = gh ? `★${gh.stars} ⑂${gh.forks}` : 'hors-ligne';
    console.log(`  ${existing ? 'maj  ' : 'creé '} ${entry.slug.padEnd(30)} ${stat}`);
  }

  console.log(`\n${created} projet(s) créé(s), ${updated} mis à jour.`);
  if (offline) {
    console.log(
      `${offline} dépôt(s) n'ont pas pu être lus sur GitHub (gh non authentifié ou dépôt privé) — ` +
        'les métriques précédentes ont été conservées.'
    );
  }

  await client.close();
}

main().catch((error) => {
  console.error('Synchronisation échouée :', error.message);
  process.exit(1);
});
