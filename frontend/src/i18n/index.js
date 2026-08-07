import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  ar: { translation: ar },
};

const applyDocumentAttributes = (lng) => {
  const currentLang = lng || 'en';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ta', 'hi', 'fr', 'de', 'es', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'angadix_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // react handles escaping
    },
    react: {
      useSuspense: false,
    },
  });

// Apply document lang and dir on initial load and whenever language changes
applyDocumentAttributes(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentAttributes(lng);
});

export default i18n;
