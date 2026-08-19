'use client';

// components/sections/ProjectsSection.tsx
//
// Vitrine projets + certifications. Le contenu vient de l'API (MongoDB)
// avec repli automatique sur les fichiers i18n : rien a recompiler pour
// ajouter une entree depuis le tableau de bord. Cette mecanique est
// inchangee — c'est la presentation qui est refaite.
//
// Ce qui a change
// ---------------
//   - Le survol inclinait chaque carte en 3D (`rotateX` / `rotateY` suivant
//     le curseur) et projetait une ombre bleue de 60 px. Une grille ou
//     chaque vignette pivote au passage de la souris est un menu de jeu ;
//     elle rend aussi le texte flou pendant la transformation. Le survol
//     souleve maintenant la carte de 2 px et resserre son trait.
//   - Le fond en verre depoli (`backdrop-blur-xl`) sur toutes les cartes,
//     les onglets et le champ de recherche : douze zones de flou empilees
//     coutaient cher a la carte graphique pour un effet que la refonte
//     n'utilise plus. Les cartes sont des surfaces opaques.
//   - L'image des projets etait recadree en 176 px de haut et zoomait de
//     10 % au survol. Elle garde desormais son ratio 16/10 et ne bouge
//     plus : c'est une capture d'ecran de travail, pas une jaquette.
import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, ExternalLink, Search, Star, GitFork, X } from 'lucide-react';

import { useI18n } from '../i18n-provider';
import { useProjects, useCertifications, pickLocale } from '../../hooks/useContent';
import { getTech } from '../../lib/tech-icons';
import { trackEvent } from '../analytics/VisitorTracker';
import { Section, SectionHeader } from '../ui/Section';
import { revealAt, reveal, viewport, EASE } from '../../lib/motion';
import type { ProjectDoc, CertificationDoc } from '../../lib/db/types';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function TechChip({ tech }: { tech: { title: string; icon: string; color: string } }) {
  const meta = getTech(tech.icon, tech.title, tech.color);
  const { Icon } = meta;
  return (
    <span className="chip">
      <Icon className="text-[13px] shrink-0" aria-hidden="true" />
      {tech.title || meta.label}
    </span>
  );
}

