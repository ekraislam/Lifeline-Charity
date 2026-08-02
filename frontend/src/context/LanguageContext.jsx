import React, { createContext, useState, useContext, useCallback } from 'react';
import en from '../i18n/en';
import bn from '../i18n/bn';

const translations = { en, bn };

export const LanguageContext = createContext();

/**
 * Resolve a dot-notation key like "nav.home" from a nested object.
 * Falls back to the key itself if not found.
 */
function resolve(obj, path) {
    return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => {
            const next = prev === 'en' ? 'bn' : 'en';
            localStorage.setItem('language', next);
            return next;
        });
    }, []);

    const switchLanguage = useCallback((lang) => {
        if (lang === 'en' || lang === 'bn') {
            localStorage.setItem('language', lang);
            setLanguage(lang);
        }
    }, []);

    /**
     * t('nav.home')            → 'Home' / 'হোম'
     * t('footer.copyright', { year: 2024 })  → interpolation support
     */
    const t = useCallback((key, vars = {}) => {
        const dict = translations[language] || translations.en;
        let value = resolve(dict, key);

        // Fallback to English
        if (value === undefined) {
            value = resolve(translations.en, key);
        }

        // Final fallback: return the key itself
        if (value === undefined) return key;

        // Simple variable interpolation: {year} → 2024
        if (typeof value === 'string' && Object.keys(vars).length) {
            return value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
        }

        return value;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage, switchLanguage, isBangla: language === 'bn' }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
};

export default LanguageContext;
