'use client';

// components/three/useSceneQuality.ts
// Un seul endroit pour decider "a quel point on pousse la 3D" : appareil
// modeste, onglet en arriere-plan, ou utilisateur qui a demande moins
// d'animations. Toutes les scenes s'y referent.
import { useEffect, useState } from 'react';

export interface SceneQuality {
  /** L'utilisateur a active "reduire les animations" au niveau de l'OS. */
  reducedMotion: boolean;
  /** Machine peu puissante ou petit ecran : on allege. */
  lowPower: boolean;
  /** Plafond de device pixel ratio passe au renderer. */
  dpr: [number, number];
  /** Multiplicateur applique aux comptes de particules. */
  density: number;
  /** false tant que le composant n'est pas monte cote client. */
  ready: boolean;
}

export function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>({
    reducedMotion: false,
    lowPower: false,
    dpr: [1, 1.5],
    density: 1,
    ready: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as any).deviceMemory ?? 4;

    const compute = (): SceneQuality => {
      const reducedMotion = motionQuery.matches;
      const lowPower = coarse || cores <= 4 || memory <= 4 || window.innerWidth < 768;
      return {
        reducedMotion,
        lowPower,
        dpr: lowPower ? [1, 1.25] : [1, 1.75],
        density: reducedMotion ? 0.4 : lowPower ? 0.55 : 1,
        ready: true,
      };
    };

    setQuality(compute());
    const onChange = () => setQuality(compute());
    motionQuery.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      motionQuery.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return quality;
}
