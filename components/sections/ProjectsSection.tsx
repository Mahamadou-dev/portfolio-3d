'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from "../i18n-provider";

// Swiper imports pour la version 11.x
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Icônes
import { BsGithub } from 'react-icons/bs';
import { HiExternalLink } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import { FaCodeBranch } from 'react-icons/fa';
import { SiReact, SiNextdotjs, SiNodedotjs, SiThreedotjs, SiMongodb, SiPython, SiTensorflow, SiAmazon } from 'react-icons/si';

// Types TypeScript
interface Technology {
  title: string;
  icon: React.ReactNode;
  color: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: Technology[];
  image: string;
  github: string;
  liveUrl: string;
  numberOfBranches: number;
  numberOfLikes: number;
}

interface Certification {
  id: number;
  title: string;
  issuer: string;
  description: string;
  date: string;
  image: string;
  credentialUrl: string;
  skills: string[];
}

// Composant Project Slide
const ProjectSlide: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`flex flex-col lg:flex-row w-full h-full rounded-2xl overflow-hidden ${
      isDarkMode ? 'bg-gray-950' : 'bg-white'
    } shadow-2xl border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Image */}
      <div className="lg:w-1/2 h-64 lg:h-full">
        <img 
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Contenu */}
      <div className="lg:w-1/2 p-6 flex flex-col justify-between">
        <div>
          {/* En-tête avec numéro */}
          <div className="mb-4">
            <h1 className={`text-2xl font-bold font-righteous ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-blue-500">{index + 1}.</span>
              &nbsp;
              {project.title}
            </h1>
          </div>

          {/* Description */}
          <p className={`text-sm mb-6 leading-relaxed font-kanit ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {project.description}
          </p>

          {/* Technologies */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {project.technologies.map((technology, techIndex) => (
              <div
                key={techIndex}
                className={`flex items-center p-2 rounded-lg border-2 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}
              >
                <span className="mr-2 text-lg" style={{ color: technology.color }}>
                  {technology.icon}
                </span>
                <span className={`text-xs font-kanit ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {technology.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions et stats */}
        <div>
          {/* Boutons */}
          <div className="flex gap-3 mb-4">
            <motion.a
              href={project.github}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-kanit text-sm flex-1 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BsGithub className="mr-2" />
              {t("portfolio.buttons.github")}
            </motion.a>
            
            <motion.a
              href={project.liveUrl}
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-kanit text-sm flex-1 hover:from-blue-600 hover:to-purple-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiExternalLink className="mr-2" />
              {t("portfolio.buttons.visit")}
            </motion.a>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6">
            <motion.div 
              className={`flex items-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <FaCodeBranch className="mr-2" />
              <span className="text-sm font-righteous">{project.numberOfBranches}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center text-yellow-500"
              whileHover={{ scale: 1.1 }}
            >
              <AiFillStar className="mr-2" />
              <span className="text-sm font-righteous">{project.numberOfLikes}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Certification Slide
const CertificationSlide: React.FC<{ certification: Certification; index: number }> = ({ certification, index }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`flex flex-col lg:flex-row w-full h-full rounded-2xl overflow-hidden ${
      isDarkMode ? 'bg-gray-950' : 'bg-white'
    } shadow-2xl border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Image */}
      <div className="lg:w-1/2 h-64 lg:h-full">
        <img 
          src={certification.image}
          alt={certification.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Contenu */}
      <div className="lg:w-1/2 p-6 flex flex-col justify-between">
        <div>
          {/* En-tête avec numéro */}
          <div className="mb-4">
            <h1 className={`text-2xl font-bold font-righteous ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-green-500">{index + 1}.</span>
              &nbsp;
              {certification.title}
            </h1>
          </div>

          {/* Métadonnées */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t("portfolio.certification.issuer")}:
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {certification.issuer}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t("portfolio.certification.date")}:
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {certification.date}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-6 leading-relaxed font-kanit ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {certification.description}
          </p>

          {/* Compétences */}
          <div className="grid grid-cols-2 gap-2">
            {certification.skills.map((skill, skillIndex) => (
              <div
                key={skillIndex}
                className={`p-2 rounded-lg text-center text-xs font-kanit ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Action principale */}
        <motion.a
          href={certification.credentialUrl}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-kanit text-sm hover:from-green-600 hover:to-teal-600 transition-all mt-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HiExternalLink className="mr-2" />
          {t("portfolio.buttons.viewCertification")}
        </motion.a>
      </div>
    </div>
  );
};

// Composant principal
const ProjectsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications'>('projects');
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';

  const projectsData = t("portfolio.projects") as unknown as Project[];
  const certificationsData = t("portfolio.certifications") as unknown as Certification[];

  const currentData = activeTab === 'projects' ? projectsData : certificationsData;

  return (
    <section id="portfolio" className="py-12 px-4 relative min-h-[80vh] flex items-center">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-2 font-righteous"
            style={{ 
              background: 'linear-gradient(135deg, #4285f4 0%, #9c27b0 50%, #34a853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t("portfolio.title")}
          </motion.h2>
          
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-kanit"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("portfolio.subtitle")}
          </motion.p>

          {/* Navigation par onglets */}
          <motion.div 
            className="flex justify-center gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("portfolio.tabs.projects")} ({projectsData.length})
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'certifications'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("portfolio.tabs.certifications")} ({certificationsData.length})
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Swiper */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[500px] w-full max-w-6xl mx-auto"
        >
          <Swiper
            effect={"cards"}
            grabCursor={true}
            modules={[EffectCards, Navigation, Pagination]}
            navigation={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true 
            }}
            className="mySwiper h-full w-full rounded-2xl"
          >
            {currentData.map((item, index) => (
              <SwiperSlide key={item.id} className="rounded-2xl">
                {activeTab === 'projects' ? (
                  <ProjectSlide project={item as Project} index={index} />
                ) : (
                  <CertificationSlide certification={item as Certification} index={index} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Indicateur de section vide */}
        {currentData.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("portfolio.empty")} {activeTab === 'projects' ? t("portfolio.project") : t("portfolio.certification")}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;