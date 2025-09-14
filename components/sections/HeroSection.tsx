'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { ChromaticAberrationEffect, BlendFunction } from 'postprocessing';

// Composant 3D pour les éléments flottants avancés
function AdvancedFloatingElements() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }

    if (meshRef1.current) {
      meshRef1.current.rotation.x = time * 0.3;
      meshRef1.current.rotation.y = time * 0.4;
    }

    if (meshRef2.current) {
      meshRef2.current.rotation.x = time * 0.2;
      meshRef2.current.rotation.z = time * 0.3;
    }

    if (meshRef3.current) {
      meshRef3.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cube */}
      <Float speed={4} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={meshRef1} position={[-4, 2, -3]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.8}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Sphère */}
      <Float speed={3} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh ref={meshRef2} position={[4, -1, -2]}>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.7}
            wireframe
          />
        </mesh>
      </Float>

      {/* Torus */}
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={0.8}>
        <mesh ref={meshRef3} position={[0, -3, -4]} rotation={[0.8, 0.4, 0.2]}>
          <torusGeometry args={[0.8, 0.2, 16, 100]} />
          <meshStandardMaterial
            color="#ec4899"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Composant pour les particules avancées
function AdvancedParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    colors[i] = Math.random() * 0.5 + 0.5;
    colors[i + 1] = Math.random() * 0.5 + 0.5;
    colors[i + 2] = Math.random() * 0.5 + 0.5;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3} args={[]}        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3} args={[]}        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Composant pour le fond 3D
function ThreeDBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }} className="absolute inset-0">
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.0} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />

      <AdvancedParticles />
      <AdvancedFloatingElements />
      <Sparkles count={300} scale={12} size={3} speed={0.5} color="#ffffff" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.001, 0.001]}
        />
      </EffectComposer>
    </Canvas>
  );
}

export default function HeroSection() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const texts = [
    "Étudiant en Génie Logiciel",
    "Développeur Full Stack",
    "Fondateur de GremahTech",
    "Passionné d'Innovation"
  ];

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setCurrentText(currentFullText.substring(0, currentText.length + 1));
        setTypingSpeed(100);

        if (currentText === currentFullText) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setCurrentText(currentFullText.substring(0, currentText.length - 1));
        setTypingSpeed(50);

        if (currentText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentTextIndex, texts, typingSpeed]);

  return (
    <section
      id="home"
      className="h-screen relative flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background */}
      <ThreeDBackground />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 z-1"></div>

      {/* Contenu */}
      <div className="z-10 text-white max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between w-full">
        {/* Texte */}
        <motion.div
          className="lg:w-2/3 text-center lg:text-left mb-12 lg:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Tooltip */}
          <motion.div
            className="inline-block mb-8 relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <span className="text-teal-400 text-xl font-light italic border-b border-dotted border-teal-400 cursor-help">
              Barka dey
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-md">
              Veut dire 'Salut' dans ma langue natale
            </div>
          </motion.div>

          {/* Nom */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-teal-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Mahamadou Gremah
          </motion.h1>

          {/* Titre */}
          <motion.h2
            className="text-2xl md:text-4xl font-semibold mb-8 text-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Je crée des choses en rapport avec le web
          </motion.h2>

          {/* Texte animé */}
          <motion.div
            className="h-10 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
          >
            <span className="text-xl md:text-2xl text-teal-300 font-mono">
              {currentText}
              <span className="blinking-cursor">|</span>
            </span>
          </motion.div>

          {/* Description */}
          <motion.div
            className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <p>
              Je suis un jeune étudiant nigérien passionné d'informatique.
              <br />
              Actuellement, je suis{' '}
              <span className="text-teal-400 font-semibold">
                en 2ème année de licence en génie logiciel et Systèmes d'information
              </span>
              <br />
              à la{' '}
              <span className="text-teal-400 font-semibold">
                Faculté des Sciences de Monastir
              </span>{' '}
              en Tunisie.
              <br />
              Je suis également à la tête d'une petite start-up nommée{' '}
              <span className="text-teal-400 font-semibold">GremahTech</span>,
              <br />
              qui fournit des services informatiques tels que le développement de
              sites Web, d'applications mobiles et certains services informatiques.
            </p>
          </motion.div>

          {/* Boutons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <motion.button
              className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Voir nos récents travaux</span>
              <div className="absolute inset-0 bg-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              className="px-6 py-3 border-2 border-teal-400 text-teal-400 font-medium rounded-lg hover:bg-teal-400 hover:text-black transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contactez-nous
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Illustration 3D */}
        <motion.div
          className="lg:w-1/3 flex justify-center items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="w-64 h-64 md:w-80 md:h-80 relative">
            <Canvas
              camera={{ position: [0, 0, 5] }}
              className="rounded-full bg-black/20 backdrop-blur-md border border-teal-400/30"
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                <mesh rotation={[0.5, 0.5, 0]}>
                  <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                  <meshStandardMaterial
                    color="#0d9488"
                    metalness={0.7}
                    roughness={0.2}
                  />
                </mesh>
              </Float>
              <Sparkles count={50} scale={4} size={2} speed={0.3} color="#0d9488" />
            </Canvas>
          </div>
        </motion.div>
      </div>

      {/* Indicateur de défilement */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center text-teal-400"
        >
          <span className="text-sm mb-2 font-light">Découvrir</span>
          <div className="w-6 h-10 border-2 border-teal-400 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-teal-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .blinking-cursor {
          animation: blink 1s infinite;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
