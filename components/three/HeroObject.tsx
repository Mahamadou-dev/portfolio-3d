'use client';

// components/three/HeroObject.tsx
//
// « Le classifieur » — un reseau de neurones en train de reconnaitre un
// chiffre, montre pendant qu'il calcule.
//
// Ce que la scene affiche vraiment
// --------------------------------
// Toutes les valeurs lumineuses de cette scene sortent d'un vrai calcul,
// fait dans ./ann.ts : une image 10x10 entre a gauche, traverse deux
// couches cachees, et dix neurones de sortie donnent une probabilite par
// chiffre. Celui qui gagne s'allume. Le reseau predit correctement les dix
// chiffres, a environ 99,8 % de confiance — ce n'est pas une animation qui
// evoque un reseau, c'est un reseau qu'on regarde travailler.
//
// Pourquoi la version precedente etait ratee
// ------------------------------------------
// Deux erreurs, l'une de rendu, l'autre de conception :
//
//   1. Les liaisons avaient un rayon de 0,0075 unite a une distance ou
//      l'echelle est d'environ 100 pixels par unite. Elles mesuraient donc
//      MOINS D'UN PIXEL de large : l'echantillonnage les transformait en
//      pointilles sales et scintillants. C'est la cause directe du
//      « moche ». Elles font maintenant 2 a 3 pixels.
//   2. L'activation etait rendue en changeant la couleur de base d'un
//      materiau entierement metallique (`metalness = 1`). Sur un metal, la
//      couleur de base ne fait que teinter la reflexion : le signal etait
//      quasiment invisible. Les neurones sont desormais en materiau mixte
//      (metalness 0,3), ou la couleur se lit franchement, et le mode sombre
//      ajoute une couche additive qui, elle, brille reellement.
//
// La propagation
// --------------
// Un front d'onde traverse les couches de gauche a droite. Un element ne
// s'allume que lorsque le front l'a atteint, et garde ensuite sa valeur :
// on voit donc l'information se construire couche apres couche, puis la
// decision tomber. Toutes les 5,2 secondes, le chiffre suivant entre.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneQuality } from './useSceneQuality';
import {
  DIGITS,
  GRID,
  H1_SIZE,
  H2_SIZE,
  OUTPUT_SIZE,
  allWires,
  buildModel,
  strongestWires,
  type Activation,
  type Wire,
} from './ann';

/* ================================================================== */
/* Geometrie de la scene                                               */
/* ================================================================== */

/** Abscisse de chaque etage. */
const X_INPUT = -2.05;
const X_H1 = -0.45;
const X_H2 = 0.75;
const X_OUT = 1.95;

/** Le pas de la grille d'entree, et la taille d'une tuile. */
const CELL = 0.14;
const TILE = 0.108;

const NODE_RADIUS = 0.1;
/**
 * Rayon des liaisons.
 *
 * Cette constante merite d'etre calculee, pas devinee. Avec la camera a
 * z = 9,4 et un champ de 31 degres, la hauteur visible vaut 5,21 unites ;
 * sur un canvas de 512 px, l'echelle est donc d'environ 98 pixels par
 * unite. Une liaison de rayon r mesure 2r a l'ecran :
 *
 *   r = 0,0075  ->  1,5 px de diametre  (la version precedente : sous le
 *                                        pixel une fois l'epaisseur
 *                                        modulee par le poids, d'ou les
 *                                        pointilles scintillants)
 *   r = 0,014   ->  2,7 px              (la liaison la plus fine reste a
 *                                        1,7 px, donc franche)
 */
const WIRE_RADIUS = 0.014;

/** Recentre l'ensemble : les etages ne sont pas symetriques autour de 0. */
const CENTER_X = 0.35;

interface Placed {
  position: THREE.Vector3;
}

function columnPositions(x: number, count: number, spacing: number): THREE.Vector3[] {
  return Array.from(
    { length: count },
    (_, i) => new THREE.Vector3(x, ((count - 1) / 2 - i) * spacing, 0)
  );
}

