'use client';

// components/sections/SkillsSection.tsx
//
// Les competences, par palier d'usage.
//
// Ce qui a change
// ---------------
// Les accordeons portaient un halo bleu permanent (« bordure electrocutee »
// dans l'ancien commentaire), qui passait a 20 px de diffusion au survol,
// avec une transition en ressort. Sept panneaux qui rayonnent en meme
// temps ne hierarchisent rien : ils demandent tous la meme attention.
//
// Et surtout : tout etait replie sauf un. Un recruteur qui veut savoir si
// vous connaissez PyTorch devait ouvrir sept panneaux pour en etre sur.
// Une section « competences » dont les competences sont cachees se bat
// contre son propre but.
//
// Maintenant : tout est visible, en colonnes. Le palier — courant,
// operationnel, en apprentissage — est le seul classement, et il est
// porte par un intitule ecrit, pas par une couleur qu'il faut decoder.
// Chaque logo garde sa couleur de marque : c'est la seule couleur
// autorisee dans la grille, et elle sert a la reconnaissance, pas a la
// decoration.
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

/* ------------------------------------------------------------------ */
/* Donnees                                                             */
/* ------------------------------------------------------------------ */

/**
 * Un palier d'usage, pas une note.
 *
 * (Inchange depuis la version precedente, et toujours pour la meme
 * raison : les pourcentages auto-attribues — « React 90 % » — n'avaient
 * aucune unite. Trois paliers decrivent un fait verifiable.)
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
  frontend: [
    { name: 'React', tier: 'core', color: '#61DAFB' },
    { name: 'Next.js', tier: 'core', color: '#000000' },
    { name: 'TypeScript', tier: 'core', color: '#3178C6' },
    { name: 'JavaScript', tier: 'core', color: '#F7DF1E' },
    { name: 'Tailwind CSS', tier: 'core', color: '#06B6D4' },
    { name: 'HTML5', tier: 'core', color: '#E34F26' },
    { name: 'CSS3', tier: 'core', color: '#1572B6' },
  ],
  backend: [
    { name: 'Node.js', tier: 'working', color: '#339933' },
    { name: 'Python', tier: 'working', color: '#3776AB' },
    { name: 'C# .NET', tier: 'core', color: '#512BD4' },
    { name: 'MongoDB', tier: 'working', color: '#47A248' },
    { name: 'PostgreSQL', tier: 'working', color: '#336791' },
    { name: 'MySQL', tier: 'learning', color: '#4479A1' },
    { name: 'REST API', tier: 'core', color: '#FF6B6B' },
  ],
  mobile: [
    { name: 'React Native', tier: 'working', color: '#61DAFB' },
    { name: 'Flutter', tier: 'learning', color: '#02569B' },
    { name: 'Android', tier: 'working', color: '#3DDC84' },
  ],
  design: [
    { name: 'Figma', tier: 'working', color: '#F24E1E' },
    { name: 'UI/UX', tier: 'working', color: '#FF4081' },
    { name: 'Adobe XD', tier: 'working', color: '#FF61F6' },
  ],
  tools: [
    { name: 'Git', tier: 'core', color: '#F05032' },
    { name: 'Docker', tier: 'working', color: '#2496ED' },
    { name: 'VS Code', tier: 'core', color: '#007ACC' },
    { name: 'Postman', tier: 'core', color: '#FF6C37' },
  ],
  machine_learning: [
    { name: 'TensorFlow', tier: 'learning', color: '#FF6F00' },
    { name: 'PyTorch', tier: 'learning', color: '#EE4C2C' },
    { name: 'Scikit-learn', tier: 'working', color: '#F7931E' },
    { name: 'Pandas', tier: 'working', color: '#150458' },
    { name: 'NumPy', tier: 'working', color: '#013243' },
    { name: 'Keras', tier: 'learning', color: '#D00000' },
  ],
  cybersecurity: [
    { name: 'Wireshark', tier: 'working', color: '#1A237E' },
    { name: 'Kali Linux', tier: 'learning', color: '#00ADEF' },
    { name: 'Metasploit', tier: 'learning', color: '#FF5722' },
    { name: 'Burp Suite', tier: 'working', color: '#FF6F61' },
    { name: 'OWASP', tier: 'working', color: '#E535AB' },
  ],
};

const CATEGORY_KEYS = [
  'frontend',
  'backend',
  'machine_learning',
  'cybersecurity',
  'mobile',
  'tools',
  'design',
] as const;

/** L'ordre d'affichage des paliers : ce qui est maitrise vient en premier. */
const TIER_ORDER: Tier[] = ['core', 'working', 'learning'];

/**
 * Le marqueur de palier. Un carre plein, un carre evide, un carre pointille.
 *
 * Trois formes distinctes plutot que trois couleurs (vert / bleu / ambre) :
 * la forme reste lisible en noir et blanc, a l'impression, et pour un
 * lecteur daltonien. La couleur des trois marqueurs est desormais la meme
 * — celle du texte courant.
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

/* ------------------------------------------------------------------ */

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
        title={t('skills.recent_technologies_intro')}
        lead={t('skills.levelsNote')}
      />

      {/* --- Les points forts --------------------------------------
          C'etaient trois pastilles rondes de 48 px, chacune avec son
          propre degrade (bleu-cyan, violet-rose, orange-rouge), sous un
          en-tete centre. Trois degrades pour trois mots. Ici, trois
          mots — numerotes, alignes, et c'est tout. */}
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={stagger}
        className="mb-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3"
      >
        {strengths.map((strength, i) => (
          <motion.li key={strength} variants={reveal} className="bg-surface p-5">
            <span className="eyebrow text-accent">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-2 text-[0.9375rem] font-medium leading-snug text-ink">{strength}</p>
          </motion.li>
        ))}
      </motion.ul>

      {/* --- La legende des paliers --------------------------------
          Elle est placee AVANT la grille, pas apres : une legende qui
          suit ce qu'elle explique arrive trop tard. */}
      <motion.dl
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={reveal}
        className="mb-10 flex flex-col gap-3 border-y border-line py-5 sm:flex-row sm:flex-wrap sm:gap-x-10"
      >
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="flex items-baseline gap-2.5">
            <span className="translate-y-[-1px]">
              <TierMark tier={tier} />
            </span>
            <dt className="text-sm font-medium text-ink">{t(`skills.levels.${tier}.label`)}</dt>
            <dd className="text-sm text-faint">{t(`skills.levels.${tier}.hint`)}</dd>
          </div>
        ))}
      </motion.dl>

      {/* --- La grille des categories ------------------------------ */}
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_KEYS.map((key, index) => (
          <motion.div
            key={key}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={revealAt(index)}
          >
            <h3 className="mb-4 border-b border-line pb-2.5 text-sm font-semibold tracking-normal text-ink">
              {t(`skills.categories.${key}.title`)}
            </h3>

            <ul className="space-y-2.5">
              {/* Les technologies sont triees par palier, pas groupees
                  sous trois sous-titres : dans une colonne de cinq
                  lignes, trois en-tetes de groupe pesaient plus lourd
                  que le contenu. Le marqueur en debut de ligne porte
                  l'information, et le tri fait que les paliers restent
                  contigus. */}
              {[...skills[key]]
                .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
                .map((skill) => {
                  const Icon = iconComponents[skill.name] || FaTools;
                  return (
                    <li key={skill.name} className="flex items-center gap-3">
                      <TierMark tier={skill.tier} />
                      <Icon
                        size={16}
                        color={skill.color}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm ${
                          skill.tier === 'learning' ? 'text-faint' : 'text-body'
                        }`}
                      >
                        {skill.name}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
