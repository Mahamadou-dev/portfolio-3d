'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import SocialLinks from './SocialLinks';
import { useI18n } from "../i18n-provider";

// Types TypeScript
interface FooterLink {
  label: string;
  href: string;
  icon?: string;
}

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';
  const currentYear = new Date().getFullYear();

  const footerLinks: FooterLink[] = [
    { label: t("footer.legal.legalNotice"), href: "/mentions-legales" },
    { label: t("footer.legal.privacy"), href: "/politique-confidentialite" },
    { label: t("footer.legal.downloadCV"), href: "/cv", icon: "📄" },
  ];

  return (
    <motion.footer 
      className={`py-8 ${
        isDarkMode 
          ? 'bg-dark border-gray-800' 
          : 'bg-light border-gray-200'
      }`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        {/* Contenu principal */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
          {/* Copyright */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-righteous">
              Mahamadou Gremah
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("footer.copyright").replace('{{year}}', String(currentYear))}
            </p>
          </motion.div>

          {/* Built with */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("footer.builtWith")} <span className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-righteous"><a rel='noopener' href="https://gremah-tech.vercel.app" target='_blank'> GremahTech </a></span> 
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div 
            className="text-center lg:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("footer.connectWith")}
            </p>
            <SocialLinks />
          </motion.div>
        </div>

        {/* Separator */}
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-4"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />

        {/* Footer links */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {footerLinks.map((link, index) => (
              <motion.a 
                key={link.href}
                href={link.href} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {link.icon && <span className="mr-1">{link.icon}</span>}
                {link.label}
              </motion.a>
            ))}
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-xs">
              {t("footer.lastUpdate").replace('{{date}}', new Date().toLocaleDateString())}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}