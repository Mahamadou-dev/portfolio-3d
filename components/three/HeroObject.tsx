'use client';

// components/three/HeroObject.tsx
//
// « L'Instrument » — la seule scene 3D du site, et la seule chose qui
// bouge en continu sur la page.
//
// Ce qu'elle remplace, et pourquoi
// --------------------------------
// L'ancien hero (« Neural Core ») etait une scene *stylisee* : des shaders
// maison qui deformaient une sphere avec du bruit simplex, des veines
// d'energie sinusoidales, un reseau de points en blending additif, et une
// chaine de post-traitement — bloom, aberration chromatique, grain,
// vignettage. Chacun de ces effets est un code de la 3D temps reel de jeu
// video. Empiles, ils produisent exactement la lecture que la refonte
// devait supprimer.
//
// Le realisme ne vient pas d'ajouter des effets : il vient de simuler
// correctement la lumiere et la matiere, puis de ne rien ajouter du tout.
// Concretement, ici :
//
//   - Materiaux PBR reels. Metal brosse (metalness 1, rugosite anisotrope
//     simulee), verre a transmission physique (indice de refraction 1.45,
//     epaisseur, dispersion), ceramique mate. Aucun shader maison.
//   - Eclairage de studio. Un environnement construit avec des surfaces
//     lumineuses (`Lightformer`) — une boite a lumiere principale a 45°,
//     un remplissage froid a l'oppose, un liseré rasant derriere. C'est le
//     dispositif d'un shooting produit, et c'est ce qui donne aux reflets
//     leur forme rectangulaire reconnaissable.
//   - Ombres de contact. L'objet touche un sol : sans ce point d'ancrage,
//     n'importe quel rendu flotte et sonne faux.
//   - Zero post-traitement. La camera ne fait pas de bloom, et le tone
//     mapping ACES suffit a tenir les hautes lumieres.
//
// Le mouvement se limite a deux choses : une rotation continue tres lente
// (un tour en ~90 secondes, sous le seuil ou l'oeil suit activement) et
// une parallaxe amortie au curseur. Rien ne pulse, rien ne clignote.
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';

/* ------------------------------------------------------------------ */
/* Matieres                                                            */
/* ------------------------------------------------------------------ */
//
// Deux ambiances, un seul objet. En clair, la scene est un objet de metal
// clair sur fond blanc — lumiere de jour, aluminium anodise. En sombre,
// c'est le meme objet en acier graphite sous une lumiere plus contrastee.
// Le bleu d'accent n'intervient qu'en liseré : il rappelle la couleur
// d'interface sans repeindre la scene.

interface Finish {
  /** Metal du noyau. */
  coreColor: string;
  /** Metal des anneaux usines. */
  ringColor: string;
  /** Teinte du verre — quasi neutre, sinon le rendu vire au gadget. */
  glassColor: string;
  /** Le liseré d'accent, unique touche de couleur. */
  accent: string;
  /** Intensite de l'environnement de studio. */
  envIntensity: number;
  /** Couleur et opacite de l'ombre portee au sol. */
  shadowColor: string;
  shadowOpacity: number;
}

const FINISH: Record<'light' | 'dark', Finish> = {
  light: {
    coreColor: '#b9bcc4',
    ringColor: '#8d9099',
    glassColor: '#eef1f5',
    accent: '#2c5bb8',
    envIntensity: 1,
    shadowColor: '#1b1c20',
    shadowOpacity: 0.34,
  },
  dark: {
    coreColor: '#6e727b',
    ringColor: '#4a4e57',
    glassColor: '#c9d2e0',
    accent: '#7ba1e8',
    envIntensity: 0.85,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
  },
};

/* ------------------------------------------------------------------ */
/* Le studio                                                           */
/* ------------------------------------------------------------------ */

/**
 * L'environnement lumineux.
 *
 * `Environment` est utilise SANS `preset` : un preset telecharge un fichier
 * HDRI de plusieurs megaoctets depuis un CDN, ce qui ajoute une dependance
 * reseau au premier rendu et un ecran vide en attendant. Ici l'environnement
 * est construit sur place a partir de rectangles lumineux, rendus une seule
 * fois dans une cube map (`frames={1}`) : cout nul apres la premiere image,
 * et les reflets ont la forme franche des boites a lumiere d'un studio
 * photo — c'est precisement ce qui fait « rendu produit » plutot que
 * « rendu de jeu ».
 */
