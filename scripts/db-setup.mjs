// scripts/db-setup.mjs
//
//   pnpm db:setup
//
// Verifie la connexion Atlas et cree les index. Idempotent.
import { connect } from './lib/bootstrap.mjs';

async function main() {
  const { client, db } = await connect();

  console.log(`Connecté à la base « ${db.databaseName} ».`);

  const projects = db.collection('projects');
  const certifications = db.collection('certifications');
  const visits = db.collection('visits');

  await projects.createIndex({ slug: 1 }, { unique: true });
  await projects.createIndex({ published: 1, order: 1 });
  await certifications.createIndex({ slug: 1 }, { unique: true });
  await certifications.createIndex({ published: 1, order: 1 });

  // Les visites sont interrogees par date, par session et par visiteur.
  await visits.createIndex({ createdAt: -1 });
  await visits.createIndex({ sessionId: 1, path: 1 });
  await visits.createIndex({ visitorHash: 1 });

  console.log('Index créés ou déjà présents :');
  console.log('  projects       : slug (unique), published+order');
  console.log('  certifications : slug (unique), published+order');
  console.log('  visits         : createdAt, sessionId+path, visitorHash');

  const counts = {
    projets: await projects.countDocuments(),
    certifications: await certifications.countDocuments(),
    visites: await visits.countDocuments(),
  };
  console.log('\nContenu actuel :', counts);

  await client.close();
}

main().catch((error) => {
  console.error('\nConnexion impossible :', error.message);
  console.error(
    "Vérifie MONGODB_URI / MONGODB_USERNAME / MONGODB_PASSWORD dans .env.local, ainsi que\n" +
      "l'autorisation de ton adresse IP dans Atlas (Network Access)."
  );
  process.exit(1);
});
