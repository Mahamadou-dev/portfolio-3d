// src/app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import CombinedParticles from '../components/three/CombinedParticles';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Mahamadou Gremah - Étudiant en Génie Logiciel</title>
        <meta name="description" content="Portfolio de Mahamadou Gremah, étudiant en génie logiciel et fondateur de GremahTech. Développeur full stack passionné par l'innovation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <CombinedParticles />
          <div className="min-h-screen flex flex-col relative z-10">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}