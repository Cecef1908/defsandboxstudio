'use client';

// ============================================================================
// USE AGENCE DESIGN - Hook pour charger les paramètres de l'agence
// Architecture: Hook réutilisable pour accéder au branding et thème
// ============================================================================

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, AGENCE_SETTINGS_COLLECTION, THEMES_COLLECTION } from '@/lib/firebase';

/**
 * Paramètres de l'agence (branding, logos, etc.)
 */
export interface AgenceSettings {
  // Logos
  iconeDarkUrl?: string;
  logoDarkUrl?: string;
  iconeLightUrl?: string;
  logoLightUrl?: string;
  
  // Thème actif
  activeThemeId: string;
  
  // Frais par défaut
  commissionRate: number;
  feesRate: number;
  
  // Autres paramètres
  agencyName?: string;
  agencyEmail?: string;
  agencyPhone?: string;
  agencyAddress?: string;
}

/**
 * Thème de design
 */
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * État du design de l'agence
 */
interface AgenceDesignState {
  settings: AgenceSettings | null;
  themes: Theme[];
  loading: boolean;
}

/**
 * Thèmes par défaut
 */
const defaultThemes: Theme[] = [
  {
    id: 'dark-vibrant',
    name: 'Dark Vibrant',
    colors: {
      primary: '#6366f1', // Indigo
      secondary: '#8b5cf6', // Violet
      accent: '#ec4899', // Pink
    }
  },
  {
    id: 'light-professional',
    name: 'Light Professional',
    colors: {
      primary: '#3b82f6', // Blue
      secondary: '#06b6d4', // Cyan
      accent: '#10b981', // Emerald
    }
  }
];

/**
 * Paramètres par défaut
 */
const defaultSettings: AgenceSettings = {
  iconeDarkUrl: '',
  logoDarkUrl: '',
  iconeLightUrl: '',
  logoLightUrl: '',
  activeThemeId: 'dark-vibrant',
  commissionRate: 15,
  feesRate: 0,
  agencyName: 'Agence Hub',
};

/**
 * Hook pour charger les paramètres de design de l'agence
 * @returns État du design (settings + themes)
 */
export function useAgenceDesign(): AgenceDesignState {
  const [design, setDesign] = useState<AgenceDesignState>({
    settings: null,
    themes: defaultThemes,
    loading: true,
  });

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        // Charger les paramètres
        const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, 'main');
        const settingsSnap = await getDoc(settingsRef);
        
        const settingsData = settingsSnap.exists()
          ? ({ ...defaultSettings, ...settingsSnap.data() } as AgenceSettings)
          : defaultSettings;

        // Charger les thèmes
        const themesRef = doc(db, THEMES_COLLECTION, 'list');
        const themesSnap = await getDoc(themesRef);
        let themesList: Theme[] = defaultThemes;

        if (
          themesSnap.exists() &&
          themesSnap.data().availableThemes &&
          Array.isArray(themesSnap.data().availableThemes)
        ) {
          const fetchedThemes = themesSnap.data().availableThemes as Theme[];
          if (fetchedThemes.length > 0) {
            themesList = fetchedThemes;
          }
        }

        setDesign({
          settings: settingsData,
          themes: themesList,
          loading: false,
        });
      } catch (err) {
        console.warn('[useAgenceDesign] Erreur chargement design, utilisation des valeurs par défaut', err);
        setDesign({
          settings: defaultSettings,
          themes: defaultThemes,
          loading: false,
        });
      }
    };

    fetchDesign();
  }, []);

  return design;
}

/**
 * Hook pour obtenir uniquement les paramètres (sans les thèmes)
 */
export function useAgenceSettings(): AgenceSettings | null {
  const { settings } = useAgenceDesign();
  return settings;
}

/**
 * Hook pour obtenir le logo actif
 */
export function useAgenceLogo(mode: 'light' | 'dark' = 'dark'): string | null {
  const { settings } = useAgenceDesign();
  
  if (!settings) return null;
  
  if (mode === 'light') {
    return settings.logoLightUrl || settings.logoDarkUrl || null;
  }
  
  return settings.logoDarkUrl || settings.logoLightUrl || null;
}
