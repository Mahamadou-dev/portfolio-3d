'use client';

import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { useI18n } from "../i18n-provider";

// Types pour les données
interface PersonalInfo {
  label: string;
  value: string;
  icon: string;
}

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
  const { t } = useI18n();

  const personalInfo: PersonalInfo[] = [
    { label: t("about.personalInfo.age.label"), value: t("about.personalInfo.age.value"), icon: "🎂" },
    { label: t("about.personalInfo.nationality.label"), value: t("about.personalInfo.nationality.value"), icon: "🇳🇪" },
    { label: t("about.personalInfo.location.label"), value: t("about.personalInfo.location.value"), icon: "📍" },
    { label: t("about.personalInfo.availability.label"), value: t("about.personalInfo.availability.value"), icon: "✅" }
  ];

  return (
    <section id="about" className="py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {t("about.title")}
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-6">
              {/* Conteneur 3D */}
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-[#667eea] shadow-xl"> 
                <Avatar3D />
              </div>
              
              {/* Conteneur Image */}
              <div className="lg:h-84 lg:w-72 rounded-tl-none rounded-br-none rounded-tr-[100px] rounded-bl-[100px] overflow-hidden border-2 bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                <Image
                  src="/Me4.png"
                  alt="Mahamadou Gremah"
                  width={286} 
                  height={364}
                  className="object-cover h-full w-full"
                  priority 
                />
              </div>
            </div>
            
            {/* Éléments en orbite */}
            <motion.div 
              className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full border border-blue-300/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-14 left-1/2 transform -translate-x-1/2 w-72 h-72 rounded-full border border-purple-300/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
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
            className="space-y-3"
          >
            <motion.h3 
              className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {t("about.introduction")}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Mahamadou Amadou Habou 
              </span>
            </motion.h3>
            
            <motion.p 
              className="text-base text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <span className="font-medium">{t("about.a_young_student")}</span>{' '}
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("about.niger")}
              </span>{' '}
              {t("about.residing_in_tunisia_and_it_passionated")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {t("about.currently_studies")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              {t("about.also_the_founder_and_ceo_of")}
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                 {" "}<a href='https://gremah-tech.vercel.app'target='_blank'> GremahTech </a>
              </span>
              , {t("about.tiamtech_description")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              {t("about.anest_post")}
            </motion.p>

            <div className="grid grid-cols-2 gap-3 mb-4 pt-2">
              {personalInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-2 rounded-lg backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}  
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 text-lg">
                    <span>{info.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-600 dark:text-gray-400 leading-tight">{info.label}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium text-sm leading-tight">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex justify-center lg:justify-start pt-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <motion.button
                className="px-6 py-3 font-medium rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              ><a href="https://flowcv.com/resume/a5spl1e2vu5a" target='_blank'>
                <span className="relative z-10 flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  {t("about.download_my_resume_button_text")}
                </span></a>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}