'use client';

import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Données des expériences
const experiences = [
  {
    id: 1,
    title: "Développeur Fullstack",
    company: "Tech Innovations",
    period: "2023 - Présent",
    description: "Développement d'applications web avec React, Node.js et MongoDB. Implémentation de solutions cloud et CI/CD.",
    technologies: ["React", "Node.js", "MongoDB", "AWS"],
    logo: "🚀"
  },
  {
    id: 2,
    title: "Stagiaire en Ingénierie Logicielle",
    company: "Data Solutions Inc.",
    period: "2022 - 2023",
    description: "Développement de microservices et optimisation des bases de données. Participation à l'architecture cloud.",
    technologies: ["Python", "Docker", "PostgreSQL", "Azure"],
    logo: "📊"
  },
  {
    id: 3,
    title: "Développeur Frontend",
    company: "WebCreators",
    period: "2021 - 2022",
    description: "Création d'interfaces utilisateur responsive avec React et intégration avec des APIs REST.",
    technologies: ["React", "TypeScript", "CSS3", "REST APIs"],
    logo: "💻"
  },
  {
    id: 4,
    title: "Assistant Développeur",
    company: "StartUp Lab",
    period: "2020 - 2021",
    description: "Support au développement d'applications web et mobile. Apprentissage des bonnes pratiques de code.",
    technologies: ["JavaScript", "HTML5", "CSS3", "Git"],
    logo: "🔧"
  }
];

// Composant 3D pour les éléments de la timeline
function ExperienceOrbit({ experience, index, isActive, onClick }: any) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index / experiences.length) * Math.PI * 2;
  const radius = 5;
  
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  useFrame((state) => {
    if (ref.current) {
      // Animation de flottement
      ref.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.3;
      
      // Rotation lente autour de l'axe Y
      ref.current.rotation.y += 0.005;
      
      // Mise à l'échelle si actif
      ref.current.scale.lerp(
        new THREE.Vector3(isActive ? 1.2 : 1, isActive ? 1.2 : 1, isActive ? 1.2 : 1),
        0.1
      );
    }
  });

  return (
    <group ref={ref} position={[x, 0, z]} onClick={() => onClick(experience.id)}>
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial 
          color={isActive ? "#ff6b9d" : "#7c4dff"} 
          emissive={isActive ? "#ff6b9d" : "#333"}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {experience.company}
      </Text>
    </group>
  );
}

// Composant 3D pour la timeline
function ExperienceTimeline3D({ activeExperience, setActiveExperience }: any) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group rotation={[0, 0, 0]}>
        {experiences.map((exp, index) => (
          <ExperienceOrbit
            key={exp.id}
            experience={exp}
            index={index}
            isActive={activeExperience === exp.id}
            onClick={setActiveExperience}
          />
        ))}
      </group>
    </Canvas>
  );
}

export default function ExperienceSection() {
  const [activeExperience, setActiveExperience] = useState(1);

  return (
    <section id="education" className="py-20 px-4 bg-gray-900 text-white">
      <div className="container mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Mon Parcours
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Timeline 3D */}
          <motion.div
            className="h-96 rounded-xl overflow-hidden glass-effect"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <ExperienceTimeline3D 
              activeExperience={activeExperience} 
              setActiveExperience={setActiveExperience} 
            />
          </motion.div>
          
          {/* Détails de l'expérience */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {experiences.map((exp) => (
              <motion.div
                key={exp.id}
                className={`p-6 rounded-xl glass-effect transition-all duration-300 ${activeExperience === exp.id ? 'border-l-4 border-primary' : 'opacity-60'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeExperience === exp.id ? 1 : 0.6 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveExperience(exp.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start mb-4">
                  <div className="text-3xl mr-4">{exp.logo}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{exp.title}</h3>
                    <p className="text-primary font-medium">{exp.company}</p>
                    <p className="text-gray-400 text-sm">{exp.period}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{exp.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Timeline horizontale pour mobile */}
        <motion.div 
          className="mt-16 lg:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-6 text-center">Mon Parcours Professionnel</h3>
          <div className="relative">
            {/* Ligne de la timeline */}
            <div className="absolute left-4 h-full w-1 bg-primary/30 top-0"></div>
            
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="flex items-start mb-8 ml-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Point sur la timeline */}
                <div className="absolute -left-7 mt-2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-gray-900"></div>
                
                <div 
                  className="p-4 rounded-xl glass-effect w-full"
                  onClick={() => setActiveExperience(exp.id)}
                >
                  <div className="flex items-start mb-2">
                    <div className="text-2xl mr-3">{exp.logo}</div>
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-primary text-sm">{exp.company}</p>
                      <p className="text-gray-400 text-xs">{exp.period}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{exp.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}