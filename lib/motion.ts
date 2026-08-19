// lib/motion.ts
//
// Le vocabulaire de mouvement du site, en un seul endroit.
//
// Avant, chaque section improvisait le sien : des `initial={{ x: -50 }}`
// ici, des `whileHover={{ scale: 1.05, y: -2 }}` la, des delais en cascade
// allant jusqu'a 1 seconde, des ressorts (`type: 'spring'`) sur des
// elements qui n'ont rien de physique. Le resultat donnait une page ou
// tout entrait par un cote different et rebondissait — la sensation
// « jeu video » que la refonte devait supprimer.
//
// Trois principes tiennent ce fichier :
//
//   1. UNE direction. Tout entre par le bas, de 12 px. Une entree laterale
//      suggere qu'un element vient d'ailleurs ; ici tout appartient a la
//      meme page, tout monte a sa place.
//   2. UNE courbe, decelerante. Un mouvement qui ralentit en arrivant se
//      lit comme un objet qui se pose ; un ressort se lit comme un jouet.
//   3. Des delais courts et bornes. Le decalage entre deux elements d'une
//      liste est de 60 ms et s'arrete apres le 6e : au-dela, le dernier
//      element apparait si tard que le visiteur croit la page cassee.

import type { Transition, Variants } from 'framer-motion';

/** La courbe unique du site. Identique a `--ease` dans globals.css. */
export const EASE = [0.22, 0.61, 0.36, 1] as const;

export const transition: Transition = { duration: 0.42, ease: EASE };

/** Le seuil d'entree : l'element se revele quand il est franchement visible. */
export const viewport = { once: true, margin: '-80px' } as const;

/** Revelation standard : 12 px vers le haut, opacite. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition },
};

/**
 * Conteneur d'une liste. Les enfants heritent de `reveal` et se decalent
 * de 60 ms — le decalage s'annule au-dela du 6e enfant (voir `revealAt`).
 */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/**
 * Variante de revelation avec un delai borne, pour les listes dont on ne
 * maitrise pas la longueur (projets, technologies, jalons...).
 *
 * `Math.min(index, 5)` : un mur de 40 tuiles ne doit pas finir de se
 * reveler 2,4 secondes apres le debut. Passe le 6e element, tout arrive
 * ensemble.
 */
export function revealAt(index: number): Variants {
  return {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { ...transition, delay: Math.min(index, 5) * 0.06 },
    },
  };
}

/**
 * Les props d'une revelation au defilement, prets a etaler sur un
 * `motion.*`. Evite de repeter initial/whileInView/viewport partout.
 */
export const revealOnScroll = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport,
  variants: reveal,
};
