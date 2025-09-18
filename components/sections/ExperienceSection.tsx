'use client';

import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaGraduationCap, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { SiMicrosoftacademic, SiGooglescholar } from 'react-icons/si';

// Données des expériences éducatives et professionnelles
const experiences = [
  {
    id: 1,
    type: "education",
    title: "Licence en Génie Logiciel & Systèmes d'Information",
    institution: "Faculté des Sciences de Monastir",
    period: "2023 - Présent",
    location: "Monastir, Tunisie",
    description: "Formation approfondie en développement logiciel, architecture des systèmes d'information, bases de données et technologies web modernes.",
    achievements: ["Major de promotion", "Projets distingués en développement web", "Spécialisation en architecture cloud"],
    technologies: ["Java", "Python", "SQL", "UML", "DevOps"],
    subjects: ["Algorithmique et structures de données", "Développement Web", "Développement d'applications mobiles", 
               "Réseaux", "Algèbre linéaire", "Statistiques/Probabilités", "Apprentissage automatique (ML)", 
               "Internet des objets (IOT)", "Services Web et architecture SOA", "Cloud et Big Data"],
    icon: <SiGooglescholar className="text-2xl" />,
    logo: "🎓"
  },
  {
    id: 2,
    type: "education",
    title: "Baccalauréat Scientifique",
    institution: "Lycée Manou Diatta",
    period: "2020 - 2022",
    location: "Dakar, Sénégal",
    description: "Parcours scientifique avec spécialisation en mathématiques et sciences physiques. Formation préuniversitaire d'excellence.",
    achievements: ["Mention Très Bien", "Major en mathématiques", "Projet scientifique primé"],
    technologies: ["Mathématiques", "Physique", "Sciences de l'ingénieur"],
    subjects: ["Mathématiques avancées", "Physique fondamentale", "Chimie", "Sciences de la vie et de la Terre", 
               "Philosophie", "Histoire-Géographie", "Langues vivantes"],
    icon: <SiGooglescholar className="text-2xl" />,
    logo: "📚"
  },
  {
    id: 3,
    type: "experience",
    title: "Développeur Fullstack Freelance",
    institution: "GremahTech",
    period: "2022 - Présent",
    location: "Projets internationaux",
    description: "Création d'applications web et mobiles sur mesure pour clients internationaux. Gestion de projet et développement fullstack.",
    achievements: ["15+ projets livrés", "Clients satisfaits à 100%", "Solutions optimisées pour performances"],
    technologies: ["React", "Node.js", "MongoDB", "AWS", "Firebase"],
    subjects: [],
    icon: <FaBriefcase className="text-2xl" />,
    logo: "💼"
  },
  {
    id: 4,
    type: "experience",
    title: "Commissaire aux Comptes",
    institution: "ANEST Monastir",
    period: "2023 - Présent",
    location: "Monastir, Tunisie",
    description: "Gestion de la trésorerie et supervision financière pour l'Association des Étudiants et Stagiaires Nigériens en Tunisie.",
    achievements: ["Transparence financière totale", "Optimisation des ressources", "Rapports financiers détaillés"],
    technologies: ["Excel", "Gestion budgétaire", "Analytique financière"],
    subjects: [],
    icon: <FaBriefcase className="text-2xl" />,
    logo: "📊"
  }
];

