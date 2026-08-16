# Portfolio — Mahamadou Amadou Habou Gremah

Site personnel construit avec Next.js 14 (App Router), React Three Fiber et
Tailwind CSS. Le contenu (projets, certifications) et l'analytique de visite
sont stockés dans **MongoDB Atlas** et pilotés depuis un tableau de bord
intégré : **aucune modification de code n'est nécessaire pour ajouter un projet
ou une certification.**

---

## 1. Démarrage

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## 2. Configuration (à faire une fois)

Copier `.env.example` vers `.env.local` puis remplir :

| Variable | Où la trouver |
|---|---|
| `MONGODB_URI` | Atlas → Database → **Connect** → *Drivers* → copier l'URI |
| `MONGODB_USERNAME` | Atlas → Database Access → nom d'utilisateur de la base |
| `MONGODB_PASSWORD` | Atlas → Database Access → mot de passe associé |
| `MONGODB_DB` | Nom de la base — `portfolio` par défaut, créée automatiquement |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Choisis-les : ce sont les identifiants de `/admin` |
| `ADMIN_JWT_SECRET` | Déjà généré dans `.env.local` — ne pas le partager |
| `ANALYTICS_SALT` | Déjà généré — sert à hacher les IP des visiteurs |

L'URI peut être collée telle qu'Atlas la donne : les placeholders
`<username>` / `<password>` sont remplacés automatiquement par les deux
variables dédiées.

> **Pense aussi à autoriser ton IP** dans Atlas → *Network Access*, sinon la
> connexion est refusée. Pour Vercel, ajouter `0.0.0.0/0` ou les plages de
> l'hébergeur, et recopier toutes ces variables dans *Project Settings →
> Environment Variables*.

## 3. Initialiser le contenu

```bash
pnpm db:setup              # vérifie la connexion et crée les index
pnpm sync:github           # importe les projets + métriques GitHub live
pnpm seed:certifications   # migre les certifications des fichiers i18n
```

ou, en une seule commande :

```bash
pnpm content:init
```

Ces scripts sont **idempotents** : les relancer ne crée pas de doublon et
n'écrase pas ce que tu as édité depuis `/admin`.

---

## 4. Tableau de bord

Accessible sur **`/admin`** (protégé par `middleware.ts`).

| Page | Rôle |
|---|---|
| `/admin` | Statistiques de visite : KPI, courbes, palmarès, journal détaillé |
| `/admin/projects` | Créer / modifier / publier / supprimer un projet |
| `/admin/certifications` | Idem pour les certifications |

### Ajouter un projet ou une certification

1. Aller sur `/admin/projects` (ou `/admin/certifications`)
2. **+ Nouveau projet**, remplir le formulaire, enregistrer
3. C'est en ligne. Rien à recompiler, rien à redéployer.

Les images se réfèrent soit à un fichier de `public/` (ex. `/Electro.png`),
soit à une URL complète. Le champ *Technologies* attend des clés séparées par
des virgules (`react, nextjs, mongodb`) ; la liste des clés reconnues est dans
[`lib/tech-icons.tsx`](lib/tech-icons.tsx) — une clé inconnue reste affichée
avec une icône générique, donc rien ne casse.

### Ce que mesure l'analytique

Pour chaque page vue : date, page, durée de lecture, pays / région / ville,
langue, fuseau, source de trafic (Google, LinkedIn, GitHub, direct…), site
référent, campagne UTM, type d'appareil, système, navigateur et version,
résolution d'écran, et les interactions déclenchées (clic sur un projet, sur
une démo, sur un CTA…).

**Les IP ne sont jamais stockées en clair** : seule une empreinte salée et
hachée sert à compter les visiteurs uniques. Les robots sont détectés et
exclus des statistiques par défaut.

La géolocalisation provient des en-têtes de l'hébergeur : elle apparaît une
fois déployé sur Vercel, pas en développement local.

---

## 5. Architecture

```
app/
  admin/                 tableau de bord (protégé par middleware.ts)
  api/
    content/projects/    CRUD projets      (GET public, écriture admin)
    content/certifications/
    admin/analytics/     agrégation des visites
    admin/login|logout|session
    track/               collecte d'une page vue
components/
  three/
    AuroraField.tsx      décor global : voile d'aurore + poussière stellaire
    HeroScene.tsx        noyau shader + coque filaire + satellites
    useSceneQuality.ts   arbitrage qualité / perfs / prefers-reduced-motion
  analytics/VisitorTracker.tsx
  admin/Field.tsx        primitives de formulaire
lib/
  db/                    connexion Atlas, modèles, collections
  auth/                  session JWT admin
  analytics/enrich.ts    geo, user-agent, source de trafic, hachage IP
  content/               validation + contenu de repli
  tech-icons.tsx         registre des technologies (icône + couleur)
scripts/
  data/projects-catalog.mjs   catalogue curé des projets
  sync-github.mjs             synchro GitHub → MongoDB
  seed-certifications.mjs
  db-setup.mjs
```

### Repli automatique

Si MongoDB n'est pas configuré ou injoignable, l'API sert le contenu des
fichiers `lib/i18n/locales/*.json`. **Le site reste donc toujours affichable**,
même sans base de données.

### La 3D

Deux scènes, toutes deux **procédurales** — aucun modèle 3D à télécharger,
donc un premier rendu immédiat :

- **`AuroraField`** — voile d'aurore en bruit fractal (fragment shader) plus
  ~1400 points animés entièrement dans le vertex shader ; réagit à la souris et
  au scroll, s'arrête quand l'onglet passe en arrière-plan.
- **`HeroScene`** — icosaèdre déformé par du bruit simplex avec éclairage de
  Fresnel, coque filaire contre-rotative, anneau de satellites et bloom.

`useSceneQuality` réduit densité, résolution et effets sur les machines
modestes et respecte `prefers-reduced-motion`.

---

## 6. Déploiement

Recopier toutes les variables de `.env.local` dans Vercel, puis déployer
normalement. Les routes API tournent en runtime Node (pilote MongoDB), le
middleware d'authentification en edge.
