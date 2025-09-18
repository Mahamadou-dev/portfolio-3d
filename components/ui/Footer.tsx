'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import SocialLinks from './SocialLinks';
import { useRef, useMemo } from 'react';

// Composant 3D pour les particules flottantes dans le footer
function FloatingParticles() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const particlesRef = useRef();
  const count = 50;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={isDarkMode ? "#9c27b0" : "#4285f4"}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Composant 3D pour le background du footer
function FooterBackground3D() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const bgColor = isDarkMode ? '#0a0e17' : '#ffffff';

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} className="absolute inset-0 z-0 h-64">
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#4285f4" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#9c27b0" />
      <FloatingParticles />
      
      {/* Sphères décoratives */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Sphere args={[0.2, 16, 16]} position={[-3, 1, -2]}>
          <meshStandardMaterial
            color="#4285f4"
            transparent
            opacity={0.7}
            metalness={0.8}
            roughness={0.2}
            emissive="#4285f4"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Float>
      
      <Float speed={3} rotationIntensity={0.4} floatIntensity={0.5}>
        <Sphere args={[0.15, 16, 16]} position={[3, -1, -1]}>
          <meshStandardMaterial
            color="#9c27b0"
            transparent
            opacity={0.7}
            metalness={0.8}
            roughness={0.2}
            emissive="#9c27b0"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Float>
    </Canvas>
  );
}

export default function Footer() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const techStack = [
    { name: "Next.js", color: "text-black dark:text-white" },
    { name: "Three.js", color: "text-gray-800 dark:text-gray-200" },
    { name: "React", color: "text-blue-600 dark:text-blue-400" },
    { name: "TypeScript", color: "text-blue-700 dark:text-blue-300" },
    { name: "TailwindCSS", color: "text-cyan-600 dark:text-cyan-400" },
    { name: "Framer Motion", color: "text-pink-600 dark:text-pink-400" }
  ];

  return (
    <motion.footer 
      className="relative py-16 mt-20 border-t overflow-hidden"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(10, 14, 23, 0.95), rgba(17, 24, 39, 0.95))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))',
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)'
      }}
    >
      {/* Background 3D */}
      <FooterBackground3D />
      
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-5 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-center gap-8"
          variants={containerVariants}
        >
          {/* Section gauche - Copyright et description */}
          <motion.div 
            className="text-center lg:text-left"
            variants={itemVariants}
          >
            <motion.h3 
              className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Mahamadou Gremah
            </motion.h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
              © {currentYear} GremahTech. Tous droits réservés.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Développeur Fullstack passionné créant des expériences digitales innovantes et performantes
            </p>
          </motion.div>
          
          {/* Section centrale - Stack technique */}
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              Construit avec
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech.name}
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
                    isDarkMode 
                      ? 'bg-gray-900/30 border-gray-700' 
                      : 'bg-white/50 border-gray-200'
                  } ${tech.color}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  {tech.name}
                </motion.span>
              ))}
            </div>
            
            <motion.div 
              className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
              variants={itemVariants}
            >
              <span className="mr-2">et</span>
              
              <motion.span
                variants={pulseVariants}
                initial="initial"
                animate="pulse"
                className="text-red-500"
              >
                ❤️
              </motion.span>
              
              <span className="ml-2">par GremahTech</span>
            </motion.div>
          </motion.div>
          
          {/* Section droite - Liens sociaux */}
          <motion.div 
            className="text-center lg:text-right"
            variants={itemVariants}
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              Connectons-nous
            </p>
            
            <SocialLinks className="justify-center lg:justify-end mb-4" />
            
            <motion.div 
              className="flex flex-col items-center lg:items-end space-y-1 text-xs text-gray-400"
              variants={itemVariants}
            >
              <motion.span 
                className="inline-flex items-center"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                📧 mahamadou8877@gmail.com
              </motion.span>
              <motion.span 
                className="inline-flex items-center"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                📱 +216 55 299 368
                    +227 88 77 80 95
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Séparateur */}
        <motion.div 
          className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"
          variants={itemVariants}
        />

        {/* Liens de bas de page */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400"
          variants={itemVariants}
        >
          <div className="flex flex-wrap justify-center gap-4">
            <motion.a 
              href="/mentions-legales" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-2 py-1 rounded-lg backdrop-blur-sm"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              style={{
                background: isDarkMode 
                  ? 'rgba(55, 65, 81, 0.3)' 
                  : 'rgba(229, 231, 235, 0.5)'
              }}
            >
              Mentions légales
            </motion.a>
            
            <motion.a 
              href="/politique-confidentialite" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-2 py-1 rounded-lg backdrop-blur-sm"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              style={{
                background: isDarkMode 
                  ? 'rgba(55, 65, 81, 0.3)' 
                  : 'rgba(229, 231, 235, 0.5)'
              }}
            >
              Politique de confidentialité
            </motion.a>
            
            <motion.a 
              href="/cv" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-2 py-1 rounded-lg backdrop-blur-sm"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              style={{
                background: isDarkMode 
                  ? 'rgba(55, 65, 81, 0.3)' 
                  : 'rgba(229, 231, 235, 0.5)'
              }}
            >
              📄 Télécharger mon CV
            </motion.a>
          </div>
          
          <motion.div 
            className="text-center md:text-right text-gray-500 dark:text-gray-400"
            variants={itemVariants}
          >
            <p className="text-xs">
              Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Élément décoratif animé en bas */}
      <motion.div 
        className="w-full h-1 mt-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          background: 'linear-gradient(90deg, #4285f4, #9c27b0, #34a853, #fbbc05, #ea4335)'
        }}
      />
      
      {/* Effet de particules en arrière-plan */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bottom-5 right-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-2/3 w-24 h-24 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.footer>
  );
}