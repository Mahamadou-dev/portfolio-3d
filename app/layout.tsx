// src/app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import CombinedParticles from '../components/three/CombinedParticles';
import { I18nProvider } from '../components/i18n-provider'; // Import conservé

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>Mahamadou Gremah - Étudiant en Génie Logiciel</title>
        <meta
          name="description"
          content="Portfolio de Mahamadou Gremah, étudiant en génie logiciel et fondateur de GremahTech. Développeur full stack passionné par l'innovation."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Me4.png" />
      </head>

      <body
        className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden`}
      >
        {/* ThemeProvider doit envelopper I18nProvider pour que le thème soit disponible dans le fournisseur i18n si nécessaire */}
        <ThemeProvider>
          {/* I18nProvider doit envelopper le Header et le reste du contenu */}
          <I18nProvider> {/* ⬅️ AJOUTÉ ICI ! */}
            <div className="relative min-h-screen flex flex-col">
              
              {/* Particules en arrière-plan */}
              <CombinedParticles />

              {/* Contenu principal */}
              <div className="relative z-10 flex flex-col min-h-screen">
                <Header /> {/* ⬅️ Le Header DOIT être enfant de I18nProvider */}
                
                <main className="flex-grow w-full overflow-x-hidden">
                  {children} {/* ⬅️ children est déjà sous I18nProvider */}
                </main>
                <Footer />
              </div>
            </div>
          </I18nProvider> {/* ⬅️ FERMETURE ICI ! */}
        </ThemeProvider>
      </body>
    </html>
  );
}