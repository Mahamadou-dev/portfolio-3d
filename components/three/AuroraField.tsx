'use client';

// components/three/AuroraField.tsx
// Fond 3D global : un voile "aurore" en shader + un nuage de points anime sur
// GPU. Zero geometrie lourde, zero HDRI : l'objectif est un decor vivant qui
// ne vole jamais l'attention au contenu.
import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const PALETTE = {
  dark: {
    background: '#05060f',
    a: '#2563eb', // bleu profond
    b: '#7c3aed', // violet
    c: '#06b6d4', // cyan
    particle: '#93c5fd',
    intensity: 1,
  },
  light: {
    background: '#f6f8fc',
    a: '#93c5fd',
    b: '#c4b5fd',
    c: '#a5f3fc',
    particle: '#3b82f6',
    intensity: 0.45,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Voile d'aurore : un plan plein ecran avec du bruit fractal          */
/* ------------------------------------------------------------------ */

const AURORA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const AURORA_FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uScroll;
  uniform float uIntensity;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform vec3  uBackground;

  // Bruit de valeur 2D classique (rapide, suffisant pour un voile diffus).
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Somme de 5 octaves : donne les volutes lentes de l'aurore.
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.02 + vec2(1.7, 9.2); // decalage : evite les motifs alignes
      amplitude *= 0.5;
    }
    return value;
  }

  /**
   * Domain warping : on deforme les coordonnees par du bruit AVANT d'y
   * echantillonner du bruit. Deux niveaux de deformation transforment un
   * degrade plat en volutes liquides — c'est ce qui distingue un fond
   * "mesh gradient" moderne d'un simple nuage de bruit.
   */
  float warpedField(vec2 p, float t, out vec2 flow) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.6),
      fbm(p + vec2(5.2, 1.3) - t * 0.4)
    );

    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.35),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.30)
    );

    flow = r;
    return fbm(p + 3.5 * r);
  }

  void main() {
    // Coordonnees centrees et corrigees du ratio d'ecran.
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    // La souris et le scroll deplacent doucement le champ.
    p += uMouse * 0.06;
    p.y += uScroll * 0.25;

    float t = uTime * 0.03;

    vec2 flow;
    float field = warpedField(p * 1.35, t, flow);

    // Le champ deforme pilote le melange des trois teintes. Le vecteur de
    // flux sert de second axe : les couleurs ne suivent pas une simple rampe.
    vec3 color = mix(uColorA, uColorB, clamp(field * 1.5, 0.0, 1.0));
    color = mix(color, uColorC, clamp(flow.x * flow.y * 1.6, 0.0, 1.0));

    // Voile principal, resserre vers le centre de l'ecran.
    float veil = smoothstep(0.12, 0.92, field);
    veil *= smoothstep(1.15, 0.1, length(p) * 0.85);

    // Filaments : les lignes de niveau du champ deforme, tres fines. C'est ce
    // qui donne la lecture "energie" plutot que "brouillard".
    float filament = abs(sin(field * 9.0 + uTime * 0.35));
    filament = pow(1.0 - filament, 22.0);

    // Halo doux qui suit le curseur : discret mais rend la page vivante.
    float halo = exp(-length(p - uMouse * 0.5) * 2.6) * 0.35;

    vec3 finalColor = uBackground
      + (color * veil + color * halo) * uIntensity
      + uColorC * filament * uIntensity * 0.5;

    // Grain leger : casse le banding des degrades sur grands aplats.
    float grain = (hash(uv * uResolution + uTime) - 0.5) * 0.014;

    gl_FragColor = vec4(finalColor + grain, 1.0);
  }
