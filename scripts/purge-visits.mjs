// scripts/purge-visits.mjs
//
//   pnpm purge:visits                # aperçu, ne supprime rien
//   pnpm purge:visits --bots         # supprime les visites marquées robot
//   pnpm purge:visits --unconfirmed  # + celles sans signe de vie du navigateur
//   pnpm purge:visits --all          # vide entièrement la collection
//
// Le mode par défaut est volontairement une simulation : on regarde ce qui
// serait supprimé avant de supprimer quoi que ce soit.
//
// Note : on ne purge PAS sur la base de l'adresse IP. Derrière le CGNAT des
// opérateurs mobiles, des centaines de visiteurs légitimes partagent une seule
// IP — les regrouper reviendrait à supprimer de vrais visiteurs.
import { connect } from './lib/bootstrap.mjs';

const args = new Set(process.argv.slice(2));

// Une visite très récente n'a pas encore eu le temps d'être confirmée : on la
// laisse tranquille pour ne pas supprimer un visiteur encore sur la page.
const GRACE_MS = 10 * 60 * 1000;

async function main() {
  const { client, db } = await connect();
  const col = db.collection('visits');

  const cutoff = new Date(Date.now() - GRACE_MS).toISOString();
  const unconfirmedFilter = {
    isBot: false,
    confirmed: { $ne: true },
    createdAt: { $lt: cutoff },
  };

  const total = await col.countDocuments();
  const bots = await col.countDocuments({ isBot: true });
  const unconfirmed = await col.countDocuments(unconfirmedFilter);

  console.log(`Visites en base          : ${total}`);
  console.log(`  marquées robot         : ${bots}`);
  console.log(`  sans signe de vie      : ${unconfirmed}`);
  console.log(`  confirmées (à garder)  : ${total - bots - unconfirmed}`);
  console.log();

  if (args.has('--all')) {
    const r = await col.deleteMany({});
    console.log(`Collection vidée : ${r.deletedCount} visite(s) supprimée(s).`);
  } else if (args.has('--bots') || args.has('--unconfirmed')) {
    const filters = [{ isBot: true }];
    if (args.has('--unconfirmed')) filters.push(unconfirmedFilter);

    const r = await col.deleteMany({ $or: filters });
    console.log(`${r.deletedCount} visite(s) supprimée(s).`);
    console.log(`Il reste ${await col.countDocuments()} visite(s).`);
  } else {
    console.log('Aucune suppression (mode aperçu).');
    console.log('Relance avec --bots, --unconfirmed ou --all pour supprimer.');
  }

  await client.close();
}

main().catch((error) => {
  console.error('Purge échouée :', error.message);
  process.exit(1);
});
