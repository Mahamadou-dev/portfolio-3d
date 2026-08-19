'use client';

// components/sections/SkillsSection.tsx
//
// Les competences, organisees par domaine puis par palier d'usage.
//
// Le probleme que cette organisation resout
// -----------------------------------------
// La version precedente presentait sept categories a plat, toutes de meme
// poids et dans cet ordre : FRONTEND, BACKEND, MOBILE, DESIGN, OUTILS,
// MACHINE LEARNING, CYBERSECURITE. Autrement dit, sur un site qui annonce
// un master recherche en IA puis un doctorat, l'intelligence artificielle
// arrivait en sixieme position, apres Adobe XD, et avec exactement la meme
// mise en forme. Une liste a plat n'exprime aucune specialisation : elle
// dit « je connais 40 outils », ce qui est la lecture d'un prestataire, pas
// celle d'un chercheur.
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
// le justifie, puis on detaille. Le web, le mobile et le design ne
// disparaissent pas — ils passent au rang de moyens, sous le troisieme
// domaine, ce qu'ils sont reellement dans ce profil.
//
// Ce que la structure ne fait PAS
// -------------------------------
// Elle n'ajoute aucune competence. Les technologies listees et leurs
// paliers sont exactement ceux de la version precedente : reorganiser un
// profil, c'est en changer la lecture, pas en gonfler le contenu.
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  SiReact, SiNextdotjs, SiTypescript, SiThreedotjs, SiTailwindcss,
  SiNodedotjs, SiPython, SiDotnet, SiMongodb, SiPostgresql,
  SiFlutter, SiAndroid, SiFigma, SiAdobexd,
  SiGit, SiDocker, SiJavascript, SiHtml5,
  SiCss3, SiSass, SiExpress, SiFirebase, SiNginx,
  SiJest, SiWebpack, SiEslint, SiPrettier, SiPostman, SiFramer,
  SiVite, SiVuedotjs, SiAngular, SiSwift, SiKotlin, SiGraphql,
  SiRedis, SiMysql, SiGooglecloud,
  SiTensorflow, SiPytorch, SiScikitlearn, SiPandas, SiNumpy, SiKeras,
  SiWireshark, SiKalilinux, SiMetasploit, SiBurpsuite, SiOwasp,
} from 'react-icons/si';
import { TbApi } from 'react-icons/tb';
import { FaTools } from 'react-icons/fa';
import { VscVscode } from 'react-icons/vsc';

import { useI18n } from '../i18n-provider';
import { Section, SectionHeader } from '../ui/Section';
import { reveal, revealAt, stagger, viewport } from '../../lib/motion';

/* ================================================================== */
/* Donnees                                                             */
/* ================================================================== */

/**
 * Un palier d'usage, pas une note.
 *
 * (Inchange, et toujours pour la meme raison : les pourcentages
 * auto-attribues — « React 90 % » — n'avaient aucune unite. 90 % de quoi,
 * mesure comment ? Trois paliers decrivent un fait verifiable, que
 * personne ne peut contester de mauvaise foi.)
 */
type Tier = 'core' | 'working' | 'learning';

interface Skill {
  name: string;
  tier: Tier;
  color: string;
}

