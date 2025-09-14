'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const techItems = ['React', 'TypeScript', 'Node.js', 'Three.js', 'Next.js', 'Python'];

export default function FloatingTech() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        child.position.y = Math.sin(state.clock.elapsedTime + index) * 0.5;
        child.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.3;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {techItems.map((tech, index) => (
        <Text
          key={tech}
          position={[
            Math.cos((index / techItems.length) * Math.PI * 2) * 5,
            Math.sin((index / techItems.length) * Math.PI * 2) * 3,
            -5
          ]}
          color="#ff6b9d"
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          {tech}
        </Text>
      ))} 
    </group>
  );
}