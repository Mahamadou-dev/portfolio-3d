'use client';

// components/sections/ExperienceSection.tsx
//
// « Mon Parcours » — une frise chronologique, du passe vers le futur.
//
// L'ancienne version utilisait des onglets verticaux (MUI Tabs). C'etait le
// mauvais outil : des onglets sont une metaphore de choix paralleles — cinq
// options equivalentes entre lesquelles on arbitre — alors qu'un parcours est
// une sequence orientee. Concretement, le visiteur voyait une entree sur cinq,
// devait cliquer quatre fois pour reconstituer l'histoire, et l'onglet ouvert
// par defaut etait le master 2026-2027 : un diplome pas encore commence,
// presente en premier comme s'il etait acquis.
//
// Ici : tout est visible d'un coup, l'axe descend dans l'ordre des annees, et
// chaque etape porte son statut reel (termine / en cours / a venir). Le futur
// est montre comme un projet — trait pointille, mention explicite — pas comme
// un acquis.
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaTrophy,
  FaStar,
  FaCode,
  FaChevronDown,
} from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { useI18n } from '../i18n-provider';

type TranslationArray = string[];

type Status = 'done' | 'current' | 'upcoming';

interface Milestone {
  key: string;
  type: 'education' | 'experience';
  /** Annee de debut : c'est elle qui donne l'ordre de la frise. */
  start: number;
  /** Annee de fin, ou null si l'etape est toujours en cours. */
  end: number | null;
  logo: string;
}

/* ------------------------------------------------------------------ */
/* Les etapes, dans l'ordre ou elles se sont produites.                */
/* ------------------------------------------------------------------ */
//
// L'ordre n'est plus decide a la main dans le JSX : il decoule de `start`.
// Ajouter une etape plus tard, c'est ajouter une ligne — elle se placera
// toute seule au bon endroit de la frise.
const MILESTONES: Milestone[] = [
  { key: 'education.preparatoryYear', type: 'education', start: 2022, end: 2023, logo: '📚' },
  { key: 'education.softwareEngineering', type: 'education', start: 2023, end: 2026, logo: '🎓' },
  { key: 'work.freelance', type: 'experience', start: 2024, end: null, logo: '🚀' },
  { key: 'work.anest', type: 'experience', start: 2024, end: null, logo: '⭐' },
  { key: 'education.masterAI', type: 'education', start: 2026, end: 2027, logo: '🧠' },
];

