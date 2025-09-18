'use client';

import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import {IconButton} from '@mui/material';
// Importez les icônes que vous utilisez des bons modules
import { 
  SiReact, SiNextdotjs, SiTypescript, SiThreedotjs, SiTailwindcss,
  SiNodedotjs, SiPython, SiDotnet, SiMongodb, SiPostgresql,
   SiFlutter, SiAndroid, SiFigma, SiAdobexd,
  SiGit, SiDocker, SiJavascript, SiHtml5,
  SiCss3, SiSass, SiExpress, SiFirebase, SiNginx,
  SiJest, SiWebpack, SiEslint, SiPrettier, SiPostman, SiFramer,
  SiVite, SiVuedotjs, SiAngular, SiSwift, SiKotlin, SiGraphql,
  SiRedis, SiMysql, SiGooglecloud
} from 'react-icons/si';

// Ajoutez l'icône de Heroicons ici
import { HiOutlineChartBar } from 'react-icons/hi'; 
import { TbApi,TbCoffee } from 'react-icons/tb';

// Ajoutez FaLightbulb à la liste des imports de Font Awesome
import { FaServer, FaDatabase, FaMobile, FaPaintBrush, FaTools, FaLightbulb,FaBrain, FaTasks } from 'react-icons/fa';


// Données des compétences
const skillsData = {
  "title": "Compétences",
  "strengths_title": "Mes points forts",
  "productivity": "Productivité",
  "problem_solving": "Résolution de problèmes",
  "hard_work": "Travail acharné",
  "technologies_title": "Quelques technologies avec lesquelles j'ai travaillé récemment",
  "web_frontend": "DÉVELOPPEMENT FRONTEND",
  "web_backend": "DÉVELOPPEMENT BACKEND",
  "mobile_apps_development": "DÉVELOPPEMENT MOBILE",
  "design_web": "DESIGN & UX/UI",
  "development_tools": "OUTILS & DEVOPS"
};

// Icônes pour les points forts
const strengthIcons = {
  productivity: <FaTasks/>, // Représente la vitesse et l'efficacité
  problem_solving: <FaBrain />, // Une idée lumineuse, un classique
  hard_work: <TbCoffee /> // Symbolise l'effort et la construction
};

// Mapping des icônes pour les technologies
const iconComponents = {
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
  'VS Code': SiDocker,
  JavaScript: SiJavascript,
  HTML5: SiHtml5,
  CSS3: SiCss3,
  Sass: SiSass,
  Express: SiExpress,
  Firebase: SiFirebase,
  AWS: SiDocker,
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
  'SQL Server': SiDocker,
  'Google Cloud': SiGooglecloud,
  Azure: SiDocker,
  'REST API': TbApi
};

// Icônes pour les catégories
const categoryIcons = {
  frontend: FaMobile,
  backend: FaServer,
  mobile: FaMobile,
  design: FaPaintBrush,
  tools: FaTools
};

const skills = {
  frontend: [
    { name: 'React', level: 90, color: '#61DAFB' },
    { name: 'Next.js', level: 85, color: '#000000' },
    { name: 'TypeScript', level: 85, color: '#3178C6' },
    { name: 'JavaScript', level: 88, color: '#F7DF1E' },
    { name: 'Three.js', level: 75, color: '#000000' },
    { name: 'Tailwind CSS', level: 90, color: '#06B6D4' },
    { name: 'HTML5', level: 95, color: '#E34F26' },
    { name: 'CSS3', level: 90, color: '#1572B6' },
    { name: 'Sass', level: 80, color: '#CC6699' },
    { name: 'Vue', level: 70, color: '#4FC08D' },
    { name: 'Angular', level: 65, color: '#DD0031' },
  ],
  backend: [
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'Python', level: 70, color: '#3776AB' },
    { name: 'C# .NET', level: 85, color: '#512BD4' },
    { name: 'Express', level: 75, color: '#000000' },
    { name: 'MongoDB', level: 75, color: '#47A248' },
    { name: 'PostgreSQL', level: 70, color: '#336791' },
    { name: 'MySQL', level: 68, color: '#4479A1' },
    { name: 'SQL Server', level: 65, color: '#CC2927' },
    { name: 'Firebase', level: 72, color: '#FFCA28' },
    { name: 'REST API', level: 85, color: '#FF6B6B' },
    { name: 'GraphQL', level: 65, color: '#E10098' },
    { name: 'Redis', level: 60, color: '#DC382D' },
  ],
  mobile: [
    { name: 'React Native', level: 75, color: '#61DAFB' },
    { name: 'Flutter', level: 65, color: '#02569B' },
    { name: 'Android', level: 70, color: '#3DDC84' },
    { name: 'Swift', level: 50, color: '#FA7343' },
    { name: 'Kotlin', level: 55, color: '#7F52FF' },
  ],
  design: [
    { name: 'Figma', level: 80, color: '#F24E1E' },
    { name: 'UI/UX', level: 75, color: '#FF4081' },
    { name: 'Adobe XD', level: 70, color: '#FF61F6' },
    { name: 'Framer', level: 65, color: '#0055FF' },
  ],
  tools: [
    { name: 'Git', level: 85, color: '#F05032' },
    { name: 'Docker', level: 70, color: '#2496ED' },
    { name: 'VS Code', level: 90, color: '#007ACC' },
    { name: 'AWS', level: 65, color: '#FF9900' },
    { name: 'Google Cloud', level: 60, color: '#4285F4' },
    { name: 'Azure', level: 55, color: '#0078D4' },
    { name: 'Nginx', level: 65, color: '#009639' },
    { name: 'Jest', level: 70, color: '#C21325' },
    { name: 'Webpack', level: 68, color: '#8DD6F9' },
    { name: 'ESLint', level: 75, color: '#4B32C3' },
    { name: 'Prettier', level: 80, color: '#F7B93E' },
    { name: 'Postman', level: 85, color: '#FF6C37' },
    { name: 'Vite', level: 75, color: '#646CFF' },
  ]
};

