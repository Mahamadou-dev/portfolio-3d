// src/components/SocialLinks.jsx
'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { FaXTwitter } from 'react-icons/fa6'; // Twitter a changé de nom pour X

const socialPlatforms = [
  {
    name: 'GitHub',
    url: 'https://github.com/Mahamadou-dev',
    icon: <FaGithub />, // Remplacement de '🐱'
    color: 'hover:text-gray-800 dark:hover:text-white'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mahamadou-amadou-habou-gremah-54766632b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    icon: <FaLinkedin />, // Remplacement de '💼'
    color: 'hover:text-blue-600'
  },
  {
    name: 'Twitter (X)',
    url: 'https://twitter.com',
    icon: <FaXTwitter />, // Remplacement de '🐦'
    color: 'hover:text-gray-800 dark:hover:text-white'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/mahamadou.amadouhabougremah.1?mibextid=ZbWKwL',
    icon: <FaFacebook />,
    color: 'hover:text-blue-600'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@amadouhabougremahmahamadou805?si=vMjXRoRKiekAz6Qc',
    icon: <FaYoutube />,
    color: 'hover:text-red-600'
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/22788778095?text=Bonjour,%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20services%20GremahTech.',
    icon: <FaWhatsapp />,
    color: 'hover:text-green-500'
  },
  {
    name: 'Email',
    url: 'mailto:mahamadou8877@gmail.com',
    icon: <AiOutlineMail />, // Remplacement de '✉️'
    color: 'hover:text-gray-600 dark:hover:text-gray-400'
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