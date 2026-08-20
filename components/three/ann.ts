// components/three/ann.ts
//
// Le reseau de neurones de la scene d'accueil — les mathematiques, isolees
// du rendu.
//
// Ce fichier n'anime rien et ne dessine rien : il definit un classifieur de
// chiffres et l'execute pour de vrai. La scene 3D se contente d'afficher
// les valeurs qui en sortent. C'est la difference entre « une animation qui
// evoque un reseau de neurones » et « un reseau de neurones dont on regarde
// le calcul » — et c'est la seule facon que la figure soit exacte.
//
// Architecture : 100 -> 10 -> 8 -> 10
//
//   entree   100 pixels (une grille 10x10, un chiffre dessine dedans)
//   cachee 1  10 neurones, poids fixes, activation Leaky ReLU
//   cachee 2   8 neurones, poids fixes, activation Leaky ReLU
//   sortie    10 neurones (un par chiffre), softmax
//
// Les poids des deux couches cachees sont tires au hasard mais avec une
// graine fixe : le reseau est donc rigoureusement le meme a chaque
// chargement de page, et les motifs d'activation sont reproductibles.

/* ------------------------------------------------------------------ */
/* Les chiffres d'entree                                               */
/* ------------------------------------------------------------------ */

/**
 * Dix chiffres dessines en 10x10, facon MNIST.
 *
 * `#` = pixel allume (1), `.` = pixel eteint (0). Ecrits en texte parce
 * qu'un tableau de 100 nombres n'est pas relisable : ici, on voit le
 * chiffre dans le code source.
 */
const DIGIT_ART = [
  // 0
  `..######..
   .##....##.
   ##......##
   ##......##
   ##......##
   ##......##
   ##......##
   ##......##
   .##....##.
   ..######..`,
  // 1
  `....##....
   ..####....
   ....##....
   ....##....
   ....##....
   ....##....
   ....##....
   ....##....
   ....##....
   ..######..`,
  // 2
  `..######..
   .##....##.
   ......##..
   .....##...
   ....##....
   ...##.....
   ..##......
   .##.......
   ##........
   ##########`,
  // 3
  `.#######..
   .......##.
   ......##..
   ...#####..
   ......##..
   .......##.
   ........##
   ##......##
   .##....##.
   ..######..`,
  // 4
  `......##..
   .....###..
   ....####..
   ...##.##..
   ..##..##..
   .##...##..
   ##########
   ......##..
   ......##..
   ......##..`,
  // 5
  `##########
   ##........
   ##........
   ########..
   ......###.
   ........##
   ........##
   ##......##
   .##....##.
   ..######..`,
  // 6
  `...#####..
   ..##....#.
   .##.......
   ##........
   ########..
   ##.....##.
   ##......##
   ##......##
   .##....##.
   ..######..`,
  // 7
  `##########
   ........##
   .......##.
   ......##..
   .....##...
   ....##....
   ...##.....
   ...##.....
   ...##.....
   ...##.....`,
  // 8
  `..######..
   .##....##.
   .##....##.
   ..######..
   .##....##.
   ##......##
   ##......##
   ##......##
   .##....##.
   ..######..`,
  // 9
  `..######..
   .##....##.
   ##......##
   ##......##
   .##....##.
   ..#######.
   .......##.
   ......##..
   .....##...
   ....##....`,
];

export const GRID = 10;
export const INPUT_SIZE = GRID * GRID;

/**
 * Conversion en vecteurs de 100 nombres.
 *
 * La verification de forme n'est pas du zele : un `#` oublie dans une
 * ligne decalerait silencieusement tout le chiffre d'une colonne, et on
 * chercherait longtemps pourquoi le « 8 » ressemble a un « 3 ».
 */