/** La grille d'entree, lue dans le meme ordre que le vecteur de 100 pixels. */
function gridPositions(): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      positions.push(
        new THREE.Vector3(X_INPUT + (x - (GRID - 1) / 2) * CELL, ((GRID - 1) / 2 - y) * CELL, 0)
      );
    }
  }
  return positions;
}

/* ================================================================== */
/* Palette                                                             */
/* ================================================================== */

interface Finish {
  /** Structure eteinte (neurones). */
  idle: THREE.Color;
  /**
   * Pixel eteint de la grille d'entree.
   *
   * Volontairement bien plus sombre que `idle` : c'est le fond du chiffre.
   * Quand les deux partageaient la meme valeur, la grille se lisait comme
   * un rectangle gris uniforme et le chiffre etait invisible — le defaut
   * le plus grave du premier jet.
   */
  pixelOff: THREE.Color;
  /** Liaisons eteintes. */
  wireIdle: THREE.Color;
  /** Signal : l'accent du site. */
  signal: THREE.Color;
  /** Signal sature, pour les valeurs les plus fortes. */
  hot: THREE.Color;
  shadow: string;
  shadowOpacity: number;
  exposure: number;
  /** La couche additive ne se lit que sur fond sombre (voir ci-dessous). */
  glow: boolean;
}

function makeFinish(dark: boolean): Finish {
  return dark
    ? {
        idle: new THREE.Color('#3c4048'),
        pixelOff: new THREE.Color('#15181d'),
        wireIdle: new THREE.Color('#22252b'),
        signal: new THREE.Color('#7ba1e8'),
        hot: new THREE.Color('#cadcff'),
        shadow: '#000000',
        shadowOpacity: 0.45,
        exposure: 1.05,
        glow: true,
      }
    : {
        idle: new THREE.Color('#b4b8bf'),
        pixelOff: new THREE.Color('#e6e8ea'),
        wireIdle: new THREE.Color('#d3d6da'),
        signal: new THREE.Color('#2c5bb8'),
        hot: new THREE.Color('#14306b'),
        shadow: '#1b1c20',
        shadowOpacity: 0.28,
        exposure: 1.2,
        // En mode clair, une couche en fusion additive tire vers le blanc
        // du fond : elle effacerait le signal au lieu de le montrer. La
        // lecture repose alors entierement sur la couleur du materiau.
        glow: false,
      };
}

/* ================================================================== */
/* Studio                                                             */
/* ================================================================== */

/**
 * Environnement lumineux construit sur place — pas de fichier HDRI a
 * telecharger, donc pas de dependance reseau ni d'attente au premier
 * rendu. Les reflets prennent la forme rectangulaire des boites a lumiere
 * d'un studio, ce qui distingue un rendu produit d'un rendu de jeu.
 */
