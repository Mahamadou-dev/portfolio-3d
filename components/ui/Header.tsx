'use client';

// components/ui/Header.tsx
//
// L'en-tete fixe.
//
// Ce qui a change
// ---------------
//   - Le logo de GremahTech occupait la tete de page, affiche en 96 px de
//     haut (`h-24`) dans une barre de 64 px : il debordait de l'en-tete et
//     poussait la navigation. Il est remplace par la signature « Gremah. »
//     — sur un site qui porte un parcours academique, la marque en tete
//     doit etre le nom de la personne, pas celui de son entreprise.
//   - Les feuilles de style etaient injectees par un `<style jsx global>`
//     de 40 lignes, avec `backdrop-filter: blur(20px) saturate(180%)` et
//     son repli `@supports`. Deux classes utilitaires suffisent.
//   - Chaque lien de navigation se soulevait de 2 px au survol et se
//     comprimait au clic ; l'indicateur de section active glissait sur un
//     ressort. La navigation est l'element le plus souvent survole d'une
//     page : c'est le dernier endroit ou mettre du mouvement. Le lien
//     actif change simplement de couleur, et un filet le souligne.
//   - L'en-tete est desormais opaque des le premier pixel de defilement
//     plutot que transparent : un menu qu'on lit par-dessus le contenu
//     n'est lisible qu'une fois sur deux.
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageSwitcher } from './language-switcher';
import { useI18n } from '../i18n-provider';
import { EASE } from '../../lib/motion';

const NAV_ITEMS = [
  { key: 'home', href: '#home' },
  { key: 'about', href: '#about' },
  { key: 'skills', href: '#skills' },
  { key: 'education', href: '#education' },
  { key: 'portfolio', href: '#portfolio' },
  { key: 'contact', href: '#contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  // `theme` n'est plus lu ici : l'icone du bouton est choisie en CSS.
  const { toggleTheme } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section active. Le seuil est a 40 % de visibilite et non 50 % : avec
  // 50 %, une section plus courte que la fenetre (le contact, par exemple)
  // ne declenchait jamais et l'indicateur restait bloque sur la
  // precedente.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' }
    );

    NAV_ITEMS.forEach((item) => {
      const element = document.getElementById(item.href.substring(1));
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Le menu mobile ouvert bloque le defilement du document : sans cela,
  // la page glisse derriere le panneau.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = useCallback((href: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsOpen(false);
    const target = document.getElementById(href.substring(1));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'border-b border-line bg-paper/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        {/* La signature.
            Le logo de GremahTech occupait cette place : c'est la marque
            d'une entreprise, pas celle d'un chercheur. Sur un site qui
            porte un parcours academique, le nom doit etre le nom — et un
            mot compose reste lisible a toutes les tailles, la ou une image
            de 500 px se retrouvait ecrasee dans 32 pixels de haut.
            Compose en capitale unique et interlettrage serre, il tient le
            role d'un logotype sans en etre un. */}
        <a
          href="#home"
          onClick={(e) => handleNavClick('#home', e)}
          className="shrink-0 text-[1.375rem] font-semibold tracking-[-0.04em] text-ink transition-colors hover:text-accent sm:text-2xl"
        >
          Gremah
          {/* Le point final : une ponctuation, pas un ornement. Il ferme le
              mot et l'installe comme une signature. */}
          <span className="text-accent">.</span>
        </a>

        {/* Navigation bureau */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.href.substring(1);
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 text-sm transition-colors ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {t(`header.nav.${item.key}`)}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px bg-ink"
                    transition={{ duration: 0.25, ease: EASE }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-label={t('header.themeToggle')}
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {/* Les deux icones sont rendues, et c'est le CSS qui choisit.
                Le theme reel n'est connu qu'au navigateur (script synchrone
                du layout) : le choisir en JavaScript ferait diverger le HTML
                du serveur de celui du client, et React signalerait une
                erreur d'hydratation. En CSS, le bon symbole est affiche des
                le premier rendu, sans que React ait a trancher. */}
            <Sun size={17} className="dark:hidden" />
            <Moon size={17} className="hidden dark:block" />
          </button>

          <LanguageSwitcher />

          <button
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={t('header.menuToggle')}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu mobile : un panneau plein, pas un voile floute. Le contenu
          derriere n'a pas a rester devinable — il est justement ce que le
          menu recouvre. */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="border-b border-line bg-paper md:hidden"
          >
            <ul className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
              {NAV_ITEMS.map((item) => {
                const active = activeSection === item.href.substring(1);
                return (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(item.href, e)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between border-b border-line py-3.5 text-[0.9375rem] transition-colors last:border-b-0 ${
                        active ? 'font-medium text-ink' : 'text-muted'
                      }`}
                    >
                      {t(`header.nav.${item.key}`)}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
