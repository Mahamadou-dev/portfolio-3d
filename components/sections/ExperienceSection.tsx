'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaGraduationCap, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTrophy, 
  FaStar, 
  FaCode,
  FaAward,
  FaRocket
} from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { Tabs, Tab, Box } from '@mui/material';
import { useI18n } from "../i18n-provider";
type TranslationArray = string[];
// Types TypeScript
interface Experience {
  id: number;
  type: 'education' | 'experience';
  title: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  subjects: string[];
  logo: string;
  color: string;
  gradient: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Composant TabPanel
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={`transition-colors duration-300 ${
        isDarkMode ? 'text-light' : 'text-dark'
      }`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

// Composant principal
const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [value, setValue] = useState(0);
  const isDarkMode = theme === 'dark';

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const experiences: Experience[] = [
    {
      id: 1,
      type: "education",
      title: t("experience.education.softwareEngineering.title"),
      institution: t("experience.education.softwareEngineering.institution"),
      period: t("experience.education.softwareEngineering.period"),
      location: t("experience.education.softwareEngineering.location"),
      description: t("experience.education.softwareEngineering.description"),
      achievements: t("experience.education.softwareEngineering.achievements" as any) as unknown as TranslationArray,
      technologies: t("experience.education.softwareEngineering.technologies" as any) as unknown as TranslationArray,
      subjects: t("experience.education.softwareEngineering.subjects" as any) as unknown as TranslationArray,
      logo: "🎓",
      color: "#4285f4",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      type: "education",
      title: t("experience.education.preparatoryYear.title"),
      institution: t("experience.education.preparatoryYear.institution"),
      period: t("experience.education.preparatoryYear.period"),
      location: t("experience.education.preparatoryYear.location"),
      description: t("experience.education.preparatoryYear.description"),
      achievements: t("experience.education.preparatoryYear.achievements" as any) as unknown as TranslationArray,
      technologies: t("experience.education.preparatoryYear.technologies" as any) as unknown as TranslationArray,
      subjects: t("experience.education.preparatoryYear.subjects" as any) as unknown as TranslationArray,
      logo: "📚",
      color: "#34a853",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      type: "experience",
      title: t("experience.work.freelance.title"),
      institution: t("experience.work.freelance.institution"),
      period: t("experience.work.freelance.period"),
      location: t("experience.work.freelance.location"),
      description: t("experience.work.freelance.description"),
      achievements: t("experience.work.freelance.achievements" as any) as unknown as TranslationArray,
      technologies: t("experience.work.freelance.technologies" as any) as unknown as TranslationArray,
      subjects: [],
      logo: "🚀",
      color: "#9c27b0",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      type: "experience",
      title: t("experience.work.anest.title"),
      institution: t("experience.work.anest.institution"),
      period: t("experience.work.anest.period"),
      location: t("experience.work.anest.location"),
      description: t("experience.work.anest.description"),
      achievements: t("experience.work.anest.achievements" as any) as unknown as TranslationArray,
      technologies: t("experience.work.anest.technologies" as any) as unknown as TranslationArray,
      subjects: [],
      logo: "⭐",
      color: "#ff6b9d",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section 
      className="py-4 px-4 relative bg-light dark:bg-dark transition-colors duration-300"
      id="education"
    >
      <div className="container mx-auto max-w-6xl">
        {/* En-tête de section réduit */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md"> 
              <FaGraduationCap className="text-4xl text-white" /> 
            </div>
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-2 font-righteous"
            style={{ 
              background: 'linear-gradient(135deg, #4285f4 0%, #9c27b0 50%, #34a853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t("experience.title")}
          </motion.h2>

          <motion.p 
            className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-kanit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("experience.subtitle")}
          </motion.p>
        </motion.div>

        {/* Contenu principal compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              minHeight: '500px'
            }}
            className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-darkElevation border-gray-700' 
                : 'bg-light border-gray-100'
            }`}
          >
            {/* Onglets verticaux compacts */}
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Expériences professionnelles"
              sx={{ 
                borderRight: 3, 
                borderColor: 'divider',
                minWidth: { xs: '100%', md: 200 },
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: '60px',
                  '&:hover': {
                    backgroundColor: 'rgba(156,39,176,0.1)',
                  },
                  '&.Mui-selected': {
                    color: isDarkMode ? '#9c27b0' : '#4285f4',
                    backgroundColor: 'rgba(156, 39, 176, 0.08)' ,
                  }
                }
              }}
              className="font-kanit transition-colors duration-300 bg-transparent"
            >
              {experiences.map((exp, index) => (
                <Tab 
                  key={exp.id}
                  label={
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">{exp.period}</span>
                      <span className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {exp.institution.length > 25 ? exp.institution.substring(0, 25) + '...' : exp.institution}
                      </span>
                    </div>
                  }
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>

            {/* Contenu des onglets compact */}
            <div className="flex-1 p-2">
              {experiences.map((exp, index) => (
                <TabPanel key={exp.id} value={value} index={index}>
                  {/* Carte d'expérience compacte */}
                  <motion.div
                    className="rounded-2xl overflow-hidden border-b shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${exp.gradient}`} />

                    <div className={`p-6 transition-colors duration-300 ${
                      isDarkMode ? 'bg-darkElevation' : 'bg-transparent'
                    }`}>
                      {/* En-tête compact */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <motion.div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exp.gradient} flex items-center justify-center text-xl shadow-md`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="text-white">{exp.logo}</span>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`text-xl font-bold mb-1 leading-tight truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {exp.institution}
                            </h3>
                            <p className={`font-semibold text-base bg-gradient-to-r ${exp.gradient} bg-clip-text text-transparent truncate`}>
                              {exp.title}
                            </p>
                          </div>
                        </div>

                        <div className={`mt-3 lg:mt-0 px-3 py-1 rounded-lg bg-gradient-to-r ${exp.gradient} text-white font-bold text-xs shadow-md`}>
                          {exp.period}
                        </div>
                      </div>

                      {/* Métadonnées compactes */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className={`flex items-center px-2 py-1 rounded-md text-xs ${
                          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                          <FaMapMarkerAlt className="mr-1" style={{ color: exp.color }} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {exp.location}
                          </span>
                        </div>
                        
                        <div className={`flex items-center px-2 py-1 rounded-md text-xs ${
                          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                          {exp.type === "education" ? 
                            <FaGraduationCap className="mr-1" style={{ color: exp.color }} /> :
                            <FaBriefcase className="mr-1" style={{ color: exp.color }} />
                          }
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {exp.type === "education" ? t("experience.type.education") : t("experience.type.experience")}
                          </span>
                        </div>
                      </div>

                      {/* Description courte */}
                      <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {exp.description}
                      </p>

                      {/* Réalisations compactes */}
                      <div className="mb-4">
                        <h4 className={`font-bold mb-3 flex items-center text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          <FaTrophy className="mr-2" style={{ color: exp.color }} />
                          {t("experience.achievements")}
                        </h4>
                        <div className="space-y-2">
                          {exp.achievements.slice(0, 2).map((achievement, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center p-2 rounded-lg text-sm ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-700' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <FaStar className="mr-2 flex-shrink-0" style={{ color: exp.color }} />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technologies ou Matières compactes */}
                      {exp.type === "education" ? (
                        <div>
                          <h4 className={`font-bold mb-2 flex items-center text-base ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            <BsDot className="text-xl mr-1" style={{ color: exp.color }} />
                            {t("experience.subjects")}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {exp.subjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs ${
                                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {subject.length > 40 ? subject.substring(0, 20) + '...' : subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className={`font-bold mb-2 flex items-center text-base ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            <FaCode className="mr-1" style={{ color: exp.color }} />
                            {t("experience.technologies")}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.slice(0, 4).map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded text-xs backdrop-blur-sm border"
                                style={{
                                  background: `linear-gradient(135deg, ${exp.color}15, ${exp.color}10)`,
                                  color: exp.color,
                                  borderColor: `${exp.color}30`
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TabPanel>
              ))}
            </div>
          </Box>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceSection;