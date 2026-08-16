'use client';

// components/three/HeroScene.tsx
//
// « Neural Core » — la piece maitresse du hero, construite autour du parcours :
// intelligence artificielle (un reseau de neurones qui pense, avec des influx
// qui circulent le long des synapses) et securite (une coque cristalline et un
// anneau de balayage qui protegent le noyau).
//
// Tout est procedural : aucun modele a telecharger, donc rendu immediat.
import { useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Icosahedron } from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';

interface Palette {
  core: string;
  rim: string;
  accent: string;
  shell: string;
  synapse: string;
  pulse: string;
}

const THEME: Record<'dark' | 'light', Palette> = {
  dark: {
    core: '#1d4ed8',
    rim: '#a855f7',
    accent: '#22d3ee',
    shell: '#60a5fa',
    synapse: '#3b82f6',
    pulse: '#67e8f9',
  },
  light: {
    core: '#2563eb',
    rim: '#7c3aed',
    accent: '#0891b2',
    shell: '#1d4ed8',
    synapse: '#3b82f6',
    pulse: '#0ea5e9',
  },
};

/* ================================================================== */
/* 1. Le noyau — bruit simplex + iridescence + veines d'energie        */
/* ================================================================== */

const CORE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;

  varying vec3  vNormal;
  varying vec3  vViewDir;
  varying vec3  vLocalPos;
  varying float vDisplacement;

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
    // Trois frequences : houle lente, fremissement, micro-detail.
    float slow   = snoise(normal * 1.3 + uTime * 0.16);
    float medium = snoise(normal * 2.9 - uTime * 0.30) * 0.40;
    float fine   = snoise(normal * 6.1 + uTime * 0.55) * 0.14;
    float displacement = (slow + medium + fine) * uAmplitude;

    vec3 displaced = position + normal * displacement;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    vLocalPos = displaced;
    vDisplacement = displacement;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CORE_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3  uCore;
  uniform vec3  uRim;
  uniform vec3  uAccent;
  uniform float uTime;

  varying vec3  vNormal;
  varying vec3  vViewDir;
  varying vec3  vLocalPos;
  varying float vDisplacement;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view   = normalize(vViewDir);
    float facing = clamp(dot(normal, view), 0.0, 1.0);

    // Fresnel : les bords s'embrasent, le centre reste dense et profond.
    float fresnel = pow(1.0 - facing, 2.4);

    // Iridescence : l'angle de vue decale la teinte, comme un film mince sur
    // une bulle. C'est ce qui donne l'aspect « materiau precieux ».
    float shift = facing * 3.0 + uTime * 0.25;
    vec3 iridescence = 0.5 + 0.5 * cos(vec3(0.0, 2.094, 4.188) + shift);

    // Les cretes du relief tirent vers la couleur d'accent.
    float crest = smoothstep(-0.15, 0.28, vDisplacement);

    vec3 color = mix(uCore * 0.22, uCore, crest);
    color = mix(color, uAccent, crest * 0.55);
    color = mix(color, color * iridescence * 1.5, fresnel * 0.7);
    color += uRim * fresnel * 1.9;

    // Veines d'energie : des bandes fines qui parcourent la surface, comme
    // des influx sous la peau du noyau.
    float veins = sin(vLocalPos.y * 14.0 - uTime * 2.2 + vDisplacement * 9.0);
    veins = pow(max(veins, 0.0), 12.0);
    color += uAccent * veins * 0.55;

    // Respiration lente, tres legere.
    color *= 0.92 + 0.08 * sin(uTime * 0.7);

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
    <Icosahedron args={[1.15, 48]}>
      <shaderMaterial vertexShader={CORE_VERT} fragmentShader={CORE_FRAG} uniforms={uniforms} />
    </Icosahedron>
  );
}

/* ================================================================== */
/* 2. Le reseau de neurones — noeuds, synapses, influx qui circulent   */
/* ================================================================== */

/** Repartition de Fibonacci : des points regulierement espaces sur la sphere. */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(
      new THREE.Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring).multiplyScalar(radius)
    );
  }
  return points;
}

