'use client';

// components/sections/SkillsSection.tsx
//
// Les competences, organisees par domaine puis par palier d'usage.
//
// Le contenu (chaque technologie, son domaine, sa rubrique et son palier)
// est gere depuis le tableau de bord (/admin/skills) et sert via
// /api/content/skills. Ce fichier ne fait plus que la mise en forme :
// grouper par domaine puis par rubrique, trier par palier, et afficher.
// Voir lib/content/fallback.ts pour le contenu de secours si la base de
// donnees n'est pas configuree.
//
// L'organisation retenue
// ----------------------
// Trois domaines, ordonnes, chacun portant une phrase qui dit son role
// dans le parcours :
//
//   01. Intelligence artificielle — l'axe de recherche ;
//   02. Securite des systemes     — le second versant du meme sujet ;
//   03. Ingenierie logicielle     — le socle qui rend le reste realisable.
//
// C'est la structure d'une page de chercheur : on annonce un domaine, on
// le justifie, puis on detaille.
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n-provider';
import { useSkills } from '../../hooks/useContent';
import { getTech } from '../../lib/tech-icons';
import { Section, SectionHeader } from '../ui/Section';
import { reveal, revealAt, stagger, viewport } from '../../lib/motion';
import type { SkillDoc, SkillDomain, SkillCategory, SkillTier } from '../../lib/db/types';

/** L'ordre d'affichage des paliers : ce qui est maitrise vient en premier. */
const TIER_ORDER: SkillTier[] = ['core', 'working', 'learning'];

/** Domaines et rubriques, dans l'ordre ou ils doivent etre lus. */
const DOMAIN_ORDER: SkillDomain[] = ['ai', 'security', 'engineering'];
const CATEGORY_ORDER: SkillCategory[] = [
  'machine_learning',
  'cybersecurity',
  'backend',
  'frontend',
  'mobile',
  'tools',
  'design',
];

/**
 * Le marqueur de palier : carre plein, carre evide, carre pointille.
 *
 * Trois FORMES plutot que trois couleurs : une forme reste lisible en noir
 * et blanc, a l'impression d'un CV, et pour un lecteur daltonien.
 */
function TierMark({ tier }: { tier: SkillTier }) {
  const style: Record<SkillTier, string> = {
    core: 'bg-ink border-ink',
    working: 'border-ink',
    learning: 'border-dashed border-faint',
  };
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-[2px] border ${style[tier]}`}
      aria-hidden="true"
    />
  );
}

/** Une technologie : marqueur de palier, logo de marque, nom. */
function SkillRow({ skill }: { skill: SkillDoc }) {
  const { Icon } = getTech(skill.icon, skill.name, skill.color);
  return (
    <li className="flex items-center gap-3">
      <TierMark tier={skill.tier} />
      <Icon className="shrink-0 text-base" color={skill.color} aria-hidden="true" />
      <span className={`text-sm ${skill.tier === 'learning' ? 'text-faint' : 'text-body'}`}>
        {skill.name}
      </span>
    </li>
  );
}

/** Les technologies d'une rubrique, triees par palier. */
function SkillList({ items, className = 'space-y-2.5' }: { items: SkillDoc[]; className?: string }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.order - b.order),
    [items]
  );

  return (
    <ul className={className}>
      {sorted.map((skill) => (
        <SkillRow key={skill.slug} skill={skill} />
      ))}
    </ul>
  );
}

/* ================================================================== */

export default function SkillsSection() {
  const { t } = useI18n();
  const { items } = useSkills();

  const strengths = useMemo(
    () => [
      t('skills.strengths.productivity.title'),
      t('skills.strengths.problem_solving.title'),
      t('skills.strengths.perseverance.title'),
    ],
    [t]
  );

  // Regroupe le contenu servi par l'API en domaines puis rubriques, dans
  // l'ordre canonique — l'ordre d'affichage ne depend donc jamais de
  // l'ordre d'insertion en base.
  const domains = useMemo(() => {
    const byDomain = new Map<SkillDomain, Map<SkillCategory, SkillDoc[]>>();
    for (const skill of items) {
      if (!byDomain.has(skill.domain)) byDomain.set(skill.domain, new Map());
      const byCategory = byDomain.get(skill.domain)!;
      if (!byCategory.has(skill.category)) byCategory.set(skill.category, []);
      byCategory.get(skill.category)!.push(skill);
    }

    return DOMAIN_ORDER.filter((domain) => byDomain.has(domain)).map((domain) => {
      const byCategory = byDomain.get(domain)!;
      const groups = CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({
        category,
        items: byCategory.get(category)!,
      }));
      return { key: domain, groups };
    });
  }, [items]);

  if (domains.length === 0) return null;

  return (
    <Section id="skills">
      <SectionHeader
        index="02"
        eyebrow={t('skills.title')}
        title={t('skills.lead')}
        lead={t('skills.levelsNote')}
      />

      {/* --- La legende des paliers -------------------------------
          Placee AVANT la grille : une legende qui suit ce qu'elle
          explique arrive trop tard. */}
      <motion.dl
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={reveal}
        className="mb-16 flex flex-col gap-3 border-y border-line py-5 sm:flex-row sm:flex-wrap sm:gap-x-10"
      >
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="flex items-baseline gap-2.5">
            <span className="-translate-y-px">
              <TierMark tier={tier} />
            </span>
            <dt className="text-sm font-medium text-ink">{t(`skills.levels.${tier}.label`)}</dt>
            <dd className="text-sm text-faint">{t(`skills.levels.${tier}.hint`)}</dd>
          </div>
        ))}
      </motion.dl>

      {/* --- Les domaines ------------------------------------------ */}
      <div className="space-y-14">
        {domains.map((domain, index) => {
          const single = domain.groups.length === 1;

          return (
            <motion.article
              key={domain.key}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={revealAt(index)}
              className="grid gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14"
            >
              <header className="lg:sticky lg:top-28 lg:self-start">
                <span className="eyebrow text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl">
                  {t(`skills.domains.${domain.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t(`skills.domains.${domain.key}.role`)}
                </p>
              </header>

              {single ? (
                <SkillList
                  items={domain.groups[0].items}
                  className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3"
                />
              ) : (
                <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                  {domain.groups.map((group) => (
                    <div key={group.category}>
                      <h4 className="eyebrow mb-3.5 border-b border-line pb-2">
                        {t(`skills.categories.${group.category}.title`)}
                      </h4>
                      <SkillList items={group.items} />
                    </div>
                  ))}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* --- La methode de travail ---------------------------------- */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={stagger}
        className="mt-14 border-t border-line pt-8"
      >
        <h3 className="eyebrow mb-4">{t('skills.strengthsTitle')}</h3>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          {strengths.map((strength) => (
            <motion.li
              key={strength}
              variants={reveal}
              className="flex items-baseline gap-2.5 text-sm text-body"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
              {strength}
            </motion.li>
          ))}
        </ul>
      </motion.section>
    </Section>
  );
}
