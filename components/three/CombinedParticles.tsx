// src/components/three/CombinedParticles.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sparkles, Text } from '@react-three/drei';
import * as random from 'maath/random';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

// Types TypeScript
interface ParticleSystemProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isHeroSection?: boolean;
}

interface ParticleLayer {
  positions: Float32Array;
  color: string;
  size: number;
  opacity: number;
  speed: number;
  reaction: number;
}

// Composant Three.js pour les particules 3D sophistiquées
function ThreeJParticles({ mouse, isHeroSection = false }: ParticleSystemProps) {
  const refs = useRef<THREE.Points[]>([]);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // Configuration avancée des particules
  const particleConfig = {
    hero: {
      count: 4000,
      baseSize: 0.025,
      sphereRadius: 6,
      layers: 4
    },
    default: {
      count: 2500,
      baseSize: 0.018,
      sphereRadius: 12,
      layers: 3
    }
  };

  const config = isHeroSection ? particleConfig.hero : particleConfig.default;

  // Palettes de couleurs CONTRASTÉES selon le thème
const colorPalettes = {
  dark: {
    primary: ['#60a5fa', '#3b82f6', '#2563eb'],
    secondary: ['#c084fc', '#a855f7', '#9333ea'],
    accent: ['#34d399', '#10b981', '#059669'],
    special: ['#f472b6', '#ec4899', '#db2777']
  },
  light: {
    // Couleurs TRÈS FONCÉES pour maximum de contraste
    primary: ['#000000', '#000000', '#000000'], // Noir pur
    secondary: ['#1a365d', '#1a365d', '#1a365d'], // Bleu très foncé
    accent: ['#064e3b', '#064e3b', '#064e3b'], // Vert très foncé
    special: ['#7f1d1d', '#7f1d1d', '#7f1d1d'] // Rouge très foncé
  }
};

  const palette = isDarkTheme ? colorPalettes.dark : colorPalettes.light;

  // Génération des couches de particules
  const particleLayers: ParticleLayer[] = [
    {
      positions: random.inSphere(new Float32Array(config.count * 3), { radius: config.sphereRadius }) as Float32Array,
      color: palette.primary[0],
      size: config.baseSize * (isDarkTheme ? 1 : 1.2), // Plus grosses en mode jour
      opacity: isDarkTheme ? 0.9 : 0.8, // Opacité ajustée
      speed: 1.0,
      reaction: 0.8
    },
    {
      positions: random.inSphere(new Float32Array(config.count * 3), { radius: config.sphereRadius * 0.8 }) as Float32Array,
      color: palette.secondary[1],
      size: config.baseSize * 0.7 * (isDarkTheme ? 1 : 1.3),
      opacity: isDarkTheme ? 0.7 : 0.7,
      speed: 1.3,
      reaction: 1.2
    },
    {
      positions: random.inSphere(new Float32Array(config.count * 3), { radius: config.sphereRadius * 0.6 }) as Float32Array,
      color: palette.accent[2],
      size: config.baseSize * 0.5 * (isDarkTheme ? 1 : 1.4),
      opacity: isDarkTheme ? 0.6 : 0.6,
      speed: 1.7,
      reaction: 1.5
    }
  ];

  // Couche supplémentaire pour Hero
  if (isHeroSection) {
    particleLayers.push({
      positions: random.inSphere(new Float32Array(config.count * 3), { radius: config.sphereRadius * 0.4 }) as Float32Array,
      color: palette.special[0],
      size: config.baseSize * 0.3 * (isDarkTheme ? 1 : 1.5),
      opacity: isDarkTheme ? 0.5 : 0.6,
      speed: 2.0,
      reaction: 2.0
    });
  }

  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  // Effet de vortex autour de la souris
  const vortexRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const { x, y } = mouse.current;
    
    // Animation des couches de particules
    refs.current.forEach((ref, index) => {
      if (!ref) return;
      
      const layer = particleLayers[index];
      
      // Rotation de base
      ref.rotation.x -= delta / (15 / layer.speed);
      ref.rotation.y -= delta / (18 / layer.speed);
      
      // Réaction à la souris avec effet vortex
      const distanceFactor = 0.7 * layer.reaction;
      const mouseInfluence = 0.05 * layer.reaction;
      
      ref.position.x = THREE.MathUtils.lerp(
        ref.position.x, 
        -x * distanceFactor,
        mouseInfluence
      );
      ref.position.y = THREE.MathUtils.lerp(
        ref.position.y, 
        -y * distanceFactor,
        mouseInfluence
      );
      
      // Effet pulsant différent pour chaque couche
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (1.5 + index * 0.5)) * 0.08;
      ref.scale.set(pulse, pulse, pulse);
    });

    // Effet vortex autour de la souris
    if (vortexRef.current) {
      vortexRef.current.rotation.z = state.clock.elapsedTime * 2;
      vortexRef.current.position.x = x * 2;
      vortexRef.current.position.y = y * 2;
    }
  });

  return (
    <group>
      {/* Couches principales de particules */}
      {particleLayers.map((layer, index) => (
        <Points
          key={index}
          ref={el => { if (el) refs.current[index] = el }}
          positions={layer.positions}
          stride={3}
          frustumCulled={false}
        >
          <PointMaterial
            transparent
            color={layer.color}
            size={layer.size}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={layer.opacity}
          />
        </Points>
      ))}

      {/* Effet vortex autour de la souris */}
      <group ref={vortexRef}>
        <ringGeometry args={[0.1, 0.3, 32]} />
        <meshBasicMaterial 
          color={isDarkTheme ? "#60a5fa" : "#1e40af"} 
          transparent 
          opacity={isDarkTheme ? 0.3 : 0.4}
          side={THREE.DoubleSide}
        />
      </group>

      {/* Effets spéciaux pour HeroSection */}
      {isHeroSection && (
        <>
          {/* Étoiles scintillantes - couleurs ajustées pour le mode jour */}
          <Sparkles 
            count={80}
            scale={10}
            size={isDarkTheme ? 4 : 5}
            speed={0.8}
            color={isDarkTheme ? palette.primary[0] : palette.primary[2]}
            opacity={isDarkTheme ? 0.8 : 0.9}
          />
          
          {/* Texte flottant discret */}
          <Text
            position={[0, -3, 0]}
            fontSize={0.3}
            color={isDarkTheme ? "#93c5fd" : "#1e40af"}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.3}
          >
            Hello World
          </Text>

          {/* Lignes de connexion organiques */}
          <lineSegments>
            <edgesGeometry args={[new THREE.IcosahedronGeometry(config.sphereRadius * 0.7, 2)]} />
            <lineBasicMaterial 
              color={isDarkTheme ? palette.secondary[0] : palette.secondary[2]} 
              transparent 
              opacity={isDarkTheme ? 0.15 : 0.2} 
              linewidth={1}
            />
          </lineSegments>
        </>
      )}

      {/* Particules réactives à la souris */}
      <MouseReactiveParticles mouse={mouse} isDarkTheme={isDarkTheme} />
    </group>
  );
}

