'use client';

// components/ui/Section.tsx
//
// La coquille commune a toutes les sections de la page.
//
// Avant, chaque section reinventait son en-tete : un `py-12` ici, un
// `py-20` la, des titres tantot en `text-2xl` tantot en `text-4xl`, et six
// degrades de texte differents — dont un qui melangeait le bleu Google, le
// violet et le vert. Une page dont chaque chapitre a sa propre regle
// typographique ne se lit pas comme un document, mais comme un assemblage.
//
// Ici, un seul rythme vertical et un seul en-tete. La consequence est
// directe : la difference entre deux sections devient leur contenu, ce qui
// est exactement ce qu'un portfolio doit mettre en avant.
import { motion } from 'framer-motion';
import { reveal, viewport } from '../../lib/motion';

export function Section({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * L'en-tete d'une section : un oeil, un titre, une phrase.
 *
 * Le numero (`index`) est ce qui remplace les couleurs comme reperage.
 * Numeroter les chapitres est une convention d'edition, pas de decoration :
 * il indique une progression et donne au visiteur la mesure de ce qui
 * reste, ce qu'un titre en degrade ne fait pas.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  align = 'left',
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';

  return (
    <motion.header
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      className={`mb-12 md:mb-16 ${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}
    >
      {(index || eyebrow) && (
        <div
          className={`mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}
        >
          {index && <span className="eyebrow text-accent">{index}</span>}
          {index && eyebrow && <span className="h-px w-6 bg-line-strong" aria-hidden="true" />}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </div>
      )}

      <h2 className="text-[1.75rem] leading-tight sm:text-4xl">{title}</h2>

      {lead && (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-[1.0625rem]">{lead}</p>
      )}
    </motion.header>
  );
}
