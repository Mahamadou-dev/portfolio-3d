// src/components/three/SkillsSection.tsx (CORRIGÉ - Bordures Électrocutées)
'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from "../i18n-provider";

// Import des icônes (corrigé)
import { 
    SiReact, SiNextdotjs, SiTypescript, SiThreedotjs, SiTailwindcss,
    SiNodedotjs, SiPython, SiDotnet, SiMongodb, SiPostgresql,
    SiFlutter, SiAndroid, SiFigma, SiAdobexd,
    SiGit, SiDocker, SiJavascript, SiHtml5,
    SiCss3, SiSass, SiExpress, SiFirebase, SiNginx,
    SiJest, SiWebpack, SiEslint, SiPrettier, SiPostman, SiFramer,
    SiVite, SiVuedotjs, SiAngular, SiSwift, SiKotlin, SiGraphql, 
    SiRedis, SiMysql, SiGooglecloud,
    SiTensorflow, 
    SiPytorch, 
    SiScikitlearn, 
    SiPandas, 
    SiNumpy, 
    SiKeras, 
    SiWireshark, 
    SiKalilinux, 
    SiMetasploit, 
    SiBurpsuite, 
    SiOwasp 
} from 'react-icons/si';

import { TbApi } from 'react-icons/tb';
import { FaServer, FaMobile, FaPaintBrush, FaTools, FaBrain, FaTasks, FaChevronDown } from 'react-icons/fa';
import { VscVscode } from 'react-icons/vsc';

// Types et Mappings (corrigés)
/**
 * Un palier d'usage, pas une note.
 *
 * Les pourcentages qui figuraient ici ("React 90 %", "HTML5 95 %") etaient
 * auto-attribues et n'avaient aucune unite : 90 % de quoi, mesure comment ?
 * Un lecteur technique les lit comme une opinion presentee en donnee, ce qui
 * dessert le profil au lieu de le servir. Trois paliers decrivent un fait
 * verifiable — comment la technologie est employee aujourd'hui — et personne
 * ne peut les contester de mauvaise foi.
 */
type Tier = 'core' | 'working' | 'learning';

interface Skill { name: string; tier: Tier; color: string; }
interface SkillCategory { key: string; skills: Skill[]; }
interface Strength { title: string; icon: JSX.Element; color: string; }

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
    'TensorFlow': SiTensorflow, 
    'PyTorch': SiPytorch, 
    'Scikit-learn': SiScikitlearn, 
    'Pandas': SiPandas, 
    'NumPy': SiNumpy, 
    'Keras': SiKeras,
    'Wireshark': SiWireshark, 
    'Kali Linux': SiKalilinux, 
    'Metasploit': SiMetasploit, 
    'Burp Suite': SiBurpsuite, 
    'OWASP': SiOwasp,
    'VS Code': VscVscode
};

const categoryIcons: { [key: string]: React.ComponentType<any> } = {
    frontend: FaMobile, 
    backend: FaServer, 
    mobile: FaMobile, 
    design: FaPaintBrush, 
    tools: FaTools, 
    machine_learning: SiTensorflow, 
    cybersecurity: SiWireshark
};

const skills: { [key: string]: Skill[] } = {
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

/* L'ordre d'affichage des paliers : ce qui est maitrise vient en premier. */
const TIER_ORDER: Tier[] = ['core', 'working', 'learning'];

/** Un point de couleur par palier : plein, cercle, cercle pointille. */
const TIER_DOT: Record<Tier, string> = {
    core: 'bg-emerald-500',
    working: 'bg-blue-500',
    learning: 'border border-dashed border-amber-500',
};

// Une tuile par technologie. L'anneau de progression a disparu avec les
// pourcentages : il n'y a plus de fraction a representer, donc plus rien a
// remplir. Reste l'essentiel — le logo, le nom, et le palier porte par la
// section qui contient la tuile.
const SkillTile = ({ skill }: { skill: Skill }) => {
    const IconComponent = iconComponents[skill.name] || FaTools;

    return (
        <motion.div
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-300/40 dark:border-gray-600/30 bg-white/40 dark:bg-gray-900/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.3 }}
        >
            <IconComponent size={26} color={skill.color} aria-hidden="true" />
            <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 font-kanit leading-tight">
                {skill.name}
            </span>
        </motion.div>
    );
};

