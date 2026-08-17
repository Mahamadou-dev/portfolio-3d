// src/app/page.tsx
'use client';

import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';

// La section Services (grille tarifaire a l'heure, plans Basique/Standard/
// Premium) a ete retiree : elle repositionnait en prestataire a la tache un
// portfolio qui, partout ailleurs, presente un ingenieur logiciel oriente IA.
// L'offre commerciale vit sur le site de GremahTech, a qui elle appartient.
// Consequence directe : plus de sujet pre-rempli venant d'un plan choisi, donc
// plus d'etat a faire transiter entre les sections.
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}
