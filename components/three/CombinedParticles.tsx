// src/components/three/RefinedKineticConstellation.tsx (Version Moins Lumineuse et Moins Douce)
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

// Types TypeScript
interface ConstellationProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isHeroSection?: boolean;
}

// --- PALETTES RÉVISÉES AVEC BLEU UNIFIÉ ---
const getRefinedColors = (isDark: boolean) => ({
  // Couleur des particules - UN BLEU ÉLECTRIQUE UNIFIÉ
  flow: '#1E90FF', // Un bleu vif et constant pour les particules elles-mêmes
  // Couleur de l'accent/Lumière de scan - S'adapte au thème
  scan: isDark ? '#FF69B4' : '#0F0F0F', // Rose électrique (Dark) | Gris très foncé (Light)
  // Fond - Noir spatial ou Blanc doux pour l'effet holographique
  background: isDark ? '#01010A' : '#F0F4F8',
});

// Composant pour la Constellation Énergétique Lumineuse (Ajustements de Luminosité)
function KineticConstellationParticles({ mouse, isHeroSection = false }: ConstellationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const sparklesRef = useRef<any>(null!);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const colors = getRefinedColors(isDarkTheme);

  const config = {
    count: isHeroSection ? 150 : 100,
    scale: isHeroSection ? 18 : 25,
    baseSize: isHeroSection ? 30 : 40,
    flowSpeed: isHeroSection ? 0.05 : 0.03,
    rotationSpeed: 0.005,
    mouseFactor: isHeroSection ? 1.2 : 0.6,
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !sparklesRef.current) return;
    const time = state.clock.elapsedTime;
    const { x, y } = mouse.current;
    
    // Mouvement de FLUX ET ROTATION MAJESTUEUSE (inchangé)
    groupRef.current.rotation.x = Math.sin(time * config.rotationSpeed * 0.5) * 0.05;
    groupRef.current.rotation.y += delta * config.rotationSpeed;

    groupRef.current.position.z += delta * config.flowSpeed;
    if (groupRef.current.position.z > config.scale * 0.5) {
      groupRef.current.position.z = -config.scale * 0.5;
    }
    
    // Réaction de DÉPLACEMENT SUBTILE CIBLÉE (inchangé)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x, 
      -x * 0.3 * config.mouseFactor, 
      0.05
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y, 
      -y * 0.3 * config.mouseFactor, 
      0.05
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, -config.scale / 2]}>
      <Sparkles 
        ref={sparklesRef}
        count={config.count}
        speed={0.5} 
        // 1. DIMINUTION DE L'OPACITÉ : Les particules sont moins intenses et lumineuses
        opacity={isDarkTheme ? 0.5 : 0.3} // NETTE BAISSE
        color={colors.flow} // BLEU UNIFIÉ
        // 2. DIMINUTION SUBTILE DE LA TAILLE : Réduit la "douceur" et l'étalement
        size={config.baseSize * 0.7} 
        scale={config.scale}
        noise={0.8}
      />
    </group>
  );
}

// --- Composant pour l'Effet de Scanner Holographique (Moins d'Intensité) ---
function HolographicScanner({ mouse, isDarkTheme }: ConstellationProps & { isDarkTheme: boolean }) {
  const spotLightRef = useRef<THREE.SpotLight>(null!);
  const colors = getRefinedColors(isDarkTheme);

  useFrame(() => {
    if (!spotLightRef.current) return;

    const { x, y } = mouse.current;
    
    spotLightRef.current.position.x = THREE.MathUtils.lerp(spotLightRef.current.position.x, x * 7, 0.1);
    spotLightRef.current.position.y = THREE.MathUtils.lerp(spotLightRef.current.position.y, y * 7, 0.1);

    spotLightRef.current.target.position.set(0, 0, 0); 
    spotLightRef.current.target.updateMatrixWorld();
  });
  
  return (
    <spotLight
      ref={spotLightRef}
      position={[0, 0, 15]}
      // 3. DIMINUTION DE L'INTENSITÉ DU SCANNER : Le balayage est plus discret
      intensity={isDarkTheme ? 30 : 15} // NETTE BAISSE
      angle={Math.PI / 10}
      penumbra={0.9} 
      decay={1} 
      distance={40}
      color={colors.scan}
    />
  );
}


// --- Composant d'Exportation Final (Optimisé et Unifié) ---
export default function RefinedKineticConstellation({ isHeroSection = false }: { isHeroSection?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const colors = getRefinedColors(isDarkTheme);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    setMounted(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${isHeroSection ? 'absolute' : 'fixed'} inset-0 -z-10 overflow-hidden`}>
      <Canvas 
        camera={{ 
          position: [0, 0, 6],
          fov: isHeroSection ? 50 : 45 
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* FOND EXCEPTIONNEL (inchangé) */}
        <color attach="background" args={[colors.background]} />
        
        <ambientLight intensity={0.03} />

        {/* Effet de brume (inchangé) */}
        <fog 
          attach="fog" 
          args={[colors.background, 1, isHeroSection ? 30 : 40]} 
        />

        {/* Composants 3D Uniques */}
        <KineticConstellationParticles mouse={mouse} isHeroSection={isHeroSection} />
        <HolographicScanner mouse={mouse} isDarkTheme={isDarkTheme} />

        {/* Environnement (inchangé) */}
        <Environment 
          preset={isDarkTheme ? "night" : "warehouse"}
          blur={isDarkTheme ? 0.8 : 0.2}
          resolution={256}
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
      </Canvas>
    </div>
  );
}