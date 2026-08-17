// src/app/layout.tsx
'use client';

import { Inter, Righteous, Kanit } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import AuroraField from '../components/three/AuroraField';
import { I18nProvider } from '../components/i18n-provider'; // Import conservé
import HtmlLang from '../components/HtmlLang';
import VisitorTracker from '../components/analytics/VisitorTracker';
import { Analytics } from "@vercel/analytics/next"

// Trois familles, trois rôles :
//  - Inter      : le texte courant, neutre et lisible ;
//  - Righteous  : les titres de section, une seule graisse, pour l'accent ;
//  - Kanit      : les libellés d'interface (boutons, méta, tags).
// Elles étaient déjà appelées partout via `font-righteous` / `font-kanit`,
// mais n'avaient jamais été chargées : tout retombait sur Inter.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const righteous = Righteous({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-righteous',
  display: 'swap',
});
const kanit = Kanit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-kanit',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Le tableau de bord a sa propre coquille : ni décor 3D, ni en-tête public.
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  return (
    // `lang` est corrigé côté client par <HtmlLang /> dès que la langue est
    // connue : le site est trilingue, l'annoncer en français pour tout le monde
    // désoriente les lecteurs d'écran et les moteurs de recherche.
    <html lang="fr" className={`${inter.variable} ${righteous.variable} ${kanit.variable}`}>
      <head>
        <title>Mahamadou Gremah — Ingénieur logiciel & IA</title>
        <meta
          name="description"
          content="Portfolio de Mahamadou Amadou Habou Gremah : ingénieur logiciel diplômé de la Faculté des Sciences de Monastir, orienté intelligence artificielle et sécurité des systèmes d'IA, fondateur de GremahTech."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Me4.png" />

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
      </head>

      <body
        className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden`}
      >
        {/* ThemeProvider doit envelopper I18nProvider pour que le thème soit disponible dans le fournisseur i18n si nécessaire */}
        <ThemeProvider>
          {/* I18nProvider doit envelopper le Header et le reste du contenu */}
          <I18nProvider>
            <HtmlLang />
            {isAdmin ? (
              children
            ) : (
              <div className="relative min-h-screen flex flex-col">
                {/* Décor 3D global (aurore + poussière stellaire) */}
                <AuroraField />

                {/* Analytique interne : une ligne par page vue dans MongoDB */}
                <VisitorTracker />

                {/* Contenu principal */}
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Header />

                  <main className="flex-grow w-full overflow-x-hidden">
                    {children}
                    <Analytics />
                  </main>
                  <Footer />
                </div>
              </div>
            )}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