// Composant 3D pour les sphères de la timeline
function ExperienceSphere({ experience, index, isActive, onClick, totalItems }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  // Position en cercle
  const angle = (index / totalItems) * Math.PI * 2;
  const radius = 4.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.sin(index * 0.8) * 0.5; // Légère variation en hauteur

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Position du groupe
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
      groupRef.current.position.y = y;
      
      // Animation de la sphère
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
      
      // Effet de pulsation pour l'élément actif
      if (isActive) {
        meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.scale.x = 1;
        meshRef.current.scale.y = 1;
        meshRef.current.scale.z = 1;
      }
    }
  });

  return (
    <group ref={groupRef} onClick={() => onClick(experience.id)}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere ref={meshRef} args={[0.5, 32, 32]}>
          <meshStandardMaterial
            color={isActive ? "#9c27b0" : (experience.type === "education" ? "#4285f4" : "#34a853")}
            transparent
            opacity={0.9}
            metalness={0.7}
            roughness={0.2}
            emissive={isActive ? "#9c27b0" : (experience.type === "education" ? "#4285f4" : "#34a853")}
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Float>
      <Text
        position={[0, -1, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {experience.institution.split(' ')[0]}
      </Text>
    </group>
  );
}

// Composant 3D pour la timeline
function ExperienceTimeline3D({ activeExperience, setActiveExperience }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const bgColor = isDarkMode ? '#0a0e17' : '#ffffff';

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }} className="rounded-2xl h-96 w-full">
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#4285f4" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#9c27b0" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#34a853" />
      
      <group rotation={[0, 0, 0]}>
        {experiences.map((exp, index) => (
          <ExperienceSphere
            key={exp.id}
            experience={exp}
            index={index}
            isActive={activeExperience === exp.id}
            onClick={setActiveExperience}
            totalItems={experiences.length}
          />
        ))}
        
        {/* Cercle de la timeline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <ringGeometry args={[3.8, 4.2, 64]} />
          <meshBasicMaterial color={isDarkMode ? "#374151" : "#E5E7EB"} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}

// Composant de carte d'expérience
function ExperienceCard({ experience, isActive, onClick }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 ${
        isActive ? 'shadow-2xl' : 'opacity-80'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      style={{
        background: isActive
          ? isDarkMode
            ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(156, 39, 176, 0.15))'
            : 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1))'
          : isDarkMode
          ? 'rgba(17, 24, 39, 0.7)'
          : 'rgba(255, 255, 255, 0.9)',
        border: isDarkMode
          ? `1px solid ${isActive ? 'rgba(156, 39, 176, 0.4)' : 'rgba(55, 65, 81, 0.5)'}`
          : `1px solid ${isActive ? 'rgba(66, 133, 244, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
        boxShadow: isActive
          ? isDarkMode
            ? '0 10px 40px -10px rgba(156, 39, 176, 0.4)'
            : '0 10px 40px -10px rgba(66, 133, 244, 0.3)'
          : '0 4px 20px -4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div
            className="p-3 rounded-full mr-4"
            style={{
              background: experience.type === "education" 
                ? 'linear-gradient(135deg, #4285f4, #34a853)'
                : 'linear-gradient(135deg, #9c27b0, #ff6b9d)'
            }}
          >
            <span className="text-xl">{experience.logo}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {experience.title}
            </h3>
            <p className={`font-medium ${
              experience.type === "education" ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"
            }`}>
              {experience.institution}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            experience.type === "education" 
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" 
              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
          }`}>
            {experience.type === "education" ? "Éducation" : "Expérience"}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <FaCalendarAlt className="mr-2" />
        <span className="mr-4">{experience.period}</span>
        <FaMapMarkerAlt className="mr-2" />
        <span>{experience.location}</span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {experience.description}
      </p>

      {(isActive || isExpanded) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Réalisations :</h4>
          <ul className="mb-4">
            {experience.achievements.map((achievement, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-1">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-2"></span>
                {achievement}
              </li>
            ))}
          </ul>

          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Technologies :</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {experience.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: experience.type === "education" 
                    ? 'rgba(66, 133, 244, 0.15)' 
                    : 'rgba(156, 39, 176, 0.15)',
                  color: experience.type === "education" 
                    ? '#4285f4' 
                    : '#9c27b0'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
          
          {/* Nouvelle section pour les matières principales */}
          {experience.type === "education" && experience.subjects && experience.subjects.length > 0 && (
            <>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Matières Principales :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {experience.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mr-2 flex-shrink-0"></span>
                    <span className="text-xs">{subject}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ExperienceSection() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [activeExperience, setActiveExperience] = useState(1);
  const [viewMode, setViewMode] = useState('all');

  const filteredExperiences = experiences.filter(exp => {
    if (viewMode === 'all') return true;
    return exp.type === viewMode;
  });

  return (
    <section id="education" className="py-20 px-4 relative overflow-hidden bg-white dark:bg-[#0a0e17]">
      {/* Background décoratif */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-4xl">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-4"
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
          Mon Parcours
        </motion.h2>

        <motion.p 
          className="text-center text-lg text-gray-600 dark:text-gray-400 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Éducation et expériences professionnelles qui ont façonné mon expertise
        </motion.p>

        {/* Filtres */}
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex space-x-2 p-1 rounded-xl backdrop-blur-md border"
            style={{
              borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
              background: isDarkMode ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            {[
              { key: 'all', label: 'Tout', icon: <FaBriefcase className="mr-2" /> },
              { key: 'education', label: 'Éducation', icon: <FaGraduationCap className="mr-2" /> },
              { key: 'experience', label: 'Expérience', icon: <FaBriefcase className="mr-2" /> }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setViewMode(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                  viewMode === item.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                style={{
                  background: viewMode === item.key
                    ? 'linear-gradient(135deg, #4285f4, #9c27b0)'
                    : 'transparent'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenu en une seule colonne */}
        <div className="space-y-12">
          {/* Timeline 3D - Version compacte */}
          <motion.div
            className="h-96 rounded-2xl overflow-hidden mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              boxShadow: isDarkMode
                ? '0 25px 50px -12px rgba(76, 29, 149, 0.25)'
                : '0 25px 50px -12px rgba(66, 133, 244, 0.25)'
            }}
          >
            <ExperienceTimeline3D 
              activeExperience={activeExperience} 
              setActiveExperience={setActiveExperience} 
            />
          </motion.div>
          
          {/* Détails des expériences */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {filteredExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                isActive={activeExperience === exp.id}
                onClick={() => setActiveExperience(exp.id)}
              />
            ))}
          </motion.div>
        </div>
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