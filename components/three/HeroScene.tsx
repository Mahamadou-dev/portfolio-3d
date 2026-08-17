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
    // Trois frequences. La plus basse est volontairement discrete : quand elle
    // dominait, la silhouette devenait grumeleuse et le noyau ressemblait a
    // une pate. L'essentiel du relief vient maintenant du detail fin.
    float slow   = snoise(normal * 1.9 + uTime * 0.16) * 0.55;
    float medium = snoise(normal * 4.2 - uTime * 0.30) * 0.30;
    float fine   = snoise(normal * 8.5 + uTime * 0.55) * 0.15;
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

    // Veines d'energie. Elles suivent une direction oblique et sont modulees
    // par le relief : sur le seul axe Y elles dessinaient des anneaux de
    // niveau reguliers, ce qui donnait au noyau un aspect de dessin anime.
    float axis = dot(normalize(vLocalPos), normalize(vec3(0.35, 1.0, 0.5)));
    float veins = sin(axis * 22.0 - uTime * 1.8 + vDisplacement * 16.0);
    veins = pow(max(veins, 0.0), 30.0);
    // Les veines ne s'allument que sur les faces vues de biais : le centre
    // reste lisse, l'energie court sur les flancs.
    color += uAccent * veins * (0.18 + fresnel * 0.5);

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

    // Taille volontairement petite : un influx doit se lire comme une etincelle
    // nette qui file, pas comme une boule. Le bloom fera le halo, pas la
    // geometrie.
    gl_PointSize = uSize * (6.0 / -mvPosition.z);

    // L'influx s'allume au depart, s'eteint a l'arrivee : on lit le sens.
    vGlow = pow(sin(t * 3.14159), 1.6);
  }
`;

const PULSE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    // Coeur dense + halo court : le point garde un contour franc.
    float core = smoothstep(0.22, 0.0, d);
    float halo = smoothstep(0.5, 0.12, d) * 0.35;
    float mask = core + halo;
    if (mask <= 0.01) discard;

    gl_FragColor = vec4(uColor, mask * vGlow * 0.85);
  }
`;

/* ---- Le neurone lui-meme : coeur lumineux + anneau + halo court ---- */

const NEURON_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;

  attribute float aPhase;
  attribute float aLayer;   // 0 = couche interne, 1 = couche externe

  varying float vActivation;
  varying float vLayer;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Chaque neurone s'active a son propre rythme : le reseau respire sans
    // jamais clignoter a l'unisson.
    vActivation = 0.55 + 0.45 * sin(uTime * 1.3 + aPhase);
    vLayer = aLayer;

    // Les couches externes portent des neurones legerement plus petits :
    // cela cree une profondeur lisible entre les niveaux.
    float scale = mix(1.0, 0.72, aLayer);
    gl_PointSize = uSize * scale * (0.85 + vActivation * 0.3) * (6.0 / -mvPosition.z);
  }
