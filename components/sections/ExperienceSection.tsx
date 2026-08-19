'use client';

// components/sections/ExperienceSection.tsx
//
// « Mon parcours » — une frise chronologique, du passe vers le futur.
//
// La logique de fond est conservee de la version precedente, et elle etait
// juste : l'ordre decoule de l'annee de debut, et le statut (termine / en
// cours / a venir) est calcule a la date du jour, jamais ecrit en dur. Un
// master 2026-2027 ne peut donc pas etre affiche comme acquis.
//
// Ce que la refonte change, c'est la forme :
//   - Les emojis (📚 🎓 🚀 ⭐ 🧠) posees dans des pastilles a degrade
//     bleu-cyan ou violet-fuchsia. Un emoji rendu en 24 px dans un carre
//     colore est une convention de jeu mobile. Un CV se lit avec des dates.
//     L'annee tient maintenant ce role : c'est le repere que l'oeil cherche
//     reellement dans un parcours.
//   - Le trait vertical en degrade bleu -> violet -> transparent devient un
//     filet gris d'un pixel. Il structure sans se faire remarquer.
//   - Les accents par type (bleu pour la formation, violet pour le terrain)
//     disparaissent au profit d'une etiquette ecrite. Une couleur qu'il
//     faut apprendre a decoder n'informe personne au premier passage.
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n-provider';
import { Section, SectionHeader } from '../ui/Section';
import { revealAt, viewport } from '../../lib/motion';

type Status = 'done' | 'current' | 'upcoming';

interface Milestone {
  key: string;
  type: 'education' | 'experience';
  /** Annee de debut : c'est elle qui donne l'ordre de la frise. */
  start: number;
  /** Annee de fin, ou null si l'etape est toujours en cours. */
  end: number | null;
}

/* ------------------------------------------------------------------ */
/* Les etapes, dans l'ordre ou elles se sont produites.                */
/* ------------------------------------------------------------------ */
//
// L'ordre n'est pas decide a la main dans le JSX : il decoule de `start`.
// Ajouter une etape plus tard, c'est ajouter une ligne — elle se placera
// toute seule au bon endroit de la frise.
const MILESTONES: Milestone[] = [
  { key: 'education.preparatoryYear', type: 'education', start: 2022, end: 2023 },
  { key: 'education.softwareEngineering', type: 'education', start: 2023, end: 2026 },
  { key: 'work.freelance', type: 'experience', start: 2024, end: null },
  { key: 'work.anest', type: 'experience', start: 2024, end: null },
  { key: 'education.masterAI', type: 'education', start: 2026, end: 2027 },
];

/**
 * Le statut colore-t-il quelque chose ? Une seule chose : « en cours ».
 *
 * C'est la seule information de la frise qui merite d'attirer l'oeil, et
 * c'est aussi celle qu'un recruteur cherche en premier. « Termine » est
 * l'etat par defaut d'un parcours : le signaler en couleur reviendrait a
 * souligner chaque mot d'une page.
 */
const STATUS_STYLE: Record<Status, string> = {
  done: 'text-faint border-line',
  current: 'text-accent border-accent-line bg-accent-soft',
  upcoming: 'text-muted border-line border-dashed',
};

/**
 * Statut reel d'une etape a la date du jour. Quand 2026 arrivera, le
 * master passera de « a venir » a « en cours » sans qu'il y ait une ligne
 * a modifier — et il ne pourra jamais s'afficher comme acquis avant de
 * l'etre.
 */
function statusOf(milestone: Milestone, year: number): Status {
  if (milestone.start > year) return 'upcoming';
  if (milestone.end === null || milestone.end > year) return 'current';
  return 'done';
}

/* ------------------------------------------------------------------ */

