'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import { SiMinutemailer } from 'react-icons/si';
import SocialLinks from '../ui/SocialLinks';

// Composant 3D pour les éléments flottants
function FloatingElements() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const groupRef = useRef<THREE.Group>(null);
  const spheres = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
    
    // Animation des sphères
    spheres.current.forEach((sphere, index) => {
      if (sphere) {
        sphere.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.02;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Sphères flottantes */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere args={[0.3, 32, 32]} position={[-2, 1, -3]} ref={el => spheres.current[0] = el}>
          <meshStandardMaterial
            color="#4285f4"
            transparent
            opacity={0.8}
            metalness={0.7}
            roughness={0.2}
            emissive="#4285f4"
            emissiveIntensity={0.3}
          />
        </Sphere>
      </Float>
      
      <Float speed={4} rotationIntensity={0.6} floatIntensity={0.7}>
        <Sphere args={[0.25, 32, 32]} position={[2, -1, -3]} ref={el => spheres.current[1] = el}>
          <meshStandardMaterial
            color="#9c27b0"
            transparent
            opacity={0.8}
            metalness={0.7}
            roughness={0.2}
            emissive="#9c27b0"
            emissiveIntensity={0.3}
          />
        </Sphere>
      </Float>
      
      <Float speed={5} rotationIntensity={0.4} floatIntensity={0.9}>
        <Sphere args={[0.2, 32, 32]} position={[0, 2, -4]} ref={el => spheres.current[2] = el}>
          <meshStandardMaterial
            color="#34a853"
            transparent
            opacity={0.8}
            metalness={0.7}
            roughness={0.2}
            emissive="#34a853"
            emissiveIntensity={0.3}
          />
        </Sphere>
      </Float>

      {/* Texte flottant */}
      <Text
        position={[0, 0, -2]}
        fontSize={0.5}
        color={isDarkMode ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
      >
        Contact
      </Text>
    </group>
  );
}

// Composant 3D pour le background
function ContactBackground3D() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const bgColor = isDarkMode ? '#0a0e17' : '#ffffff';

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} className="absolute inset-0 z-0">
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.0} color="#4285f4" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#9c27b0" />
      <pointLight position={[0, 10, 0]} intensity={0.6} color="#34a853" />
      <FloatingElements />
    </Canvas>
  );
}

export default function ContactSection() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      console.log(formData);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      
      // Animation de succès
      const button = document.querySelector('.submit-btn');
      if (button) {
        button.classList.add('submit-success');
        setTimeout(() => {
          button.classList.remove('submit-success');
        }, 2000);
      }
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden bg-white dark:bg-[#0a0e17]">
      {/* Background 3D */}
      <ContactBackground3D />
      
      {/* Background décoratif cohérent avec les autres sections */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10">
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
          Contactez-moi
        </motion.h2>

        <motion.p 
          className="text-center text-lg text-gray-600 dark:text-gray-400 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Discutons de votre prochain projet ensemble
        </motion.p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Informations de contact */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Travaillons ensemble
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Je suis toujours ouvert à discuter de nouvelles opportunités et de projets passionnants.
                Que vous ayez une question ou que vous souhaitiez simplement dire bonjour, n'hésitez pas à m'envoyer un message !
              </p>
            </div>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
                whileHover={{ x: 5 }}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(55, 65, 81, 0.5))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.6))',
                  borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-4">
                  <FaEnvelope className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">mahamadou8877@gmail.com</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
                whileHover={{ x: 5 }}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(55, 65, 81, 0.5))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.6))',
                  borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Localisation</p>
                  <p className="text-gray-600 dark:text-gray-300">Monastir, Tunisie</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
                whileHover={{ x: 5 }}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(55, 65, 81, 0.5))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.6))',
                  borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(66, 133, 244, 0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mr-4">
                  <FaPhone className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Téléphone</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    +216 55 299 368
                    +227 88 77 80 95
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Réseaux sociaux */}
            <div className="pt-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Suivez-moi</h4>
              <div className="flex space-x-4">
                <SocialLinks className="justify-center lg:justify-end mb-4" />
              </div>
            </div>
          </motion.div>
          
          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl backdrop-blur-md border"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(55, 65, 81, 0.6))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))',
                borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(66, 133, 244, 0.4)',
                boxShadow: isDarkMode
                  ? '0 20px 40px -10px rgba(0, 0, 0, 0.3)'
                  : '0 20px 40px -10px rgba(66, 133, 244, 0.2)'
              }}
            >
              <div className="mb-6">
                <label htmlFor="name" className="block mb-3 font-medium text-gray-800 dark:text-gray-200">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Votre nom"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block mb-3 font-medium text-gray-800 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div className="mb-8">
                <label htmlFor="message" className="block mb-3 font-medium text-gray-800 dark:text-gray-200">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Décrivez votre projet..."
                  required
                ></textarea>
              </div>
              
              <motion.button 
                type="submit" 
                className="submit-btn w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-500 flex items-center justify-center relative overflow-hidden"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #4285f4, #9c27b0)',
                  boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)'
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Envoyer le message
                  </>
                )}
                
                {/* Effet de vague animée */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>
            </form>
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
        
        .submit-success {
          background: linear-gradient(135deg, #34a853, #0f9d58) !important;
          box-shadow: 0 4px 15px rgba(52, 168, 83, 0.3) !important;
        }
        
        .submit-success::before {
          content: '✓';
          margin-right: 8px;
        }
      `}</style>
    </section>
  );
}