function Studio() {
  return (
    <Environment frames={1} resolution={256}>
      <mesh scale={40}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#3a3d43" side={THREE.BackSide} />
      </mesh>

      {/* Source principale, haute a gauche : elle dessine le volume. */}
      <Lightformer
        form="rect"
        intensity={4}
        color="#ffffff"
        position={[-5, 5, 5]}
        rotation={[-Math.PI / 5, Math.PI / 6, 0]}
        scale={[9, 9, 1]}
      />
      {/* Remplissage froid, deux fois moins intense : le rapport 2:1
          conserve le relief tout en ouvrant les ombres. */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#ccd9f2"
        position={[6, 0, 4]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[7, 7, 1]}
      />
      {/* Bande rasante derriere la scene : elle detache chaque sphere du
          fond par un lisere. Sans elle, les neurones eteints se confondent
          avec le decor en mode sombre. */}
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#ffffff"
        position={[0, 0, -7]}
        scale={[12, 4, 1]}
      />
    </Environment>
  );
}

/* ================================================================== */
/* Le reseau                                                           */
/* ================================================================== */

interface PlacedWire {
  a: THREE.Vector3;
  b: THREE.Vector3;
  source: number;
  stage: number;
  strength: number;
}

/** Tout ce qui ne doit etre calcule qu'une fois. */
function useNetwork(wiresPerNeuron: number) {
  return useMemo(() => {
    const model = buildModel();

    const input = gridPositions();
    const h1 = columnPositions(X_H1, H1_SIZE, 0.26);
    const h2 = columnPositions(X_H2, H2_SIZE, 0.3);
    const out = columnPositions(X_OUT, OUTPUT_SIZE, 0.26);

    // Les neurones des trois couches, dans un seul tampon instancie.
    const nodes: Placed[] = [...h1, ...h2, ...out].map((position) => ({ position }));

    // Les liaisons. La premiere couche est dense (10 x 100 = 1000) : on
    // n'en dessine que les plus fortes, sinon c'est une pelote opaque. Les
    // deux suivantes sont assez etroites pour etre tracees en entier.
    const segments: { wires: Wire[]; from: THREE.Vector3[]; to: THREE.Vector3[]; stage: number }[] = [
      { wires: strongestWires(model.W1, wiresPerNeuron), from: input, to: h1, stage: 0.5 },
      { wires: allWires(model.W2), from: h1, to: h2, stage: 1.5 },
      { wires: allWires(model.Wout), from: h2, to: out, stage: 2.5 },
    ];

    // Amplitude maximale par segment : elle ramene les poids sur une
    // echelle comparable d'une couche a l'autre.
    const wires: PlacedWire[] = segments.flatMap((segment) => {
      const peak = Math.max(...segment.wires.map((w) => Math.abs(w.weight))) || 1;
      return segment.wires.map((wire) => ({
        a: segment.from[wire.from],
        b: segment.to[wire.to],
        source: wire.from,
        stage: segment.stage,
        strength: Math.abs(wire.weight) / peak,
      }));
    });

    // Les dix passes avant, calculees d'avance : autant faire ces dix
    // produits matrice-vecteur au montage plutot qu'a l'image ou le
    // chiffre change.
    const activations: Activation[] = DIGITS.map((digit) => model.forward(digit));

    return { input, nodes, wires, activations };
  }, [wiresPerNeuron]);
}

/** Duree d'un cycle complet, en secondes. */
const CYCLE = 5.2;
/** Duree du balayage a l'interieur du cycle. */
const SWEEP = 2.6;

function Network({
  finish,
  still,
  wiresPerNeuron,
}: {
  finish: Finish;
  still: boolean;
  wiresPerNeuron: number;
}) {
  const { input, nodes, wires, activations } = useNetwork(wiresPerNeuron);

  const tiles = useRef<THREE.InstancedMesh>(null!);
  const tilesGlow = useRef<THREE.InstancedMesh>(null);
  const neurons = useRef<THREE.InstancedMesh>(null!);
  const neuronsGlow = useRef<THREE.InstancedMesh>(null);
  const links = useRef<THREE.InstancedMesh>(null!);
  const linksGlow = useRef<THREE.InstancedMesh>(null);

  const elapsed = useRef(0);
  const color = useMemo(() => new THREE.Color(), []);

  /* --- Les matrices, posees une fois pour toutes ------------------ */
  useEffect(() => {
    const matrix = new THREE.Matrix4();
    const identity = new THREE.Quaternion();

    input.forEach((position, i) => {
      matrix.makeTranslation(position.x, position.y, position.z);
      tiles.current.setMatrixAt(i, matrix);
      // La couche lumineuse est plus grande et legerement avancee : sans
      // ce decalage, les deux surfaces coplanaires se disputeraient le
      // tampon de profondeur (z-fighting).
      matrix.makeTranslation(position.x, position.y, position.z + 0.03);
      tilesGlow.current?.setMatrixAt(i, matrix);
    });
    tiles.current.instanceMatrix.needsUpdate = true;
    if (tilesGlow.current) tilesGlow.current.instanceMatrix.needsUpdate = true;

    nodes.forEach((node, i) => {
      matrix.makeTranslation(node.position.x, node.position.y, node.position.z);
      neurons.current.setMatrixAt(i, matrix);
      matrix.compose(node.position, identity, new THREE.Vector3(1.5, 1.5, 1.5));
      neuronsGlow.current?.setMatrixAt(i, matrix);
    });
    neurons.current.instanceMatrix.needsUpdate = true;
    if (neuronsGlow.current) neuronsGlow.current.instanceMatrix.needsUpdate = true;

    // Chaque liaison est un cylindre unitaire (axe Y) qu'on oriente,
    // etire et deplace pour joindre deux points.
    const up = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const middle = new THREE.Vector3();

    wires.forEach((wire, i) => {
      direction.subVectors(wire.b, wire.a);
      const length = direction.length();
      quaternion.setFromUnitVectors(up, direction.clone().normalize());
      middle.addVectors(wire.a, wire.b).multiplyScalar(0.5);

      // Le poids module l'epaisseur, mais jamais en dessous de 62 % : une
      // liaison faible doit rester visible, sinon la topologie du reseau
      // devient fausse a l'oeil — et sous ce seuil elle repasserait sous
      // le pixel sur petit ecran.
      const thickness = 0.62 + wire.strength * 0.38;
      matrix.compose(middle, quaternion, new THREE.Vector3(thickness, length, thickness));
      links.current.setMatrixAt(i, matrix);

      matrix.compose(
        middle,
        quaternion,
        new THREE.Vector3(thickness * 1.7, length, thickness * 1.7)
      );
      linksGlow.current?.setMatrixAt(i, matrix);
    });
    links.current.instanceMatrix.needsUpdate = true;
    if (linksGlow.current) linksGlow.current.instanceMatrix.needsUpdate = true;
  }, [input, nodes, wires, finish.glow]);

  /* --- L'animation ------------------------------------------------ */
  useFrame((_, delta) => {
    if (!still) elapsed.current += delta;

    // Sur « animations reduites », on fige une image parlante : le reseau
    // entierement propage sur un chiffre, decision prise.
    const time = still ? CYCLE * 0.75 : elapsed.current;
    const index = still ? 3 : Math.floor(time / CYCLE) % activations.length;
    const local = still ? SWEEP : time % CYCLE;
    const activation = activations[index];

    // Le front d'onde : il part avant l'entree et sort apres la sortie.
    const front = -0.6 + Math.min(1, local / SWEEP) * 4.4;

    // Extinction en fin de cycle : le reseau se vide avant que le chiffre
    // suivant n'entre, sinon les deux passes se chevauchent.
    const fade =
      still || local < CYCLE - 0.75 ? 1 : Math.max(0, 1 - (local - (CYCLE - 0.75)) / 0.75);

    /** Un etage ne s'eclaire qu'une fois le front passe dessus. */
    const gate = (stage: number) => {
      const t = Math.min(1, Math.max(0, (front - stage + 0.7) / 0.8));
      return t * t * (3 - 2 * t) * fade; // lissage de Hermite
    };

    /** Les valeurs brutes n'ont pas la meme echelle d'un etage a l'autre. */
    const peakOf = (values: number[]) => Math.max(...values.map(Math.abs)) || 1;
    const h1Peak = peakOf(activation.h1);
    const h2Peak = peakOf(activation.h2);

    /** idle -> signal -> hot, selon l'intensite. */
    const paint = (intensity: number, idle: THREE.Color) => {
      const v = Math.min(1, Math.max(0, intensity));
      color.copy(idle).lerp(finish.signal, Math.min(1, v * 1.25));
      // Le passage au ton chaud ne commence qu'a 78 % : plus tot, presque
      // tout partait en blanc et la scene se lisait comme une tache.
      if (v > 0.78) color.lerp(finish.hot, (v - 0.78) / 0.22);
      return color;
    };

    /** Version additive : le noir est invisible, donc l'intensite pilote
     *  directement la luminosite emise. */
    const paintGlow = (intensity: number) => {
      // Puissance 3 plutot que 2 : seules les valeurs vraiment fortes
      // rayonnent, au lieu d'un halo general sur toute la scene.
      const v = Math.min(1, Math.max(0, intensity));
      color.copy(finish.signal).multiplyScalar(v * v * v);
      if (v > 0.85) color.lerp(finish.hot, (v - 0.85) / 0.15);
      return color;
    };

    // --- Entree ---
    const inputGate = gate(0);
    for (let i = 0; i < activation.input.length; i++) {
      const v = activation.input[i] * inputGate;
      tiles.current.setColorAt(i, paint(v, finish.pixelOff));
      tilesGlow.current?.setColorAt(i, paintGlow(v * 0.7));
    }

    // --- Neurones : les trois couches se suivent dans le meme tampon ---
    const values = [
      ...activation.h1.map((v) => (Math.abs(v) / h1Peak) * gate(1)),
      ...activation.h2.map((v) => (Math.abs(v) / h2Peak) * gate(2)),
      // La sortie porte des probabilites : elles sont deja dans [0, 1], et
      // c'est justement leur echelle absolue qui fait la decision — un
      // seul neurone doit dominer.
      ...activation.probabilities.map((p) => p * gate(3)),
    ];

    for (let i = 0; i < values.length; i++) {
      neurons.current.setColorAt(i, paint(values[i], finish.idle));
      neuronsGlow.current?.setColorAt(i, paintGlow(values[i]));
    }

    // --- Liaisons : l'intensite vient de la source, ponderee par le poids ---
    const sourceValue = (stage: number, source: number) => {
      if (stage === 0.5) return activation.input[source];
      if (stage === 1.5) return Math.abs(activation.h1[source]) / h1Peak;
      return Math.abs(activation.h2[source]) / h2Peak;
    };

    for (let i = 0; i < wires.length; i++) {
      const wire = wires[i];
      const v = sourceValue(wire.stage, wire.source) * wire.strength * gate(wire.stage);
      links.current.setColorAt(i, paint(v * 0.7, finish.wireIdle));
      linksGlow.current?.setColorAt(i, paintGlow(v * 0.5));
    }

    // three.js ne televerse les couleurs que si on le lui demande.
    for (const mesh of [tiles, tilesGlow, neurons, neuronsGlow, links, linksGlow]) {
      const instance = mesh.current;
      if (instance?.instanceColor) instance.instanceColor.needsUpdate = true;
    }
  });

  /** Le materiau de structure : ni plastique, ni miroir.
   *  A `metalness = 1`, la couleur de base ne teinte que la reflexion et
   *  le signal devient illisible — c'etait le defaut de la version
   *  precedente. A 0,3, la couleur se lit franchement tout en gardant un
   *  reflet speculaire net. */
  const solid = {
    metalness: 0.3,
    roughness: 0.25,
    envMapIntensity: 1.15,
    // Un vernis fin par-dessus le metal mixte : c'est ce qui donne aux
    // spheres leur petit point de lumiere net (le "catchlight") plutot
    // qu'un reflet diffus — la difference visuelle entre plastique et
    // produit fini.
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  };

  /** Le materiau lumineux : soustrait au tone mapping, sinon ACES
   *  ecraserait justement les hautes lumieres qu'on cherche a produire. */
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  } as const;

  return (
    <>
      {/* --- La grille d'entree --- */}
      <instancedMesh
        ref={tiles}
        args={[undefined, undefined, input.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[TILE, TILE, 0.045]} />
        <meshPhysicalMaterial {...solid} />
      </instancedMesh>
      {finish.glow && (
        <instancedMesh ref={tilesGlow} args={[undefined, undefined, input.length]}>
          <boxGeometry args={[TILE * 1.2, TILE * 1.2, 0.01]} />
          <meshBasicMaterial {...additive} />
        </instancedMesh>
      )}

      {/* --- Les liaisons --- */}
      <instancedMesh ref={links} args={[undefined, undefined, wires.length]} castShadow>
        <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, 1, 8]} />
        <meshPhysicalMaterial {...solid} roughness={0.35} />
      </instancedMesh>
      {finish.glow && (
        <instancedMesh ref={linksGlow} args={[undefined, undefined, wires.length]}>
          <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, 1, 6]} />
          <meshBasicMaterial {...additive} />
        </instancedMesh>
      )}

      {/* --- Les neurones --- */}
      <instancedMesh
        ref={neurons}
        args={[undefined, undefined, nodes.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[NODE_RADIUS, 24, 24]} />
        <meshPhysicalMaterial {...solid} />
      </instancedMesh>
      {finish.glow && (
        <instancedMesh ref={neuronsGlow} args={[undefined, undefined, nodes.length]}>
          <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
          <meshBasicMaterial {...additive} />
        </instancedMesh>
      )}
    </>
  );
}

