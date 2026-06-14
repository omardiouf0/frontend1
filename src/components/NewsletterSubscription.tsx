/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../utils/translations';

interface NewsletterSubscriptionProps {
  currentLanguage: Language;
}

const localTranslations = {
  fr: {
    title: "Newsletter Scientifique UMMISCO",
    subtitle: "Abonnez-vous pour recevoir nos derniers articles, séminaires de modélisation et parutions de jeux de données.",
    placeholder: "Votre adresse email professionnelle...",
    button: "S'abonner",
    submitting: "S'abonnement...",
    successMsg: "Merci d'avoir rejoint notre liste ! Un e-mail de confirmation a été envoyé à {email}.",
    invalidEmail: "Veuillez entrer une adresse e-mail valide.",
    alreadySubscribed: "Cette adresse e-mail est déjà inscrite.",
    generalError: "Une erreur est survenue. Veuillez réessayer.",
    securityDisclaimer: "Vos données de recherche sont protégées. Désabonnement en un clic.",
    toastTitle: "Notification Système",
    toastBadge: "NEWSLETTER"
  },
  en: {
    title: "UMMISCO Scientific Newsletter",
    subtitle: "Subscribe to receive our latest papers, modeling seminars, and open dataset releases.",
    placeholder: "Your professional email address...",
    button: "Subscribe",
    submitting: "Subscribing...",
    successMsg: "Thank you for subscribing! A confirmation email has been sent to {email}.",
    invalidEmail: "Please enter a valid email address.",
    alreadySubscribed: "This email address is already subscribed.",
    generalError: "An error occurred. Please try again.",
    securityDisclaimer: "Your research data is protected. Unsubscribe with one click.",
    toastTitle: "System Notification",
    toastBadge: "NEWSLETTER"
  },
  ar: {
    title: "النشرة الإخبارية العلمية أوميسكو",
    subtitle: "اشترك لتلقي أحدث الأوراق البحثية، ندوات النمذجة، وإصدارات مجموعات البيانات المفتوحة.",
    placeholder: "بريدك الإلكتروني المهني...",
    button: "اشتراك",
    submitting: "جاري الاشتراك...",
    successMsg: "شكرًا للاشتراك! تم إرسال رسالة تأكيد إلى {email}.",
    invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    alreadySubscribed: "هذا البريد الإلكتروني مشترك بالفعل.",
    generalError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    securityDisclaimer: "بياناتك البحثية محمية. إلغاء الاشتراك بنقرة واحدة.",
    toastTitle: "إشعار النظام",
    toastBadge: "النشرة الإخبارية"
  }
};

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ currentLanguage }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const t = localTranslations[currentLanguage] || localTranslations.fr;
  const isRtl = currentLanguage === 'ar';

  // Simulating the Mock API Service Call
  const subscribeEmailToNewsletter = async (targetEmail: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple random simulated response checking for duplicate or simulation errors
        if (targetEmail.toLowerCase().includes('duplicate') || targetEmail.toLowerCase().includes('test@test')) {
          resolve({ success: false, message: t.alreadySubscribed });
        } else if (targetEmail.toLowerCase().includes('error')) {
          resolve({ success: false, message: t.generalError });
        } else {
          resolve({ success: true });
        }
      }, 1200);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Simple Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t.invalidEmail);
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const response = await subscribeEmailToNewsletter(email);
      
      if (response.success) {
        setStatus('success');
        setToastMessage(t.successMsg.replace('{email}', email));
        setShowToast(true);
        setEmail('');
        
        // Auto-dismiss toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setErrorMessage(response.message || t.generalError);
        setStatus('error');
      }
    } catch (err) {
      setErrorMessage(t.generalError);
      setStatus('error');
    }
  };

  return (
    <div className="relative py-4" id="newsletter-section">
      {/* Container Area */}
      <div className="bg-gradient-to-br from-[#0a3d62]/5 to-[#0091ff]/10 rounded-2xl border border-blue-100 shadow-sm overflow-hidden p-8 md:p-10 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -inset-10 bg-[radial-gradient(#c19d75_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Text content */}
          <div className={`space-y-3 text-center lg:text-left ${isRtl ? 'lg:text-right' : 'lg:text-left'} max-w-xl`}>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[11px] font-bold uppercase tracking-wider border border-brand-blue/20">
              <Mail size={12} />
              <span>Newsletter scientifique</span>
            </div>
            <h3 className="text-xl md:text-2xl font-display font-semibold text-[#0a3d62] tracking-tight">
              {t.title}
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full lg:max-w-md">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder={t.placeholder}
                    disabled={status === 'loading'}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all font-sans"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="sm:w-auto px-6 py-2.5 bg-[#c19d75] hover:bg-[#b08b64] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.button}</span>
                      <Send size={14} className={isRtl ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
              </div>

              {/* Status Warnings */}
              <AnimatePresence mode="wait">
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-rose-600 text-xs font-semibold pl-1"
                  >
                    <AlertCircle size={14} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-emerald-650 text-xs font-semibold pl-1"
                  >
                    <CheckCircle2 size={14} />
                    <span>✓ Inscrit avec succès !</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data security note */}
              <p className="text-[10px] text-slate-500 text-center sm:text-left">
                {t.securityDisclaimer}
              </p>
            </form>
          </div>

        </div>
      </div>

      {/* Floating Success Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-2xl max-w-sm flex flex-col gap-1`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                  {t.toastBadge}
                </span>
              </div>
              <button 
                onClick={() => setShowToast(false)} 
                className="text-slate-500 hover:text-slate-300 text-xs font-sans font-bold leading-none pl-2"
              >
                ✕
              </button>
            </div>
            <strong className="text-xs font-semibold font-display text-white mt-1">
              {t.toastTitle}
            </strong>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