function Studio({ finish }: { finish: Finish }) {
  return (
    <Environment frames={1} resolution={256}>
      {/* Le fond de l'environnement : un degres de gris, pas un noir pur.
          Un environnement noir donne des metaux ternes et sans vie. */}
      <mesh scale={40}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#3a3d44" side={THREE.BackSide} />
      </mesh>

      {/* Lumiere principale : grande boite haute a gauche, a 45°. C'est
          elle qui dessine la forme de l'objet. */}
      <Lightformer
        form="rect"
        intensity={4.2 * finish.envIntensity}
        color="#ffffff"
        position={[-4, 5, 3]}
        rotation={[-Math.PI / 5, Math.PI / 5, 0]}
        scale={[7, 9, 1]}
      />

      {/* Remplissage, a l'oppose et plus froid : il ouvre les ombres sans
          creer un second point chaud. Deux fois moins intense que la
          principale — le rapport 2:1 est ce qui garde du relief. */}
      <Lightformer
        form="rect"
        intensity={1.6 * finish.envIntensity}
        color="#c8d6f0"
        position={[5, 2, 2]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[6, 6, 1]}
      />

      {/* Liseré arriere : une bande fine et rasante qui detache la
          silhouette du fond. C'est le seul endroit ou l'accent apparait
          dans la scene. */}
      <Lightformer
        form="rect"
        intensity={2.4 * finish.envIntensity}
        color={finish.accent}
        position={[0, -1, -5]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[8, 0.6, 1]}
      />

      {/* Reflet de sol : eclaire le dessous de l'objet, sinon il parait
          pose sur du vide. */}
      <Lightformer
        form="rect"
        intensity={0.9 * finish.envIntensity}
        color="#ffffff"
        position={[0, -4, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 8, 1]}
      />
    </Environment>
  );
}

/* ------------------------------------------------------------------ */
/* L'objet                                                             */
/* ------------------------------------------------------------------ */

/**
 * Les anneaux usines qui entourent le noyau.
 *
 * Trois anneaux de metal, d'inclinaisons differentes, tournant chacun a sa
 * propre vitesse — toutes tres lentes et non multiples les unes des autres,
 * pour que la figure ne se repete jamais a l'identique.
 *
 * La forme dit quelque chose : un instrument de mesure, une monture de
 * gyroscope. C'est l'image d'un travail d'ingenierie, pas d'un artefact
 * magique.
 */
