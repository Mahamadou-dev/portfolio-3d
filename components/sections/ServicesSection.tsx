'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Mousewheel, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { useTheme } from '../../contexts/ThemeContext';
import { FaCode, FaPalette, FaServer, FaMobile, FaChevronLeft, FaChevronRight, FaPlay, FaPause } from 'react-icons/fa';
import { SiNextdotjs, SiThreedotjs, SiNodedotjs, SiMongodb, SiFigma, SiAdobexd, SiReact, SiExpress, SiPostman, SiTailwindcss } from 'react-icons/si';

// Données des services
const servicesData = [
  {
    id: 0,
    title: "Développement Fullstack",
    subtitle: "Solutions web complètes et sur mesure",
    description: "Création d'applications web complètes avec frontend et backend intégrés. Solutions performantes, sécurisées et évolutives.",
    plans: [
      {
        title: "Starter",
        price: "299€",
        duration: "2 semaines",
        features: ["Design responsive", "Backend Node.js", "Base de données", "1 révision incluse"],
        popular: false
      },
      {
        title: "Professional",
        price: "699€",
        duration: "4 semaines",
        features: ["Design premium", "API RESTful", "Base de données avancée", "3 révisions", "Support 1 mois"],
        popular: true
      },
      {
        title: "Enterprise",
        price: "1299€",
        duration: "8 semaines",
        features: ["Design sur mesure", "Architecture microservices", "Base de données cloud", "Révisions illimitées", "Support 3 mois", "Formation"],
        popular: false
      }
    ],
    technologies: [
      { icon: <SiNextdotjs />, name: "Next.js", color: "#000000" },
      { icon: <SiNodedotjs />, name: "Node.js", color: "#339933" },
      { icon: <SiMongodb />, name: "MongoDB", color: "#47A248" },
      { icon: <SiThreedotjs />, name: "Three.js", color: "#000000" }
    ],
    icon: <FaCode className="text-2xl" />,
    color: "from-blue-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: 1,
    title: "Développement Frontend",
    subtitle: "Interfaces modernes et interactives",
    description: "Conception d'interfaces utilisateur exceptionnelles avec des animations fluides et une expérience utilisateur optimale.",
    plans: [
      {
        title: "Basic",
        price: "199€",
        duration: "1 semaine",
        features: ["Design responsive", "Animations basiques", "Optimisation SEO", "1 révision"],
        popular: false
      },
      {
        title: "Advanced",
        price: "499€",
        duration: "3 semaines",
        features: ["Design interactif", "Animations avancées", "SEO complet", "3 révisions", "Support 2 semaines"],
        popular: true
      },
      {
        title: "Premium",
        price: "899€",
        duration: "5 semaines",
        features: ["Design sur mesure", "Animations complexes", "SEO technique", "Révisions illimitées", "Support 1 mois"],
        popular: false
      }
    ],
    technologies: [
      { icon: <SiReact />, name: "React", color: "#61DAFB" },
      { icon: <SiThreedotjs />, name: "Three.js", color: "#000000" },
      { icon: <SiTailwindcss />, name: "Tailwind", color: "#06B6D4" },
      { icon: <SiNextdotjs />, name: "Next.js", color: "#000000" }
    ],
    icon: <FaMobile className="text-2xl" />,
    color: "from-purple-500 to-pink-500",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    title: "API RESTful",
    subtitle: "Services backend robustes et sécurisés",
    description: "Développement d'APIs performantes et sécurisées pour alimenter vos applications web et mobiles.",
    plans: [
      {
        title: "Essential",
        price: "249€",
        duration: "2 semaines",
        features: ["API RESTful", "Authentification JWT", "Base de données", "Documentation de base"],
        popular: false
      },
      {
        title: "Professional",
        price: "599€",
        duration: "4 semaines",
        features: ["API avancée", "Auth avancée", "Base de données optimisée", "Documentation complète", "Support 1 mois"],
        popular: true
      },
      {
        title: "Enterprise",
        price: "1099€",
        duration: "6 semaines",
        features: ["API microservices", "Sécurité renforcée", "Base de données cloud", "Documentation détaillée", "Support 3 mois", "Monitoring"],
        popular: false
      }
    ],
    technologies: [
      { icon: <SiNodedotjs />, name: "Node.js", color: "#339933" },
      { icon: <SiExpress />, name: "Express", color: "#000000" },
      { icon: <SiMongodb />, name: "MongoDB", color: "#47A248" },
      { icon: <SiPostman />, name: "Postman", color: "#FF6C37" }
    ],
    icon: <FaServer className="text-2xl" />,
    color: "from-green-500 to-teal-500",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Design UI/UX",
    subtitle: "Expériences utilisateur exceptionnelles",
    description: "Conception d'interfaces intuitives et esthétiques qui améliorent l'expérience utilisateur et la conversion.",
    plans: [
      {
        title: "Starter",
        price: "179€",
        duration: "1 semaine",
        features: ["Maquettes basiques", "Guide de style", "3 pages design", "1 révision"],
        popular: false
      },
      {
        title: "Professional",
        price: "449€",
        duration: "3 semaines",
        features: ["Maquettes détaillées", "Design system", "8 pages design", "3 révisions", "Support 2 semaines"],
        popular: true
      },
      {
        title: "Enterprise",
        price: "799€",
        duration: "5 semaines",
        features: ["Design complet", "Système de design", "Pages illimitées", "Révisions illimitées", "Support 1 mois", "Assets export"],
        popular: false
      }
    ],
    technologies: [
      { icon: <SiFigma />, name: "Figma", color: "#F24E1E" },
      { icon: <SiAdobexd />, name: "Adobe XD", color: "#FF61F6" },
      { icon: <FaPalette />, name: "UI Design", color: "#FF6B6B" },
      { icon: <FaMobile />, name: "Responsive", color: "#4ECDC4" }
    ],
    icon: <FaPalette className="text-2xl" />,
    color: "from-orange-500 to-red-500",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop"
  }
];

