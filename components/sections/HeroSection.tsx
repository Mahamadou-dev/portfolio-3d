'use client';

// components/sections/HeroSection.tsx
//
// L'ouverture du site.
//
// Trois choses ont disparu par rapport a la version precedente, et c'est
// l'essentiel de la refonte :
//
//   1. La machine a ecrire. Un titre qui se tape lettre par lettre puis
//      s'efface est une animation en boucle infinie placee sur le contenu
//      le plus important de la page. Tant qu'elle tourne, le visiteur ne
//      peut pas lire une phrase stable, et il ne voit jamais qu'une
//      specialite sur sept. Les sept sont maintenant affichees ensemble :
//      c'est plus d'information, en moins de temps, sans mouvement.
//   2. Les trois degrades de texte. Le nom, le sous-titre et les boutons
//      etaient tous en bleu-violet-cyan. Le nom est desormais en encre
//      pleine — c'est le seul element de la page qui n'a besoin d'aucun
//      artifice pour ressortir : il est en 60 px.
//   3. Les entrees laterales decalees jusqu'a une seconde. Tout monte de
//      12 px, en 400 ms, et c'est fini.
import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../i18n-provider';
import { trackEvent } from '../analytics/VisitorTracker';
import { EASE, stagger, reveal } from '../../lib/motion';

// La scene 3D est chargee cote client uniquement : elle ne bloque ni le
// rendu serveur ni l'affichage du texte (qui porte le LCP).
const HeroObject = dynamic(() => import('../three/HeroObject'), {
  ssr: false,
  loading: () => <div className="h-[19rem] w-full sm:h-[22rem] lg:h-[26rem]" />,
});

export default function HeroSection() {
  const { t, tList } = useI18n();

  // Les specialites : la meme donnee que l'ancienne machine a ecrire,
  // rendue d'un coup. La cle i18n est inchangee.
  //
  // `tList` et non `t` : `t` ne renvoie que des chaines et retombe sur la
  // cle pour tout le reste. Cette liste s'affichait donc litteralement
  // « hero.typewriterPhrases » a la place des sept specialites.
  const specialities = tList('hero.typewriterPhrases');

  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] items-center px-5 pb-20 pt-28 sm:px-8 md:pt-32"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ---------------------------------------------------------- */}
        {/* Colonne texte                                              */}
        {/* ---------------------------------------------------------- */}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          {/* La salutation en haoussa. Elle etait en vert vif, seule
              occurrence de cette couleur sur tout le site. En gris, avec
              son infobulle conservee, elle redevient ce qu'elle est : une
              note personnelle, pas une alerte. */}
          <motion.p variants={reveal} className="mb-5">
            <span
              className="eyebrow cursor-help border-b border-dotted border-line-strong pb-0.5"
              title={t('hero.greetingTooltip')}
            >
              {t('hero.greeting')}
            </span>
          </motion.p>

          <motion.h1
            variants={reveal}
            className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl"
          >
            {t('hero.name')}
          </motion.h1>

          {/* Les specialites, en liste. Un point separateur plutot qu'une
              virgule : l'oeil balaie une enumeration technique plus vite
              quand les items sont visuellement equivalents. */}
          <motion.ul
            variants={reveal}
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.9375rem] text-body"
          >
            {specialities.map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                )}
                <span>{label}</span>
              </li>
            ))}
          </motion.ul>

          {/* La description contient des <strong> dans les fichiers de
              traduction : le HTML est donc injecte tel quel. La source
              est un fichier du depot, jamais une saisie utilisateur. */}
          <motion.p
            variants={reveal}
            className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-muted [&_strong]:font-medium [&_strong]:text-ink"
            dangerouslySetInnerHTML={{ __html: t('hero.description') }}
          />

          <motion.div variants={reveal} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#portfolio"
              onClick={() => trackEvent('cta_voir_projets')}
              className="btn btn-primary"
            >
              {t('hero.buttons.viewWork')}
              <ArrowUpRight size={17} strokeWidth={2} />
            </a>
            <a href="#contact" onClick={() => trackEvent('cta_contact')} className="btn btn-ghost">
              {t('hero.buttons.contact')}
            </a>
          </motion.div>
        </motion.div>

        {/* ---------------------------------------------------------- */}
        {/* Colonne 3D                                                 */}
        {/* ---------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Un fondu long et sans deplacement : la scene 3D met quelques
          // images a s'initialiser, un mouvement d'entree la ferait
          // apparaitre en saccade.
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="relative z-[9999]"
        >
          <HeroObject />
        </motion.div>
      </div>

      {/* L'invite a defiler. Immobile : une fleche qui rebondit en
          permanence est le reflexe de page d'accueil dont on cherche
          justement a se defaire. Le mot suffit. */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1, ease: EASE }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-muted transition-colors hover:text-ink md:flex"
      >
        <ArrowDown size={14} />
        <span className="eyebrow">Parcours</span>
      </motion.a>
    </section>
  );
}