const iconComponents: Record<string, React.ComponentType<any>> = {
  React: SiReact,
  'Next.js': SiNextdotjs,
  TypeScript: SiTypescript,
  'Three.js': SiThreedotjs,
  'Tailwind CSS': SiTailwindcss,
  'Node.js': SiNodedotjs,
  Python: SiPython,
  'C# .NET': SiDotnet,
  MongoDB: SiMongodb,
  PostgreSQL: SiPostgresql,
  'React Native': SiReact,
  Flutter: SiFlutter,
  Android: SiAndroid,
  Figma: SiFigma,
  'UI/UX': SiFigma,
  'Adobe XD': SiAdobexd,
  Git: SiGit,
  Docker: SiDocker,
  JavaScript: SiJavascript,
  HTML5: SiHtml5,
  CSS3: SiCss3,
  Sass: SiSass,
  Express: SiExpress,
  Firebase: SiFirebase,
  Nginx: SiNginx,
  Jest: SiJest,
  Webpack: SiWebpack,
  ESLint: SiEslint,
  Prettier: SiPrettier,
  Postman: SiPostman,
  Framer: SiFramer,
  Vite: SiVite,
  Vue: SiVuedotjs,
  Angular: SiAngular,
  Swift: SiSwift,
  Kotlin: SiKotlin,
  GraphQL: SiGraphql,
  Redis: SiRedis,
  MySQL: SiMysql,
  'Google Cloud': SiGooglecloud,
  'REST API': TbApi,
  TensorFlow: SiTensorflow,
  PyTorch: SiPytorch,
  'Scikit-learn': SiScikitlearn,
  Pandas: SiPandas,
  NumPy: SiNumpy,
  Keras: SiKeras,
  Wireshark: SiWireshark,
  'Kali Linux': SiKalilinux,
  Metasploit: SiMetasploit,
  'Burp Suite': SiBurpsuite,
  OWASP: SiOwasp,
  'VS Code': VscVscode,
};

const skills: Record<string, Skill[]> = {
  machine_learning: [
    // Python figure ici ET dans le backend. Ce n'est pas un doublon
    // accidentel : c'est le langage de travail des deux domaines, et
    // l'absenter de la rubrique IA rendrait la liste incomprehensible.
    { name: 'Python', tier: 'working', color: '#3776AB' },
    { name: 'PyTorch', tier: 'learning', color: '#EE4C2C' },
    { name: 'TensorFlow', tier: 'learning', color: '#FF6F00' },
    { name: 'Keras', tier: 'learning', color: '#D00000' },
    { name: 'Scikit-learn', tier: 'working', color: '#F7931E' },
    { name: 'Pandas', tier: 'working', color: '#150458' },
    { name: 'NumPy', tier: 'working', color: '#013243' },
  ],
  cybersecurity: [
    { name: 'OWASP', tier: 'working', color: '#E535AB' },
    { name: 'Burp Suite', tier: 'working', color: '#FF6F61' },
    { name: 'Wireshark', tier: 'working', color: '#1A237E' },
    { name: 'Kali Linux', tier: 'learning', color: '#00ADEF' },
    { name: 'Metasploit', tier: 'learning', color: '#FF5722' },
  ],
  backend: [
    { name: 'C# .NET', tier: 'core', color: '#512BD4' },
    { name: 'REST API', tier: 'core', color: '#FF6B6B' },
    { name: 'Node.js', tier: 'working', color: '#339933' },
    { name: 'Python', tier: 'working', color: '#3776AB' },
    { name: 'MongoDB', tier: 'working', color: '#47A248' },
    { name: 'PostgreSQL', tier: 'working', color: '#336791' },
    { name: 'MySQL', tier: 'learning', color: '#4479A1' },
  ],
  frontend: [
    { name: 'TypeScript', tier: 'core', color: '#3178C6' },
    { name: 'React', tier: 'core', color: '#61DAFB' },
    { name: 'Next.js', tier: 'core', color: '#000000' },
    { name: 'JavaScript', tier: 'core', color: '#F7DF1E' },
    { name: 'Tailwind CSS', tier: 'core', color: '#06B6D4' },
    { name: 'HTML5', tier: 'core', color: '#E34F26' },
    { name: 'CSS3', tier: 'core', color: '#1572B6' },
  ],
  mobile: [
    { name: 'Android', tier: 'working', color: '#3DDC84' },
    { name: 'React Native', tier: 'working', color: '#61DAFB' },
    { name: 'Flutter', tier: 'learning', color: '#02569B' },
  ],
  tools: [
    { name: 'Git', tier: 'core', color: '#F05032' },
    { name: 'VS Code', tier: 'core', color: '#007ACC' },
    { name: 'Postman', tier: 'core', color: '#FF6C37' },
    { name: 'Docker', tier: 'working', color: '#2496ED' },
  ],
  design: [
    { name: 'Figma', tier: 'working', color: '#F24E1E' },
    { name: 'UI/UX', tier: 'working', color: '#FF4081' },
    { name: 'Adobe XD', tier: 'working', color: '#FF61F6' },
  ],
};

