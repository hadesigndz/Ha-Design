import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Set Arabic ('ar') as the default starting language as requested
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

    const t = (path) => {
        const keys = path.split('.');

        const getValue = (obj, pathKeys) => {
            let current = obj;
            for (const key of pathKeys) {
                if (!current || current[key] === undefined) return undefined;
                current = current[key];
            }
            return current;
        };

        // Try current language
        const currentVal = getValue(translations[lang], keys);
        if (currentVal !== undefined) return currentVal;

        // Try English fallback
        const fallbackVal = getValue(translations['en'], keys);
        if (fallbackVal !== undefined) return fallbackVal;

        // Return path as last resort
        return path;
    };

    useEffect(() => {
        localStorage.setItem('lang', lang);
        const direction = translations[lang]?.dir || 'ltr';
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', lang);

        // Apply specialized fonts for Arabic
        if (lang === 'ar') {
            document.body.style.fontFamily = "'Cairo', sans-serif";
        } else {
            document.body.style.fontFamily = "'Outfit', sans-serif";
        }
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
