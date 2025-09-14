'use client';

import { motion } from 'framer-motion';

const projects = [
  {
    title: "3D E-Commerce Experience",
    description: "An immersive shopping experience with Three.js and React",
    technologies: ["React", "Three.js", "Node.js"],
    image: "/api/placeholder/300/200"
  },
  {
    title: "AI-Powered Dashboard",
    description: "Real-time analytics dashboard with machine learning insights",
    technologies: ["Next.js", "Python", "TensorFlow"],
    image: "/api/placeholder/300/200"
  },
  {
    title: "VR Portfolio Showcase",
    description: "Virtual reality portfolio experience for designers",
    technologies: ["WebXR", "A-Frame", "React"],
    image: "/api/placeholder/300/200"
  }
];

export default function ProjectsSection() {
  return (
    <section id="portfolio" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          My Projects
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg glass-effect"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-4xl">Project {index + 1}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <button className="btn-primary w-full">View Project</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}