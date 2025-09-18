// src/components/three/CombinedParticles.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls, Sparkles } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

// Composant Three.js pour les particules 3D sophistiquées
function ThreeJParticles({ 
  mouse,
  isHeroSection = false
}: { 
  mouse: React.MutableRefObject<{ x: number; y: number }>; 
  isHeroSection?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // Configuration des particules selon la section
  const particleCount = isHeroSection ? 3000 : 2000;
  const particleSize = isHeroSection ? 0.03 : 0.02;
  const sphereRadius = isHeroSection ? 7 : 14;
  
  const [sphere] = useState(() => 
    random.inSphere(new Float32Array(particleCount), { radius: sphereRadius })
  );
  
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Animation des particules plus fluide
    ref.current.rotation.x -= delta / 12;
    ref.current.rotation.y -= delta / 15;
    
    // Réaction plus prononcée à la souris
    const { x, y } = mouse.current;
    const distanceFactor = 0.9;
    
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x, 
      -x * distanceFactor,
      0.03
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y, 
      -y * distanceFactor,
      0.03
    );
    
    // Effet pulsant pour les particules
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    ref.current.scale.set(pulse, pulse, pulse);
  });

  // Palette de couleurs plus riche selon le thème
  const primaryColor = isDarkTheme ? '#60a5fa' : '#2563eb';
  const secondaryColor = isDarkTheme ? '#c084fc' : '#7c3aed';
  const accentColor = isDarkTheme ? '#34d399' : '#059669';

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={primaryColor}
          size={particleSize}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.85}
        />
      </Points>
      
      {/* Deuxième ensemble de particules pour plus de richesse visuelle */}
      <Points positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={secondaryColor}
          size={particleSize * 0.7}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.7}
        />
      </Points>
      
      {/* Troisième ensemble de particules d'accentuation */}
      <Points positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={accentColor}
          size={particleSize * 0.5}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>
      
      {/* Effets supplémentaires pour la HeroSection */}
      {isHeroSection && (
        <>
          <Sparkles 
            count={60}
            scale={12}
            size={5}
            speed={0.5} 
            color={isDarkTheme ? "#93c5fd" : "#3b82f6"} 
          />
          
          {/* Lignes de connexion entre particules */}
          <lineSegments>
            <edgesGeometry args={[new THREE.SphereGeometry(sphereRadius * 0.9, 20, 20)]} />
            <lineBasicMaterial 
              color={isDarkTheme ? "#60a5fa" : "#2563eb"} 
              transparent 
              opacity={0.2} 
            />
          </lineSegments>
        </>
      )}
    </group>
  );
}

// Composant principal
export default function CombinedParticles({ isHeroSection = false }: { isHeroSection?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normaliser les coordonnées de la souris entre -1 et 1
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
      <Canvas camera={{ position: [0, 0, isHeroSection ? 1.5 : 2.5], fov: 75 }}>
        <color attach="background" args={[isDarkTheme ? '#000000' : '#f0f9ff']} />
        <ambientLight intensity={isDarkTheme ? 0.5 : 0.7} />
        
        <ThreeJParticles mouse={mouse} isHeroSection={isHeroSection} />
        
        {!isHeroSection && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={true}
            autoRotateSpeed={0.7}
          />
        )}
      </Canvas>
    </div>
  );
}