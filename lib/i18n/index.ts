// ============================================================================
// i18n - Système de traduction
// ============================================================================

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { fr, Translations } from './locales/fr';
import { en } from './locales/en';

// ============================================================================
// TYPES
// ============================================================================

export type Locale = 'fr' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

// ============================================================================
// TRADUCTIONS
// ============================================================================

const translations: Record<Locale, any> = {
  fr,
  en,
};

// ============================================================================
// CONTEXT
// ============================================================================

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr'); // Français par défaut

  const value: I18nContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// ============================================================================
// HELPER
// ============================================================================

/**
 * Hook simplifié pour obtenir uniquement les traductions
 */
export function useTranslations() {
  const { t } = useI18n();
  return t;
}
