'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useI18n } from "../i18n-provider";
import { trackEvent } from '../analytics/VisitorTracker';

// La scène 3D est chargée côté client uniquement : elle ne bloque ni le SSR
// ni le premier rendu du texte (LCP).
const HeroScene = dynamic(() => import('../three/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-[24rem] md:h-[32rem]" />,
});

// Types TypeScript
interface TypewriterProps {
  phrases: string[];
}

// Composant Typewriter optimisé
const TypewriterEffect: React.FC<TypewriterProps> = ({ phrases }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    
    const timer = setTimeout(() => {
      if (isDeleting) {
        setText(currentPhrase.substring(0, text.length - 1));
      } else {
        setText(currentPhrase.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases]);

  return (
    <h2 className="text-2xl md:text-4xl font-bold mb-4 min-h-[3rem] flex items-center justify-center">
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {text}
      </span>
      <span className="inline-block w-1 h-8 ml-1 bg-blue-600 animate-pulse" />
    </h2>
  );
};

// Composant principal HeroSection
const HeroSection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section id="home" className="min-h-[85vh] flex items-center justify-center relative overflow-hidden py-32 my-8">
      <div className="container mx-auto max-w-7xl px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenu texte */}
          <motion.div
            className="text-center lg:text-left relative z-20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Salutation */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span 
                className="text-lg text-green-600 dark:text-green-400 cursor-help font-kanit"
                title={t("hero.greetingTooltip")}
              >
                {t("hero.greeting")}
              </span>
            </motion.div>

            {/* Nom */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 font-righteous"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {t("hero.name")}
              </span>
            </motion.h1>

                          {/* Typewriter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <TypewriterEffect phrases={
                  (() => {
                    const phrases = t("hero.typewriterPhrases");
                    return Array.isArray(phrases) ? phrases : [phrases];
                  })()
                } />
              </motion.div>

            {/* Description */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p 
                className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-kanit"
                dangerouslySetInnerHTML={{ __html: t("hero.description") }}
              />
            </motion.div>

            {/* Boutons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-base hover:shadow-xl transition-all duration-300 font-kanit"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  trackEvent('cta_voir_projets');
                  window.location.href = '#portfolio';
                }}
              >
                {t("hero.buttons.viewWork")}
              </motion.button>
              <motion.button
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg font-medium text-base hover:bg-blue-600 hover:text-white transition-all duration-300 font-kanit"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  trackEvent('cta_contact');
                  window.location.href = '#contact';
                }}
              >
                {t("hero.buttons.contact")}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Modèle 3D */}
          <motion.div
            className="flex justify-center items-center relative z-30"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;