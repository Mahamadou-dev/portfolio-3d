// lib/content/fallback.ts
// Contenu de secours : si MongoDB n'est pas encore configure (ou injoignable),
// le site public continue de fonctionner avec les donnees des fichiers i18n.
import fr from '../i18n/locales/fr.json';
import en from '../i18n/locales/en.json';
import ha from '../i18n/locales/ha.json';
import type {
  ProjectDoc,
  CertificationDoc,
  SkillDoc,
  SkillDomain,
  SkillCategory,
  ParcoursDoc,
  AboutDoc,
} from '../db/types';

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type RawProject = {
  id: number;
  title: string;
  description: string;
  technologies: { title: string; icon: string; color: string }[];
  image: string;
  github: string;
  liveUrl: string;
  numberOfBranches: number;
  numberOfLikes: number;
};

type RawCert = {
  id: number;
  title: string;
  issuer: string;
  description: string;
  date: string;
  image: string;
  credentialUrl: string;
  skills: string[];
};

const now = new Date(0).toISOString();

function byId<T extends { id: number }>(list: T[], id: number): T | undefined {
  return list.find((x) => x.id === id);
}

export function fallbackProjects(): ProjectDoc[] {
  const base = (fr as any).portfolio.projects as RawProject[];
  const enList = (en as any).portfolio.projects as RawProject[];
  const haList = (ha as any).portfolio.projects as RawProject[];

  return base.map((p, index) => ({
    slug: slugify(p.title),
    title: p.title,
    description: {
      fr: p.description,
      en: byId(enList, p.id)?.description,
      ha: byId(haList, p.id)?.description,
    },
    technologies: p.technologies.map((t) => ({
      title: t.title,
      icon: slugify(t.icon || t.title),
      color: t.color,
    })),
    image: p.image,
    github: p.github,
    liveUrl: p.liveUrl,
    category: 'web',
    featured: index < 3,
    published: true,
    order: index,
    stars: p.numberOfLikes ?? 0,
    forks: p.numberOfBranches ?? 0,
    createdAt: now,
    updatedAt: now,
  }));
}

/* ------------------------------------------------------------------ */
/* Competences — memes technologies et paliers que la version d'origine */
/* ------------------------------------------------------------------ */

const RAW_SKILLS: { name: string; icon: string; color: string; category: SkillCategory; tier: SkillDoc['tier'] }[] = [
  { name: 'Python', icon: 'python', color: '#3776AB', category: 'machine_learning', tier: 'working' },
  { name: 'PyTorch', icon: 'pytorch', color: '#EE4C2C', category: 'machine_learning', tier: 'learning' },
  { name: 'TensorFlow', icon: 'tensorflow', color: '#FF6F00', category: 'machine_learning', tier: 'learning' },
  { name: 'Keras', icon: 'keras', color: '#D00000', category: 'machine_learning', tier: 'learning' },
  { name: 'Scikit-learn', icon: 'scikitlearn', color: '#F7931E', category: 'machine_learning', tier: 'working' },
  { name: 'Pandas', icon: 'pandas', color: '#150458', category: 'machine_learning', tier: 'working' },
  { name: 'NumPy', icon: 'numpy', color: '#013243', category: 'machine_learning', tier: 'working' },
  { name: 'OWASP', icon: 'owasp', color: '#E535AB', category: 'cybersecurity', tier: 'working' },
  { name: 'Burp Suite', icon: 'burpsuite', color: '#FF6F61', category: 'cybersecurity', tier: 'working' },
  { name: 'Wireshark', icon: 'wireshark', color: '#1A237E', category: 'cybersecurity', tier: 'working' },
  { name: 'Kali Linux', icon: 'kalilinux', color: '#00ADEF', category: 'cybersecurity', tier: 'learning' },
  { name: 'Metasploit', icon: 'metasploit', color: '#FF5722', category: 'cybersecurity', tier: 'learning' },
  { name: 'C# .NET', icon: 'dotnet', color: '#512BD4', category: 'backend', tier: 'core' },
  { name: 'REST API', icon: 'restapi', color: '#FF6B6B', category: 'backend', tier: 'core' },
  { name: 'Node.js', icon: 'nodedotjs', color: '#339933', category: 'backend', tier: 'working' },
  { name: 'MongoDB', icon: 'mongodb', color: '#47A248', category: 'backend', tier: 'working' },
  { name: 'PostgreSQL', icon: 'postgresql', color: '#336791', category: 'backend', tier: 'working' },
  { name: 'MySQL', icon: 'mysql', color: '#4479A1', category: 'backend', tier: 'learning' },
  { name: 'TypeScript', icon: 'typescript', color: '#3178C6', category: 'frontend', tier: 'core' },
  { name: 'React', icon: 'react', color: '#61DAFB', category: 'frontend', tier: 'core' },
  { name: 'Next.js', icon: 'nextdotjs', color: '#000000', category: 'frontend', tier: 'core' },
  { name: 'JavaScript', icon: 'javascript', color: '#F7DF1E', category: 'frontend', tier: 'core' },
  { name: 'Tailwind CSS', icon: 'tailwindcss', color: '#06B6D4', category: 'frontend', tier: 'core' },
  { name: 'HTML5', icon: 'html5', color: '#E34F26', category: 'frontend', tier: 'core' },
  { name: 'CSS3', icon: 'css3', color: '#1572B6', category: 'frontend', tier: 'core' },
  { name: 'Android', icon: 'android', color: '#3DDC84', category: 'mobile', tier: 'working' },
  { name: 'React Native', icon: 'react', color: '#61DAFB', category: 'mobile', tier: 'working' },
  { name: 'Flutter', icon: 'flutter', color: '#02569B', category: 'mobile', tier: 'learning' },
  { name: 'Git', icon: 'git', color: '#F05032', category: 'tools', tier: 'core' },
  { name: 'VS Code', icon: 'vscode', color: '#007ACC', category: 'tools', tier: 'core' },
  { name: 'Postman', icon: 'postman', color: '#FF6C37', category: 'tools', tier: 'core' },
  { name: 'Docker', icon: 'docker', color: '#2496ED', category: 'tools', tier: 'working' },
  { name: 'Figma', icon: 'figma', color: '#F24E1E', category: 'design', tier: 'working' },
  { name: 'UI/UX', icon: 'figma', color: '#FF4081', category: 'design', tier: 'working' },
  { name: 'Adobe XD', icon: 'adobexd', color: '#FF61F6', category: 'design', tier: 'working' },
];

