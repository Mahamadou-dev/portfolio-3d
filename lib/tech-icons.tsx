// lib/tech-icons.tsx
// Table de correspondance "cle technologie" -> icone + couleur de marque.
// Ajouter une techno au tableau de bord ne demande aucun changement de code :
// si la cle est inconnue, on retombe sur une pastille avec l'initiale.
import React from 'react';
import {
  SiReact, SiNextdotjs, SiNodedotjs, SiThreedotjs, SiMongodb, SiPython,
  SiTensorflow, SiTailwindcss, SiTypescript, SiJavascript, SiDocker,
  SiPostgresql, SiMysql, SiFirebase, SiAppwrite, SiFlutter, SiDart,
  SiSpringboot, SiFastapi, SiExpress, SiVercel, SiGit, SiGithub, SiLinux,
  SiSupabase, SiRedis, SiGraphql, SiPrisma, SiKotlin, SiPhp, SiLaravel,
  SiHtml5, SiCss3, SiFigma, SiKubernetes, SiOpenai, SiPandas, SiNumpy,
  SiScikitlearn, SiJupyter, SiElectron, SiVite, SiSwiper, SiStripe,
  SiCloudflare, SiNginx, SiRust, SiGo, SiSharp, SiDotnet, SiFramer, SiRender,
} from 'react-icons/si';
import { FaJava, FaAws, FaDatabase, FaCode, FaBrain, FaMobileAlt } from 'react-icons/fa';
import { VscAzure } from 'react-icons/vsc';

