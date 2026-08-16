// scripts/seed-certifications.mjs
//
//   pnpm seed:certifications
//
// Migre les certifications encore stockees dans les fichiers i18n vers
// MongoDB. Idempotent : relancer le script ne cree pas de doublon et n'ecrase
// pas ce qui a ete edite depuis /admin.
import fs from 'node:fs';
import path from 'node:path';
import { connect, slugify } from './lib/bootstrap.mjs';

function readLocale(name) {
  const file = path.join(process.cwd(), 'lib', 'i18n', 'locales', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function main() {
  const fr = readLocale('fr');
  const en = readLocale('en');
  const ha = readLocale('ha');

  const { client, db } = await connect();
  const col = db.collection('certifications');
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ published: 1, order: 1 });

  const findById = (list, id) => list.find((x) => x.id === id);

  let created = 0;
  let skipped = 0;

  for (const [index, cert] of fr.portfolio.certifications.entries()) {
    const slug = slugify(`${cert.title}-${cert.issuer}`);
    if (await col.findOne({ slug })) {
      skipped++;
      continue;
    }

    const now = new Date().toISOString();
    await col.insertOne({
      slug,
      title: cert.title,
      issuer: cert.issuer,
      description: {
        fr: cert.description,
        en: findById(en.portfolio.certifications, cert.id)?.description,
        ha: findById(ha.portfolio.certifications, cert.id)?.description,
      },
      date: cert.date,
      image: cert.image,
      // Les URL bidon du contenu d'origine ne doivent pas devenir des liens morts.
      credentialUrl: cert.credentialUrl?.includes('example.com') ? '' : cert.credentialUrl,
      skills: cert.skills ?? [],
      published: true,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
    created++;
    console.log(`  creé  ${slug}`);
  }

  console.log(`\n${created} certification(s) importée(s), ${skipped} déjà présente(s).`);
  await client.close();
}

main().catch((error) => {
  console.error('Import échoué :', error.message);
  process.exit(1);
});
