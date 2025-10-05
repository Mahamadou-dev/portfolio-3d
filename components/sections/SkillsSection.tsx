'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from "../i18n-provider";

// Import des icônes
import { 
  SiReact, SiNextdotjs, SiTypescript, SiThreedotjs, SiTailwindcss,
  SiNodedotjs, SiPython, SiDotnet, SiMongodb, SiPostgresql,
  SiFlutter, SiAndroid, SiFigma, SiAdobexd,
  SiGit, SiDocker, SiJavascript, SiHtml5,
  SiCss3, SiSass, SiExpress, SiFirebase,
  SiJest, SiWebpack, SiEslint, SiPrettier, SiPostman, SiFramer,
  SiVite, SiVuedotjs, SiAngular, SiSwift, SiKotlin, SiGraphql,
  SiRedis, SiMysql, SiGooglecloud
} from 'react-icons/si';

import { TbApi, TbCoffee } from 'react-icons/tb';
import { FaServer, FaMobile, FaPaintBrush, FaTools, FaBrain, FaTasks } from 'react-icons/fa';

// Types TypeScript
interface Skill {
  name: string;
  level: number;
  color: string;
}

interface SkillCategory {
  key: string;
  skills: Skill[];
}

interface Strength {
  title: string;
  icon: JSX.Element;
  color: string;
}

// Mapping des icônes pour les technologies
const iconComponents: { [key: string]: React.ComponentType<any> } = {
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
  Nginx: SiDocker,
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
  'REST API': TbApi
};

// Icônes pour les catégories
const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  frontend: FaMobile,
  backend: FaServer,
  mobile: FaMobile,
  design: FaPaintBrush,
  tools: FaTools
};

const skills: { [key: string]: Skill[] } = {
  frontend: [
    { name: 'React', level: 90, color: '#61DAFB' },
    { name: 'Next.js', level: 85, color: '#000000' },
    { name: 'TypeScript', level: 85, color: '#3178C6' },
    { name: 'JavaScript', level: 88, color: '#F7DF1E' },
    { name: 'Tailwind CSS', level: 90, color: '#06B6D4' },
    { name: 'HTML5', level: 95, color: '#E34F26' },
    { name: 'CSS3', level: 90, color: '#1572B6' },
  ],
  backend: [
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'Python', level: 70, color: '#3776AB' },
    { name: 'C# .NET', level: 85, color: '#512BD4' },
    { name: 'MongoDB', level: 75, color: '#47A248' },
    { name: 'PostgreSQL', level: 70, color: '#336791' },
    { name: 'MySQL', level: 68, color: '#4479A1' },
    { name: 'REST API', level: 85, color: '#FF6B6B' },
  ],
  mobile: [
    { name: 'React Native', level: 75, color: '#61DAFB' },
    { name: 'Flutter', level: 65, color: '#02569B' },
    { name: 'Android', level: 70, color: '#3DDC84' },
  ],
  design: [
    { name: 'Figma', level: 80, color: '#F24E1E' },
    { name: 'UI/UX', level: 75, color: '#FF4081' },
    { name: 'Adobe XD', level: 70, color: '#FF61F6' },
  ],
  tools: [
    { name: 'Git', level: 85, color: '#F05032' },
    { name: 'Docker', level: 70, color: '#2496ED' },
    { name: 'VS Code', level: 90, color: '#007ACC' },
    { name: 'Postman', level: 85, color: '#FF6C37' },
  ]
};

// Composant Progress Circle compact
const ProgressCircle = ({ skill, size = 60 }: { skill: Skill; size?: number }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (skill.level / 100) * circumference;
  const IconComponent = iconComponents[skill.name] || FaTools;

  return (
    <div className="relative flex flex-col items-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#374151' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={skill.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center mb-6">
        <IconComponent 
          size={size * 0.5} 
          color={skill.color} 
        />
      </div>
      <span className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
        {skill.level}%
      </span>
    </div>
  );
};

// Composant Accordion compact
function SkillCategory({ 
  category, 
  isExpanded, 
  onToggle, 
  index 
}: { 
  category: SkillCategory; 
  isExpanded: boolean; 
  onToggle: (index: number) => void; 
  index: number;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';
  const CategoryIcon = categoryIcons[category.key] || FaTools;

  return (
    <motion.div 
      className="mb-4 overflow-hidden rounded-xl border transition-all duration-300"
      style={{
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(209, 213, 219, 0.5)',
      }}
    >
      <motion.button
        onClick={() => onToggle(index)}
        className="w-full flex items-center p-4 transition-all duration-300 group"
      >
        <CategoryIcon 
          size={20} 
          className="mr-3" 
          color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
        />
        <h3 className="text-base font-semibold text-left flex-1 text-gray-800 dark:text-gray-200">
          {t(`skills.categories.${category.key}.title`)}
        </h3>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg text-gray-600 dark:text-gray-400"
        >
          {isExpanded ? '−' : '+'}
        </motion.span>
      </motion.button>
      
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0, 
          opacity: isExpanded ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {category.skills.map((skill, skillIndex) => (
              <motion.div
                key={skill.name}
                className="flex flex-col items-center p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: skillIndex * 0.03 }}
              >
                <ProgressCircle skill={skill} size={50} />
                <span className="mt-2 text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                  {skill.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Composant pour les points forts simplifié
function StrengthsSection() {
  const { t } = useI18n();

  const strengths: Strength[] = [
    {
      title: t("skills.strengths.productivity.title"),
      icon: <FaTasks className="text-lg" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: t("skills.strengths.problem_solving.title"),
      icon: <FaBrain className="text-lg" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: t("skills.strengths.perseverance.title"),
      icon: <TbCoffee className="text-lg" />,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center gap-6">
        {strengths.map((strength, index) => (
          <motion.div
            key={strength.title}
            className="flex flex-col items-center p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${strength.color} flex items-center justify-center text-white mb-2`}>
              {strength.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {strength.title}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const { t } = useI18n();

  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const categories: SkillCategory[] = [
    { key: 'frontend', skills: skills.frontend },
    { key: 'backend', skills: skills.backend },
    { key: 'mobile', skills: skills.mobile },
    { key: 'design', skills: skills.design },
    { key: 'tools', skills: skills.tools }
  ];

  return (
    <section id="skills" className="py-12 px-4 relative">
      <div className="container max-w-4xl mx-auto">
        {/* En-tête */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4 font-righteous"
            style={{ 
              background: 'linear-gradient(135deg, #4285f4 0%, #9c27b0 50%, #34a853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t("skills.title")}
          </motion.h2>
        </motion.div>

        {/* Points forts */}
        <StrengthsSection />

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3">
            {categories.map((category, index) => (
              <SkillCategory
                key={category.key}
                category={category}
                isExpanded={expandedCategory === index}
                onToggle={toggleCategory}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}