function ProjectCard({
  project,
  locale,
  index,
  onOpen,
}: {
  project: ProjectDoc;
  locale: string;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.article
      layout
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={revealAt(index)}
      // `relative` sert d'ancre a la zone cliquable etendue du titre.
      className="card-interactive group relative flex flex-col overflow-hidden"
    >
      {/* L'image, en ratio fixe. Le fond gris derriere elle evite le trou
          blanc pendant le chargement paresseux. */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-2">
        <img
          src={project.image || '/logo2.png'}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {project.featured && (
          <span className="absolute left-3 top-3 rounded-sm bg-paper/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
            Selection
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          {/* Le titre est un bouton : c'est lui la cible principale de la
              carte. Avant, l'ouverture du detail passait par une fleche
              « → » de 12 px dans un coin — une cible que personne ne
              trouve, et qui n'annonce rien a un lecteur d'ecran. */}
          <h3 className="text-base font-semibold leading-snug">
            <button
              type="button"
              onClick={onOpen}
              className="text-left transition-colors hover:text-accent"
            >
              {project.title}
              {/* Etend la zone cliquable a toute la carte sans imbriquer
                  les liens GitHub / demo dans le bouton. */}
              <span className="absolute inset-0" aria-hidden="true" />
            </button>
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {pickLocale(project.description, locale)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <TechChip key={i} tech={tech} />
          ))}
          {project.technologies.length > 4 && (
            <span className="chip border-transparent bg-transparent text-faint">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-4 text-xs text-faint">
            {project.stars > 0 && (
              <span className="flex items-center gap-1.5">
                <Star size={13} aria-hidden="true" /> {project.stars}
              </span>
            )}
            {project.forks > 0 && (
              <span className="flex items-center gap-1.5">
                <GitFork size={13} aria-hidden="true" /> {project.forks}
              </span>
            )}
          </div>

          {/* `relative z-10` : ces liens passent au-dessus de la zone
              cliquable du titre, sinon ils seraient inatteignables. */}
          <div className="relative z-10 flex items-center gap-1">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('projet_github', project.slug)}
                aria-label={`Code source de ${project.title}`}
                className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Github size={16} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('projet_demo', project.slug)}
                aria-label={`Démo de ${project.title}`}
                className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CertificationCard({
  certification,
  locale,
  index,
}: {
  certification: CertificationDoc;
  locale: string;
  index: number;
}) {
  return (
    <motion.article
      layout
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={revealAt(index)}
      className="card-interactive flex flex-col overflow-hidden"
    >
      <a
        href={certification.credentialUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('certif_ouverte', certification.slug)}
        className="block"
      >
        {/* `object-contain` : un badge de certification est un logo, pas
            une photo. L'ancien `object-cover` en rognait les bords. */}
        <div className="aspect-[16/10] border-b border-line bg-surface-2 p-4">
          <img
            src={certification.image || '/logo2.png'}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">{certification.issuer}</p>
            <span className="eyebrow text-faint">{certification.date}</span>
          </div>

          <h3 className="text-[0.9375rem] font-semibold leading-snug">{certification.title}</h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {pickLocale(certification.description, locale)}
          </p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {certification.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </a>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function ProjectsSection() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<'projects' | 'certifications'>('projects');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<ProjectDoc | null>(null);

  const { items: projects, loading: loadingProjects } = useProjects();
  const { items: certifications, loading: loadingCerts } = useCertifications();

  // Les categories sont deduites du contenu : ajouter une categorie dans
  // le tableau de bord la fait apparaitre ici automatiquement.
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return [p.title, pickLocale(p.description, locale), ...p.technologies.map((x) => x.title)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [projects, category, query, locale]);

  const visibleCerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certifications;
    return certifications.filter((c) =>
      [c.title, c.issuer, ...c.skills].join(' ').toLowerCase().includes(q)
    );
  }, [certifications, query]);

  const loading = tab === 'projects' ? loadingProjects : loadingCerts;
  const isEmpty = tab === 'projects' ? visibleProjects.length === 0 : visibleCerts.length === 0;

  return (
    <Section id="portfolio">
      <SectionHeader
        index="04"
        eyebrow={t('portfolio.title')}
        title={t('portfolio.subtitle')}
      />

      {/* --- Barre de controle -------------------------------------
          Les onglets etaient deux pilules dans un bloc en verre depoli,
          avec une pastille en degrade qui glissait sur ressort. Ici, deux
          onglets soulignes : la convention universelle, qui indique en
          plus la position dans un ensemble. */}
      <div className="mb-8 flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" className="flex gap-6">
          {(['projects', 'certifications'] as const).map((key) => {
            const active = tab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(key);
                  setCategory('all');
                  trackEvent('portfolio_onglet', key);
                }}
                className={`relative -mb-[21px] pb-5 text-sm font-medium transition-colors ${
                  active ? 'text-ink' : 'text-faint hover:text-muted'
                }`}
              >
                {t(`portfolio.tabs.${key}`)}
                <span className="ml-1.5 font-mono text-xs text-faint">
                  {key === 'projects' ? projects.length : certifications.length}
                </span>
                {active && (
                  <motion.span
                    layoutId="portfolio-tab"
                    className="absolute inset-x-0 bottom-0 h-px bg-ink"
                    transition={{ duration: 0.25, ease: EASE }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3 py-2 transition-colors focus-within:border-accent sm:w-64">
          <Search size={14} className="shrink-0 text-faint" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('portfolio.search')}
            aria-label={t('portfolio.search')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </label>
      </div>

      {/* --- Filtres par categorie --------------------------------- */}
      {tab === 'projects' && categories.length > 2 && (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={reveal}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === cat
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              {cat === 'all' ? t('portfolio.filters.all') : cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* --- Grille ------------------------------------------------ */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse" />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="border-y border-line py-20 text-center text-sm text-muted">
          {t('portfolio.noResults')}
        </p>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {tab === 'projects'
              ? visibleProjects.map((project, i) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    locale={locale}
                    index={i}
                    onOpen={() => {
                      setDetail(project);
                      trackEvent('projet_detail', project.slug);
                    }}
                  />
                ))
              : visibleCerts.map((certification, i) => (
                  <CertificationCard
                    key={certification.slug}
                    certification={certification}
                    locale={locale}
                    index={i}
                  />
                ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- Fiche detaillee --------------------------------------- */}
      <AnimatePresence>
        {detail && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDetail(null)}
            role="dialog"
            aria-modal="true"
            aria-label={detail.title}
          >
            <motion.div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-surface shadow-e3"
              // 8 px et 220 ms, sans ressort : une fiche modale doit
              // apparaitre, pas rebondir.
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-[16/9] border-b border-line bg-surface-2">
                <img
                  src={detail.image || '/logo2.png'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold">{detail.title}</h3>
                  <button
                    onClick={() => setDetail(null)}
                    aria-label={t('portfolio.close')}
                    className="-m-1 rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-[0.9375rem] leading-relaxed text-muted">
                  {pickLocale(detail.description, locale)}
                </p>

                <div>
                  <h4 className="eyebrow mb-2.5">{t('portfolio.techUsed')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.technologies.map((tech, i) => (
                      <TechChip key={i} tech={tech} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-line pt-5">
                  {detail.github && (
                    <a
                      href={detail.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost flex-1"
                    >
                      <Github size={16} /> {t('portfolio.buttons.github')}
                    </a>
                  )}
                  {detail.liveUrl && (
                    <a
                      href={detail.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex-1"
                    >
                      <ExternalLink size={16} /> {t('portfolio.buttons.visit')}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