`;

const NEURON_FRAG = /* glsl */ `
  precision mediump float;

  uniform vec3 uCore;   // coeur lumineux
  uniform vec3 uHalo;   // anneau et halo

  varying float vActivation;
  varying float vLayer;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    // Trois zones nettes, qui donnent la lecture « noeud numerique »
    // plutot que « bulle » : un coeur dense, un anneau fin qui le cercle,
    // et un halo court.
    float core = smoothstep(0.14, 0.0, d);
    float ring = smoothstep(0.30, 0.25, d) - smoothstep(0.25, 0.19, d);
    float halo = smoothstep(0.5, 0.16, d) * 0.20;

    vec3 color = uCore * core + uHalo * (ring * 1.1 + halo);
    float alpha = (core + ring * 0.85 + halo) * (0.5 + vActivation * 0.5);

    // Les neurones du fond s'estompent legerement : la profondeur se lit.
    alpha *= mix(1.0, 0.75, vLayer);

    gl_FragColor = vec4(color, alpha);
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

  const { nodeGeometry, synapseGeometry, pulseGeometry, pulseUniforms, neuronUniforms } =
    useMemo(() => {
      // --- Topologie : un perceptron multicouche enroule autour du noyau ---
      //
      // Trois couches concentriques. Les connexions vont exclusivement d'une
      // couche vers la suivante, jamais a l'interieur d'une couche : c'est
      // ce qui fait lire un reseau feed-forward plutot qu'un simple treillis.
      // Le noyau central n'est pas touche — les couches commencent au-dela
      // de son rayon.
      const LAYERS = [
        { radius: 1.72, count: Math.round(nodeCount * 0.28) },
        { radius: 2.15, count: Math.round(nodeCount * 0.38) },
        { radius: 2.55, count: Math.round(nodeCount * 0.34) },
      ];

      const layers = LAYERS.map((layer, index) => ({
        ...layer,
        // Chaque couche est tournee differemment : les neurones ne
        // s'alignent pas radialement d'une couche a l'autre.
        points: fibonacciSphere(layer.count, layer.radius).map((point) =>
          point.applyAxisAngle(new THREE.Vector3(0, 1, 0), index * 0.9)
        ),
      }));

      const allNodes: { point: THREE.Vector3; layer: number }[] = [];
      layers.forEach((layer, index) =>
        layer.points.forEach((point) => allNodes.push({ point, layer: index }))
      );

      // Chaque neurone se projette vers les 3 neurones les plus proches de la
      // couche suivante : dense sans devenir illisible.
      const FAN_OUT = 3;
      const edges: { from: THREE.Vector3; to: THREE.Vector3; weight: number }[] = [];

      for (let l = 0; l < layers.length - 1; l++) {
        const next = layers[l + 1].points;
        for (const source of layers[l].points) {
          next
            .map((target) => ({ target, distance: source.distanceTo(target) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, FAN_OUT)
            .forEach(({ target }, rank) => {
              // Le « poids » module la luminosite : quelques connexions
              // ressortent, comme des chemins privilegies du reseau.
              const weight = rank === 0 ? 0.85 + Math.random() * 0.15 : 0.2 + Math.random() * 0.3;
              edges.push({ from: source, to: target, weight });
            });
        }
      }

      // --- Neurones ---
      const nodePositions = new Float32Array(allNodes.length * 3);
      const nodePhase = new Float32Array(allNodes.length);
      const nodeLayer = new Float32Array(allNodes.length);

      allNodes.forEach((node, i) => {
        node.point.toArray(nodePositions, i * 3);
        nodePhase[i] = Math.random() * Math.PI * 2;
        nodeLayer[i] = node.layer / (layers.length - 1);
      });

      const nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
      nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(nodePhase, 1));
      nodeGeo.setAttribute('aLayer', new THREE.BufferAttribute(nodeLayer, 1));

      // --- Synapses, avec une couleur par sommet pour porter le poids ---
      const linePositions = new Float32Array(edges.length * 6);
      const lineColors = new Float32Array(edges.length * 6);
      const synapseColor = new THREE.Color(colors.synapse);

      edges.forEach((edge, i) => {
        edge.from.toArray(linePositions, i * 6);
        edge.to.toArray(linePositions, i * 6 + 3);

        // Degrade le long de la connexion : plus sombre au depart, plus clair
        // a l'arrivee, ce qui suggere le sens de propagation meme a l'arret.
        for (let end = 0; end < 2; end++) {
          const intensity = edge.weight * (end === 0 ? 0.45 : 1);
          lineColors[i * 6 + end * 3] = synapseColor.r * intensity;
          lineColors[i * 6 + end * 3 + 1] = synapseColor.g * intensity;
          lineColors[i * 6 + end * 3 + 2] = synapseColor.b * intensity;
        }
      });

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

      // --- Influx : seules les connexions bien ponderees en portent un,
      //     sinon la scene se remplit de points mobiles. ---
      const active = edges.filter((edge) => edge.weight > 0.5);
      const from = new Float32Array(active.length * 3);
      const to = new Float32Array(active.length * 3);
      const offset = new Float32Array(active.length);
      const pulseSpeed = new Float32Array(active.length);
      const dummy = new Float32Array(active.length * 3);

      active.forEach((edge, i) => {
        edge.from.toArray(from, i * 3);
        edge.to.toArray(to, i * 3);
        offset[i] = Math.random();
        pulseSpeed[i] = 0.7 + Math.random() * 1.4;
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
          uSize: { value: 7 },
          uColor: { value: new THREE.Color(colors.pulse) },
        },
        neuronUniforms: {
          uTime: { value: 0 },
          uSize: { value: 20 },
          uCore: { value: new THREE.Color(colors.pulse) },
          uHalo: { value: new THREE.Color(colors.accent) },
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
    neuronUniforms.uTime.value += delta;
    if (!quiet) {
      group.current.rotation.y += delta * speed;
      group.current.rotation.x = Math.sin(pulseUniforms.uTime.value * 0.15) * 0.12;
    }
  });

  pulseUniforms.uColor.value.set(colors.pulse);
  neuronUniforms.uCore.value.set(colors.pulse);
  neuronUniforms.uHalo.value.set(colors.accent);

  return (
    <group ref={group}>
      <points geometry={nodeGeometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={NEURON_VERT}
          fragmentShader={NEURON_FRAG}
          uniforms={neuronUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* vertexColors : chaque connexion porte son propre poids lumineux. */}
      <lineSegments geometry={synapseGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.55} />
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

function SecurityScanner({ colors }: { colors: Palette }) {
  const scanner = useRef<THREE.Group>(null!);
  const material = useRef<THREE.MeshBasicMaterial>(null!);

  // La coque filaire en icosaedre a ete retiree : ses longues aretes
  // traversaient le reseau de neurones et les deux treillis se lisaient comme
  // une seule cage confuse. L'anneau de balayage suffit a porter l'idee de
  // securite, et il reste lisible.
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Va-et-vient vertical autour du noyau.
    const y = Math.sin(t * 0.5) * 1.5;
    scanner.current.position.y = y;
    scanner.current.rotation.y += delta * 0.5;

    // Le rayon epouse la silhouette du noyau : l'anneau semble le raser.
    const grip = Math.cos(Math.asin(THREE.MathUtils.clamp(y / 2.0, -1, 1)));
    scanner.current.scale.setScalar(0.35 + grip * 0.75);

    // Il s'efface aux extremites de la course : pas de disque flottant isole.
    material.current.opacity = 0.15 + grip * 0.4;
  });

  return (
    <group ref={scanner}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.75, 0.005, 6, 128]} />
        <meshBasicMaterial ref={material} color={colors.accent} transparent opacity={0.4} />
      </mesh>
    </group>
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
  // Reparti sur les trois couches du reseau (28 % / 38 % / 34 %).
  const nodeCount = quality.lowPower ? 40 : 72;

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
            <Core colors={colors} amplitude={0.16 * motion + 0.03} />
          </Float>

          <NeuralNetwork
            colors={colors}
            nodeCount={nodeCount}
            speed={0.11 * motion}
            quiet={quality.reducedMotion}
          />

          <SecurityScanner colors={colors} />

          <ParallaxRig strength={quality.reducedMotion ? 0 : 0.55} />

          {/* La chaine de post-traitement fait 80 % de l'aspect final. On la
              coupe entierement sur machine modeste : elle coute cher. */}
          {!quality.lowPower && (
            <EffectComposer>
              {/* Seuil haut et intensite moderee : seuls les influx et les
                  aretes vives fleurissent. Plus bas, tout diffusait et la
                  scene perdait ses contours. */}
              <Bloom
                intensity={isDark ? 0.55 : 0.25}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.85}
                mipmapBlur
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.0004, 0.0005)}
                radialModulation={false}
                modulationOffset={0}
              />
              <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.07} />
              <Vignette eskil={false} offset={0.25} darkness={0.5} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
