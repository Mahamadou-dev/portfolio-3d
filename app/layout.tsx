// app/layout.tsx
'use client';

import { Inter, JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { I18nProvider } from '../components/i18n-provider';
import HtmlLang from '../components/HtmlLang';
import VisitorTracker from '../components/analytics/VisitorTracker';
import { Analytics } from '@vercel/analytics/next';

// Deux familles, deux roles — la ou il y en avait trois.
//
// Righteous (un display arrondi, geometrique, a graisse unique) portait
// tous les titres de section. C'est une fonte d'affiche : elle etait
// responsable a elle seule d'une bonne part de la lecture « ludique » du
// site, et sa graisse unique interdisait toute hierarchie a l'interieur
// d'un titre. Kanit faisait doublon avec Inter sur les libelles.
//
//   - Inter          : tout le texte, des titres aux legendes. Sa large
//                      palette de graisses (400 a 700) suffit a construire
//                      toute la hierarchie, ce que trois familles mal
//                      accordees ne faisaient pas.
//   - JetBrains Mono : uniquement les metadonnees — oeils de section,
//                      dates, numeros, etiquettes techniques. Le monospace
//                      y agit comme un signal : « ceci est une donnee ».
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Le tableau de bord a sa propre coquille : ni decor, ni en-tete public.
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  return (
    // `lang` est corrige cote client par <HtmlLang /> des que la langue est
    // connue : le site est trilingue, l'annoncer en francais pour tout le
    // monde desoriente les lecteurs d'ecran et les moteurs de recherche.
    <html lang="fr" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <title>Mahamadou Gremah — Ingénieur logiciel & IA</title>
        <meta
          name="description"
          content="Portfolio de Mahamadou Amadou Habou Gremah : ingénieur logiciel diplômé de la Faculté des Sciences de Monastir, orienté intelligence artificielle et sécurité des systèmes d'IA, fondateur de GremahTech."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* L'icone d'onglet est le portrait, recadre carre sur le visage.
            `Me4.png` servait directement d'icone : c'est un portrait
            d'identite de 500x548 px, donc non carre et cadre en buste. Le
            navigateur le reduisait a 16 px, ou l'on ne distinguait plus
            qu'une tache grise. Les trois tailles ci-dessous sont
            pre-recadrees sur la tete (voir public/icon-*.png). */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/icon-180.png" />

        {/* Le theme, applique AVANT le premier rendu.
            ThemeContext ne pose la classe `dark` que dans un `useEffect`,
            c'est-a-dire apres l'hydratation : la page s'affichait donc
            toujours en clair pendant une fraction de seconde avant de
            basculer. Le decor 3D plein ecran masquait autrefois ce flash ;
            sur les surfaces opaques de la refonte, il saute aux yeux.
            Ce script est volontairement synchrone et minuscule : il doit
            s'executer avant que le navigateur ne peigne quoi que ce soit. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />

        {/* La couleur de la barre d'adresse sur mobile suit le theme : sans
            ces deux lignes, un bandeau blanc surmonte le site en mode
            sombre. */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfbf9" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c0d10" />

        {/* Partage social : sans ces balises, un lien vers le portfolio
            s'affiche comme une URL nue sur LinkedIn ou WhatsApp. */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Mahamadou Gremah — Ingénieur logiciel & IA" />
        <meta
          property="og:description"
          content="Génie logiciel, intelligence artificielle et sécurité des systèmes d'IA. Monastir, Tunisie."
        />
        <meta property="og:image" content="/Me4.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Donnees structurees schema.org.
            Sur un profil academique, c'est ce qui permet a un moteur de
            recherche de relier une personne a son etablissement, a son
            domaine et a ses profils externes — au lieu de n'indexer qu'une
            suite de mots. C'est la meme brique que celle utilisee par les
            pages de laboratoire et les annuaires de chercheurs, et elle
            restera valable du master au doctorat : il n'y aura qu'a
            completer `affiliation` et `knowsAbout`. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Mahamadou Amadou Habou Gremah',
              alternateName: 'Mahamadou Gremah',
              jobTitle: 'Ingénieur logiciel — Intelligence artificielle',
              description:
                "Ingénieur logiciel diplômé de la Faculté des Sciences de Monastir, orienté intelligence artificielle et sécurité des systèmes d'IA.",
              image: 'https://gremah.vercel.app/icon-512.png',
              nationality: { '@type': 'Country', name: 'Niger' },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Monastir',
                addressCountry: 'TN',
              },
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Faculté des Sciences de Monastir',
              },
              knowsAbout: [
                'Intelligence artificielle',
                'Apprentissage automatique',
                'Apprentissage profond',
                "Sécurité des systèmes d'IA",
                'Cybersécurité',
                'Génie logiciel',
              ],
              knowsLanguage: ['fr', 'en', 'ha'],
              founder: { '@type': 'Organization', name: 'GremahTech' },
              sameAs: [
                'https://github.com/Mahamadou-dev',
                'https://www.linkedin.com/in/mahamadou-amadou-habou-gremah-54766632b',
                'https://gremah-tech.vercel.app',
              ],
            }),
          }}
        />
      </head>

      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <I18nProvider>
            <HtmlLang />
            {isAdmin ? (
              children
            ) : (
              <>
                {/* Le decor de page. C'etait un troisieme contexte WebGL
                    plein ecran (voile d'aurore en shader + 1400 points
                    animes) qui tournait en permanence derriere le texte.
                    Il est remplace par deux voiles CSS immobiles : meme
                    profondeur, aucun mouvement derriere la lecture, et la
                    carte graphique reste disponible pour la seule scene
                    3D qui merite d'exister — celle du hero. */}
                <div className="page-ground" aria-hidden="true" />

                {/* Analytique interne : une ligne par page vue dans MongoDB */}
                <VisitorTracker />

                {/* Lien d'evitement : la premiere tabulation sur la page
                    doit permettre de sauter la navigation. */}
                <a
                  href="#main"
                  className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
                >
                  Aller au contenu
                </a>

                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main id="main" className="flex-1">
                    {children}
                    <Analytics />
                  </main>
                  <Footer />
                </div>
              </>
            )}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