export default function ExperienceSection() {
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

  const [openKey, setOpenKey] = useState(defaultOpen);

  const tr = (key: string) => t(`experience.${key}`);
  const trList = (key: string): string[] => {
    const value = t(`experience.${key}`) as unknown;
    return Array.isArray(value) ? (value as string[]) : [];
  };

  return (
    <Section id="education">
      <SectionHeader
        index="03"
        eyebrow={tr('title')}
        title={tr('subtitle')}
      />

      <ol className="relative">
        {/* L'axe : un filet d'un pixel, aligne sur la colonne des annees.
            Il s'arrete a la derniere etape au lieu de s'estomper dans le
            vide — la frise a une fin, autant la montrer. */}
        <div
          className="absolute bottom-6 left-[4.5rem] top-3 hidden w-px bg-line sm:block"
          aria-hidden="true"
        />

        {milestones.map((milestone, index) => {
          const status = statusOf(milestone, year);
          const isOpen = openKey === milestone.key;
          const panelId = `milestone-${milestone.key.replace('.', '-')}`;

          return (
            <motion.li
              key={milestone.key}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={revealAt(index)}
              className="relative pb-4 sm:pl-[6.5rem]"
            >
              {/* L'annee, en monospace, dans la marge. C'est le repere de
                  lecture de toute la frise : l'oeil descend la colonne des
                  dates et s'arrete la ou il veut. */}
              <div className="mb-2 flex items-center gap-3 sm:absolute sm:left-0 sm:top-4 sm:mb-0 sm:block sm:w-16 sm:text-right">
                <span className="eyebrow text-ink">{milestone.start}</span>
                <span className="eyebrow text-faint sm:block">
                  {milestone.end === null ? '→' : milestone.end === milestone.start ? '' : `→ ${milestone.end}`}
                </span>
              </div>

              {/* Le point sur l'axe. Plein pour une etape engagee, evide
                  pour une etape a venir. */}
              <span
                className={`absolute left-[4.5rem] top-[1.4rem] hidden h-2 w-2 -translate-x-1/2 rounded-full border sm:block ${
                  status === 'upcoming'
                    ? 'border-line-strong bg-paper'
                    : status === 'current'
                      ? 'border-accent bg-accent'
                      : 'border-line-strong bg-line-strong'
                }`}
                aria-hidden="true"
              />

              <div className="card overflow-hidden">
                {/* L'en-tete cliquable. Tout le resume reste lisible sans
                    rien ouvrir : le depliage n'ajoute que le detail. */}
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? '' : milestone.key)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`chip border ${STATUS_STYLE[status]}`}>
                        {tr(`status.${status}`)}
                      </span>
                      <span className="eyebrow">
                        {milestone.type === 'education' ? tr('type.education') : tr('type.experience')}
                      </span>
                    </div>

                    {/* Le titre du role avant l'etablissement : c'est ce
                        qu'un recruteur cherche en premier. */}
                    <h3 className="text-[1.0625rem] font-semibold leading-snug">
                      {tr(`${milestone.key}.title`)}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {tr(`${milestone.key}.institution`)}
                      <span className="mx-1.5 text-faint">·</span>
                      {tr(`${milestone.key}.location`)}
                    </p>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-faint transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Le detail. Rendu en permanence et masque en CSS plutot
                    que demonte : le contenu reste dans le DOM, donc
                    indexable et trouvable par la recherche du navigateur. */}
                <div
                  id={panelId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 border-t border-line px-5 py-5">
                      <p className="text-sm leading-relaxed text-muted">
                        {tr(`${milestone.key}.description`)}
                      </p>

                      {trList(`${milestone.key}.achievements`).length > 0 && (
                        <div>
                          <h4 className="eyebrow mb-2.5">{tr('achievements')}</h4>
                          <ul className="space-y-2">
                            {trList(`${milestone.key}.achievements`).map((achievement, i) => (
                              <li
                                key={i}
                                className="flex gap-3 text-sm leading-relaxed text-body"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(() => {
                        const isEducation = milestone.type === 'education';
                        const field = isEducation ? 'subjects' : 'technologies';
                        const items = trList(`${milestone.key}.${field}`);
                        if (!items.length) return null;

                        return (
                          <div>
                            <h4 className="eyebrow mb-2.5">
                              {isEducation ? tr('subjects') : tr('technologies')}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((item, i) => (
                                <span key={i} className="chip">
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
    </Section>
  );
}
