'use client';

// components/sections/AboutSection.tsx
//
// Le portrait et le recit.
//
// Le contenu (portrait, recit, informations personnelles) est gere depuis
// le tableau de bord (/admin/about) et sert via /api/content/about. Ce
// fichier ne fait plus que la mise en forme.
//
// Le jeton {gremahtech} dans un paragraphe du recit est remplace par le
// lien vers GremahTech ; le jeton {age} dans une valeur d'information est
// remplace par l'age reel, calcule cote client.
import Image from 'next/image';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { useI18n } from '../i18n-provider';
import { useAbout, pickLocale } from '../../hooks/useContent';
import { currentAge } from '../../lib/profile';
import { Section, SectionHeader } from '../ui/Section';
import { reveal, revealAt, viewport } from '../../lib/motion';

/** Coupe un paragraphe sur {gremahtech} et insere le lien a sa place. */
function renderParagraph(text: string, url: string) {
  const parts = text.split('{gremahtech}');
  if (parts.length === 1) return text;

  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent underline decoration-accent-line underline-offset-2 transition-colors hover:decoration-accent"
        >
          GremahTech
        </a>
      )}
    </Fragment>
  ));
}

export default function AboutSection() {
  const { t, locale } = useI18n();
  const { item } = useAbout();

  if (!item) return null;

  const facts = item.facts.map((fact) => ({
    label: pickLocale(fact.label, locale),
    value: pickLocale(fact.value, locale).replace('{age}', String(currentAge())),
  }));

  const story = item.story
    .map((p) => pickLocale(p, locale))
    .filter(Boolean);

  return (
    <Section id="about">
      <SectionHeader
        index="01"
        eyebrow={t('about.title')}
        title={`${t('about.introduction')} ${item.name}`}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        {/* ---------------------------------------------------------- */}
        {/* Portrait                                                   */}
        {/* ---------------------------------------------------------- */}
        <motion.figure
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={reveal}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <div className="overflow-hidden rounded-lg border border-line bg-surface-2 shadow-e2">
            <Image
              src={item.image || '/Me4.png'}
              alt={`Portrait de ${item.name}`}
              width={640}
              height={800}
              className="aspect-[4/5] w-full object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 20rem"
            />
          </div>

          <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <span className="eyebrow">{item.captionLocation}</span>
            <span className="eyebrow text-faint">{item.captionYear}</span>
          </figcaption>
        </motion.figure>

        {/* ---------------------------------------------------------- */}
        {/* Recit                                                      */}
        {/* ---------------------------------------------------------- */}
        <div>
          <div className="space-y-4 text-[1.0625rem] leading-relaxed text-muted">
            {story.map((paragraph, i) => (
              <motion.p
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={viewport}
                variants={revealAt(i)}
              >
                {renderParagraph(paragraph, item.gremahtechUrl)}
              </motion.p>
            ))}
          </div>

          {facts.length > 0 && (
            <motion.dl
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={reveal}
              className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-4"
            >
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="eyebrow mb-1.5">{fact.label}</dt>
                  <dd className="text-sm font-medium leading-snug text-ink">{fact.value}</dd>
                </div>
              ))}
            </motion.dl>
          )}

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={reveal}
            className="mt-8 flex flex-wrap gap-3"
          >
            {item.resumeUrl && (
              <a href={item.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <Download size={16} />
                {t('about.download_my_resume_button_text')}
              </a>
            )}
            {item.gremahtechUrl && (
              <a href={item.gremahtechUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                GremahTech
                <ArrowUpRight size={16} />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