const PULSE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;

  attribute float aOffset;   // position de depart le long de la synapse
  attribute float aSpeed;
  attribute vec3  aFrom;
  attribute vec3  aTo;

  varying float vGlow;

  void main() {
    // Progression 0 -> 1 le long de la synapse, en boucle.
    float t = fract(aOffset + uTime * aSpeed * 0.22);

    vec3 pos = mix(aFrom, aTo, t);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * (9.0 / -mvPosition.z);

    // L'influx s'allume au depart, s'eteint a l'arrivee : on lit le sens.
    vGlow = sin(t * 3.14159);
  }
`;

const PULSE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float mask = smoothstep(0.5, 0.0, d);
    if (mask <= 0.01) discard;
    gl_FragColor = vec4(uColor, mask * vGlow);
  }
`;

function NeuralNetwork({
  colors,
  nodeCount,
  speed,
  quiet,
}: {
  colors: Palette;
  nodeCount: number;
  speed: number;
  quiet: boolean;
}) {
  const group = useRef<THREE.Group>(null!);

  const { nodeGeometry, synapseGeometry, pulseGeometry, pulseUniforms } = useMemo(() => {
    const radius = 2.15;
    const nodes = fibonacciSphere(nodeCount, radius);

    // Chaque neurone se relie a ses deux plus proches voisins : on obtient un
    // maillage connexe et lisible, jamais une pelote.
    const edges: [THREE.Vector3, THREE.Vector3][] = [];
    const seen = new Set<string>();

    nodes.forEach((node, i) => {
      const neighbours = nodes
        .map((other, j) => ({ j, distance: node.distanceTo(other) }))
        .filter((entry) => entry.j !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      for (const neighbour of neighbours) {
        const key = i < neighbour.j ? `${i}-${neighbour.j}` : `${neighbour.j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([node, nodes[neighbour.j]]);
      }
    });

    // --- Neurones (points) ---
    const nodePositions = new Float32Array(nodes.length * 3);
    nodes.forEach((node, i) => node.toArray(nodePositions, i * 3));
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    // --- Synapses (segments) ---
    const linePositions = new Float32Array(edges.length * 6);
    edges.forEach(([from, to], i) => {
      from.toArray(linePositions, i * 6);
      to.toArray(linePositions, i * 6 + 3);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    // --- Influx (un point mobile par synapse) ---
    const count = edges.length;
    const from = new Float32Array(count * 3);
    const to = new Float32Array(count * 3);
    const offset = new Float32Array(count);
    const pulseSpeed = new Float32Array(count);
    const dummy = new Float32Array(count * 3);

    edges.forEach(([a, b], i) => {
      a.toArray(from, i * 3);
      b.toArray(to, i * 3);
      offset[i] = Math.random();
      pulseSpeed[i] = 0.6 + Math.random() * 1.6;
    });

    const pulseGeo = new THREE.BufferGeometry();
    // L'attribut position n'est pas utilise (tout vient de aFrom/aTo) mais
    // three.js exige l'attribut pour dimensionner le draw call.
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(dummy, 3));
    pulseGeo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
    pulseGeo.setAttribute('aTo', new THREE.BufferAttribute(to, 3));
    pulseGeo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1));
    pulseGeo.setAttribute('aSpeed', new THREE.BufferAttribute(pulseSpeed, 1));

    return {
      nodeGeometry: nodeGeo,
      synapseGeometry: lineGeo,
      pulseGeometry: pulseGeo,
      pulseUniforms: {
        uTime: { value: 0 },
        uSize: { value: 26 },
        uColor: { value: new THREE.Color(colors.pulse) },
      },
    };
  }, [nodeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Geometries construites a la main : c'est a nous de les liberer.
  useEffect(
    () => () => {
      nodeGeometry.dispose();
      synapseGeometry.dispose();
      pulseGeometry.dispose();
    },
    [nodeGeometry, synapseGeometry, pulseGeometry]
  );

  useFrame((_, delta) => {
    pulseUniforms.uTime.value += delta;
    if (!quiet) {
      group.current.rotation.y += delta * speed;
      group.current.rotation.x = Math.sin(pulseUniforms.uTime.value * 0.15) * 0.12;
    }
  });

  pulseUniforms.uColor.value.set(colors.pulse);

  return (
    <group ref={group}>
      <points geometry={nodeGeometry}>
        <pointsMaterial
          size={0.055}
          color={colors.accent}
          transparent
          opacity={0.95}
          sizeAttenuation
        />
      </points>

      <lineSegments geometry={synapseGeometry}>
        <lineBasicMaterial color={colors.synapse} transparent opacity={0.16} />
      </lineSegments>

      <points geometry={pulseGeometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={PULSE_VERT}
          fragmentShader={PULSE_FRAG}
          uniforms={pulseUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ================================================================== */
/* 3. La coque de securite — cristal filaire + anneau de balayage      */
/* ================================================================== */

function SecurityShell({ colors, speed }: { colors: Palette; speed: number }) {
  const shell = useRef<THREE.Mesh>(null!);
  const scanner = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    shell.current.rotation.y -= delta * speed;
    shell.current.rotation.x += delta * speed * 0.4;

    // L'anneau balaie le noyau de haut en bas, comme un scan de sécurité.
    const t = state.clock.elapsedTime;
    scanner.current.position.y = Math.sin(t * 0.55) * 1.6;
    scanner.current.rotation.y += delta * 0.7;
    const squeeze = Math.cos(Math.asin(THREE.MathUtils.clamp(scanner.current.position.y / 2.2, -1, 1)));
    scanner.current.scale.setScalar(0.6 + squeeze * 0.55);
  });

  return (
    <>
      <Icosahedron ref={shell} args={[2.75, 1]}>
        <meshBasicMaterial color={colors.shell} wireframe transparent opacity={0.14} />
      </Icosahedron>

      <group ref={scanner}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.3, 0.008, 6, 96]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.55} />
        </mesh>
      </group>
    </>
  );
}

/* ================================================================== */
/* 4. Camera parallaxe                                                 */
/* ================================================================== */

function ParallaxRig({ strength }: { strength: number }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 6.4));

  useFrame(() => {
    target.current.set(pointer.x * strength, pointer.y * strength * 0.55, 6.4);
    camera.position.lerp(target.current, 0.045);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ================================================================== */

export default function HeroScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;
  const quality = useSceneQuality();

  if (!quality.ready) {
    return <div className="w-full h-[24rem] md:h-[32rem]" />;
  }

  const motion = quality.reducedMotion ? 0.12 : 1;
  const nodeCount = quality.lowPower ? 34 : 64;

  return (
    <div className="w-full h-[24rem] md:h-[32rem] relative">
      <Canvas
        dpr={quality.dpr}
        camera={{ position: [0, 0, 6.4], fov: 45 }}
        gl={{ antialias: !quality.lowPower, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Float
            speed={1.1 * motion}
            rotationIntensity={0.3 * motion}
            floatIntensity={0.45 * motion}
          >
            <Core colors={colors} amplitude={0.2 * motion + 0.05} />
          </Float>

          <NeuralNetwork
            colors={colors}
            nodeCount={nodeCount}
            speed={0.11 * motion}
            quiet={quality.reducedMotion}
          />

          <SecurityShell colors={colors} speed={0.06 * motion} />

          <ParallaxRig strength={quality.reducedMotion ? 0 : 0.55} />

          {/* La chaine de post-traitement fait 80 % de l'aspect final. On la
              coupe entierement sur machine modeste : elle coute cher. */}
          {!quality.lowPower && (
            <EffectComposer>
              <Bloom
                intensity={isDark ? 1.15 : 0.4}
                luminanceThreshold={0.28}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.0007, 0.0009)}
                radialModulation={false}
                modulationOffset={0}
              />
              <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.18} />
              <Vignette eskil={false} offset={0.22} darkness={0.6} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
