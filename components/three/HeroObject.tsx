'use client';

// components/three/HeroObject.tsx
//
// « Le reseau » — un perceptron multicouche, rendu comme un objet reel.
//
// Le sujet
// --------
// C'est la figure canonique de l'apprentissage profond : des couches de
// neurones, des poids qui les relient, une propagation avant qui traverse
// le reseau de l'entree vers la sortie. N'importe qui la reconnait — un
// recruteur, un jury de master, un directeur de these — et elle restera
// juste tout au long du parcours qu'elle annonce.
//
// Le traitement
// -------------
// Le meme schema existait dans l'ancienne version du site, mais rendu en
// blending additif : des points lumineux et des influx qui filaient sur
// les synapses, sous une chaine de bloom et d'aberration chromatique. Le
// sujet etait bon, le traitement disait « jeu video ».
//
// Ici, le reseau est un objet manufacture : des noeuds en metal poli, des
// liaisons en fil metallique fin, poses sur un sol qui recoit leur ombre,
// eclaires par un studio a trois sources. Aucun shader maison, aucun
// post-traitement. La lumiere fait tout le travail.
//
// Deux decisions de mise en scene meritent d'etre expliquees :
//
//   1. Le reseau est PLAN. Un nuage de neurones sur une sphere fait joli
//      mais ne se lit pas : on n'y distingue ni couche, ni sens de
//      propagation. Un schema plan, vu de trois quarts, garde la lecture
//      du diagramme tout en donnant de la profondeur.
//   2. Il OSCILLE, il ne tourne pas. Une rotation complete presenterait
//      periodiquement le plan par la tranche, ou le reseau disparait. Un
//      balancement de +/- 7 degres suffit a faire vivre les reflets.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';

/* ================================================================== */
/* Topologie                                                           */
/* ================================================================== */

/**
 * 4 -> 6 -> 6 -> 3.
 *
 * Ce ne sont pas des dimensions au hasard : c'est la plus petite
 * architecture qui se lise encore comme « profonde » (deux couches
 * cachees), avec un goulot en sortie qui rend le sens de la propagation
 * evident. Au-dela, les liaisons se croisent trop et la figure devient un
 * treillis illisible — c'est exactement ce qui arrivait a l'ancienne
 * version, qui alignait 72 neurones.
 */
const LAYERS = [4, 6, 6, 3];

const SPACING_X = 1.5;
const SPACING_Y = 0.66;
const NODE_RADIUS = 0.125;
const EDGE_RADIUS = 0.0075;

interface Node {
  position: THREE.Vector3;
  layer: number;
}

interface Edge {
  from: THREE.Vector3;
  to: THREE.Vector3;
  /** Position de l'arete dans la profondeur du reseau (entre deux couches). */
  depth: number;
  /** Le poids de la connexion : il module l'epaisseur du fil. */
  weight: number;
}

function buildNetwork() {
  const nodes: Node[] = [];
  const layerNodes: Node[][] = [];

  LAYERS.forEach((count, layer) => {
    const column: Node[] = [];
    for (let i = 0; i < count; i++) {
      const node: Node = {
        position: new THREE.Vector3(
          (layer - (LAYERS.length - 1) / 2) * SPACING_X,
          (i - (count - 1) / 2) * SPACING_Y,
          0
        ),
        layer,
      };
      column.push(node);
      nodes.push(node);
    }
    layerNodes.push(column);
  });

  // Reseau entierement connecte entre couches successives : c'est la
  // definition d'un perceptron multicouche, et la seule topologie qu'un
  // lecteur reconnaitra sans legende.
  const edges: Edge[] = [];
  for (let l = 0; l < layerNodes.length - 1; l++) {
    for (const from of layerNodes[l]) {
      for (const to of layerNodes[l + 1]) {
        edges.push({
          from: from.position,
          to: to.position,
          depth: l + 0.5,
          // Des poids inegaux : un reseau dont toutes les connexions sont
          // identiques ressemble a une grille, pas a un modele entraine.
          weight: 0.35 + Math.random() * 0.65,
        });
      }
    }
  }

  return { nodes, edges };
}

/* ================================================================== */
/* Palette                                                             */
/* ================================================================== */

interface Finish {
  nodeIdle: THREE.Color;
  nodeActive: THREE.Color;
  edgeIdle: THREE.Color;
  edgeActive: THREE.Color;
  shadow: string;
  shadowOpacity: number;
  envIntensity: number;
  exposure: number;
}

function makeFinish(dark: boolean): Finish {
  return dark
    ? {
        nodeIdle: new THREE.Color('#5b6069'),
        // L'accent du site sert d'etat actif. C'est la meme regle que dans
        // l'interface : la couleur signale un etat, jamais un ornement.
        nodeActive: new THREE.Color('#7ba1e8'),
        edgeIdle: new THREE.Color('#3a3e46'),
        edgeActive: new THREE.Color('#7ba1e8'),
        shadow: '#000000',
        shadowOpacity: 0.5,
        envIntensity: 0.9,
        exposure: 1.05,
      }
    : {
        nodeIdle: new THREE.Color('#a9adb5'),
        nodeActive: new THREE.Color('#2c5bb8'),
        edgeIdle: new THREE.Color('#b6b9bf'),
        edgeActive: new THREE.Color('#2c5bb8'),
        shadow: '#1b1c20',
        shadowOpacity: 0.3,
        envIntensity: 1,
        exposure: 1.2,
      };
}

