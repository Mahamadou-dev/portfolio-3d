'use client';

// components/sections/ExperienceSection.tsx
//
// « Mon parcours » — une frise chronologique, du passe vers le futur.
//
// Le contenu de chaque etape (formation ou experience) est gere depuis le
// tableau de bord (/admin/parcours) et sert via /api/content/parcours. Ce
// fichier ne fait plus que la mise en forme :
//   - l'ordre decoule de l'annee de debut, jamais ecrit en dur ;
//   - le statut (termine / en cours / a venir) est calcule a la date du
//     jour a partir de `start`/`end`, jamais stocke — un master 2026-2027
//     ne peut donc pas s'afficher comme acquis avant de l'etre ;
//   - realisations, matieres et technologies sont saisies une par ligne
//     dans le tableau de bord et affichees en liste ici.
//
// Voir lib/content/fallback.ts pour le contenu de secours si la base de
// donnees n'est pas configuree.
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n-provider';
import { useParcours, pickLocale } from '../../hooks/useContent';
import { Section, SectionHeader } from '../ui/Section';
import { revealAt, viewport } from '../../lib/motion';
import type { ParcoursDoc } from '../../lib/db/types';

type Status = 'done' | 'current' | 'upcoming';

const STATUS_STYLE: Record<Status, string> = {
  done: 'text-faint border-line',
  current: 'text-accent border-accent-line bg-accent-soft',
  upcoming: 'text-muted border-line border-dashed',
};

/** Statut reel d'une etape a la date du jour. */
function statusOf(milestone: ParcoursDoc, year: number): Status {
  if (milestone.start > year) return 'upcoming';
  if (milestone.end === null || milestone.end > year) return 'current';
  return 'done';
}

/** Les listes (realisations, matieres, technologies) sont saisies une par ligne. */
function lines(text: string | undefined): string[] {
  return (text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
}

export default function ExperienceSection() {
  const { t, locale } = useI18n();
  const { items } = useParcours();
  const year = new Date().getFullYear();

  const milestones = useMemo(
    () => [...items].sort((a, b) => a.start - b.start || a.order - b.order),
    [items]
  );

  // Ouverte par defaut : la derniere etape reellement engagee.
  const defaultOpen = useMemo(() => {
    const engaged = milestones.filter((m) => statusOf(m, year) !== 'upcoming');
    return engaged.length ? engaged[engaged.length - 1].slug : (milestones[0]?.slug ?? '');
  }, [milestones, year]);

  const [openKey, setOpenKey] = useState(defaultOpen);
  useEffect(() => setOpenKey(defaultOpen), [defaultOpen]);

  if (milestones.length === 0) return null;

  return (
    <Section id="education">
      <SectionHeader
        index="03"
        eyebrow={t('experience.title')}
        title={t('experience.subtitle')}
      />

      <ol className="relative">
        <div
          className="absolute bottom-6 left-[4.5rem] top-3 hidden w-px bg-line sm:block"
          aria-hidden="true"
        />

        {milestones.map((milestone, index) => {
          const status = statusOf(milestone, year);
          const isOpen = openKey === milestone.slug;
          const panelId = `milestone-${milestone.slug}`;
          const achievements = lines(pickLocale(milestone.achievements, locale));
          const isEducation = milestone.type === 'education';
          const extra = lines(
            pickLocale(isEducation ? milestone.subjects : milestone.technologies, locale)
          );

          return (
            <motion.li
              key={milestone.slug}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={revealAt(index)}
              className="relative pb-4 sm:pl-[6.5rem]"
            >
              <div className="mb-2 flex items-center gap-3 sm:absolute sm:left-0 sm:top-4 sm:mb-0 sm:block sm:w-16 sm:text-right">
                <span className="eyebrow text-ink">{milestone.start}</span>
                <span className="eyebrow text-faint sm:block">
                  {milestone.end === null ? '→' : milestone.end === milestone.start ? '' : `→ ${milestone.end}`}
                </span>
              </div>

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
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? '' : milestone.slug)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`chip border ${STATUS_STYLE[status]}`}>
                        {t(`experience.status.${status}`)}
                      </span>
                      <span className="eyebrow">
                        {isEducation ? t('experience.type.education') : t('experience.type.experience')}
                      </span>
                    </div>

                    <h3 className="text-[1.0625rem] font-semibold leading-snug">
                      {pickLocale(milestone.title, locale)}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {pickLocale(milestone.institution, locale)}
                      <span className="mx-1.5 text-faint">·</span>
                      {pickLocale(milestone.location, locale)}
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

                <div
                  id={panelId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 border-t border-line px-5 py-5">
                      <p className="text-sm leading-relaxed text-muted">
                        {pickLocale(milestone.description, locale)}
                      </p>

                      {achievements.length > 0 && (
                        <div>
                          <h4 className="eyebrow mb-2.5">{t('experience.achievements')}</h4>
                          <ul className="space-y-2">
                            {achievements.map((achievement, i) => (
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

                      {extra.length > 0 && (
                        <div>
                          <h4 className="eyebrow mb-2.5">
                            {isEducation ? t('experience.subjects') : t('experience.technologies')}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {extra.map((item, i) => (
                              <span key={i} className="chip">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
