'use client';

// components/three/HeroScene.tsx
// Piece maitresse du hero : un noyau organique en shader, une coque
// filaire contre-rotative et un anneau de satellites. Tout est procedural —
// aucun modele a telecharger, donc un premier rendu quasi instantane.
import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Icosahedron, Torus } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';

interface Palette {
  core: string;
  rim: string;
  accent: string;
  shell: string;
}

const THEME: Record<'dark' | 'light', Palette> = {
  dark: { core: '#3b82f6', rim: '#a855f7', accent: '#22d3ee', shell: '#60a5fa' },
  light: { core: '#2563eb', rim: '#7c3aed', accent: '#0891b2', shell: '#1d4ed8' },
};

/* ------------------------------------------------------------------ */
/* Noyau : deplacement par bruit simplex + eclairage de Fresnel        */
/* ------------------------------------------------------------------ */

const CORE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisplacement;

  // Bruit simplex 3D (Ashima Arts) — compact et sans texture.
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Deux frequences de bruit : une houle lente + un fremissement rapide.
    float slow = snoise(normal * 1.4 + uTime * 0.18);
    float fast = snoise(normal * 3.2 - uTime * 0.35) * 0.35;
    float displacement = (slow + fast) * uAmplitude;

    vec3 displaced = position + normal * displacement;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    vDisplacement = displacement;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CORE_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform vec3 uAccent;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisplacement;

  void main() {
    // Fresnel : les bords s'illuminent, le centre reste dense.
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.2);

    // Le relief pilote le melange de couleurs : les cretes tirent vers l'accent.
    float crest = smoothstep(-0.15, 0.25, vDisplacement);

    vec3 color = mix(uCore * 0.35, uCore, crest);
    color = mix(color, uAccent, crest * 0.55);
    color += uRim * fresnel * 1.6;

    // Pulsation lente et tres legere, comme une respiration.
    color *= 0.9 + 0.1 * sin(uTime * 0.8);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Core({ colors, amplitude }: { colors: Palette; amplitude: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: amplitude },
      uCore: { value: new THREE.Color(colors.core) },
      uRim: { value: new THREE.Color(colors.rim) },
      uAccent: { value: new THREE.Color(colors.accent) },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  uniforms.uCore.value.set(colors.core);
  uniforms.uRim.value.set(colors.rim);
  uniforms.uAccent.value.set(colors.accent);
  uniforms.uAmplitude.value = amplitude;

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <Icosahedron args={[1.25, 32]}>
      <shaderMaterial vertexShader={CORE_VERT} fragmentShader={CORE_FRAG} uniforms={uniforms} />
    </Icosahedron>
  );
}

/* ------------------------------------------------------------------ */
/* Coque filaire contre-rotative                                       */
/* ------------------------------------------------------------------ */

function Shell({ color, speed }: { color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.y -= delta * speed;
    ref.current.rotation.x += delta * speed * 0.35;
  });

  return (
    <Icosahedron ref={ref} args={[1.95, 1]}>
      <meshBasicMaterial color={color} wireframe transparent opacity={0.22} />
    </Icosahedron>
  );
}

/* ------------------------------------------------------------------ */
/* Satellites : petites spheres sur un anneau incline                  */
/* ------------------------------------------------------------------ */

function Satellites({ color, count, speed }: { color: string; count: number; speed: number }) {
  const group = useRef<THREE.Group>(null!);

  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return {
          angle,
          radius: 2.5 + (i % 3) * 0.22,
          height: Math.sin(angle * 2) * 0.35,
          size: 0.05 + (i % 4) * 0.018,
        };
      }),
    [count]
  );

  useFrame((_, delta) => {
    group.current.rotation.y += delta * speed;
  });

  return (
    <group ref={group} rotation={[0.42, 0, 0.18]}>
      {nodes.map((node, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(node.angle) * node.radius,
            node.height,
            Math.sin(node.angle) * node.radius,
          ]}
        >
          <sphereGeometry args={[node.size, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <Torus args={[2.5, 0.006, 8, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </Torus>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera qui suit doucement le curseur                                */
/* ------------------------------------------------------------------ */

function ParallaxRig({ strength }: { strength: number }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 6));

  useFrame(() => {
    target.current.set(pointer.x * strength, pointer.y * strength * 0.6, 6);
    camera.position.lerp(target.current, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */

export default function HeroScene() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? THEME.dark : THEME.light;
  const quality = useSceneQuality();

  if (!quality.ready) {
    return <div className="w-full h-[22rem] md:h-[30rem]" />;
  }

  // Mouvement reduit : la scene reste presente mais devient quasi statique.
  const motion = quality.reducedMotion ? 0.15 : 1;

  return (
    <div className="w-full h-[22rem] md:h-[30rem] relative">
      <Canvas
        dpr={quality.dpr}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: !quality.lowPower, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Float
            speed={1.1 * motion}
            rotationIntensity={0.35 * motion}
            floatIntensity={0.5 * motion}
          >
            <Core colors={colors} amplitude={0.22 * motion + 0.04} />
            <Shell color={colors.shell} speed={0.12 * motion} />
          </Float>

          <Satellites color={colors.accent} count={quality.lowPower ? 12 : 20} speed={0.18 * motion} />

          <ParallaxRig strength={quality.reducedMotion ? 0 : 0.6} />

          {/* Le bloom est ce qui donne l'aspect "energie" — desactive sur
              appareil modeste ou il coute cher pour peu de rendu. */}
          {!quality.lowPower && (
            <EffectComposer>
              <Bloom intensity={theme === 'dark' ? 0.9 : 0.35} luminanceThreshold={0.35} mipmapBlur />
              <Vignette eskil={false} offset={0.25} darkness={0.55} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
