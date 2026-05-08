import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationZHTW from '@/i18n/locales/zh-TW/translation.json';
import translationEN from '@/i18n/locales/en/translation.json';

export const resources = {
  'zh-TW': {
    translation: translationZHTW,
  },
  zh: {
    translation: translationZHTW,
  },
  en: {
    translation: translationEN,
  },
};

const initI18n = () => {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources,
      fallbackLng: 'zh-TW',
      debug: false,
      detection: {
        order: ['querystring', 'localStorage', 'htmlTag'],
        lookupQuerystring: 'lang',
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
    })
    .then();
};

export default initI18n;
