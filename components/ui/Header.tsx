'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X, Globe, Sun, Moon, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { name: 'Accueil', href: '#home' },
  { name: 'À propos', href: '#about' },
  { name: 'Compétences', href: '#skills' },
  { name: 'Éducation', href: '#education' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Services', href: '#services' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesHovered, setIsServicesHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Détection du défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Détection de la section active avec IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observer toutes les sections de navigation
    NAV_ITEMS.forEach(item => {
      const element = document.getElementById(item.href.substring(1));
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Navigation fluide avec offset pour le header fixe
  const handleNavClick = useCallback((href: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsOpen(false);
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, []);

  const scrollToServices = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsOpen(false);
    const servicesElement = document.getElementById('services');
    
    if (servicesElement) {
      const headerOffset = 80;
      const elementPosition = servicesElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, []);

  const MobileMenuButton = () => (
    <motion.button
      className="md:hidden flex items-center justify-center p-2 rounded-full transition-colors duration-200"
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Toggle menu"
      whileTap={{ scale: 0.95 }}
      whileHover={{ 
        scale: 1.05,
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
      }}
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

  const LanguageToggle = () => (
    <motion.button 
      className="p-2 rounded-full transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      whileHover={{ 
        scale: 1.1,
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
      }}
      whileTap={{ scale: 0.9 }}
      aria-label="Changer de langue"
    >
      <Globe size={20} />
    </motion.button>
  );

  const ModeToggle = () => (
    <motion.button 
      className="p-2 rounded-full transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      onClick={toggleTheme}
      whileHover={{ 
        scale: 1.1,
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
      }}
      whileTap={{ scale: 0.9 }}
      aria-label="Changer de thème"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.div 
            key="sun-icon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div 
            key="moon-icon"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  const ServicesButton = () => (
    <motion.button
      onClick={scrollToServices}
      onHoverStart={() => setIsServicesHovered(true)}
      onHoverEnd={() => setIsServicesHovered(false)}
      className="hidden md:flex items-center px-4 py-2 rounded-full text-sm font-medium overflow-hidden relative glass-button"
      whileHover={{ 
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.span
        className="relative z-10"
        animate={{ color: isServicesHovered ? '#ffffff' : (theme === 'light' ? '#2563eb' : '#60a5fa') }}
        transition={{ duration: 0.3 }}
      >
        Nos services
      </motion.span>
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 z-0"
        initial={{ x: '-100%' }}
        animate={{ x: isServicesHovered ? '0%' : '-100%' }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      
      <motion.div
        animate={{ x: isServicesHovered ? 5 : 0, color: isServicesHovered ? '#ffffff' : (theme === 'light' ? '#2563eb' : '#60a5fa') }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="ml-1 z-10"
      >
        <ChevronRight size={16} />
      </motion.div>
    </motion.button>
  );

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-lg" : "bg-transparent"
      } `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container mx-auto px-5 ">
        <div className="flex justify-between items-center h-16">
          {/* Logo avec effet glass amélioré */}
          <motion.a
            href="#home"
            className="flex items-center"
            onClick={(e) => handleNavClick('#home', e)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            aria-label="Retour à l'accueil"
          >
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* Logo avec effet glass amélioré */}
              <div className=" p-2 rounded-xl">
                <img src="/logo2.png" alt="GremahTech Logo" className="h-32 w-40 object-contain" />
              </div>
            </motion.div>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ">
            {NAV_ITEMS.filter(item => item.href !== '#services').map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={`relative text-sm font-medium px-3 py-2 overflow-hidden group ${
                  activeSection === item.href.substring(1)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {item.name}
                
                {/* Animation de surlignement gauche-droite */}
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileHover={{ scaleX: 1, originX: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                    layoutId="activeSection"
                    transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.5 }}
                  />
                )}
              </motion.a>
            ))}
            
            <ServicesButton />
          </nav>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            <LanguageToggle />
          </div>
          
          {/* Mobile menu buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <LanguageToggle />
            <MobileMenuButton />
          </div>
        </div>

        {/* Mobile Navigation avec effet glass */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 frosted-glass border-t border-gray-200/30 dark:border-gray-800/30 shadow-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <nav className="py-4 px-5 space-y-3">
                {NAV_ITEMS.filter(item => item.href !== '#services').map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    className={`block py-3 px-4 text-base font-medium rounded-lg transition-colors duration-400 ${
                      activeSection === item.href.substring(1)
                        ? 'bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/30'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item.name}
                    {activeSection === item.href.substring(1) && (
                      <motion.div 
                        className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.a>
                ))}
                
                <motion.button
                  onClick={scrollToServices}
                  className="w-full py-3 px-4 text-base font-medium rounded-lg text-blue-600 dark:text-blue-300 flex items-center justify-center mt-2 relative overflow-hidden frosted-glass-button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (NAV_ITEMS.length - 1) * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsServicesHovered(true)}
                  onHoverEnd={() => setIsServicesHovered(false)}
                >
                  <motion.span
                    className="relative z-10"
                    animate={{ color: isServicesHovered ? '#ffffff' : (theme === 'light' ? '#2563eb' : '#60a5fa') }}
                    transition={{ duration: 0.3 }}
                  >
                    Nos services
                  </motion.span>
                   
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 z-0"
                    initial={{ x: '-100%' }}
                    animate={{ x: isServicesHovered ? '0%' : '-100%' }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                  
                  <ChevronRight size={18} className="ml-1 z-10" />
                </motion.button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Styles CSS pour l'effet de verre givré amélioré */}
      <style jsx>{`
        .frosted-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        .dark .frosted-glass {
          background: rgba(0, 0, 0, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        
        .frosted-glass-logo {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px) saturate(150%);
          -webkit-backdrop-filter: blur(10px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .dark .frosted-glass-logo {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .frosted-glass-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px) saturate(150%);
          -webkit-backdrop-filter: blur(10px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        
        .dark .frosted-glass-button {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Amélioration de la visibilité en mode clair */
        @media (prefers-color-scheme: light) {
          .frosted-glass {
            background: rgba(255, 255, 255, 0.85);
          }
          
          .frosted-glass-logo {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .frosted-glass-button {
            background: rgba(255, 255, 255, 0.2);
          }
        }

        /* Support pour Safari */
        @supports not (backdrop-filter: blur(20px)) {
          .frosted-glass {
            background: rgba(255, 255, 255, 0.95);
          }
          
          .dark .frosted-glass {
            background: rgba(0, 0, 0, 0.95);
          }
        }
      `}</style>
    </motion.header>
  );
}