export interface TechMeta {
  label: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/** Cles normalisees (slug) -> metadonnees. */
export const TECH_REGISTRY: Record<string, TechMeta> = {
  react: { label: 'React', color: '#61DAFB', Icon: SiReact },
  'react-native': { label: 'React Native', color: '#61DAFB', Icon: SiReact },
  reactjs: { label: 'React', color: '#61DAFB', Icon: SiReact },
  nextjs: { label: 'Next.js', color: '#000000', Icon: SiNextdotjs },
  'next-js': { label: 'Next.js', color: '#000000', Icon: SiNextdotjs },
  nodejs: { label: 'Node.js', color: '#339933', Icon: SiNodedotjs },
  'node-js': { label: 'Node.js', color: '#339933', Icon: SiNodedotjs },
  threejs: { label: 'Three.js', color: '#049EF4', Icon: SiThreedotjs },
  'three-js': { label: 'Three.js', color: '#049EF4', Icon: SiThreedotjs },
  mongodb: { label: 'MongoDB', color: '#47A248', Icon: SiMongodb },
  'mongodb-atlas': { label: 'MongoDB Atlas', color: '#47A248', Icon: SiMongodb },
  python: { label: 'Python', color: '#3776AB', Icon: SiPython },
  tensorflow: { label: 'TensorFlow', color: '#FF6F00', Icon: SiTensorflow },
  'tailwind-css': { label: 'Tailwind CSS', color: '#38BDF8', Icon: SiTailwindcss },
  tailwindcss: { label: 'Tailwind CSS', color: '#38BDF8', Icon: SiTailwindcss },
  typescript: { label: 'TypeScript', color: '#3178C6', Icon: SiTypescript },
  javascript: { label: 'JavaScript', color: '#F7DF1E', Icon: SiJavascript },
  docker: { label: 'Docker', color: '#2496ED', Icon: SiDocker },
  dockerfile: { label: 'Docker', color: '#2496ED', Icon: SiDocker },
  postgresql: { label: 'PostgreSQL', color: '#4169E1', Icon: SiPostgresql },
  mysql: { label: 'MySQL', color: '#4479A1', Icon: SiMysql },
  firebase: { label: 'Firebase', color: '#FFCA28', Icon: SiFirebase },
  'firebase-cloud-messaging': { label: 'Firebase FCM', color: '#FFCA28', Icon: SiFirebase },
  appwrite: { label: 'Appwrite', color: '#FD366E', Icon: SiAppwrite },
  'appwrite-database': { label: 'Appwrite', color: '#FD366E', Icon: SiAppwrite },
  flutter: { label: 'Flutter', color: '#02569B', Icon: SiFlutter },
  dart: { label: 'Dart', color: '#0175C2', Icon: SiDart },
  'spring-boot': { label: 'Spring Boot', color: '#6DB33F', Icon: SiSpringboot },
  springboot: { label: 'Spring Boot', color: '#6DB33F', Icon: SiSpringboot },
  fastapi: { label: 'FastAPI', color: '#009688', Icon: SiFastapi },
  expressjs: { label: 'Express', color: '#6b7280', Icon: SiExpress },
  express: { label: 'Express', color: '#6b7280', Icon: SiExpress },
  vercel: { label: 'Vercel', color: '#000000', Icon: SiVercel },
  git: { label: 'Git', color: '#F05032', Icon: SiGit },
  github: { label: 'GitHub', color: '#6b7280', Icon: SiGithub },
  linux: { label: 'Linux', color: '#FCC624', Icon: SiLinux },
  supabase: { label: 'Supabase', color: '#3ECF8E', Icon: SiSupabase },
  redis: { label: 'Redis', color: '#DC382D', Icon: SiRedis },
  graphql: { label: 'GraphQL', color: '#E10098', Icon: SiGraphql },
  prisma: { label: 'Prisma', color: '#2D3748', Icon: SiPrisma },
  kotlin: { label: 'Kotlin', color: '#7F52FF', Icon: SiKotlin },
  php: { label: 'PHP', color: '#777BB4', Icon: SiPhp },
  laravel: { label: 'Laravel', color: '#FF2D20', Icon: SiLaravel },
  html5: { label: 'HTML5', color: '#E34F26', Icon: SiHtml5 },
  html: { label: 'HTML5', color: '#E34F26', Icon: SiHtml5 },
  css3: { label: 'CSS3', color: '#1572B6', Icon: SiCss3 },
  css: { label: 'CSS3', color: '#1572B6', Icon: SiCss3 },
  figma: { label: 'Figma', color: '#F24E1E', Icon: SiFigma },
  kubernetes: { label: 'Kubernetes', color: '#326CE5', Icon: SiKubernetes },
  openai: { label: 'OpenAI', color: '#412991', Icon: SiOpenai },
  llm: { label: 'LLM', color: '#8B5CF6', Icon: FaBrain },
  pandas: { label: 'Pandas', color: '#150458', Icon: SiPandas },
  numpy: { label: 'NumPy', color: '#013243', Icon: SiNumpy },
  'scikit-learn': { label: 'scikit-learn', color: '#F7931E', Icon: SiScikitlearn },
  jupyter: { label: 'Jupyter', color: '#F37626', Icon: SiJupyter },
  'jupyter-notebook': { label: 'Jupyter', color: '#F37626', Icon: SiJupyter },
  electron: { label: 'Electron', color: '#47848F', Icon: SiElectron },
  vite: { label: 'Vite', color: '#646CFF', Icon: SiVite },
  swiper: { label: 'Swiper', color: '#0080FF', Icon: SiSwiper },
  stripe: { label: 'Stripe', color: '#635BFF', Icon: SiStripe },
  cloudflare: { label: 'Cloudflare', color: '#F38020', Icon: SiCloudflare },
  nginx: { label: 'NGINX', color: '#009639', Icon: SiNginx },
  rust: { label: 'Rust', color: '#DEA584', Icon: SiRust },
  go: { label: 'Go', color: '#00ADD8', Icon: SiGo },
  csharp: { label: 'C#', color: '#512BD4', Icon: SiSharp },
  'c-sharp': { label: 'C#', color: '#512BD4', Icon: SiSharp },
  dotnet: { label: '.NET', color: '#512BD4', Icon: SiDotnet },
  java: { label: 'Java', color: '#E76F00', Icon: FaJava },
  aws: { label: 'AWS', color: '#FF9900', Icon: FaAws },
  'amazon-web-services': { label: 'AWS', color: '#FF9900', Icon: FaAws },
  azure: { label: 'Azure', color: '#0078D4', Icon: VscAzure },
  'microsoft-azure': { label: 'Azure', color: '#0078D4', Icon: VscAzure },
  'deep-learning': { label: 'Deep Learning', color: '#8B5CF6', Icon: FaBrain },
  'machine-learning': { label: 'Machine Learning', color: '#8B5CF6', Icon: FaBrain },
  ai: { label: 'IA', color: '#8B5CF6', Icon: FaBrain },
  mobile: { label: 'Mobile', color: '#06B6D4', Icon: FaMobileAlt },
  android: { label: 'Android', color: '#3DDC84', Icon: FaMobileAlt },
  sql: { label: 'SQL', color: '#4479A1', Icon: FaDatabase },
  microservices: { label: 'Microservices', color: '#0EA5E9', Icon: FaCode },
  // Cles heritees du contenu i18n d'origine : conservees pour que les fiches
  // existantes gardent une icone correcte avant la synchronisation GitHub.
  'framer-motion': { label: 'Framer Motion', color: '#0055FF', Icon: SiFramer },
  huggingface: { label: 'Hugging Face', color: '#FFD21E', Icon: FaBrain },
  render: { label: 'Render', color: '#46E3B7', Icon: SiRender },
  asp: { label: 'ASP.NET', color: '#512BD4', Icon: SiDotnet },
  'entity-framework': { label: 'Entity Framework', color: '#512BD4', Icon: FaDatabase },
  'sql-server': { label: 'SQL Server', color: '#CC2927', Icon: FaDatabase },
  javaswing: { label: 'Java Swing', color: '#E76F00', Icon: FaJava },
  'jakarta-ee': { label: 'Jakarta EE', color: '#E76F00', Icon: FaJava },
};

/** Pastille de repli : initiale coloree, toujours lisible. */
function FallbackIcon({ className }: { className?: string }) {
  return <FaCode className={className} />;
}

export function getTech(key: string, fallbackLabel?: string, fallbackColor?: string): TechMeta {
  const found = TECH_REGISTRY[key?.toLowerCase?.() ?? ''];
  if (found) return found;
  return {
    label: fallbackLabel || key || 'Tech',
    color: fallbackColor || '#6b7280',
    Icon: FallbackIcon,
  };
}
