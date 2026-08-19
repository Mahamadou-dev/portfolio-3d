'use client';

// components/ui/SocialLinks.tsx
//
// Les icones grossissaient de 20 % et montaient de 2 px au survol, avec
// une couleur de marque differente par plateforme (bleu LinkedIn, vert
// WhatsApp...). Six couleurs pour six liens de 24 px, dans un pied de page.
// Ici : une seule couleur, la teinte du texte secondaire, qui passe a
// l'encre pleine au survol. Le lien reste evidemment reconnaissable a sa
// forme — c'est a cela que servent ces logos.
import { FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { AiOutlineMail } from 'react-icons/ai';

const socialPlatforms = [
  { name: 'GitHub', url: 'https://github.com/Mahamadou-dev', Icon: FaGithub },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mahamadou-amadou-habou-gremah-54766632b',
    Icon: FaLinkedin,
  },
  { name: 'X', url: 'https://twitter.com', Icon: FaXTwitter },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/22788778095?text=Bonjour,%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20services%20GremahTech.',
    Icon: FaWhatsapp,
  },
  { name: 'Email', url: 'mailto:mahamadou8877@gmail.com', Icon: AiOutlineMail },
];

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-1 ${className}`}>
      {socialPlatforms.map(({ name, url, Icon }) => (
        <li key={name}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            // La cible fait 36 px avec son remplissage : en dessous de
            // 32 px, un lien devient difficile a atteindre au doigt.
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Icon size={17} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