/**
 * Les trois domaines, dans l'ordre ou ils doivent etre lus.
 *
 * Un domaine a une seule rubrique n'affiche pas de sous-titre : son titre
 * suffit. C'est le cas de l'IA et de la securite, et c'est voulu — ces
 * deux domaines doivent se lire d'un bloc, sans niveau intermediaire qui
 * les fragmenterait.
 */
const DOMAINS = [
  { key: 'ai', groups: ['machine_learning'] },
  { key: 'security', groups: ['cybersecurity'] },
  { key: 'engineering', groups: ['backend', 'frontend', 'mobile', 'tools', 'design'] },
] as const;

/** L'ordre d'affichage des paliers : ce qui est maitrise vient en premier. */
const TIER_ORDER: Tier[] = ['core', 'working', 'learning'];

/**
 * Le marqueur de palier : carre plein, carre evide, carre pointille.
 *
 * Trois FORMES plutot que trois couleurs (l'ancienne version utilisait
 * vert / bleu / ambre). Une forme reste lisible en noir et blanc, a
 * l'impression d'un CV, et pour un lecteur daltonien.
 */
function TierMark({ tier }: { tier: Tier }) {
  const style: Record<Tier, string> = {
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
function SkillRow({ skill }: { skill: Skill }) {
  const Icon = iconComponents[skill.name] || FaTools;
  return (
    <li className="flex items-center gap-3">
      <TierMark tier={skill.tier} />
      <Icon size={16} color={skill.color} className="shrink-0" aria-hidden="true" />
      <span className={`text-sm ${skill.tier === 'learning' ? 'text-faint' : 'text-body'}`}>
        {skill.name}
      </span>
    </li>
  );
}

/** Les technologies d'une rubrique, triees par palier. */
function SkillList({ group, className = 'space-y-2.5' }: { group: string; className?: string }) {
  const sorted = useMemo(
    () => [...skills[group]].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)),
    [group]
  );

  return (
    <ul className={className}>
      {sorted.map((skill) => (
        <SkillRow key={skill.name} skill={skill} />
      ))}
    </ul>
  );
}

/* ================================================================== */

export default function SkillsSection() {
  const { t } = useI18n();

  const strengths = useMemo(
    () => [
      t('skills.strengths.productivity.title'),
      t('skills.strengths.problem_solving.title'),
      t('skills.strengths.perseverance.title'),
    ],
    [t]
  );

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
          explique arrive trop tard. C'est aussi la piece qui donne son
          serieux a la section — elle assume un classement au lieu de
          laisser croire a une notation objective. */}
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

      {/* --- Les trois domaines ----------------------------------- */}
      <div className="space-y-14">
        {DOMAINS.map((domain, index) => {
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
              {/* L'enonce du domaine : numero, titre, role. Colle en
                  haut pendant qu'on parcourt la liste a droite, pour
                  qu'on sache toujours dans quel domaine on se trouve. */}
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

              {/* Les technologies. Un domaine a rubrique unique s'affiche
                  d'un bloc en deux colonnes ; un domaine compose garde ses
                  sous-titres. */}
              {single ? (
                // Une grille plutot qu'un `columns-*` : le multicolonnage
                // decide lui-meme ou couper la liste, et l'espacement
                // vertical se retrouve applique en haut de la 2e colonne.
                // Une grille garde des gouttieres previsibles.
                <SkillList
                  group={domain.groups[0]}
                  className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3"
                />
              ) : (
                <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                  {domain.groups.map((group) => (
                    <div key={group}>
                      <h4 className="eyebrow mb-3.5 border-b border-line pb-2">
                        {t(`skills.categories.${group}.title`)}
                      </h4>
                      <SkillList group={group} />
                    </div>
                  ))}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* --- La methode de travail --------------------------------
          C'etaient trois pastilles rondes a degrade (bleu-cyan,
          violet-rose, orange-rouge) placees EN TETE de la section, avant
          toute competence technique. Ouvrir un profil d'ingenieur par
          trois qualites personnelles non demontrables, c'est commencer
          par le plus faible argument. Elles ferment maintenant la
          section, en une ligne sobre. */}
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
