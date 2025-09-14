'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { inSphere } from 'maath/random/dist/maath-random.esm';

export default function ParticlesBackground() {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => 
    new Float32Array(5000 * 3)
  );
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  useEffect(() => {
    inSphere(sphere, { radius: 1.5 });
  }, [sphere]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffa0e0"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}