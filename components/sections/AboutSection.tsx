'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  // Données statiques en attendant l'intégration i18n
  const aboutData = {
    title: "About Me",
    subtitle: "Passionate Developer Creating Digital Solutions",
    description: "I'm a software engineering student with a passion for creating innovative web applications and immersive 3D experiences. I specialize in modern JavaScript frameworks and love exploring the intersection of design and technology.",
    info: {
      age: {
        label: "Age",
        value: "23"
      },
      location: {
        label: "Location",
        value: "Paris, France"
      },
      education: {
        label: "Education",
        value: "Software Engineering"
      },
      availability: {
        label: "Availability",
        value: "Open to opportunities"
      }
    },
    downloadCv: "Download CV"
  };

  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {aboutData.title}
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary/30 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl">
                JD
              </div>
            </div>
            <div className="absolute -inset-4 rounded-full border border-primary/20 animate-pulse"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-4">{aboutData.subtitle}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {aboutData.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(aboutData.info).map(([key, item]) => (
                <div key={key} className="glass-effect p-4 rounded-lg">
                  <h4 className="font-semibold text-primary">{item.label}</h4>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
            
            <button className="btn-primary">
              {aboutData.downloadCv}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}