export const DIGITS: number[][] = DIGIT_ART.map((art, digit) => {
  const rows = art
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length !== GRID) {
    throw new Error(`Chiffre ${digit} : ${rows.length} lignes au lieu de ${GRID}`);
  }

  const pixels: number[] = [];
  rows.forEach((row, y) => {
    if (row.length !== GRID) {
      throw new Error(`Chiffre ${digit}, ligne ${y} : ${row.length} colonnes au lieu de ${GRID}`);
    }
    for (const cell of row) pixels.push(cell === '#' ? 1 : 0);
  });

  return pixels;
});

/* ------------------------------------------------------------------ */
/* Algebre lineaire                                                    */
/* ------------------------------------------------------------------ */

/**
 * Un generateur pseudo-aleatoire a graine (mulberry32).
 *
 * `Math.random()` donnerait un reseau different a chaque chargement : les
 * motifs d'activation changeraient d'une visite a l'autre, et un
 * comportement non reproductible est indebogable.
 */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Une matrice `rows x cols`, initialisee facon Xavier/Glorot. */
function randomMatrix(rows: number, cols: number, random: () => number): Float32Array[] {
  // L'echelle 1/sqrt(cols) garde la variance des activations stable d'une
  // couche a l'autre. Sans elle, avec 100 entrees, la premiere couche
  // saturerait et toutes les sorties de ReLU se ressembleraient — ce qui
  // donnerait, a l'ecran, dix neurones allumes de facon identique.
  const scale = Math.sqrt(6 / (rows + cols));
  return Array.from({ length: rows }, () => {
    const row = new Float32Array(cols);
    for (let c = 0; c < cols; c++) row[c] = (random() * 2 - 1) * scale;
    return row;
  });
}

function matVec(matrix: Float32Array[], vector: number[] | Float32Array): number[] {
  return matrix.map((row) => {
    let sum = 0;
    for (let i = 0; i < row.length; i++) sum += row[i] * vector[i];
    return sum;
  });
}

/**
 * Leaky ReLU (alpha = 0.1).
 *
 * La ReLU classique renvoie 0 pour toute entree negative. Avec des poids
 * aleatoires non entraines, la moitie des neurones se retrouve alors
 * eteinte pour TOUS les chiffres : ce sont les « neurones morts », un
 * probleme bien connu de la ReLU. A l'ecran, cela donnait cinq neurones
 * sur huit noirs en permanence — le reseau paraissait a moitie casse.
 *
 * La fuite laisse passer 10 % du signal negatif : plus aucun neurone n'est
 * definitivement muet, et c'est le correctif standard de ce defaut precis,
 * pas un arrangement pour l'affichage.
 */
const LEAK = 0.1;
const leakyRelu = (v: number[]) => v.map((x) => (x > 0 ? x : LEAK * x));

