import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { useTheme } from '../../contexts/ThemeContext';

// Icônes
import { BsGithub } from 'react-icons/bs';
import { HiExternalLink } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import { FaCodeBranch, FaPlay, FaPause, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SiReact, SiNextdotjs, SiNodedotjs, SiThreedotjs, SiMongodb, SiTailwindcss, SiPython, SiTensorflow, SiWebgl, SiAframe } from 'react-icons/si';



// Données des projets
const projects = [
  {
    id: 1,
    title: "Plateforme E-Commerce Immersive",
    description: {
      fr: "Expérience d'achat immersive en 3D avec visualisation des produits en temps réel. Interface intuitive et performances optimisées.",
      en: "Immersive 3D shopping experience with real-time product visualization. Intuitive interface and optimized performance."
    },
    technologies: [
      { title: "React", icon: <SiReact />, color: "#61DAFB" },
      { title: "Three.js", icon: <SiThreedotjs />, color: "#000000" },
      { title: "Node.js", icon: <SiNodedotjs />, color: "#339933" },
      { title: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
      { title: "Stripe", icon: <SiReact />, color: "#635BFF" }
    ],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    github: "https://github.com",
    liveUrl: "https://example.com",
    numberOfBranches: 12,
    numberOfLikes: 25,
    icon: <SiReact className="text-2xl" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Dashboard Intelligent IA",
    description: {
      fr: "Tableau de bord analytique avec insights en temps réel et prédictions basées sur l'apprentissage automatique.",
      en: "Analytical dashboard with real-time insights and machine learning-based predictions."
    },
    technologies: [
      { title: "Next.js", icon: <SiNextdotjs />, color: "#000000" },
      { title: "Python", icon: <SiPython />, color: "#3776AB" },
      { title: "TensorFlow", icon: <SiTensorflow />, color: "#FF6F00" },
      { title: "Chart.js", icon: <SiReact />, color: "#F57842" },
      { title: "Firebase", icon: <SiReact />, color: "#FFCA28" }
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    github: "https://github.com",
    liveUrl: "https://example.com",
    numberOfBranches: 8,
    numberOfLikes: 42,
    icon: <SiNextdotjs className="text-2xl" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Portfolio VR Interactif",
    description: {
      fr: "Expérience portfolio en réalité virtuelle accessible directement depuis le navigateur sans installation requise.",
      en: "Virtual reality portfolio experience accessible directly from the browser without installation required."
    },
    technologies: [
      { title: "WebXR", icon: <SiWebgl />, color: "#1F1F1F" },
      { title: "A-Frame", icon: <SiAframe />, color: "#EF2D5E" },
      { title: "React", icon: <SiReact />, color: "#61DAFB" },
      { title: "Three.js", icon: <SiThreedotjs />, color: "#000000" },
      { title: "GSAP", icon: <SiReact />, color: "#88CE02" }
    ],
    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=600&h=400&fit=crop",
    github: "https://github.com",
    liveUrl: "https://example.com",
    numberOfBranches: 15,
    numberOfLikes: 37,
    icon: <SiWebgl className="text-2xl" />,
    color: "from-green-500 to-teal-500"
  },
  {
    id: 4,
    title: "Application Mobile Fitness",
    description: {
      fr: "Application de fitness avec tracking en temps réel, plans d'entraînement personnalisés et communauté interactive.",
      en: "Fitness application with real-time tracking, personalized workout plans and interactive community."
    },
    technologies: [
      { title: "React Native", icon: <SiReact />, color: "#61DAFB" },
      { title: "Node.js", icon: <SiNodedotjs />, color: "#339933" },
      { title: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
      { title: "TailwindCSS", icon: <SiTailwindcss />, color: "#06B6D4" }
    ],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    github: "https://github.com",
    liveUrl: "https://example.com",
    numberOfBranches: 20,
    numberOfLikes: 58,
    icon: <SiReact className="text-2xl" />,
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Plateforme de Streaming",
    description: {
      fr: "Plateforme de streaming vidéo avec lecture adaptative, sous-titres automatiques et recommandations IA.",
      en: "Video streaming platform with adaptive playback, automatic subtitles and AI recommendations."
    },
    technologies: [
      { title: "Next.js", icon: <SiNextdotjs />, color: "#000000" },
      { title: "Python", icon: <SiPython />, color: "#3776AB" },
      { title: "TensorFlow", icon: <SiTensorflow />, color: "#FF6F00" },
      { title: "Node.js", icon: <SiNodedotjs />, color: "#339933" }
    ],
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&h=400&fit=crop",
    github: "https://github.com",
    liveUrl: "https://example.com",
    numberOfBranches: 18,
    numberOfLikes: 73,
    icon: <SiNextdotjs className="text-2xl" />,
    color: "from-indigo-500 to-purple-500"
  }
];

// Composant de carte de projet pour le carousel
const ProjectCard = ({ project, isActive }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div 
      className="project-card h-[500px] relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10" />
      
      {/* Contenu de la carte */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-500 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Icône du projet */}
        <div className={`inline-flex p-3 rounded-full mb-4 bg-gradient-to-r ${project.color}`}>
          {project.icon}
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold mb-3 leading-tight">
          {project.title}
        </h2>

        {/* Description courte */}
        <p className="text-gray-200 mb-4 text-sm leading-relaxed line-clamp-2">
          {project.description.fr}
        </p>

        {/* Technologies */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
                style={{ color: tech.color }}
              >
                <span className="mr-1">{tech.icon}</span>
                {tech.title}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <motion.a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsGithub className="mr-2" />
            GitHub
          </motion.a>
          
          <motion.a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiExternalLink className="mr-2" />
            Voir
          </motion.a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <span className="flex items-center text-gray-300 text-sm">
            <FaCodeBranch className="mr-1" />
            {project.numberOfBranches} branches
          </span>
          <span className="flex items-center text-gray-300 text-sm">
            <AiFillStar className="mr-1 text-yellow-500" />
            {project.numberOfLikes} likes
          </span>
        </div>

        {/* Bouton "Explorer" */}
        <motion.button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Explorer
        </motion.button>
      </div>
    </div>
  );
};

// Composant principal Portfolio
const ProjectsSection = () => {
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
    if (swiperRef) {
      if (isAutoPlay) {
        swiperRef.autoplay?.stop();
      } else {
        swiperRef.autoplay?.start();
      }
    }
  };

  const goToPrevSlide = () => {
    if (swiperRef) {
      swiperRef.slidePrev();
    }
  };

  const goToNextSlide = () => {
    if (swiperRef) {
      swiperRef.slideNext();
    }
  };

  return (
    <section 
      id="portfolio" 
      className="py-20 px-4 relative overflow-hidden bg-white dark:bg-[#0a0e17]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background décoratif - identique à la section Skills */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #4285f4, #9c27b0, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Portfolio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Découvrez mes projets les plus innovants
          </p>
          
          {/* Contrôles de navigation */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              onClick={toggleAutoPlay}
              className="inline-flex items-center px-6 py-3 rounded-full backdrop-blur-md border font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.7)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              {isAutoPlay ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isAutoPlay ? 'Pause' : 'Play'} Auto-rotation
            </motion.button>

            <motion.button
              onClick={goToPrevSlide}
              className="p-3 rounded-full backdrop-blur-md border transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.7)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              <FaChevronLeft />
            </motion.button>

            <motion.button
              onClick={goToNextSlide}
              className="p-3 rounded-full backdrop-blur-md border transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.7)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                color: isDarkMode ? '#9c27b0' : '#4285f4'
              }}
            >
              <FaChevronRight />
            </motion.button>
          </div>
        </motion.div>

        {/* Carousel 3D */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            onSwiper={setSwiperRef}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={3}
            spaceBetween={30}
            speed={600}
            effect="coverflow"
            loop={true}
            loopAdditionalSlides={2}
            mousewheel={true}
            autoplay={isAutoPlay ? {
              delay: 4000,
              disableOnInteraction: false,
            } : false}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            coverflowEffect={{
              rotate: 50,
              stretch: 8,
              depth: 160,
              modifier: 1,
              slideShadows: true,
            }}
            modules={[EffectCoverflow, Pagination, Mousewheel]}
            onSlideChange={handleSlideChange}
            className="project-swiper"
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
          >
            {projects.map((project, index) => (
              <SwiperSlide key={project.id}>
                <ProjectCard project={project} isActive={index === activeIndex} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Indicateur de projet actuel */}
        <motion.div
          className="text-center text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-lg">
            Projet <span className="font-bold text-gray-800 dark:text-gray-200">{activeIndex + 1}</span> sur <span className="font-bold text-gray-800 dark:text-gray-200">{projects.length}</span>
          </p>
        </motion.div>
      </div>

      {/* Styles personnalisés */}
      <style jsx>{`
        .project-swiper {
          height: 550px;
          padding: 50px 0;
        }

        .project-swiper .swiper-slide {
          background-position: center;
          background-size: cover;
          border-radius: 20px;
          box-reflect: below 24px linear-gradient(transparent, transparent, #0006);
        }

        .project-swiper .swiper-slide-shadow-coverflow {
          border-radius: 20px;
        }

        .project-swiper .swiper-pagination {
          bottom: 0 !important;
        }

        .project-swiper .swiper-pagination-bullet {
          background: rgba(66, 133, 244, 0.5);
          width: 12px;
          height: 12px;
          opacity: 0.7;
        }

        .project-swiper .swiper-pagination-bullet-active {
          background: #4285f4;
          opacity: 1;
          transform: scale(1.3);
        }

        .dark .project-swiper .swiper-pagination-bullet {
          background: rgba(156, 39, 176, 0.5);
        }

        .dark .project-swiper .swiper-pagination-bullet-active {
          background: #9c27b0;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

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

        @media (max-width: 768px) {
          .project-swiper {
            height: 450px;
            padding: 30px 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ProjectsSection;