const CATEGORY_DOMAIN: Record<SkillCategory, SkillDomain> = {
  machine_learning: 'ai',
  cybersecurity: 'security',
  backend: 'engineering',
  frontend: 'engineering',
  mobile: 'engineering',
  tools: 'engineering',
  design: 'engineering',
};

export function fallbackSkills(): SkillDoc[] {
  return RAW_SKILLS.map((s, index) => ({
    slug: slugify(s.name),
    name: s.name,
    icon: s.icon,
    color: s.color,
    domain: CATEGORY_DOMAIN[s.category],
    category: s.category,
    tier: s.tier,
    published: true,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));
}

/* ------------------------------------------------------------------ */
/* Parcours — memes etapes que la version d'origine, texte francais    */
/* ------------------------------------------------------------------ */

type RawMilestone = {
  title: string;
  institution: string;
  location: string;
  description: string;
  achievements: string[];
  subjects?: string[];
  technologies?: string[];
};

function joinLines(items: string[] | undefined): string {
  return (items ?? []).join('\n');
}

export function fallbackParcours(): ParcoursDoc[] {
  const exp = (fr as any).experience;

  const entries: { key: string; type: 'education' | 'experience'; start: number; end: number | null }[] = [
    { key: 'education.preparatoryYear', type: 'education', start: 2022, end: 2023 },
    { key: 'education.softwareEngineering', type: 'education', start: 2023, end: 2026 },
    { key: 'work.freelance', type: 'experience', start: 2024, end: null },
    { key: 'work.anest', type: 'experience', start: 2024, end: null },
    { key: 'education.masterAI', type: 'education', start: 2026, end: 2027 },
  ];

  return entries.map((entry, index) => {
    const parts = entry.key.split('.');
    const raw: RawMilestone = parts.reduce((obj, part) => obj?.[part], exp);

    return {
      slug: slugify(`${entry.type}-${raw.title}`),
      type: entry.type,
      title: { fr: raw.title },
      institution: { fr: raw.institution },
      location: { fr: raw.location },
      description: { fr: raw.description },
      achievements: { fr: joinLines(raw.achievements) },
      subjects: { fr: joinLines(raw.subjects) },
      technologies: { fr: joinLines(raw.technologies) },
      start: entry.start,
      end: entry.end,
      published: true,
      order: index,
      createdAt: now,
      updatedAt: now,
    };
  });
}

/* ------------------------------------------------------------------ */
/* A propos — singleton                                                */
/* ------------------------------------------------------------------ */

export function fallbackAbout(): AboutDoc {
  const about = (fr as any).about;

  return {
    name: 'Mahamadou Amadou Habou',
    image: '/Me4.png',
    captionLocation: 'Monastir, Tunisie',
    captionYear: '2026',
    story: [
      { fr: `${about.a_young_student} ${about.niger} ${about.residing_in_tunisia_and_it_passionated}` },
      { fr: about.currently_studies },
      { fr: `${about.also_the_founder_and_ceo_of} {gremahtech}, ${about.tiamtech_description}` },
      { fr: about.anest_post },
    ],
    gremahtechUrl: 'https://gremah-tech.vercel.app',
    resumeUrl: 'https://flowcv.com/resume/a5spl1e2vu5a',
    facts: [
      { label: { fr: about.personalInfo.age.label }, value: { fr: about.personalInfo.age.value } },
      { label: { fr: about.personalInfo.nationality.label }, value: { fr: about.personalInfo.nationality.value } },
      { label: { fr: about.personalInfo.location.label }, value: { fr: about.personalInfo.location.value } },
      { label: { fr: about.personalInfo.availability.label }, value: { fr: about.personalInfo.availability.value } },
    ],
    updatedAt: now,
  };
}

export function fallbackCertifications(): CertificationDoc[] {
  const base = (fr as any).portfolio.certifications as RawCert[];
  const enList = (en as any).portfolio.certifications as RawCert[];
  const haList = (ha as any).portfolio.certifications as RawCert[];

  return base.map((c, index) => ({
    slug: slugify(`${c.title}-${c.issuer}`),
    title: c.title,
    issuer: c.issuer,
    description: {
      fr: c.description,
      en: byId(enList, c.id)?.description,
      ha: byId(haList, c.id)?.description,
    },
    date: c.date,
    image: c.image,
    credentialUrl: c.credentialUrl,
    skills: c.skills,
    published: true,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));
}