/* ================================================================== */
/* Le studio                                                           */
/* ================================================================== */

/**
 * L'environnement lumineux, construit sur place a partir de surfaces
 * emissives plutot que charge depuis un fichier HDRI.
 *
 * Un preset drei telecharge plusieurs megaoctets depuis un CDN : une
 * dependance reseau et un ecran vide au premier rendu. Rendu une seule
 * fois dans une cube map (`frames={1}`), cet environnement ne coute plus
 * rien apres la premiere image, et ses reflets ont la forme rectangulaire
 * franche des boites a lumiere d'un studio photo. C'est cette forme, plus
 * que toute autre chose, qui fait lire un rendu comme « produit » plutot
 * que comme « jeu ».
 */
function Studio({ finish }: { finish: Finish }) {
  return (
    <Environment frames={1} resolution={256}>
      {/* Un fond gris moyen, jamais noir : un environnement noir donne des
          metaux ternes, sans rien a reflechir. */}
      <mesh scale={40}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#3d4046" side={THREE.BackSide} />
      </mesh>

      {/* Source principale : haute, a gauche, a 45°. Elle dessine la forme. */}
      <Lightformer
        form="rect"
        intensity={4}
        color="#ffffff"
        position={[-5, 5, 4]}
        rotation={[-Math.PI / 5, Math.PI / 5, 0]}
        scale={[9, 9, 1]}
      />

      {/* Remplissage, a l'oppose et plus froid, deux fois moins intense.
          Ce rapport 2:1 est ce qui conserve du relief tout en ouvrant les
          ombres. */}
      <Lightformer
        form="rect"
        intensity={1.5 * finish.envIntensity}
        color="#ccd8f0"
        position={[6, 1, 3]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[7, 7, 1]}
      />

      {/* Bande rasante derriere le reseau : elle detache chaque noeud du
          fond par un liseré, sans quoi les spheres sombres se confondent
          avec le decor en mode sombre. */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#ffffff"
        position={[0, 0, -6]}
        scale={[10, 3, 1]}
      />
    </Environment>
  );
}

/* ================================================================== */
/* Le reseau                                                           */
/* ================================================================== */

/**
 * Noeuds et liaisons, en rendu instancie.
 *
 * 19 noeuds et 78 liaisons, soit 97 objets : dessines un par un, ce serait
 * 97 appels de rendu par image. Deux `InstancedMesh` les ramenent a deux.
 * C'est ce qui permet de garder des liaisons en vraie geometrie — des
 * cylindres qui recoivent la lumiere et projettent une ombre — la ou
 * l'ancienne version utilisait des `lineSegments`, plates et insensibles a
 * l'eclairage.
 */
function Network({ finish, still }: { finish: Finish; still: boolean }) {
  const nodesRef = useRef<THREE.InstancedMesh>(null!);
  const edgesRef = useRef<THREE.InstancedMesh>(null!);
  const clock = useRef(0);

  const { nodes, edges } = useMemo(buildNetwork, []);

  // Les matrices de transformation ne changent jamais : on les calcule une
  // fois pour toutes. Seules les couleurs seront mises a jour par image.
  useEffect(() => {
    const matrix = new THREE.Matrix4();

    nodes.forEach((node, i) => {
      matrix.makeTranslation(node.position.x, node.position.y, node.position.z);
      nodesRef.current.setMatrixAt(i, matrix);
    });
    nodesRef.current.instanceMatrix.needsUpdate = true;

    // Chaque liaison est un cylindre unitaire (axe Y) qu'on oriente,
    // etire et deplace pour joindre deux noeuds.
    const up = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const midpoint = new THREE.Vector3();
    const scale = new THREE.Vector3();

    edges.forEach((edge, i) => {
      direction.subVectors(edge.to, edge.from);
      const length = direction.length();
      quaternion.setFromUnitVectors(up, direction.clone().normalize());
      midpoint.addVectors(edge.from, edge.to).multiplyScalar(0.5);
      // Le poids module l'epaisseur : les connexions fortes se voient.
      scale.set(edge.weight, length, edge.weight);
      matrix.compose(midpoint, quaternion, scale);
      edgesRef.current.setMatrixAt(i, matrix);
    });
    edgesRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes, edges]);

  // La propagation avant.
  //
  // Une onde traverse le reseau de la couche d'entree vers la sortie, puis
  // recommence apres une pause. Ce n'est pas un clignotement : l'activation
  // d'un element est une gaussienne centree sur le front d'onde, donc tout
  // s'allume et s'eteint progressivement.
  const color = useMemo(() => new THREE.Color(), []);
  const PERIOD = 9; // secondes pour un cycle complet, pause comprise
  const WIDTH = 0.85; // largeur du front, en couches

  useFrame((_, delta) => {
    if (!still) clock.current += delta;

    // Le front part avant la premiere couche et sort apres la derniere :
    // le reseau se vide completement entre deux passages.
    const progress = (clock.current % PERIOD) / PERIOD;
    const front = -1 + progress * (LAYERS.length + 1);

    const activation = (position: number) => {
      const d = (position - front) / WIDTH;
      return Math.exp(-d * d);
    };

    nodes.forEach((node, i) => {
      color.lerpColors(finish.nodeIdle, finish.nodeActive, activation(node.layer));
      nodesRef.current.setColorAt(i, color);
    });
    if (nodesRef.current.instanceColor) nodesRef.current.instanceColor.needsUpdate = true;

    edges.forEach((edge, i) => {
      // Les liaisons faibles s'allument moins : la propagation suit les
      // chemins de poids fort, comme dans un reseau reellement entraine.
      color.lerpColors(finish.edgeIdle, finish.edgeActive, activation(edge.depth) * edge.weight);
      edgesRef.current.setColorAt(i, color);
    });
    if (edgesRef.current.instanceColor) edgesRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, nodes.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[NODE_RADIUS, 28, 28]} />
        {/* Rugosite basse : les noeuds sont polis et attrapent nettement
            la boite a lumiere. C'est le reflet qui les rend spheriques a
            l'oeil — sans lui, ce sont des disques. */}
        <meshStandardMaterial metalness={1} roughness={0.16} envMapIntensity={1.3} />
      </instancedMesh>

      <instancedMesh ref={edgesRef} args={[undefined, undefined, edges.length]} castShadow>
        {/* 8 cotes : a cette epaisseur (7,5 mm a l'echelle de la scene),
            personne ne verra jamais la facettisation, et on economise
            les trois quarts des sommets. */}
        <cylinderGeometry args={[EDGE_RADIUS, EDGE_RADIUS, 1, 8]} />
        <meshStandardMaterial metalness={1} roughness={0.38} envMapIntensity={1} />
      </instancedMesh>
    </>
  );
}

/**
 * Le balancement et la parallaxe.
 *
 * Le reseau oscille lentement autour de la verticale (periode 24 s) et
 * s'incline vers le curseur, avec un amortissement fort. La camera ne
 * bouge jamais : c'est l'objet qui pivote. Deplacer la camera, comme le
 * faisait l'ancienne version, deforme la perspective et donne le mal de
 * mer.
 */
function Rig({
  children,
  strength,
  still,
}: {
  children: React.ReactNode;
  strength: number;
  still: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();
  const time = useRef(0);

  // Le reseau est presente de trois quarts : de face, c'est un schema plat
  // sans profondeur ; trop de biais, et les couches se recouvrent.
  const BASE_YAW = -0.34;

  useFrame((_, delta) => {
    if (!still) time.current += delta;

    const sway = Math.sin(time.current * 0.26) * 0.12;
    const targetYaw = BASE_YAW + sway + pointer.x * strength;
    const targetPitch = -pointer.y * strength * 0.6;

    group.current.rotation.y += (targetYaw - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetPitch - group.current.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}

/* ================================================================== */

export default function HeroObject() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const finish = useMemo(() => makeFinish(dark), [dark]);
  const quality = useSceneQuality();

  // Reserve d'espace pendant l'hydratation : sans elle, la mise en page
  // saute au montage du canvas.
  if (!quality.ready) {
    return <div className="h-[22rem] w-full sm:h-[26rem] lg:h-[32rem]" aria-hidden="true" />;
  }

  const still = quality.reducedMotion;

  return (
    <div
      className="h-[22rem] w-full sm:h-[26rem] lg:h-[32rem]"
      // Purement decoratif : la scene porte la meme information que le
      // titre a cote. La masquer evite qu'un lecteur d'ecran annonce un
      // canvas vide.
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={quality.dpr}
        camera={{ position: [0, 0.35, 6.6], fov: 34 }}
        gl={{
          antialias: !quality.lowPower,
          alpha: true,
          powerPreference: 'high-performance',
          // ACES compresse les hautes lumieres comme une pellicule : les
          // reflets du metal restent des reflets au lieu de saturer.
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: finish.exposure,
        }}
      >
        <Suspense fallback={null}>
          <Studio finish={finish} />

          {/* Une seule lumiere directe, la pour projeter l'ombre : tout
              l'eclairage visible vient de l'environnement. */}
          <directionalLight
            position={[-5, 6, 4]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={22}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-bias={-0.0005}
          />

          <Rig strength={still ? 0 : 0.16} still={still}>
            <Network finish={finish} still={still} />
          </Rig>

          {/* L'ombre de contact ancre le reseau au sol. Sans elle, un objet
              rendu flotte et sonne faux, quelle que soit la qualite des
              materiaux. */}
          <ContactShadows
            position={[0, -1.75, 0]}
            scale={11}
            blur={2.6}
            far={4}
            opacity={finish.shadowOpacity}
            color={finish.shadow}
            // Le reseau ne se deplace pas verticalement : son ombre au sol
            // n'a pas besoin d'etre recalculee a chaque image sur une
            // machine modeste.
            frames={quality.lowPower ? 1 : Infinity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
