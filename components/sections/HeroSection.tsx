'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Float, OrbitControls, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

// Données pour l'effet Typewriter
const TYPEWRITER_PHRASES = [
  "Je crée des choses en rapport avec le web",
  "Développeur Web Full Stack",
  "Expert C# .NET",
  "Spécialiste React & Node.js",
  "Créateur d'applications mobiles",
  "Fondateur de GremahTech"
];

// Composant pour l'effet Typewriter
const TypewriterEffect = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % TYPEWRITER_PHRASES.length;
      const currentPhrase = TYPEWRITER_PHRASES[i];

      if (isDeleting) {
        setText(currentPhrase.substring(0, text.length - 1));
        setTypingSpeed(50); // Vitesse d'effacement rapide
      } else {
        setText(currentPhrase.substring(0, text.length + 1));
        setTypingSpeed(150); // Vitesse d'écriture normale
      }

      // Logique de changement d'état (écriture/effacement)
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1500); // Pause avant d'effacer
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <h2
      className="text-3xl md:text-5xl font-bold mb-5 text-gray-800 dark:text-gray-200"
      style={{ 
        background: 'linear-gradient(135deg, #4285f4, #9c27b0)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        minHeight: '3.5rem' // pour éviter le décalage du contenu
      }}
    >
      {text}
      <span className="inline-block animate-pulse-cursor color-[linear-gradient(135deg, #4285f4, #9c27b0, #00bcd4)]">|</span>
    </h2>
  );
};