/** Deux accents seulement — formation et terrain — au lieu de cinq degrades. */
const ACCENT: Record<Milestone['type'], { hex: string; gradient: string }> = {
  education: { hex: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' },
  experience: { hex: '#a855f7', gradient: 'from-violet-500 to-fuchsia-500' },
};

const STATUS_STYLE: Record<Status, string> = {
  done: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/25',
  current: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  upcoming: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

/**
 * Statut reel d'une etape a la date du jour. Rien n'est ecrit en dur : quand
 * 2026 arrivera, le master passera de « a venir » a « en cours » sans qu'il y
 * ait une ligne a modifier — et surtout, il ne pourra jamais etre affiche
 * comme acquis avant de l'etre.
 */
function statusOf(milestone: Milestone, year: number): Status {
  if (milestone.start > year) return 'upcoming';
  if (milestone.end === null || milestone.end > year) return 'current';
  return 'done';
}

/* ------------------------------------------------------------------ */

const ExperienceSection: React.FC = () => {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const milestones = useMemo(
    () => [...MILESTONES].sort((a, b) => a.start - b.start || a.type.localeCompare(b.type)),
    []
  );

  // Ouverte par defaut : la derniere etape reellement engagee. Le visiteur
  // tombe donc sur « ou j'en suis », pas sur une projection.
  const defaultOpen = useMemo(() => {
    const engaged = milestones.filter((m) => statusOf(m, year) !== 'upcoming');
    return engaged.length ? engaged[engaged.length - 1].key : milestones[0].key;
  }, [milestones, year]);

  const [openKey, setOpenKey] = useState<string>(defaultOpen);

  const tr = (key: string) => t(`experience.${key}`);
  const trList = (key: string) => {
    const value = t(`experience.${key}`) as unknown;
    return (Array.isArray(value) ? value : []) as TranslationArray;
  };

  return (
    <section
      className="py-16 px-4 relative transition-colors duration-300"
      id="education"
      aria-labelledby="experience-title"
    >
      <div className="container mx-auto max-w-4xl">
        {/* En-tete */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 shadow-md">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
          </div>

          <h2
            id="experience-title"
            className="text-3xl md:text-4xl font-bold mb-2 font-righteous bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent"
          >
            {tr('title')}
          </h2>

          <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-kanit">
            {tr('subtitle')}
          </p>
        </motion.div>

        {/* Frise : un axe vertical unique, les etapes s'y accrochent. */}
        <div className="relative">
          {/* L'axe. Il s'estompe vers le bas : le futur est moins affirme que
              le passe, et cela se lit avant meme d'avoir lu un mot. */}
          <div
            className="absolute left-[19px] md:left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500 via-violet-500 to-transparent"
            aria-hidden="true"
          />

          <ol className="space-y-4">
            {milestones.map((milestone, index) => {
              const status = statusOf(milestone, year);
              const accent = ACCENT[milestone.type];
              const isOpen = openKey === milestone.key;
              const isFuture = status === 'upcoming';

              return (
                <motion.li
                  key={milestone.key}
                  className="relative pl-12 md:pl-16"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  {/* Le jalon sur l'axe */}
                  <div
                    className={`absolute left-0 top-3 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg shadow-md ${
                      isFuture
                        ? 'border-2 border-dashed bg-transparent'
                        : `bg-gradient-to-br ${accent.gradient}`
                    }`}
                    style={isFuture ? { borderColor: accent.hex } : undefined}
                    aria-hidden="true"
                  >
                    <span className={isFuture ? 'opacity-70' : 'text-white'}>{milestone.logo}</span>
                  </div>

                  {/* La carte */}
                  <div
                    className={`rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm transition-colors duration-300 bg-light dark:bg-darkElevation ${
                      isFuture
                        ? 'border border-dashed border-amber-500/40'
                        : 'border border-white/10 dark:border-white/5'
                    }`}
                  >
                    {/* En-tete cliquable : tout le resume reste lisible sans
                        ouvrir quoi que ce soit. Le depliage n'ajoute que le
                        detail. */}
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? '' : milestone.key)}
                      aria-expanded={isOpen}
                      aria-controls={`milestone-${milestone.key}`}
                      className="w-full text-left p-5 flex items-start gap-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="text-xs font-bold font-kanit px-2 py-0.5 rounded-md"
                            style={{ background: `${accent.hex}1f`, color: accent.hex }}
                          >
                            {tr(`${milestone.key}.period`)}
                          </span>

                          <span
                            className={`text-xs font-medium font-kanit px-2 py-0.5 rounded-md border ${STATUS_STYLE[status]}`}
                          >
                            {tr(`status.${status}`)}
                          </span>

                          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 font-kanit">
                            {milestone.type === 'education' ? (
                              <FaGraduationCap className="mr-1" style={{ color: accent.hex }} />
                            ) : (
                              <FaBriefcase className="mr-1" style={{ color: accent.hex }} />
                            )}
                            {milestone.type === 'education'
                              ? tr('type.education')
                              : tr('type.experience')}
                          </span>
                        </div>

                        {/* Le titre du role passe avant l'etablissement :
                            c'est ce qu'un recruteur cherche en premier. */}
                        <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                          {tr(`${milestone.key}.title`)}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-300 font-kanit">
                          {tr(`${milestone.key}.institution`)}
                          <span className="mx-1 text-gray-400">·</span>
                          <span className="inline-flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-[0.7rem]" />
                            {tr(`${milestone.key}.location`)}
                          </span>
                        </p>
                      </div>

                      <FaChevronDown
                        className={`mt-1 flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Le detail. Rendu en permanence et masque en CSS plutot
                        que demonte : le contenu reste dans le DOM, donc
                        indexable et accessible a la recherche du navigateur. */}
                    <div
                      id={`milestone-${milestone.key}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0 space-y-4">
                          <div className={`h-px w-full`} style={{ background: `${accent.hex}25` }} />

                          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {tr(`${milestone.key}.description`)}
                          </p>

                          {/* Realisations */}
                          {trList(`${milestone.key}.achievements`).length > 0 && (
                            <div>
                              <h4 className="font-bold mb-2 flex items-center text-sm text-gray-800 dark:text-white font-kanit">
                                <FaTrophy className="mr-2" style={{ color: accent.hex }} />
                                {tr('achievements')}
                              </h4>
                              <ul className="space-y-1.5">
                                {trList(`${milestone.key}.achievements`).map((achievement, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    <FaStar
                                      className="mr-2 mt-1 flex-shrink-0 text-[0.7rem]"
                                      style={{ color: accent.hex }}
                                    />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Matieres (formation) ou technologies (terrain) */}
                          {(() => {
                            const isEducation = milestone.type === 'education';
                            const items = trList(
                              `${milestone.key}.${isEducation ? 'subjects' : 'technologies'}`
                            );
                            if (!items.length) return null;

                            return (
                              <div>
                                <h4 className="font-bold mb-2 flex items-center text-sm text-gray-800 dark:text-white font-kanit">
                                  {isEducation ? (
                                    <BsDot className="text-xl mr-1" style={{ color: accent.hex }} />
                                  ) : (
                                    <FaCode className="mr-2" style={{ color: accent.hex }} />
                                  )}
                                  {isEducation ? tr('subjects') : tr('technologies')}
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {items.map((item, i) => (
                                    // Plus de troncature a 25 caracteres : une
                                    // matiere coupee en plein milieu ne dit
                                    // rien et donne l'impression d'un bug.
                                    <span
                                      key={i}
                                      className="px-2 py-1 rounded text-xs border font-kanit"
                                      style={{
                                        background: `${accent.hex}12`,
                                        color: accent.hex,
                                        borderColor: `${accent.hex}30`,
                                      }}
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