// Composant Accordion (Bordure ÉLECTROCUTÉE - corrigé)
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

    // COULEUR DU HALO ÉLECTRIQUE (Bleu d'énergie, plus clair en mode sombre)
    const glowColor = isDarkMode ? '#3b82f6' : '#2563eb';
    
    // Niveau d'éclat basé sur l'état (ouvert/fermé)
    const shadowIntensity = isExpanded ? '0 0 15px rgba(59, 130, 246, 0.5)' : '0 0 8px rgba(59, 130, 246, 0.3)';

    return (
        <motion.div 
            className="mb-4 overflow-hidden rounded-xl transition-all duration-300 backdrop-blur-sm hover:shadow-2xl"
            style={{
                backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.2)' : 'rgba(255, 255, 255, 0.6)',
                border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(209, 213, 219, 0.8)',
                boxShadow: shadowIntensity,
            }}
            whileHover={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.7)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <motion.button
                onClick={() => onToggle(index)}
                className="w-full flex items-center p-4 transition-all duration-300 group"
                aria-expanded={isExpanded}
                aria-controls={`skill-category-${index}`}
            >
                <CategoryIcon 
                    size={20} 
                    className="mr-3" 
                    color={isDarkMode ? '#60A5FA' : '#1D4ED8'} 
                />
                <h3 className="text-base font-semibold text-left flex-1 text-gray-800 dark:text-gray-200">
                    {t(`skills.categories.${category.key}.title`)}
                </h3>
                <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg text-gray-600 dark:text-gray-400"
                >
                    <FaChevronDown size={14} />
                </motion.span>
            </motion.button>
            
            <motion.div
                id={`skill-category-${index}`}
                initial={false}
                animate={{ 
                    height: isExpanded ? 'auto' : 0, 
                    opacity: isExpanded ? 1 : 0 
                }}
                transition={{ 
                    duration: 0.3,
                    opacity: { duration: 0.2 }
                }}
                className="overflow-hidden"
            >
                <div className="p-4 pt-2 border-t border-gray-400/20 dark:border-gray-600/20 space-y-5">
                    {TIER_ORDER.map((tier) => {
                        const tierSkills = category.skills.filter((skill) => skill.tier === tier);
                        // Une categorie n'a pas forcement les trois paliers :
                        // on n'affiche pas d'en-tete vide.
                        if (!tierSkills.length) return null;

                        return (
                            <div key={tier}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`w-2 h-2 rounded-full ${TIER_DOT[tier]}`}
                                        aria-hidden="true"
                                    />
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 font-kanit">
                                        {t(`skills.levels.${tier}.label`)}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 font-kanit">
                                        — {t(`skills.levels.${tier}.hint`)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {tierSkills.map((skill) => (
                                        <SkillTile key={skill.name} skill={skill} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Composant StrengthsSection (optimisé)
function StrengthsSection() {
    const { t } = useI18n();

    const strengths: Strength[] = useMemo(() => [
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
            icon: <FaTasks className="text-lg" />,
            color: "from-orange-500 to-red-500"
        }
    ], [t]);

    return (
        <motion.div 
            className="text-center mb-6"
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
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${strength.color} flex items-center justify-center text-white mb-2 shadow-md`}>
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

// Composant SkillsSection principal (corrigé)
export default function SkillsSection() {
    const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
    const { t } = useI18n();

    const toggleCategory = (index: number) => {
        setExpandedCategory(expandedCategory === index ? null : index);
    };

    const categories: SkillCategory[] = useMemo(() => [
        { key: 'frontend', skills: skills.frontend },
        { key: 'backend', skills: skills.backend },
        { key: 'mobile', skills: skills.mobile },
        { key: 'design', skills: skills.design },
        { key: 'tools', skills: skills.tools },
        { key: 'machine_learning', skills: skills.machine_learning },
        { key: 'cybersecurity', skills: skills.cybersecurity }
    ], []);

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

                {/* PHRASE DESCRIPTIVE */}
                <motion.p
                    className="text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {t('skills.recent_technologies_intro')}
                </motion.p>

                {/* La legende des paliers. Sans elle, trois groupes non
                    etiquetes ne veulent rien dire ; avec elle, le classement
                    devient une declaration assumee plutot qu'un jugement. */}
                <motion.p
                    className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 font-kanit"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {t('skills.levelsNote')}
                </motion.p>
                
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