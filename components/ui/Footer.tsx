'use client';

// components/ui/Footer.tsx
//
// Le pied de page.
//
// Il portait deux fois le nom « Mahamadou Gremah » / « GremahTech » en
// degrade bleu-violet, cinq revelations au defilement decalees, et un
// separateur qui se depliait horizontalement a l'entree. Un pied de page
// est la zone la moins lue d'un site : lui donner cinq animations est un
// mauvais placement d'attention.
//
// Ici : trois colonnes, un filet, une ligne de mentions. Aucune animation
// hormis la revelation d'ensemble.
import { motion } from 'framer-motion';
import SocialLinks from './SocialLinks';
import { useI18n } from '../i18n-provider';
import { reveal, viewport } from '../../lib/motion';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: t('footer.legal.legalNotice'), href: '/mentions-legales' },
    { label: t('footer.legal.privacy'), href: '/politique-confidentialite' },
    { label: t('footer.legal.downloadCV'), href: '/cv' },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      className="border-t border-line bg-surface-sunk px-5 py-14 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-base font-semibold text-ink">Mahamadou Gremah</p>
            <p className="mt-2 text-sm text-muted">
              {t('footer.copyright').replace('{{year}}', String(currentYear))}
            </p>
          </div>

          <div>
            <h2 className="eyebrow mb-3">{t('footer.connectWith')}</h2>
            <SocialLinks />
          </div>

          <div>
            <h2 className="eyebrow mb-3">{t('footer.builtWith')}</h2>
            <a
              href="https://gremah-tech.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-ink underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
            >
              GremahTech
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="eyebrow text-faint">
            {t('footer.lastUpdate').replace('{{date}}', new Date().toLocaleDateString())}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
