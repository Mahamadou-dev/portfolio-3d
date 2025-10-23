'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X, Sun, Moon } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useI18n } from "../i18n-provider";

const NAV_ITEMS = [
  { key: 'home', href: '#home' },
  { key: 'about', href: '#about' },
  { key: 'skills', href: '#skills' },
  { key: 'education', href: '#education' },
  { key: 'portfolio', href: '#portfolio' },
  { key: 'services', href: '#services' },
  { key: 'contact', href: '#contact' }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  // Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    NAV_ITEMS.forEach((item) => {
      const element = document.getElementById(item.href.substring(1));
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll
  const handleNavClick = useCallback((href: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsOpen(false);
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const MobileMenuButton = () => (
    <motion.button
      className="md:hidden flex items-center justify-center p-2 rounded-full transition-colors duration-200"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={t("header.menuToggle")}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="x"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <X size={24} className="text-gray-800 dark:text-gray-200" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Menu size={24} className="text-gray-800 dark:text-gray-200" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  const ModeToggle = () => (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
      whileTap={{ scale: 0.9 }}
      aria-label={t("header.themeToggle")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.div key="sun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <>
      {/* Styles CSS globaux pour l'effet glass */}
      <style jsx global>{`
        .header-glass {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .dark .header-glass {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-transparent {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-bottom: 1px solid transparent;
        }

        /* Fallback pour les navigateurs qui ne supportent pas backdrop-filter */
        @supports not (backdrop-filter: blur(20px)) {
          .header-glass {
            background: rgba(255, 255, 255, 0.95);
          }
          .dark .header-glass {
            background: rgba(0, 0, 0, 0.95);
          }
        }
      `}</style>

      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'header-glass shadow-lg' : 'header-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Logo */}
            <motion.a
              href="#home"
              onClick={(e) => handleNavClick('#home', e)}
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <img src="/logo2.png" alt="GremahTech Logo" className="h-24 w-auto object-contain" />
            </motion.a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center justify-center space-x-4 flex-grow">
              {NAV_ITEMS.map((item) => (
                <motion.a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className={`relative text-sm font-medium px-3 py-2 transition-colors duration-200 ${
                    activeSection === item.href.substring(1)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t(`header.nav.${item.key}`)}
                  {activeSection === item.href.substring(1) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      layoutId="activeSection"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ModeToggle />
              <LanguageSwitcher />
            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center space-x-2">
              <ModeToggle />
              <LanguageSwitcher />
              <MobileMenuButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-lg z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                className="fixed top-16 left-0 right-0 bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl z-50 shadow-lg border-t border-gray-300/20 dark:border-gray-700/30"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <nav className="py-4 px-6 space-y-3">
                  {NAV_ITEMS.map((item) => (
                    <motion.a
                      key={item.key}
                      href={item.href}
                      onClick={(e) => handleNavClick(item.href, e)}
                      className={`block py-3 px-4 text-base font-medium rounded-lg transition-all duration-200 ${
                        activeSection === item.href.substring(1)
                          ? 'bg-blue-100/40 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 border-l-4 border-transparent'
                      }`}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t(`header.nav.${item.key}`)}
                    </motion.a>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}