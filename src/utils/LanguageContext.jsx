/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { translations } from '../constants/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const cached = localStorage.getItem('aps_lang');
    return cached === 'en' || cached === 'vi' ? cached : 'vi';
  });

  const changeLang = (newLang) => {
    if (newLang === 'en' || newLang === 'vi') {
      setLang(newLang);
      localStorage.setItem('aps_lang', newLang);
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if Vietnamese key is missing
        let enFallback = translations.en;
        for (const enKey of keys) {
          if (enFallback && typeof enFallback === 'object' && enKey in enFallback) {
            enFallback = enFallback[enKey];
          } else {
            enFallback = null;
            break;
          }
        }
        return enFallback || path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
