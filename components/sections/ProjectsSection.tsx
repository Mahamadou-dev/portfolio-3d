'use client';

// components/sections/ProjectsSection.tsx
import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, ExternalLink, Search, Star, GitFork, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { useI18n } from '../i18n-provider';
import { useProjects, useCertifications, pickLocale } from '../../hooks/useContent';
import { getTech } from '../../lib/tech-icons';
import { trackEvent } from '../analytics/VisitorTracker';
import { Section, SectionHeader } from '../ui/Section';
import { revealAt, reveal, viewport, EASE } from '../../lib/motion';
import type { ProjectDoc, CertificationDoc } from '../../lib/db/types';

const CARDS_PER_PAGE = 3;

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 60, opacity: 0 }),
};

const slideTransition = { duration: 0.35, ease: [0.32, 0, 0.67, 0] as const };

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

function ProjectCard({ project, locale, index, onOpen }: { project: ProjectDoc; locale: string; index: number; onOpen: () => void; }) {
  return (
    <motion.article layout initial="hidden" whileInView="show" viewport={viewport} variants={revealAt(index)} className="card-interactive group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-2">
        <img src={project.image || '/logo2.png'} alt="" loading="lazy" className="h-full w-full object-cover" />
        {project.featured && (<span className="absolute left-3 top-3 rounded-sm bg-paper/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">Selection</span>)}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug">
            <button type="button" onClick={onOpen} className="text-left transition-colors hover:text-accent">
              {project.title}
              <span className="absolute inset-0" aria-hidden="true" />
            </button>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{pickLocale(project.description, locale)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech, i) => (<TechChip key={i} tech={tech} />))}
          {project.technologies.length > 4 && (<span className="chip border-transparent bg-transparent text-faint">+{project.technologies.length - 4}</span>)}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-4 text-xs text-faint">
            {project.stars > 0 && (<span className="flex items-center gap-1.5"><Star size={13} aria-hidden="true" /> {project.stars}</span>)}
            {project.forks > 0 && (<span className="flex items-center gap-1.5"><GitFork size={13} aria-hidden="true" /> {project.forks}</span>)}
          </div>
          <div className="relative z-10 flex items-center gap-1">
            {project.github && (<a href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('projet_github', project.slug)} aria-label={`Code source de ${project.title}`} className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"><Github size={16} /></a>)}
            {project.liveUrl && (<a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('projet_demo', project.slug)} aria-label={`Démo de ${project.title}`} className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"><ExternalLink size={16} /></a>)}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CertificationCard({ certification, locale, index }: { certification: CertificationDoc; locale: string; index: number; }) {
  return (
    <motion.article layout initial="hidden" whileInView="show" viewport={viewport} variants={revealAt(index)} className="card-interactive flex flex-col overflow-hidden">
      <a href={certification.credentialUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('certif_ouverte', certification.slug)} className="block">
        <div className="aspect-[16/10] border-b border-line bg-surface-2 p-4">
          <img src={certification.image || '/logo2.png'} alt="" loading="lazy" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">{certification.issuer}</p>
            <span className="eyebrow text-faint">{certification.date}</span>
          </div>
          <h3 className="text-[0.9375rem] font-semibold leading-snug">{certification.title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{pickLocale(certification.description, locale)}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {certification.skills.slice(0, 3).map((skill, i) => (<span key={i} className="chip">{skill}</span>))}
          </div>
        </div>
      </a>
    </motion.article>
  );
}

function NavButton({ direction, disabled, onClick }: { direction: 'left' | 'right'; disabled: boolean; onClick: () => void; }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Page précédente' : 'Page suivante'}
      className={[
        'absolute top-1/2 z-10 -translate-y-1/2',
        direction === 'left' ? '-left-6' : '-right-6',
        'flex h-12 w-12 items-center justify-center rounded-full',
        'border border-line bg-surface/80 shadow-lg backdrop-blur-sm',
        'text-ink transition-all duration-200',
        'hover:scale-110 hover:bg-surface hover:shadow-xl',
        'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-lg',
        'dark:border-line dark:bg-surface/70 dark:hover:bg-surface',
      ].join(' ')}
    >
      <Icon size={22} strokeWidth={2.5} />
    </button>
  );
}

export default function ProjectsSection() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<'projects' | 'certifications'>('projects');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<ProjectDoc | null>(null);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const { items: projects, loading: loadingProjects } = useProjects();
  const { items: certifications, loading: loadingCerts } = useCertifications();

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return [p.title, pickLocale(p.description, locale), ...p.technologies.map((x) => x.title)].join(' ').toLowerCase().includes(q);
    });
  }, [projects, category, query, locale]);

  const visibleCerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certifications;
    return certifications.filter((c) => [c.title, c.issuer, ...c.skills].join(' ').toLowerCase().includes(q));
  }, [certifications, query]);

  const loading = tab === 'projects' ? loadingProjects : loadingCerts;
  const isEmpty = tab === 'projects' ? visibleProjects.length === 0 : visibleCerts.length === 0;

  const items = tab === 'projects' ? visibleProjects : visibleCerts;
  const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
  const currentItems = items.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  function goTo(next: number) {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  }

  function resetPage() {
    setPage(0);
    setDirection(1);
  }

  return (
    <Section id="portfolio">
      <SectionHeader index="04" eyebrow={t('portfolio.title')} title={t('portfolio.subtitle')} />

      <div className="mb-8 flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" className="flex gap-6">
          {(['projects', 'certifications'] as const).map((key) => {
            const active = tab === key;
            return (
              <button key={key} role="tab" aria-selected={active} onClick={() => { setTab(key); setCategory('all'); resetPage(); trackEvent('portfolio_onglet', key); }} className={`relative -mb-[21px] pb-5 text-sm font-medium transition-colors ${active ? 'text-ink' : 'text-faint hover:text-muted'}`}>
                {t(`portfolio.tabs.${key}`)}
                <span className="ml-1.5 font-mono text-xs text-faint">{key === 'projects' ? projects.length : certifications.length}</span>
                {active && (<motion.span layoutId="portfolio-tab" className="absolute inset-x-0 bottom-0 h-px bg-ink" transition={{ duration: 0.25, ease: EASE }} />)}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3 py-2 transition-colors focus-within:border-accent sm:w-64">
          <Search size={14} className="shrink-0 text-faint" aria-hidden="true" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); resetPage(); }} placeholder={t('portfolio.search')} aria-label={t('portfolio.search')} className="w-full bg-transparent text-sm outline-none placeholder:text-faint" />
        </label>
      </div>

      {tab === 'projects' && categories.length > 2 && (
        <motion.div initial="hidden" whileInView="show" viewport={viewport} variants={reveal} className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setCategory(cat); resetPage(); }} className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${category === cat ? 'border-ink bg-ink text-paper' : 'border-line text-muted hover:border-line-strong hover:text-ink'}`}>
              {cat === 'all' ? t('portfolio.filters.all') : cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* CARROUSEL */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="card h-80 animate-pulse" />))}
        </div>
      ) : isEmpty ? (
        <p className="border-y border-line py-20 text-center text-sm text-muted">{t('portfolio.noResults')}</p>
      ) : (
        <div className="relative px-8">
          {/* Bouton gauche */}
          <NavButton direction="left" disabled={page === 0} onClick={() => goTo(page - 1)} />

          {/* Conteneur overflow-hidden */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${tab}-${category}-${query}-${page}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {tab === 'projects'
                  ? (currentItems as ProjectDoc[]).map((project, i) => (
                      <ProjectCard
                        key={project.slug}
                        project={project}
                        locale={locale}
                        index={i}
                        onOpen={() => { setDetail(project); trackEvent('projet_detail', project.slug); }}
                      />
                    ))
                  : (currentItems as CertificationDoc[]).map((certification, i) => (
                      <CertificationCard
                        key={certification.slug}
                        certification={certification}
                        locale={locale}
                        index={i}
                      />
                    ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton droite */}
          <NavButton direction="right" disabled={page >= totalPages - 1} onClick={() => goTo(page + 1)} />

          {/* Dots indicateur */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Pages du carrousel">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === page}
                  aria-label={`Page ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={[
                    'rounded-full transition-all duration-300',
                    i === page
                      ? 'w-6 h-2 bg-ink'
                      : 'w-2 h-2 bg-line hover:bg-muted',
                  ].join(' ')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal detail */}
      <AnimatePresence>
        {detail && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setDetail(null)} role="dialog" aria-modal="true" aria-label={detail.title}>
            <motion.div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-surface shadow-e3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: EASE }} onClick={(e) => e.stopPropagation()}>
              <div className="aspect-[16/9] border-b border-line bg-surface-2">
                <img src={detail.image || '/logo2.png'} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold">{detail.title}</h3>
                  <button onClick={() => setDetail(null)} aria-label={t('portfolio.close')} className="-m-1 rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"><X size={18} /></button>
                </div>
                <p className="text-[0.9375rem] leading-relaxed text-muted">{pickLocale(detail.description, locale)}</p>
                <div>
                  <h4 className="eyebrow mb-2.5">{t('portfolio.techUsed')}</h4>
                  <div className="flex flex-wrap gap-1.5">{detail.technologies.map((tech, i) => (<TechChip key={i} tech={tech} />))}</div>
                </div>
                <div className="flex flex-wrap gap-3 border-t border-line pt-5">
                  {detail.github && (<a href={detail.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost flex-1"><Github size={16} /> {t('portfolio.buttons.github')}</a>)}
                  {detail.liveUrl && (<a href={detail.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1"><ExternalLink size={16} /> {t('portfolio.buttons.visit')}</a>)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
