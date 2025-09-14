'use client';

import { motion } from 'framer-motion';

const skills = [
  { name: 'React', level: 90, color: '#61DAFB' },
  { name: 'TypeScript', level: 85, color: '#3178C6' },
  { name: 'Node.js', level: 80, color: '#339933' },
  { name: 'Next.js', level: 85, color: '#000000' },
  { name: 'Three.js', level: 75, color: '#000000' },
  { name: 'Python', level: 70, color: '#3776AB' },
  { name: 'Tailwind', level: 90, color: '#06B6D4' },
  { name: 'MongoDB', level: 75, color: '#47A248' },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          My Skills
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{skill.name}</h3>
                <span>{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{ backgroundColor: skill.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {skills.map((skill) => (
            <div key={skill.name} className="skill-orb p-4 text-center" style={{ color: skill.color }}>
              <div className="text-4xl mb-2">⚙️</div>
              <div className="font-medium">{skill.name}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}