// Composant de carte de service pour le carousel
const ServiceCard = ({ service, isActive, index }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const cardRef = useRef(null);

  return (
    <motion.div 
      ref={cardRef}
      className="service-card h-[600px] relative overflow-hidden rounded-3xl cursor-pointer group"
      style={{
        backgroundImage: `url(${service.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transformStyle: 'preserve-3d'
      }}
      initial={{ scale: 0.9, opacity: 0.7, z: 0 }}
      animate={{ 
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.7,
        z: isActive ? 50 : 0
      }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      {/* Overlay gradient dynamique */}
      <div className={`absolute inset-0 bg-gradient-to-t ${
        isActive 
          ? 'from-black/90 via-black/60 to-transparent' 
          : 'from-black/80 via-black/40 to-transparent'
      } transition-all duration-500`} />
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5" />
      
      {/* Bordure animée */}
      <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-500 ${
        isActive 
          ? 'border-white/30 shadow-2xl shadow-blue-500/30' 
          : 'border-white/10'
      }`} />
      
      {/* Contenu de la carte */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-700 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* En-tête avec icône */}
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className={`inline-flex p-3 rounded-xl backdrop-blur-md ${
              isActive ? 'bg-white/20' : 'bg-black/30'
            } transition-all duration-500`}
            animate={isActive ? { 
              y: [0, -5, 0],
              transition: { 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              } 
            } : {}}
          >
            {service.icon}
          </motion.div>
          
          {/* Badge actif */}
          {isActive && (
            <motion.span 
              className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              Populaire
            </motion.span>
          )}
        </div>

        {/* Titre et description */}
        <motion.h2 
          className="text-2xl font-bold mb-2 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {service.title}
        </motion.h2>

        <motion.p 
          className="text-gray-200 mb-4 text-sm leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {service.subtitle}
        </motion.p>

        {/* Technologies */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-2">
            {service.technologies.map((tech, techIndex) => (
              <motion.span
                key={techIndex}
                className="flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/10"
                style={{ 
                  backgroundColor: isDarkMode 
                    ? `${tech.color}15` 
                    : `${tech.color}10`,
                  color: tech.color
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isActive ? { 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    delay: 0.3 + (techIndex * 0.1),
                    type: "spring", 
                    stiffness: 200 
                  }
                } : { opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="mr-1.5 text-sm">{tech.icon}</span>
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Forfaits */}
        <motion.div 
          className="space-y-3 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {service.plans.map((plan, planIndex) => (
            <motion.div
              key={planIndex}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
                  : 'border-white/10 bg-white/5'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${plan.popular ? 'text-blue-300' : 'text-white'}`}>
                  {plan.title}
                </span>
                <span className="text-lg font-bold text-white">{plan.price}</span>
              </div>
              <div className="text-xs text-gray-300 mb-2">{plan.duration}</div>
              <div className="space-y-1">
                {plan.features.slice(0, 2).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-xs text-gray-300">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
                {plan.features.length > 2 && (
                  <div className="text-xs text-blue-400">+{plan.features.length - 2} autres fonctionnalités</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bouton d'action */}
        <motion.button 
          className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Choisir ce service
        </motion.button>
      </div>

      {/* Overlay de survol */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 rounded-3xl" />
    </motion.div>
  );
};

// Composant principal Services
const ServicesSection = () => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [swiperRef, setSwiperRef] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const isDarkMode = theme === 'dark';

  // Auto-rotation avec pause au survol
  useEffect(() => {
    if (isAutoPlay && swiperRef && !isHovering) {
      const interval = setInterval(() => {
        if (swiperRef && !swiperRef.destroyed) {
          swiperRef.slideNext();
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, swiperRef, isHovering]);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const goToPrevSlide = () => {
    if (swiperRef) {
      swiperRef.slidePrev(1000);
    }
  };

  const goToNextSlide = () => {
    if (swiperRef) {
      swiperRef.slideNext(1000);
    }
  };

  const goToSlide = (index) => {
    if (swiperRef) {
      swiperRef.slideToLoop(index, 1000);
    }
  };

  return (
    <section 
      id="services" 
      className="py-20 px-4 relative overflow-hidden bg-white dark:bg-[#0a0e17]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background décoratif */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header avec animation */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ 
              background: 'linear-gradient(135deg, #4285f4, #9c27b0, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Mes Services
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Des solutions complètes pour transformer vos idées en réalité digitale
          </motion.p>
          
          {/* Contrôles de navigation */}
          <motion.div 
            className="flex items-center justify-center space-x-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <motion.button
              onClick={goToPrevSlide}
              className="p-4 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 group"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.6)'
                  : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              <FaChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>

            <motion.button
              onClick={toggleAutoPlay}
              className="px-6 py-3 rounded-2xl backdrop-blur-md border-2 font-medium transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isAutoPlay 
                  ? (isDarkMode 
                      ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(66, 133, 244, 0.2))' 
                      : 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1))')
                  : (isDarkMode 
                      ? 'rgba(17, 24, 39, 0.6)' 
                      : 'rgba(255, 255, 255, 0.7)'),
                borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              {isAutoPlay ? (
                <>
                  <FaPause className="inline mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Pause
                </>
              ) : (
                <>
                  <FaPlay className="inline mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Lecture
                </>
              )}
            </motion.button>

            <motion.button
              onClick={goToNextSlide}
              className="p-4 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 group"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.6)'
                  : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              <FaChevronRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Carousel des services */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          <Swiper
            onSwiper={setSwiperRef}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            spaceBetween={40}
            speed={1000}
            effect="coverflow"
            loop={true}
            loopAdditionalSlides={2}
            mousewheel={{ 
              forceToAxis: true,
              sensitivity: 0.8,
            }}
            autoplay={isAutoPlay ? {
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            } : false}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3,
            }}
            coverflowEffect={{
              rotate: 5,
              stretch: 0,
              depth: 200,
              modifier: 1.8,
              slideShadows: true,
            }}
            modules={[EffectCoverflow, Pagination, Mousewheel, Autoplay]}
            onSlideChange={handleSlideChange}
            className="service-swiper"
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
                coverflowEffect: {
                  rotate: 10,
                  stretch: 0,
                  depth: 100,
                  modifier: 1.2,
                }
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
                coverflowEffect: {
                  rotate: 5,
                  stretch: 0,
                  depth: 150,
                  modifier: 1.5,
                }
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
                coverflowEffect: {
                  rotate: 5,
                  stretch: 0,
                  depth: 200,
                  modifier: 1.8,
                }
              },
            }}
          >
            {servicesData.map((service, index) => (
              <SwiperSlide key={service.id} className="!w-[380px] !h-auto">
                <ServiceCard service={service} isActive={index === activeIndex} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Indicateurs de navigation */}
        <motion.div
          className="flex justify-center space-x-3 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {servicesData.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ease-out ${
                index === activeIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8'
                  : isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>

        {/* Indicateur de service actuel */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 bg-white/5">
            <span className="text-gray-600 dark:text-gray-400 mr-2">Service</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-lg mx-1">
              {activeIndex + 1}
            </span>
            <span className="text-gray-600 dark:text-gray-400 mx-2">sur</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">
              {servicesData.length}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Styles personnalisés */}
      <style jsx>{`
        .service-swiper {
          padding: 60px 0;
          margin: 0 -20px;
        }

        .service-swiper .swiper-slide {
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          border-radius: 24px;
          overflow: hidden;
          transform-origin: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .service-swiper .swiper-slide-active {
          transform: scale(1.05);
          z-index: 10;
        }

        .service-swiper .swiper-pagination {
          bottom: 20px !important;
        }

        .service-swiper .swiper-pagination-bullet {
          background: rgba(66, 133, 244, 0.6);
          width: 16px;
          height: 4px;
          border-radius: 2px;
          opacity: 0.6;
          transition: all 0.4s ease;
        }

        .service-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #4285f4, #9c27b0);
          opacity: 1;
          width: 32px;
          transform: scale(1.2);
        }

        .dark .service-swiper .swiper-pagination-bullet {
          background: rgba(156, 39, 176, 0.6);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 12s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }

        @media (max-width: 768px) {
          .service-swiper {
            padding: 40px 0;
            margin: 0 -10px;
          }
          
          .service-swiper .swiper-slide {
            width: 320px !important;
          }
        }

        @media (max-width: 480px) {
          .service-swiper .swiper-slide {
            width: 280px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;