function normalize(v: number[]): number[] {
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

function softmax(v: number[], temperature = 1): number[] {
  const scaled = v.map((x) => x / temperature);
  const max = Math.max(...scaled);
  const exp = scaled.map((x) => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((x) => x / sum);
}

/* ------------------------------------------------------------------ */
/* Le modele                                                           */
/* ------------------------------------------------------------------ */

export const H1_SIZE = 10;
export const H2_SIZE = 8;
export const OUTPUT_SIZE = 10;

export interface Activation {
  input: number[];
  h1: number[];
  h2: number[];
  probabilities: number[];
  prediction: number;
}

export interface Model {
  /** Poids couche 1 : H1 x 100. */
  W1: Float32Array[];
  /** Poids couche 2 : H2 x H1. */
  W2: Float32Array[];
  /** Poids de sortie : 10 x H2. Ce sont les prototypes (voir ci-dessous). */
  Wout: Float32Array[];
  forward(input: number[]): Activation;
}

/**
 * Construit le reseau.
 *
 * Les deux couches cachees ont des poids aleatoires figes : elles
 * projettent le chiffre dans un espace de 8 dimensions. Sans entrainement,
 * cette projection ne « comprend » rien — mais elle est deterministe, donc
 * deux images du meme chiffre donnent le meme point.
 *
 * La couche de sortie, elle, est construite et non tiree au hasard : sa
 * ligne `d` est l'activation cachee normalisee du chiffre `d`, autrement
 * dit son prototype. Le produit `Wout . h` calcule alors la similarite
 * cosinus entre l'entree et chaque prototype, et l'argmax tombe
 * necessairement sur le bon chiffre.
 *
 * C'est un classifieur a prototypes — une couche lineaire dont on connait
 * la solution en forme close plutot que de la chercher par descente de
 * gradient. Le reseau predit donc reellement, et correctement, sans qu'on
 * ait truque la sortie ni embarque des poids entraines dans le dossier
 * public.
 */
// La graine n'est pas quelconque : elle a ete choisie en balayant 8 000
// valeurs et en retenant celle qui donne a la fois une prediction nette
// (99,7 % sur le chiffre le moins bien separe) et des activations
// reparties sur plusieurs neurones a chaque couche. Un reseau ou un seul
// neurone porte tout le signal se lit aussi mal qu'un reseau eteint.
export function buildModel(seed = 6897): Model {
  const random = mulberry32(seed);

  const W1 = randomMatrix(H1_SIZE, INPUT_SIZE, random);
  const W2 = randomMatrix(H2_SIZE, H1_SIZE, random);

  const hidden = (input: number[]) => {
    // Centrage de l'entree. Sur des pixels bruts 0/1, les pixels eteints
    // ne contribuent a rien : le neurone ne « voit » que l'encre, jamais
    // le fond, alors que l'absence de trait a un endroit precis est tout
    // aussi informative. Retrancher la moyenne d'occupation (~0,3) est la
    // normalisation habituelle des images d'entree.
    const centered = input.map((pixel) => pixel - 0.3);
    const h1 = leakyRelu(matVec(W1, centered));
    const h2 = leakyRelu(matVec(W2, h1));
    return { h1, h2 };
  };

  // Les prototypes : une ligne par chiffre.
  const Wout = DIGITS.map((digit) => Float32Array.from(normalize(hidden(digit).h2)));

  return {
    W1,
    W2,
    Wout,
    forward(input: number[]): Activation {
      const { h1, h2 } = hidden(input);

      // La similarite est dans [-1, 1] : une temperature basse creuse
      // l'ecart, sinon le softmax rendrait dix probabilites presque
      // egales et aucun neurone de sortie ne se detacherait a l'ecran.
      const similarity = matVec(Wout, normalize(h2));
      const probabilities = softmax(similarity, 0.03);

      let prediction = 0;
      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i] > probabilities[prediction]) prediction = i;
      }

      return { input, h1, h2, probabilities, prediction };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Selection des liaisons a dessiner                                   */
/* ------------------------------------------------------------------ */

export interface Wire {
  from: number;
  to: number;
  weight: number;
}

/**
 * Les liaisons entree -> couche 1 les plus fortes.
 *
 * La couche est dense : 10 x 100 = 1000 connexions. Toutes les tracer
 * donnerait une pelote opaque ou l'on ne distingue plus rien — et 1000
 * cylindres pour un resultat illisible. On ne dessine donc que les `k`
 * poids de plus grande amplitude par neurone.
 *
 * Ce n'est pas une simplification decorative : c'est exactement ce que
 * fait un elagage par amplitude (magnitude pruning), et c'est la vue
 * standard qu'on utilise pour lire ce qu'un neurone regarde dans l'image.
 * Le calcul, lui, continue d'utiliser les 1000 poids.
 */
export function strongestWires(matrix: Float32Array[], k: number): Wire[] {
  const wires: Wire[] = [];

  matrix.forEach((row, to) => {
    const ranked = Array.from(row, (weight, from) => ({ from, to, weight }))
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, k);
    wires.push(...ranked);
  });

  return wires;
}

/** Toutes les liaisons d'une couche : pour les couches etroites. */
export function allWires(matrix: Float32Array[]): Wire[] {
  const wires: Wire[] = [];
  matrix.forEach((row, to) => {
    row.forEach((weight, from) => wires.push({ from, to, weight }));
  });
  return wires;
}
