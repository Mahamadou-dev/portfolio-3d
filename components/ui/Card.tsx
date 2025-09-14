'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function Card({ children, className = '', hoverEffect = true }: CardProps) {
  return (
    <motion.div
      className={`glass-effect rounded-xl p-6 ${hoverEffect ? 'hover:shadow-xl' : ''} ${className}`}
      whileHover={hoverEffect ? { y: -5 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}