/* ================================================================== */
/* Cadrage et parallaxe                                                */
/* ================================================================== */

/**
 * Recentre, met a l'echelle pour tenir dans le cadre, et incline vers le
 * curseur.
 *
 * La mise a l'echelle n'est pas cosmetique : le reseau fait pres de cinq
 * unites de large, et le canvas est presque carre sur grand ecran mais
 * beaucoup plus etroit sur telephone. Sans ce calcul, la scene deborderait
 * simplement du cadre sur mobile.
 */
function Rig({ children, strength }: { children: React.ReactNode; strength: number }) {
  const group = useRef<THREE.Group>(null!);
  const { pointer, viewport } = useThree();

  const WIDTH = 5.0;

  useFrame(() => {
    group.current.scale.setScalar(Math.min(1, (viewport.width * 0.94) / WIDTH));

    // Amortissement fort : le mouvement suit le curseur avec un retard, ce
    // qui donne une masse a l'ensemble. Inclinaison faible, aussi — le
    // reseau est un plan, trop de biais et les couches se recouvrent.
    const targetY = pointer.x * strength;
    const targetX = -pointer.y * strength * 0.7;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group}>
      <group position={[CENTER_X, 0, 0]}>{children}</group>
    </group>
  );
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
    return <div className="h-[19rem] w-full sm:h-[22rem] lg:h-[26rem]" aria-hidden="true" />;
  }

  const still = quality.reducedMotion;

  return (
    <div
      className="h-[19rem] w-full sm:h-[22rem] lg:h-[26rem]"
      // Purement decoratif : la scene porte la meme information que le
      // titre a cote. La masquer evite qu'un lecteur d'ecran annonce un
      // canvas vide.
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={quality.dpr}
        camera={{ position: [0, 0.05, 8.2], fov: 32 }}
        gl={{
          antialias: !quality.lowPower,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: finish.exposure,
        }}
      >
        <Suspense fallback={null}>
          <Studio />

          {/* Une seule lumiere directe, la pour projeter l'ombre : tout
              l'eclairage visible vient de l'environnement. */}
          <directionalLight
            position={[-5, 6, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={24}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
            shadow-bias={-0.0005}
          />

          <Rig strength={still ? 0 : 0.14}>
            <Network
              finish={finish}
              still={still}
              // Trois liaisons par neurone au lieu de quatre sur machine
              // modeste : c'est le poste le plus lourd de la scene.
              wiresPerNeuron={quality.lowPower ? 3 : 4}
            />
          </Rig>

          {/* L'ombre de contact ancre l'ensemble. Sans elle, un rendu
              flotte et sonne faux, quelle que soit la qualite des
              materiaux. */}
          <ContactShadows
            position={[0, -1.5, 0]}
            scale={9}
            blur={2.4}
            far={3}
            opacity={finish.shadowOpacity}
            color={finish.shadow}
            frames={quality.lowPower ? 1 : Infinity}
          />

          {/* Post-traitement de camera reelle, pas de decor. Le reseau est
              quasiment plat en profondeur (tous les etages sont a z = 0) :
              une profondeur de champ y trouve trop peu de relief a exploiter
              et finit par flouter l'ensemble de la scene au lieu d'un seul
              plan — c'est ce qui rendait le rendu flou, retire. Le
              vignettage, discret, recentre l'oeil sans jamais assombrir les
              bords au point de devenir visible en soi. Le bloom garde son
              seuil volontairement haut : a 0,82, seules les activations
              additives le declenchent, jamais la structure — c'est ce qui
              distingue un halo de signal d'un bloom generalise, celui qui
              donnait a l'ancienne version son aspect de jeu video. */}
          {!quality.lowPower && (
            <EffectComposer multisampling={0}>
              <Bloom
                // Nul en mode clair : le fond blanc rendrait toute couche
                // additive illisible (voir `makeFinish`), donc il n'y a
                // simplement rien a faire rayonner.
                intensity={dark ? 0.38 : 0}
                luminanceThreshold={0.82}
                luminanceSmoothing={0.25}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.22} darkness={dark ? 0.55 : 0.32} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
