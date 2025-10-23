'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from "../i18n-provider";

// Types TypeScript
interface Technology {
  icon: React.ReactNode;
  name: string;
}

interface Plan {
  title: 'basic' | 'standard' | 'premium';
  priceperHour: {
    FCFA: number;
    USD: number;
  };
  advantagesIndexes: number[];
}

interface ServiceCategory {
  id: number;
  title: string;
  description: string;
  advantages: string[];
  icon: React.ReactNode;
  color: string;
  plans: Plan[];
  technologies: Technology[];
}

// Composant Plan Card optimisé
const PlanCard: React.FC<{ 
  plan: Plan;
  service: ServiceCategory;
  index: number;
  onPlanSelect: (subject: string) => void; // ✨ AJOUT
}> = ({ plan, service, index, onPlanSelect }) => { // ✨ AJOUT de onPlanSelect
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';

  const handleChoosePlan = () => {
    // Crée une chaîne de caractères formatée pour le sujet
    const subject = `Demande de devis : ${service.title} - Plan ${getLevelText(plan.title)}`;
    onPlanSelect(subject);
  };

  const getLevelText = (level: string) => {
    return t(`services.plans.${level}.title`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'from-gray-500 to-gray-600';
      case 'standard': return 'from-blue-500 to-cyan-500';
      case 'premium': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case 'basic': return 'border-gray-300 dark:border-gray-600';
      case 'standard': return 'border-blue-300 dark:border-blue-600';
      case 'premium': return 'border-purple-300 dark:border-purple-600';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <motion.div
      className={`rounded-xl p-4 border-2 ${getLevelBorder(plan.title)} 
       shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {/* Badge niveau */}
      <div className={`inline-flex px-3 py-1 rounded-full text-white text-xs font-bold mb-3 bg-gradient-to-r ${getLevelColor(plan.title)}`}>
        {getLevelText(plan.title)}
      </div>

      {/* Prix */}
      <div className="text-center mb-4">
        <div className="font-bold text-xl mb-1">
          {plan.priceperHour.FCFA.toLocaleString()} FCFA
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {plan.priceperHour.USD} USD / {t("services.perHour")}
        </div>
      </div>

      {/* Avantages inclus */}
      <div className="space-y-2 mb-4 flex-1">
        {plan.advantagesIndexes.map((advantageIndex) => (
          <div key={advantageIndex} className="flex items-start text-xs">
            <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600 leading-tight'}>
              {service.advantages[advantageIndex]}
            </span>
          </div>
        ))}
      </div>

      {/* Bouton */}
       <motion.a
        href="#contact" // Fait défiler vers la section contact
        onClick={handleChoosePlan} // Appelle notre nouvelle fonction
        className={`w-full block text-center py-2 rounded-lg font-medium text-sm bg-gradient-to-r ${getLevelColor(plan.title)} text-white hover:shadow-md transition-all mt-auto cursor-pointer`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {t("services.choosePlan")}
      </motion.a>
    </motion.div>
  );
};

// Composant Service Category
const ServiceCategorySection: React.FC<{ service: ServiceCategory; onPlanSelect: (subject: string) => void; }> = ({ service, onPlanSelect }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl p-6  shadow-lg border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-400'
      } mb-8`}
    >
      {/* En-tête service */}
      <div className="flex items-center mb-6">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${service.color} text-white mr-4 shadow-lg`}>
          {service.icon}
        </div>
        <div>
          <h3 className={`text-2xl font-bold font-righteous ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {service.title}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          } mt-1`}>
            {service.description}
          </p>
        </div>
      </div>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-6">
        {service.technologies.map((tech, techIndex) => (
          <motion.span
            key={techIndex}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: techIndex * 0.1 }}
          >
            <span className="mr-2">{tech.icon}</span>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {tech.name}
            </span>
          </motion.span>
        ))}
      </div>

      {/* Plans */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {service.plans.map((plan, index) => (
          <PlanCard 
            key={index}
            plan={plan}
            service={service}
            index={index}
            onPlanSelect={onPlanSelect} // 🔄 Fais passer la prop
          />
        ))}
      </div>
    </motion.div>
  );
};

// Composant principal
const ServicesSection: React.FC<{ onPlanSelect: (subject: string) => void; }> = ({ onPlanSelect }) => {
  // ...
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const { t } = useI18n();

  const servicesData = t("services.categories") as unknown as ServiceCategory[];

  return (
    <section id="services" className="py-12 px-4 relative min-h-screen flex items-center">
      <div className="container mx-auto max-w-6xl">
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
            {t("services.title")}
          </motion.h2>
          
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-kanit"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("services.subtitle")}
          </motion.p>

          {/* Navigation avec les 4 catégories */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {servicesData.map((service, index) => (
              <motion.button
                key={service.id}
                onClick={() => setActiveCategory(index)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  activeCategory === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={{
                  background: activeCategory === index ? 
                    `linear-gradient(135deg, ${service.color.split(' ')[1]}, ${service.color.split(' ')[3]})` : ''
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{service.icon}</span>
                {service.title}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Contenu de la catégorie active */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ServiceCategorySection 
            service={servicesData[activeCategory]} 
            onPlanSelect={onPlanSelect} // 🔄 Fais passer la prop
          />
        </motion.div>
         
        {/* Note */}
        <motion.div 
          className="text-center mt-6 p-4 rounded-lg border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("services.flexibilityNote")}
          </p>
          
        </motion.div>
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.a
            href="https://gremah-tech.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 rounded-lg font-kanit font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Découvrir d'autres services chez GremahTech
          </motion.a>
        </motion.div>
        {/* --- FIN DE L'AJOUT --- */}
      </div>
    </section>
  );
};

export default ServicesSection;