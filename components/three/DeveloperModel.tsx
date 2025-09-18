// src/components/three/DeveloperModel.tsx
'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function DeveloperModel() {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF('/models/developer.glb');
  const { actions } = useAnimations(animations, group);
  const [hovered, setHovered] = useState(false);
  const { mouse } = useThree();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        mouse.x * 0.2,
        0.05
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        mouse.y * 0.1,
        0.05
      );
      
      if (hovered) {
        group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      <primitive object={nodes.Scene} />
    </group>
  );
}
