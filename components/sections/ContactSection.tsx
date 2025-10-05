'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import SocialLinks from '../ui/SocialLinks';
import { useI18n } from "../i18n-provider";

// Types TypeScript
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

export default function ContactSection() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = theme === 'dark';
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactInfos: ContactInfo[] = [
    {
      icon: <FaEnvelope className="text-lg" />,
      label: t("contact.info.email.label"),
      value: t("contact.info.email.value"),
      href: t("contact.info.email.href")
    },
    {
      icon: <FaMapMarkerAlt className="text-lg" />,
      label: t("contact.info.location.label"),
      value: t("contact.info.location.value")
    },
    {
      icon: <FaPhone className="text-lg" />,
      label: t("contact.info.phone1.label"),
      value: t("contact.info.phone1.value"),
      href: t("contact.info.phone1.href")
    },
    {
      icon: <FaPhone className="text-lg" />,
      label: t("contact.info.phone2.label"),
      value: t("contact.info.phone2.value"),
      href: t("contact.info.phone2.href")
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'eeb71069-0faf-449d-b270-d950cf7d8da7';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          from_name: 'Portfolio Contact',
          botcheck: false
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        console.error('Erreur Web3Forms:', result);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 px-4 relative min-h-[80vh] flex items-center">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-2 font-righteous"
            style={{ 
              background: 'linear-gradient(135deg, #4285f4 0%, #9c27b0 50%, #34a853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t("contact.title")}
          </motion.h2>
          
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-kanit"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("contact.subtitle")}
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Informations de contact */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 font-righteous">
                {t("contact.workTogether.title")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("contact.workTogether.description")}
              </p>
            </div>
            
            {/* Infos contact */}
            <div className="space-y-4">
              {contactInfos.map((info, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-darkElevation border-gray-700 hover:border-purple-500' 
                      : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mr-4`}>
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{info.label}</p>
                    {info.href ? (
                      <a 
                        href={info.href} 
                        className="text-gray-600 dark:text-gray-300 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Réseaux sociaux */}
            <div className="pt-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">
                {t("contact.followMe")}
              </h4>
              <SocialLinks />
            </div>
          </motion.div>
          
          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-darkElevation border-gray-700' : 'bg-white border-gray-200'
            } shadow-lg`}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t("contact.form.name.label")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder={t("contact.form.name.placeholder")}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t("contact.form.email.label")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder={t("contact.form.email.placeholder")}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("contact.form.subject.label")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder={t("contact.form.subject.placeholder")}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("contact.form.message.label")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm resize-none"
                  placeholder={t("contact.form.message.placeholder")}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Status message */}
              {submitStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm"
                >
                  {t("contact.form.status.success")}
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm"
                >
                  {t("contact.form.status.error")}
                </motion.div>
              )}
              
              <motion.button 
                type="submit" 
                className="w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-500 flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t("contact.form.submitting")}
                  </div>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2 text-sm" />
                    {t("contact.form.submit")}
                  </>
                )}
              </motion.button>

              {/* Note de confidentialité */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                {t("contact.form.privacy")}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}