function Rings({ finish, speed }: { finish: Finish; speed: number }) {
  const refs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];

  // Des vitesses volontairement premieres entre elles : 1, 0.62, 0.41.
  // Avec des vitesses proportionnelles, les anneaux se realignent
  // periodiquement et l'oeil percoit une pulsation.
  const RATES = [1, -0.62, 0.41];

  useFrame((_, delta) => {
    refs.forEach((ref, i) => {
      if (ref.current) ref.current.rotation.z += delta * speed * RATES[i];
    });
  });

  const GEOMETRY: [number, number, [number, number, number]][] = [
    // rayon, epaisseur, inclinaison
    [1.62, 0.022, [Math.PI / 2.2, 0, 0]],
    [1.86, 0.016, [Math.PI / 2, Math.PI / 3.4, 0]],
    [2.08, 0.012, [Math.PI / 1.75, -Math.PI / 5, 0]],
  ];

  return (
    <>
      {GEOMETRY.map(([radius, tube, rotation], i) => (
        <group key={i} rotation={rotation}>
          <mesh ref={refs[i]} castShadow>
            {/* 128 segments radiaux : en dessous, la silhouette d'un
                anneau fin devient un polygone visible sur les bords. */}
            <torusGeometry args={[radius, tube, 12, 128]} />
            <meshStandardMaterial
              color={finish.ringColor}
              metalness={1}
              // Une rugosite moyenne donne le reflet etire du metal brosse.
              // A 0, l'anneau devient un miroir et attrape des reflets
              // durs qui scintillent des qu'il tourne.
              roughness={0.32}
              envMapIntensity={1.1}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/**
 * Le noyau : une sphere de metal poli sous une coque de verre.
 *
 * Le verre est le seul element couteux de la scene (la transmission exige
 * un rendu de l'arriere-plan dans une cible intermediaire). Il est donc
 * remplace par un vernis simple sur machine modeste — visuellement proche
 * de loin, et sans faire tomber la page a 20 images par seconde.
 */
function Core({ finish, glass }: { finish: Finish; glass: boolean }) {
  return (
    <group>
      {/* Le noyau metallique. Un icosaedre tres subdivise plutot qu'une
          UV-sphere : pas de pincement des reflets aux poles. */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1, 16]} />
        <meshStandardMaterial
          color={finish.coreColor}
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* La coque de verre. */}
      <mesh>
        <icosahedronGeometry args={[1.34, 12]} />
        {glass ? (
          <meshPhysicalMaterial
            color={finish.glassColor}
            transmission={0.97}
            // L'epaisseur pilote la refraction : sans elle, le verre est
            // un simple film transparent et l'objet derriere n'est pas
            // devie.
            thickness={0.55}
            ior={1.45}
            roughness={0.05}
            // Une trace de dispersion suffit a poser une frange coloree
            // sur les aretes. Plus haut, on retombe dans l'aberration
            // chromatique tape-a-l'oeil.
            iridescence={0.12}
            iridescenceIOR={1.2}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={1.4}
            transparent
          />
        ) : (
          <meshPhysicalMaterial
            color={finish.glassColor}
            metalness={0}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.2}
            transparent
            opacity={0.22}
          />
        )}
      </mesh>

      {/* Le socle : un disque de ceramique mate. Il donne l'echelle et une
          surface qui recoit l'ombre — deux indices que le cerveau utilise
          pour juger qu'une image est « reelle ». */}
      <mesh position={[0, -2.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[2.6, 2.6, 0.001, 64]} />
        <meshStandardMaterial color={finish.coreColor} metalness={0} roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Parallaxe au curseur.
 *
 * Le groupe s'incline vers le pointeur, avec un amortissement fort (5 %
 * par image) : le mouvement suit la souris avec un temps de retard, ce qui
 * donne une masse a l'objet. L'ancienne version deplacait la camera, ce
 * qui deformait la perspective et donnait le mal de mer ; incliner l'objet
 * garde la camera fixe et le cadrage stable.
 */
function Parallax({
  children,
  strength,
  spin,
}: {
  children: React.ReactNode;
  strength: number;
  spin: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, delta) => {
    target.set(-pointer.y * strength, pointer.x * strength);
    group.current.rotation.x += (target.x - group.current.rotation.x) * 0.05;
    // La rotation continue s'ajoute a la composante de parallaxe sur Y.
    group.current.rotation.y += (target.y - group.current.rotation.y) * 0.05 + delta * spin;
  });

  return <group ref={group}>{children}</group>;
}

/* ------------------------------------------------------------------ */

export default function HeroObject() {
  const { theme } = useTheme();
  const finish = FINISH[theme === 'dark' ? 'dark' : 'light'];
  const quality = useSceneQuality();

  // Reserve d'espace pendant l'hydratation : sans elle, la mise en page
  // saute au montage du canvas (CLS).
  if (!quality.ready) {
    return <div className="h-[22rem] w-full sm:h-[26rem] lg:h-[32rem]" aria-hidden="true" />;
  }

  const still = quality.reducedMotion;

  return (
    <div
      className="h-[22rem] w-full sm:h-[26rem] lg:h-[32rem]"
      // La scene est purement decorative : elle porte la meme information
      // que le titre a cote. La masquer evite qu'un lecteur d'ecran
      // annonce un canvas vide.
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={quality.dpr}
        camera={{ position: [0, 0.5, 6.2], fov: 36 }}
        gl={{
          antialias: !quality.lowPower,
          alpha: true,
          powerPreference: 'high-performance',
          // ACES compresse les hautes lumieres comme une pellicule : les
          // reflets speculaires du metal restent des reflets au lieu de
          // saturer en blanc pur.
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: theme === 'dark' ? 1.05 : 1.25,
        }}
      >
        <Suspense fallback={null}>
          <Studio finish={finish} />

          {/* Une seule lumiere directe, uniquement pour projeter l'ombre :
              tout l'eclairage visible vient de l'environnement. */}
          <directionalLight
            position={[-4, 6, 4]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={20}
            shadow-bias={-0.0006}
          />

          <Parallax
            strength={still ? 0 : 0.12}
            // Un tour complet en ~90 secondes. En dessous de ce seuil,
            // l'oeil enregistre que la scene est vivante sans jamais etre
            // tente de suivre le mouvement.
            spin={still ? 0 : 0.07}
          >
            <Core finish={finish} glass={!quality.lowPower} />
            <Rings finish={finish} speed={still ? 0 : 0.06} />
          </Parallax>

          {/* L'ombre de contact : c'est elle qui pose l'objet. Un flou
              large et une opacite moyenne imitent une source etendue —
              une ombre nette impliquerait un spot, incompatible avec
              l'eclairage de studio ci-dessus. */}
          <ContactShadows
            position={[0, -2.05, 0]}
            scale={9}
            blur={2.8}
            far={4.5}
            opacity={finish.shadowOpacity}
            color={finish.shadowColor}
            // Rendue une seule fois : la geometrie ne se deplace pas
            // verticalement, l'ombre n'a donc aucune raison d'etre
            // recalculee a chaque image.
            frames={quality.lowPower ? 1 : Infinity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