`;

interface FieldProps {
  mouse: React.MutableRefObject<THREE.Vector2>;
  scroll: React.MutableRefObject<number>;
  isDark: boolean;
  paused: boolean;
}

function AuroraVeil({ mouse, scroll, isDark, paused }: FieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();
  const palette = isDark ? PALETTE.dark : PALETTE.light;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: palette.intensity },
      uColorA: { value: new THREE.Color(palette.a) },
      uColorB: { value: new THREE.Color(palette.b) },
      uColorC: { value: new THREE.Color(palette.c) },
      uBackground: { value: new THREE.Color(palette.background) },
    }),
    // Les couleurs sont mises a jour dans l'effet ci-dessous, pas recreees.
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Transition de theme : on interpole les couleurs plutot que de recreer le
  // materiau, ce qui evite un flash au basculement clair/sombre.
  useEffect(() => {
    const u = uniforms;
    u.uIntensity.value = palette.intensity;
    u.uColorA.value.set(palette.a);
    u.uColorB.value.set(palette.b);
    u.uColorC.value.set(palette.c);
    u.uBackground.value.set(palette.background);
  }, [palette, uniforms]);

  useFrame((state, delta) => {
    if (paused) return;
    const u = uniforms;
    u.uTime.value += delta;
    u.uResolution.value.set(size.width, size.height);
    u.uMouse.value.lerp(mouse.current, 0.04);
    u.uScroll.value += (scroll.current - u.uScroll.value) * 0.05;
  });

  return (
    // Le vertex shader ecrit directement en espace clip : le plan 2x2 couvre
    // l'ecran quelle que soit la camera, sans mise a l'echelle.
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={AURORA_VERT}
        fragmentShader={AURORA_FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Poussiere stellaire : points animes entierement dans le vertex shader */
/* ------------------------------------------------------------------ */

const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2  uMouse;
  uniform float uScroll;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Derive verticale continue : chaque point remonte puis reboucle.
    float drift = mod(pos.y + uTime * aSpeed * 0.35 + uScroll * 2.0, 24.0) - 12.0;
    pos.y = drift;

    // Ondulation laterale desynchronisee (aPhase) pour eviter tout effet de grille.
    pos.x += sin(uTime * 0.25 * aSpeed + aPhase) * 0.6;
    pos.z += cos(uTime * 0.2 * aSpeed + aPhase) * 0.6;

    // Parallaxe : les points proches reagissent plus a la souris.
    float depth = (pos.z + 12.0) / 24.0;
    pos.xy += uMouse * mix(1.2, 0.15, depth);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Taille attenuee par la distance + scintillement lent.
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.1 * aSpeed + aPhase * 3.0);
    gl_PointSize = uSize * aScale * twinkle * (12.0 / -mvPosition.z);

    // On efface progressivement les points les plus lointains.
    vAlpha = twinkle * smoothstep(0.0, 0.35, depth) * (1.0 - smoothstep(0.75, 1.0, depth));
  }
`;

const DUST_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Point rond a bords doux (pas de texture a charger).
    float d = length(gl_PointCoord - 0.5);
    float mask = smoothstep(0.5, 0.15, d);
    if (mask <= 0.01) discard;
    gl_FragColor = vec4(uColor, mask * vAlpha * 0.9);
  }
`;

function StarDust({ mouse, scroll, isDark, paused, count }: FieldProps & { count: number }) {
  const palette = isDark ? PALETTE.dark : PALETTE.light;

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      scales[i] = 0.4 + Math.random() * 1.6;
      speeds[i] = 0.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    return {
      geometry: geo,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.4 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 },
        uColor: { value: new THREE.Color(palette.particle) },
      },
    };
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    uniforms.uColor.value.set(palette.particle);
  }, [palette, uniforms]);

  // La geometrie est creee a la main : il faut la liberer nous-memes.
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (paused) return;
    uniforms.uTime.value += delta;
    uniforms.uMouse.value.lerp(mouse.current, 0.03);
    uniforms.uScroll.value += (scroll.current - uniforms.uScroll.value) * 0.04;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={DUST_VERT}
        fragmentShader={DUST_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Composant exporte                                                   */
/* ------------------------------------------------------------------ */

export default function AuroraField() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const quality = useSceneQuality();

  const mouse = useRef(new THREE.Vector2(0, 0));
  const scroll = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
    };
    // Onglet en arriere-plan : on coupe l'animation (batterie + CPU).
    const onVisibility = () => setPaused(document.visibilityState === 'hidden');

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!quality.ready) {
    // Aplat de la bonne couleur pendant l'hydratation : pas de flash blanc.
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ background: isDark ? PALETTE.dark.background : PALETTE.light.background }}
      />
    );
  }

  const dustCount = Math.round(1400 * quality.density);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <Canvas
        dpr={quality.dpr}
        camera={{ position: [0, 0, 12], fov: 55 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      >
        <AuroraVeil mouse={mouse} scroll={scroll} isDark={isDark} paused={paused || quality.reducedMotion} />
        <StarDust
          mouse={mouse}
          scroll={scroll}
          isDark={isDark}
          paused={paused}
          count={dustCount}
        />
      </Canvas>

      {/* Vignette CSS : concentre le regard vers le centre, cote GPU c'est gratuit. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(5,6,15,0.75) 100%)'
            : 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(246,248,252,0.85) 100%)',
        }}
      />
    </div>
  );
}
