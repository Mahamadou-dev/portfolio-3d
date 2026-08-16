'use client';

// components/sections/ProjectsSection.tsx
// Vitrine projets + certifications. Le contenu vient de l'API (MongoDB) avec
// repli automatique sur les fichiers i18n : rien a recompiler pour ajouter
// une entree depuis le tableau de bord.
import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BsGithub } from 'react-icons/bs';
import { HiExternalLink } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import { FaCodeBranch, FaSearch } from 'react-icons/fa';

import { useI18n } from '../i18n-provider';
import { useProjects, useCertifications, pickLocale } from '../../hooks/useContent';
import { getTech } from '../../lib/tech-icons';
import { trackEvent } from '../analytics/VisitorTracker';
import type { ProjectDoc, CertificationDoc } from '../../lib/db/types';

/* ------------------------------------------------------------------ */
/* Primitives visuelles                                                */
/* ------------------------------------------------------------------ */

/** Carte en verre depoli, socle visuel commun a toute la section. */
const glass =
  'rounded-2xl border border-white/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] ' +
  'backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]';

function TechChip({ tech }: { tech: { title: string; icon: string; color: string } }) {
  const meta = getTech(tech.icon, tech.title, tech.color);
  const { Icon } = meta;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10
                 bg-black/[0.03] dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium
                 text-gray-700 dark:text-gray-200"
    >
      <Icon className="text-[13px]" />
      {tech.title || meta.label}
    </span>
  );
}

/** Carte projet : le survol incline legerement la carte (effet parallaxe). */
function ProjectCard({
  project,
  locale,
  onOpen,
}: {
  project: ProjectDoc;
  locale: string;
  onOpen: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    // Amplitude volontairement faible : on veut du relief, pas du vertige.
    setTilt({ x: -py * 6, y: px * 8 });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className={`${glass} group relative flex flex-col overflow-hidden transition-shadow duration-300
                  hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.45)]`}
    >
      {project.featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600
                         px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          ★
        </span>
      )}

      <div className="relative h-44 overflow-hidden">
        <img
          src={project.image || '/logo2.png'}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Voile degrade : garantit la lisibilite du titre quelle que soit l'image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <h3 className="absolute bottom-3 left-4 right-4 truncate text-lg font-semibold text-white">
          {project.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {pickLocale(project.description, locale)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((tech, i) => (
            <TechChip key={i} tech={tech} />
          ))}
          {project.technologies.length > 5 && (
            <span className="self-center text-[11px] text-gray-500">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {project.stars > 0 && (
              <span className="flex items-center gap-1">
                <AiFillStar className="text-yellow-500" /> {project.stars}
              </span>
            )}
            {project.forks > 0 && (
              <span className="flex items-center gap-1">
                <FaCodeBranch /> {project.forks}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('projet_github', project.slug)}
                aria-label={`Code source de ${project.title}`}
                className="rounded-lg border border-black/10 dark:border-white/15 p-2 text-gray-700
                           transition-colors hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <BsGithub />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('projet_demo', project.slug)}
                aria-label={`Démo de ${project.title}`}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white
                           transition-transform hover:scale-105"
              >
                <HiExternalLink />
              </a>
            )}
            <button
              onClick={onOpen}
              className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition-colors
                         hover:bg-blue-600/10 dark:text-blue-400"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CertificationCard({
  certification,
  locale,
}: {
  certification: CertificationDoc;
  locale: string;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`${glass} group flex flex-col overflow-hidden`}
    >
      <a
        href={certification.credentialUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('certif_ouverte', certification.slug)}
        className="relative block h-40 overflow-hidden"
      >
        <img
          src={certification.image || '/logo2.png'}
          alt={certification.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
          {certification.date}
        </span>
      </a>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {certification.title}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">{certification.issuer}</p>
        </div>

        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {pickLocale(certification.description, locale)}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {certification.skills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const ProjectsSection: React.FC = () => {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<'projects' | 'certifications'>('projects');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<ProjectDoc | null>(null);

  const { items: projects, loading: loadingProjects } = useProjects();
  const { items: certifications, loading: loadingCerts } = useCertifications();

  // Les categories sont deduites du contenu : ajouter une categorie dans le
  // tableau de bord la fait apparaitre ici automatiquement.
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        pickLocale(p.description, locale),
        ...p.technologies.map((tech) => tech.title),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
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
    <section id="portfolio" className="relative scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-screen-xl">
        {/* En-tete */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="mb-3 text-3xl font-bold md:text-4xl"
            style={{
              backgroundImage: 'linear-gradient(120deg,#3b82f6,#8b5cf6 45%,#06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('portfolio.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            {t('portfolio.subtitle')}
          </p>
        </motion.div>

        {/* Barre de controle : onglets + recherche + filtres */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className={`${glass} inline-flex rounded-full p-1`}>
              {(['projects', 'certifications'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setCategory('all');
                    trackEvent('portfolio_onglet', key);
                  }}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    tab === key
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {tab === key && (
                    <motion.span
                      layoutId="portfolio-tab"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {t(`portfolio.tabs.${key}`)}{' '}
                  <span className="opacity-70">
                    ({key === 'projects' ? projects.length : certifications.length})
                  </span>
                </button>
              ))}
            </div>

            <div className={`${glass} flex items-center gap-2 rounded-full px-4 py-2`}>
              <FaSearch className="text-xs text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('portfolio.search')}
                aria-label={t('portfolio.search')}
                className="w-40 bg-transparent text-sm outline-none placeholder:text-gray-400 sm:w-56"
              />
            </div>
          </div>

          {tab === 'projects' && categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                    category === cat
                      ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300'
                      : 'border-black/10 text-gray-600 hover:border-blue-400 dark:border-white/10 dark:text-gray-400'
                  }`}
                >
                  {cat === 'all' ? t('portfolio.filters.all') : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${glass} h-80 animate-pulse`} />
            ))}
          </div>
        ) : isEmpty ? (
          <p className="py-16 text-center text-gray-500 dark:text-gray-400">
            {t('portfolio.noResults')}
          </p>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {tab === 'projects'
                ? visibleProjects.map((project) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      locale={locale}
                      onOpen={() => {
                        setDetail(project);
                        trackEvent('projet_detail', project.slug);
                      }}
                    />
                  ))
                : visibleCerts.map((certification) => (
                    <CertificationCard
                      key={certification.slug}
                      certification={certification}
                      locale={locale}
                    />
                  ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Fiche detaillee */}
      <AnimatePresence>
        {detail && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
            role="dialog"
            aria-modal="true"
            aria-label={detail.title}
          >
            <motion.div
              className={`${glass} max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-white dark:bg-gray-950`}
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={detail.image || '/logo2.png'}
                alt={detail.title}
                className="h-56 w-full object-cover"
              />
              <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{detail.title}</h3>
                  <button
                    onClick={() => setDetail(null)}
                    aria-label={t('portfolio.close')}
                    className="rounded-lg px-3 py-1 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {pickLocale(detail.description, locale)}
                </p>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {t('portfolio.techUsed')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.technologies.map((tech, i) => (
                      <TechChip key={i} tech={tech} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {detail.github && (
                    <a
                      href={detail.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border
                                 border-black/10 px-4 py-2.5 text-sm dark:border-white/15"
                    >
                      <BsGithub /> {t('portfolio.buttons.github')}
                    </a>
                  )}
                  {detail.liveUrl && (
                    <a
                      href={detail.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg
                                 bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm text-white"
                    >
                      <HiExternalLink /> {t('portfolio.buttons.visit')}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
