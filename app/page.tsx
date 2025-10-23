// src/app/page.tsx
'use client';
import { useState } from 'react';
import React from 'react'
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import ServicesSection from '../components/sections/ServicesSection';
export default function Home() {
      // ✨ AJOUT : État pour le sujet du formulaire de contact
  const [contactSubject, setContactSubject] = useState('');

  // ✨ AJOUT : Fonction pour gérer la sélection d'un plan
  const handlePlanSelect = (subject: string) => {
    setContactSubject(subject);
  };
  return (

    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ServicesSection onPlanSelect={handlePlanSelect} />
      <ContactSection initialSubject={contactSubject} />
    </>
  );
}