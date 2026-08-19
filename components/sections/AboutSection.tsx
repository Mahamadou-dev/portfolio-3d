'use client';

// components/sections/AboutSection.tsx
//
// Le portrait et le recit.
//
// Ce qui a change : le portrait etait cercle de deux anneaux contrarotatifs
// et de huit points qui clignotaient en cascade — soit dix animations en
// boucle infinie autour d'un visage. Le cadre lui-meme etait un degre
// bleu-violet-cyan avec deux coins arrondis a 100 px, une forme
// d'affiche. Ici : un cadre droit, une bordure d'un pixel, et une legende.
// Le regard va au visage parce que plus rien ne tourne autour.
//
// Les quatre informations personnelles etaient des cartes a pastille
// degradee portant un emoji. Elles deviennent une liste de definition
// (<dl>), qui est le balisage exact de « une etiquette, une valeur » — et
// qui se lit correctement dans un lecteur d'ecran, ce que quatre <div>
// empiles ne faisaient pas.
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { useI18n } from '../i18n-provider';
import { currentAge } from '../../lib/profile';
import { Section, SectionHeader } from '../ui/Section';
import { reveal, revealAt, viewport } from '../../lib/motion';

export default function AboutSection() {
  const { t } = useI18n();

  const facts = [
    {
      label: t('about.personalInfo.age.label'),
      // L'age est calcule depuis l'annee de naissance : rien a maintenir.
      value: t('about.personalInfo.age.value').replace('{age}', String(currentAge())),
    },
    {
      label: t('about.personalInfo.nationality.label'),
      value: t('about.personalInfo.nationality.value'),
    },
    {
      label: t('about.personalInfo.location.label'),
      value: t('about.personalInfo.location.value'),
    },
    {
      label: t('about.personalInfo.availability.label'),
      value: t('about.personalInfo.availability.value'),
    },
  ];

  // Les quatre paragraphes du recit. Les regrouper permet de les reveler
  // en cascade sans repeter cinq fois les memes props d'animation.
  const story = [
    <>
      <span className="font-medium text-ink">{t('about.a_young_student')}</span>{' '}
      <span className="font-medium text-ink">{t('about.niger')}</span>{' '}
      {t('about.residing_in_tunisia_and_it_passionated')}
    </>,
    t('about.currently_studies'),
    <>
      {t('about.also_the_founder_and_ceo_of')}{' '}
      <a
        href="https://gremah-tech.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        // Le lien est souligne. C'est la seule facon fiable de signaler un
        // lien dans un paragraphe : la couleur seule echoue pour un
        // lecteur daltonien, et le degrade violet-rose precedent ne
        // ressemblait pas du tout a un lien.
        className="font-medium text-accent underline decoration-accent-line underline-offset-2 transition-colors hover:decoration-accent"
      >
        GremahTech
      </a>
      , {t('about.tiamtech_description')}
    </>,
    t('about.anest_post'),
  ];

  return (
    <Section id="about">
      <SectionHeader
        index="01"
        eyebrow={t('about.title')}
        title={`${t('about.introduction')} Mahamadou Amadou Habou`}
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
              src="/Me4.png"
              alt="Portrait de Mahamadou Amadou Habou Gremah"
              width={640}
              height={800}
              className="aspect-[4/5] w-full object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 20rem"
            />
          </div>

          <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <span className="eyebrow">Monastir, Tunisie</span>
            <span className="eyebrow text-faint">2026</span>
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
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Les faits. Une grille de definitions : etiquette en petit
              monospace au-dessus, valeur en encre pleine en dessous. Cette
              inversion (l'etiquette discrete, la valeur affirmee) est ce
              qui rend un tableau de donnees lisible en un coup d'oeil. */}
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

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={reveal}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="https://flowcv.com/resume/a5spl1e2vu5a"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <Download size={16} />
              {t('about.download_my_resume_button_text')}
            </a>
            <a
              href="https://gremah-tech.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              GremahTech
              <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