// Composant pour l'écran de code agrandi
function LargeCodeScreen() {
  const groupRef = useRef();
  const [currentLine, setCurrentLine] = useState(0);
  const [currentCode, setCurrentCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timer;
    const typeCode = () => {
      if (isTyping && currentLine < CSHARP_CODE.length) {
        const currentLineText = CSHARP_CODE[currentLine];
        if (currentCode.length < currentLineText.length) {
          timer = setTimeout(() => {
            setCurrentCode(currentLineText.substring(0, currentCode.length + 1));
          }, Math.random() * 80 + 30);
        } else {
          timer = setTimeout(() => {
            setCurrentLine(prev => prev + 1);
            setCurrentCode('');
          }, 400);
        }
      } else if (currentLine >= CSHARP_CODE.length) {
        setIsTyping(false);
        setTimeout(() => {
          setCurrentLine(0);
          setCurrentCode('');
          setIsTyping(true);
        }, 3000);
      }
    };
    timer = setTimeout(typeCode, 100);
    return () => clearTimeout(timer);
  }, [currentCode, currentLine, isTyping]);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  const codeElements = useMemo(() => 
    CSHARP_CODE.slice(0, currentLine + 1).map((line, i) => {
      let color = "#4285f4";
      if (line.includes("public") || line.includes("private") || line.includes("void")) {
        color = "#4285f4";
      } else if (line.includes("class") || line.includes("float") || line.includes("bool")) {
        color = "#34a853";
      } else if (line.includes("if") || line.includes("else") || line.includes("return")) {
        color = "#ea4335";
      } else if (line.includes("new")) {
        color = "#fbbc05";
      } else if (/[0-9]/.test(line)) {
        color = "#9c27b0";
      } else if (line.startsWith("//")) {
        color = "#6a9955";
      } else if (line.startsWith("using")) {
        color = "#4285f4";
      }
      return (
        <Text
          key={i}
          color={color}
          fontSize={0.12}
          maxWidth={6}
          lineHeight={1.2}
          letterSpacing={0.02}
          textAlign="left"
          anchorX="left"
          anchorY="top"
          position={[0, -i * 0.2, 0]}
        >
          {i === currentLine ? currentCode + (isTyping ? "█" : "") : line}
        </Text>
      );
    }), [currentCode, currentLine, isTyping]
  );
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef} position={[0, 0, -3]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.5, -0.05]}>
          <boxGeometry args={[6.5, 4.5, 0.15]} />
          <meshStandardMaterial color="#0a0e17" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.5, 0.025]}>
          <planeGeometry args={[6.2, 4.2]} />
          <meshStandardMaterial color="#111827" emissive="#1e293b" emissiveIntensity={0.2} toneMapped={false} />
        </mesh>
        <group position={[-2.8, 2.5, 0.06]}>{codeElements}</group>
        <mesh position={[0, -1.8, 0.2]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4, 0.1, 1.5]} />
          <meshStandardMaterial color="#1a202c" metalness={0.7} roughness={0.3} />
        </mesh>
        {Array.from({ length: 40 }, (_, i) => (
          <mesh
            key={i}
            position={[ -1.8 + (i % 10) * 0.36, -1.75, 0.3 + Math.floor(i / 10) * 0.2 ]}
            rotation={[0.2, 0, 0]}
          >
            <boxGeometry args={[0.3, 0.02, 0.15]} />
            <meshStandardMaterial color="#0f141f" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}
const CSHARP_CODE = [
  "using UnityEngine;",
  "using System.Collections;",
  "",
  "public class PlayerController : MonoBehaviour",
  "{",
  "    public float moveSpeed = 5f;",
  "    public float jumpForce = 10f;",
  "    private Rigidbody rb;",
  "    private bool isGrounded;",
  "",
  "    void Start()",
  "    {",
  "        rb = GetComponent<Rigidbody>();",
  "    }",
  "",
  "    void Update()",
  "    {",
  "        float moveX = Input.GetAxis(\"Horizontal\");",
  "        float moveZ = Input.GetAxis(\"Vertical\");",
  "        Vector3 movement = new Vector3(moveX, 0, moveZ);",
  "        rb.AddForce(movement * moveSpeed);",
  "",
  "        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)",
  "        {",
  "            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);",
  "            isGrounded = false;",
  "        }",
  "    }",
  "",
  "    void OnCollisionEnter(Collision collision)",
  "    {",
  "        if (collision.gameObject.CompareTag(\"Ground\"))",
  "        {",
  "            isGrounded = true;",
  "        }",
  "    }",
  "}"
];

// Composant pour les particules Gemini
function GeminiParticles() {
  const particlesRef = useRef();
  const count = 2000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const geminiColors = [
      [0.258, 0.523, 0.956],
      [0.203, 0.658, 0.325],
      [0.917, 0.262, 0.207],
      [0.988, 0.552, 0.235]
    ];
    for (let i = 0; i < count * 3; i += 3) {
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
      const colorIndex = Math.floor(Math.random() * geminiColors.length);
      colors[i] = geminiColors[colorIndex][0];
      colors[i + 1] = geminiColors[colorIndex][1];
      colors[i + 2] = geminiColors[colorIndex][2];
    }
    return { positions, colors };
  }, [count]);
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={positions.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Composant principal
export default function HeroSection() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // On définit les couleurs en fonction de l'état
  const bgColor = isDarkMode ? '#0a0e17' : '#ffffff';

  return (
    <section id='home' className="h-[100vh] mt-16 relative flex items-center justify-center overflow-hidden transition-colors duration-500 bg-white dark:bg-[#0a0e17]">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }} className="absolute inset-0 z-0">
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#4285f4" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#34a853" />
        <pointLight position={[0, -10, 0]} intensity={0.5} color="#ea4335" />
        <directionalLight position={[0, 5, 5]} intensity={1.0} color="#ffffff" />
        <GeminiParticles />
        <LargeCodeScreen />
        <Sparkles 
          count={200} 
          scale={15} 
          size={3} 
          speed={0.5} 
          color="#4285f4" 
          opacity={1}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0e17]/80 via-transparent to-[#0a0e17]/80 dark:bg-gradient-to-t dark:from-[#0a0e17]/80 dark:via-transparent dark:to-[#0a0e17]/80"></div>

      <div className="z-20 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center w-full h-full">
        <motion.div
          className="w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            className="relative mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span 
              className="text-lg cursor-pointer hover:underline text-green-600 dark:text-green-400"
              title="Barka dey veut dire 'Salut' dans ma langue natale."
            >
              Barka dey, moi c'est
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-3.5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{ 
              background: 'linear-gradient(135deg, #4285f4, #9c27b0, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Mahamadou Gremah
          </motion.h1>
        </motion.div>

        <motion.div
          className="w-full text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <TypewriterEffect />
        </motion.div>

        <motion.div
          className="w-full text-center relative p-8 mb-8 backdrop-blur-md rounded-2xl border border-gray-300/30 dark:border-gray-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1), rgba(0, 188, 212, 0.1))',
          }}
        >
          <motion.div
            className="text-lg leading-relaxed text-gray-800 dark:text-gray-200"
          >
            <p>
              Je suis un jeune étudiant nigérien passionné d'informatique.<br />
              Actuellement, je suis <strong>en 2ème année de licence en génie logiciels et Systèmes d'information</strong><br/>
              à la <strong>Faculté des Sciences de Monastir</strong> en Tunisie.<br />
              Je suis également à la tête d'une petite start-up nommée <strong className='bg'>GremahTech</strong>,<br />
              qui fournit des services informatiques tels que le développement de sites Web, d'applications mobiles et certains services informatiques.
            </p>
          </motion.div>
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 bg-gradient-to-br from-blue-500 to-green-500"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full opacity-15 bg-gradient-to-br from-red-500 to-yellow-500"></div>
        </motion.div>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.button
            className="px-6 py-3 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Voir nos récents travaux</span>
          </motion.button>
          <motion.button
            className="px-6 py-3 border-2 font-medium rounded-lg transition-all duration-300 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400 bg-transparent hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: '#3b82f6',
              color: 'white'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Contactez-nous
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes pulse-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-pulse-cursor {
          animation: pulse-cursor 1s infinite step-end;
        }
        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.3;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.6;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </section>
  );
}