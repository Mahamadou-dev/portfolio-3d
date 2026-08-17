'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { useI18n } from "../i18n-provider";
import { currentAge } from "../../lib/profile";

// Types pour les données
interface PersonalInfo {
  label: string;
  value: string;
  icon: string;
}

export default function AboutSection() {
  const { t } = useI18n();

  const personalInfo: PersonalInfo[] = [
    {
      label: t("about.personalInfo.age.label"),
      // L'âge est calculé depuis l'année de naissance : plus rien à mettre à jour.
      value: t("about.personalInfo.age.value").replace('{age}', String(currentAge())),
      icon: "🎂",
    },
    { label: t("about.personalInfo.nationality.label"), value: t("about.personalInfo.nationality.value"), icon: "🇳🇪" },
    { label: t("about.personalInfo.location.label"), value: t("about.personalInfo.location.value"), icon: "📍" },
    { label: t("about.personalInfo.availability.label"), value: t("about.personalInfo.availability.value"), icon: "✅" }
  ];

  return (
    <section id="about" className="py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {t("about.title")}
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center"
          >
            {/*
              Le portrait, seul, dans une orbite calme.

              Il y avait ici un troisieme canvas WebGL (une sphere turquoise
              #0d9488 entouree des mots « React / Next.js / Three.js » en 3D).
              Trois raisons de l'avoir retire :
                - la couleur n'apparaissait nulle part ailleurs sur le site, ce
                  qui cassait la palette bleu/violet/cyan tenue par le hero ;
                - les noms de technologies faisaient doublon avec toute la
                  section Competences, juste en dessous ;
                - c'etait le 3e contexte WebGL de la page (fond + hero + celui-ci),
                  avec un autoRotate qui tournait en continu sans respecter
                  prefers-reduced-motion.
              Le decor est desormais en CSS : meme intention, cout nul, et le
              regard va au visage plutot qu'a une sphere qui tourne.
            */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Deux anneaux contrarotatifs, centres sur le portrait. */}
              <motion.div
                className="absolute inset-0 rounded-full border border-blue-400/25"
                animate={{ rotate: 360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />
              <motion.div
                className="absolute inset-6 rounded-full border border-violet-400/25"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />

              {/* Les jalons sur l'anneau exterieur. Places dans un conteneur
                  carre, ils decrivent enfin un vrai cercle : auparavant ils
                  etaient positionnes sur toute la colonne et se dispersaient. */}
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  style={{
                    left: `calc(50% + ${48 * Math.cos((i * Math.PI) / 4)}% - 5px)`,
                    top: `calc(50% + ${48 * Math.sin((i * Math.PI) / 4)}% - 5px)`,
                  }}
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.35 }}
                  aria-hidden="true"
                />
              ))}

              <div className="relative w-52 h-64 sm:w-56 sm:h-72 rounded-tr-[100px] rounded-bl-[100px] overflow-hidden p-[2px] bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 shadow-xl">
                <Image
                  src="/Me4.png"
                  alt="Portrait de Mahamadou Amadou Habou Gremah"
                  width={286}
                  height={364}
                  className="object-cover h-full w-full rounded-tr-[98px] rounded-bl-[98px]"
                  priority
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h3 
              className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {t("about.introduction")}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Mahamadou Amadou Habou 
              </span>
            </motion.h3>
            
            <motion.p 
              className="text-base text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <span className="font-medium">{t("about.a_young_student")}</span>{' '}
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("about.niger")}
              </span>{' '}
              {t("about.residing_in_tunisia_and_it_passionated")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {t("about.currently_studies")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              {t("about.also_the_founder_and_ceo_of")}
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                 {" "}<a href='https://gremah-tech.vercel.app'target='_blank'> GremahTech </a>
              </span>
              , {t("about.tiamtech_description")}
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              {t("about.anest_post")}
            </motion.p>

            <div className="grid grid-cols-2 gap-3 mb-4 pt-2">
              {personalInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-2 rounded-lg backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}  
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 text-lg">
                    <span>{info.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-600 dark:text-gray-400 leading-tight">{info.label}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium text-sm leading-tight">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex justify-center lg:justify-start pt-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              {/* C'etait un <a> imbrique dans un <button> : du HTML invalide,
                  que les navigateurs « reparent » en sortant le lien du bouton.
                  Resultat, la cible cliquable ne couvrait pas le bouton et le
                  CV etait inatteignable au clavier. Un seul element suffit. */}
              <motion.a
                href="https://flowcv.com/resume/a5spl1e2vu5a"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-medium rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-blue-600 to-violet-600 text-white inline-flex items-center justify-center text-sm font-kanit"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  {t("about.download_my_resume_button_text")}
                </span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-600 to-blue-600" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}