// Composant Progress Circle pour les compétences
const ProgressCircle = ({ skill, size = 60, strokeWidth = 7 }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (skill.level / 100) * circumference;
  const IconComponent = iconComponents[skill.name] || FaTools;

  return (
    <div className="relative flex flex-col items-center top-3 ">
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
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
        <IconComponent 
          size={size * 0.35} 
          color={skill.color} 
          className="drop-shadow-sm "
        />
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {skill.level}%
      </span>
    </div>
  );
};

// Composant Accordion amélioré pour les catégories de compétences
function SkillCategory({ title, skills, category, isExpanded, onToggle, index }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const CategoryIcon = categoryIcons[category] || FaTools;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border transition-all duration-300"
      style={{
        borderColor: isExpanded 
          ? (isDarkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(66, 133, 244, 0.4)')
          : (isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)'),
        background: isExpanded 
          ? (isDarkMode 
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(55, 65, 81, 0.5))' 
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))')
          : 'transparent',
        boxShadow: isExpanded 
          ? (isDarkMode 
              ? '0 10px 30px -10px rgba(76, 29, 149, 0.3)' 
              : '0 10px 30px -10px rgba(66, 133, 244, 0.2)')
          : 'none'
      }}
    >
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center p-6 transition-all duration-300"
        style={{
          background: isExpanded 
            ? (isDarkMode 
                ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1))' 
                : 'linear-gradient(135deg, rgba(66, 133, 244, 0.05), rgba(156, 39, 176, 0.05))')
            : 'transparent'
        }}
      >
        <CategoryIcon 
          size={24} 
          className="mr-4" 
          color={isDarkMode ? (isExpanded ? '#9c27b0' : '#9CA3AF') : (isExpanded ? '#4285f4' : '#6B7280')} 
        />
        <h3 className="text-xl font-semibold text-left flex-1 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl text-gray-600 dark:text-gray-400"
        >
          {isExpanded ? '−' : '+'}
        </motion.span>
      </button>
      
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0, 
          opacity: isExpanded ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 mt-7">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {skills.map((skill, skillIndex) => (
              <motion.div
                key={skill.name}
                className="flex flex-col items-center p-2  rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px"}}
                transition={{ duration: 0.5, delay: skillIndex * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <ProgressCircle skill={skill} />
                <span className="mt-3  text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                  {skill.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Composant pour les points forts amélioré
function StrengthsSection() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const strengths = [
    {
      title: skillsData.productivity,
      description: "Capacité à livrer des projets de qualité dans les délais impartis avec une efficacité remarquable",
      icon: strengthIcons.productivity,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: skillsData.problem_solving,
      description: "Approche analytique et méthodique pour résoudre des problèmes complexes de manière efficace et innovante",
      icon: strengthIcons.problem_solving,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: skillsData.hard_work,
      description: "Engagement total et persévérance pour atteindre l'excellence dans chaque projet et dépasser les attentes",
      icon: strengthIcons.hard_work,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <h3 className="text-2xl font-semibold mb-12 text-gray-800 dark:text-gray-200">
        {skillsData.strengths_title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {strengths.map((strength, index) => (
          <motion.div
            key={strength.title}
            className="group relative p-8 rounded-2xl overflow-hidden transition-all duration-500 flex flex-col items-center text-center "
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            style={{
              boxShadow: isDarkMode
                ? '0 10px 40px -10px rgba(0, 0, 0, 0.2)'
                : '0 10px 40px -10px rgba(66, 133, 244, 0.15)'
            }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
          >
            {/* Effet de fond au survol */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${strength.color}`}></div>
            
            {/* Icône */}
            <div className="relative z-10 text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <IconButton 
                 color='primary' size='large'
                 style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1))'
                    : 'linear-gradient(135deg, rgba(66, 133, 244, 0.05), rgba(156, 39, 176, 0.05))'
                 }}
              
                >
                 {strength.icon}
              </IconButton>
            </div>
            
            {/* Titre */}
            <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 relative z-10">
              {strength.title}
            </h4>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 relative z-10 leading-relaxed">
              {strength.description}
            </p>
            
            {/* Bordure animée */}
            <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${strength.color} group-hover:w-full transition-all duration-700`}></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [expandedCategory, setExpandedCategory] = useState(0);

  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const categories = [
    { key: 'frontend', title: skillsData.web_frontend, skills: skills.frontend },
    { key: 'backend', title: skillsData.web_backend, skills: skills.backend },
    { key: 'mobile', title: skillsData.mobile_apps_development, skills: skills.mobile },
    { key: 'design', title: skillsData.design_web, skills: skills.design },
    { key: 'tools', title: skillsData.development_tools, skills: skills.tools }
  ];

  return (
    <section id="skills" className="py-20 px-4  relative overflow-hidden bg-white dark:bg-[#0a0e17]">
      {/* Background décoratif */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container  relative z-10 max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ 
            background: 'linear-gradient(135deg, #4285f4, #9c27b0, #00bcd4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {skillsData.title}
        </motion.h2>

        {/* Points forts améliorés */}
        <StrengthsSection />

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold text-center mb-12 text-gray-800 dark:text-gray-200">
            {skillsData.technologies_title}
          </h3>
          
          <div className="max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <SkillCategory
                key={category.key}
                title={category.title}
                skills={category.skills}
                category={category.key}
                isExpanded={expandedCategory === index}
                onToggle={toggleCategory}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 10s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}