// Composant pour les particules qui suivent la souris
function MouseReactiveParticles({ 
  mouse, 
  isDarkTheme 
}: { 
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isDarkTheme: boolean;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => 
    random.inSphere(new Float32Array(200 * 3), { radius: 0.5 }) as Float32Array
  );

  useFrame((state) => {
    if (!particlesRef.current) return;

    const { x, y } = mouse.current;
    
    // Les particules suivent la souris avec un léger délai
    particlesRef.current.position.x = x * 3;
    particlesRef.current.position.y = y * 3;
    
    // Rotation douce
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    
    // Effet de respiration
    const scale = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    particlesRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points
      ref={particlesRef}
      positions={particles}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color={isDarkTheme ? "#f472b6" : "#dc2626"} // Rouge visible en mode jour
        size={isDarkTheme ? 0.02 : 0.025} // Plus grosses en mode jour
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={isDarkTheme ? 0.7 : 0.8}
      />
    </Points>
  );
}

// Composant principal amélioré
export default function CombinedParticles({ isHeroSection = false }: { isHeroSection?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalisation améliorée avec effet de momentum
      mouse.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    // Effet de clic pour explosion de particules
    const handleClick = (event: MouseEvent) => {
      // Animation temporaire au clic
      const explosionIntensity = 2;
      mouse.current = {
        x: ((event.clientX / window.innerWidth) * 2 - 1) * explosionIntensity,
        y: -((event.clientY / window.innerHeight) * 2 + 1) * explosionIntensity
      };
      
      // Retour à la normale après un court instant
      setTimeout(() => {
        mouse.current = {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1
        };
      }, 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    setMounted(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${isHeroSection ? 'absolute' : 'fixed'} inset-0 -z-10 overflow-hidden`}>
      <Canvas 
        camera={{ 
          position: [0, 0, isHeroSection ? 1.2 : 2], 
          fov: isHeroSection ? 70 : 60 
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Fond SEMI-TRANSPARENT pour voir les particules en mode jour */}
        <color attach="background" args={[
          isDarkTheme 
            ? (isHeroSection ? '#0a0e17' : '#000000') 
            : (isHeroSection ? 'rgba(240, 249, 255, 0.7)' : 'rgba(255, 255, 255, 0.8)') // Fond légèrement transparent
        ]} />
        
        <ambientLight intensity={isDarkTheme ? 0.4 : 0.8} /> {/* Plus de lumière en mode jour */}
        <pointLight position={[10, 10, 10]} intensity={isDarkTheme ? 0.8 : 1.2} />
        
        <ThreeJParticles mouse={mouse} isHeroSection={isHeroSection} />
        
        {/* Effets de lumière dynamiques */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={isDarkTheme ? 0.5 : 0.7}
          color={isDarkTheme ? "#3b82f6" : "#1e40af"}
        />
      </Canvas>
    </div>
  );
}