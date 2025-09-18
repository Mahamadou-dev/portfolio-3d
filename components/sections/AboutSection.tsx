'use client';

import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import Image from 'next/image';
import { Import } from 'lucide-react';


// Composant 3D pour la sphère animée avec particules
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Création des particules autour de la sphère
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
  }

  return (
    <>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere ref={meshRef} args={[1, 32, 32]} scale={1.2}>
          <meshStandardMaterial
            color="#0d9488"
            transparent
            opacity={0.8}
            metalness={0.7}
            roughness={0.2}
            emissive="#0d9488"
            emissiveIntensity={0.1}
          />
        </Sphere>
      </Float>
      
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#3b82f6"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// Composant 3D pour les éléments orbitaux avec texte
function OrbitingElements() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Éléments orbitaux avec technologies */}
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      
      <mesh position={[-1.5, 1.5, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      
      <mesh position={[0, -2, 1]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>
      
      {/* Textes orbitaux */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
      >
        React
      </Text>
      
      <Text
        position={[2.5, 0, 0]}
        fontSize={0.2}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        Next.js
      </Text>
      
      <Text
        position={[-2.5, 0, 0]}
        fontSize={0.2}
        color="#ec4899"
        anchorX="center"
        anchorY="middle"
      >
        Three.js
      </Text>
    </group>
  );
}

// Composant pour l'avatar 3D
function Avatar3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} className="w-full h-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0d9488" />
      <AnimatedSphere />
      <OrbitingElements />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={1} 
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}

export default function AboutSection() {
  // Données avec vos informations
  const aboutData = {
    title: "A propos de moi",
    introduction: "Salut, je m'appelle",
    a_young_student: "Un jeune étudiant",
    niger: "NIGERIEN",
    residing_in_tunisia_and_it_passionated: " résidant en Tunisie et surtout passioné d'informatique.",
    currently_studies: "Je suis actuellement en deuxième année de licence en génie logiciel & Systèmes d'Information à l' Université De Monastir en Tunisie.",
    also_the_founder_and_ceo_of: "Je suis également le fondateur & PDG de ",
    tiamtech_description: "une petite start-up basée au Niger fournissant des services tels que le développement de SITES WEB, le développement d'API Restful, le développement d'applications mobiles, etc...",
    anest_post: "Je suis commissaire aux comptes de la trésorerie de la section Monastir de l'ANEST (Association des Étudiants et Stagiaires Nigériens en Tunisie), où je veille à la transparence et à la conformité des finances de l'association.",
    download_my_resume_button_text: "Télécharger mon cv"
  };

  // Informations personnelles
  const personalInfo = [
    { label: "Âge", value: "23 ans", icon: "🎂" },
    { label: "Nationalité", value: "Nigérienne", icon: "🇳🇪" },
    { label: "Localisation", value: "Monastir, Tunisie", icon: "📍" },
    { label: "Disponibilité", value: "Ouvert aux opportunités", icon: "✅" }
  ];

  return (
    <section id="about" className="py-20 px-4 relative overflow-hidden bg-white dark:bg-[#0a0e17]">
      {/* Background décoratif */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <motion.h2 
          className="text-4xl md:text-5xl gradient-text font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ 
           
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {aboutData.title}
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center"
          >
            {/* Conteneur pour l'avatar 3D et la photo */}
            <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Avatar 3D */}
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-gradient-text shadow-2xl">
                <Avatar3D />
              </div>
              
              {/* Photo CV - Remplacez par votre image */}
              <div className="bg-dark dark:bg-light lg:h-96 lg:w-auto flex justify-center items-center rounded-tl-none rounded-br-none rounded-tr-[150px] rounded-bl-[150px] overflow-hidden border-2 bg-[linear-gradient(135deg,oklch(0.55_0.23_250),oklch(0.68_0.28_300),oklch(0.80_0.22_190))] shadow-2xl">
               
                {/* Décommentez et remplacez par votre image */}
                
                <Image
                  src="/Me4.png"
                  alt="Mahamadou Gremah"
                  width={384}
                  height={384}
                  className="object-cover h-full w-full  border-[linear-gradient(135deg,oklch(0.55_0.23_250),oklch(0.68_0.28_300),oklch(0.80_0.22_190))]"
                  priority  
                />
                
              </div>
            </div>
            
            {/* Éléments décoratifs autour de l'avatar */}
            <motion.div 
              className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full border border-gradient-text/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-14 left-1/2 transform -translate-x-1/2 w-72 h-72 rounded-full border border-gradient-text"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Points décoratifs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-gradient-text dark:bg-gemini-gradient"
                style={{
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.h3 
              className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {aboutData.introduction}{' '}
              <span className="text-transparent bg-clip-text gradient-text">
                Mahamadou Gremah
              </span>
            </motion.h3>
            
            <motion.p 
              className="text-lg mb-4 text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <span className="font-medium">{aboutData.a_young_student}</span>{' '}
              <span className="font-bold gradient-text">{aboutData.niger}</span>{' '}
              {aboutData.residing_in_tunisia_and_it_passionated}
            </motion.p>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {aboutData.currently_studies}
            </motion.p>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              {aboutData.also_the_founder_and_ceo_of}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                GremahTech
              </span>
              , {aboutData.tiamtech_description}
            </motion.p>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              {aboutData.anest_post}
            </motion.p>
            {/* Informations personnelles avec un design coherent et attirant */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {personalInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}  
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-text/20 flex items-center justify-center mr-4 text-xl">
                    <span>{info.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{info.label}</p>
                    <p className="text-gray-600 dark:text-gray-300">{info.value}</p>  
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >

              {/* Bouton de téléchargement du CV */}
            
            <motion.button
              className="px-6 py-3 font-medium rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden group bg-[linear-gradient(135deg,oklch(0.55_0.23_250),oklch(0.68_0.28_300),oklch(0.80_0.22_190))]  flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {aboutData.download_my_resume_button_text}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-600 to-blue-600"></div>
            </motion.button>
          </motion.div>
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
          animation: blob 7s infinite;
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
