'use client';

// components/sections/ContactSection.tsx
//
// Le formulaire de contact et les coordonnees.
//
// La logique d'envoi (Web3Forms) est inchangee. Ce qui change :
//   - Les quatre cartes de coordonnees avaient chacune une pastille en
//     degrade bleu-violet et glissaient de 5 px vers la droite au survol.
//     Une adresse e-mail n'a pas besoin de bouger pour etre lue. Elles
//     deviennent une liste : etiquette, valeur, et un lien quand la valeur
//     est actionnable.
//   - Le bouton d'envoi passait par cinq etats de degrade et se
//     redimensionnait au clic. Il est maintenant un aplat, avec le seul
//     etat qui compte : « envoi en cours », desactive.
//   - Les messages de succes et d'erreur etaient en vert et rouge vifs sur
//     fond sature. Ils prennent les couleurs d'etat du systeme, sourdes,
//     et portent `role="status"` — sans quoi un lecteur d'ecran n'annonce
//     jamais que le message est parti.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import SocialLinks from '../ui/SocialLinks';
import { useI18n } from '../i18n-provider';
import { Section, SectionHeader } from '../ui/Section';
import { reveal, revealAt, viewport } from '../../lib/motion';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: ContactFormData = { name: '', email: '', subject: '', message: '' };

export default function ContactSection() {
  const { t } = useI18n();

  const [formData, setFormData] = useState<ContactFormData>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactInfos = [
    {
      icon: Mail,
      label: t('contact.info.email.label'),
      value: t('contact.info.email.value'),
      href: t('contact.info.email.href'),
    },
    {
      icon: MapPin,
      label: t('contact.info.location.label'),
      value: t('contact.info.location.value'),
    },
    {
      icon: Phone,
      label: t('contact.info.phone1.label'),
      value: t('contact.info.phone1.value'),
      href: t('contact.info.phone1.href'),
    },
    {
      icon: Phone,
      label: t('contact.info.phone2.label'),
      value: t('contact.info.phone2.value'),
      href: t('contact.info.phone2.href'),
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const web3formsKey =
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'eeb71069-0faf-449d-b270-d950cf7d8da7';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          ...formData,
          from_name: 'Portfolio Contact',
          botcheck: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData(EMPTY);
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
    <Section id="contact">
      <SectionHeader
        index="05"
        eyebrow={t('contact.title')}
        title={t('contact.workTogether.title')}
        lead={t('contact.subtitle')}
      />

      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* ---------------------------------------------------------- */}
        {/* Coordonnees                                                */}
        {/* ---------------------------------------------------------- */}
        <div>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={reveal}
            className="text-[0.9375rem] leading-relaxed text-muted"
          >
            {t('contact.workTogether.description')}
          </motion.p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {contactInfos.map((info, i) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={`${info.label}-${info.value}`}
                  initial="hidden"
                  whileInView="show"
                  viewport={viewport}
                  variants={revealAt(i)}
                  className="flex items-baseline gap-4 py-3.5"
                >
                  <Icon
                    size={15}
                    className="translate-y-0.5 shrink-0 text-faint"
                    aria-hidden="true"
                  />
                  <dt className="w-24 shrink-0 text-sm text-muted">{info.label}</dt>
                  <dd className="min-w-0 flex-1 break-words text-sm font-medium text-ink">
                    {info.href ? (
                      <a
                        href={info.href}
                        className="underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        {info.value}
                      </a>
                    ) : (
                      info.value
                    )}
                  </dd>
                </motion.div>
              );
            })}
          </dl>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={reveal}
            className="mt-8"
          >
            <h3 className="eyebrow mb-3">{t('contact.followMe')}</h3>
            <SocialLinks />
          </motion.div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Formulaire                                                 */}
        {/* ---------------------------------------------------------- */}
        <motion.form
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={reveal}
          onSubmit={handleSubmit}
          className="card space-y-5 p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="eyebrow mb-2 block">
                {t('contact.form.name.label')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="field"
                placeholder={t('contact.form.name.placeholder')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="eyebrow mb-2 block">
                {t('contact.form.email.label')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="field"
                placeholder={t('contact.form.email.placeholder')}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="eyebrow mb-2 block">
              {t('contact.form.subject.label')}
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="field"
              placeholder={t('contact.form.subject.placeholder')}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="message" className="eyebrow mb-2 block">
              {t('contact.form.message.label')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="field resize-none"
              placeholder={t('contact.form.message.placeholder')}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* `role="status"` + `aria-live` : le retour d'envoi doit etre
              annonce. Sans cela, une personne qui navigue au lecteur
              d'ecran soumet le formulaire et n'apprend jamais s'il est
              parti. */}
          {submitStatus !== 'idle' && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-md border px-4 py-3 text-sm ${
                submitStatus === 'success'
                  ? 'border-ok/30 bg-ok-soft text-ok'
                  : 'border-danger/30 bg-danger-soft text-danger'
              }`}
            >
              {t(`contact.form.status.${submitStatus}`)}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <p className="max-w-xs text-xs leading-relaxed text-faint">
              {t('contact.form.privacy')}
            </p>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                t('contact.form.submitting')
              ) : (
                <>
                  <Send size={15} />
                  {t('contact.form.submit')}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </Section>
  );
}
