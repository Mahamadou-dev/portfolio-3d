'use client';

import { motion } from 'framer-motion';

const socialPlatforms = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    icon: '🐱',
    color: 'hover:text-gray-800 dark:hover:text-white'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    icon: '💼',
    color: 'hover:text-blue-600'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com',
    icon: '🐦',
    color: 'hover:text-blue-400'
  },
  {
    name: 'Dribbble',
    url: 'https://dribbble.com',
    icon: '🎨',
    color: 'hover:text-pink-500'
  },
  {
    name: 'Email',
    url: 'mailto:contact@example.com',
    icon: '✉️',
    color: 'hover:text-primary'
  }
];

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {socialPlatforms.map((platform, index) => (
        <motion.a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-2xl transition-colors duration-300 ${platform.color}`}
          aria-label={platform.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.2, y: -2 }}
        >
          {platform.icon}
        </motion.a>
      ))}
    </div>
  );
}