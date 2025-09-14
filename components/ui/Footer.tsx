'use client';

import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="glass-effect py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300">
              © {new Date().getFullYear()} Portfolio. Tous droits réservés.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <SocialLinks className="mb-4" />
            <p className="text-sm text-gray-500">Créé avec Next.js, Three.js et ❤️</p>
          </div>
        </div>
      </div>
    </footer>
  );
}