'use client';

import { useState, useEffect } from 'react';
import { db, authenticateUser, AGENCE_SETTINGS_COLLECTION, THEMES_COLLECTION } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AgenceSettings, Theme, defaultThemes } from '../types/agence';

interface AgenceDesignState {
  settings: AgenceSettings | null;
  themes: Theme[];
}

export function useAgenceDesign(): AgenceDesignState | null {
  const [design, setDesign] = useState<AgenceDesignState | null>(null);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        await authenticateUser();

        const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, 'main');
        const settingsSnap = await getDoc(settingsRef);
        const defaultSettings: AgenceSettings = {
          iconeDarkUrl: '',
          logoDarkUrl: '',
          iconeLightUrl: '',
          logoLightUrl: '',
          activeThemeId: 'dark-vibrant',
          commissionRate: 15,
          feesRate: 0,
        } as AgenceSettings;

        const settingsData = settingsSnap.exists()
          ? ({ ...defaultSettings, ...settingsSnap.data() } as AgenceSettings)
          : defaultSettings;

        const themesRef = doc(db, THEMES_COLLECTION, 'list');
        const themesSnap = await getDoc(themesRef);
        let themesList: Theme[] = defaultThemes;

        if (
          themesSnap.exists() &&
          themesSnap.data().availableThemes &&
          Array.isArray(themesSnap.data().availableThemes)
        ) {
          const fetchedThemes = themesSnap.data().availableThemes as Theme[];
          if (fetchedThemes.length > 0) themesList = fetchedThemes;
        }

        setDesign({ settings: settingsData, themes: themesList });
      } catch (err) {
        console.warn('Erreur chargement design, fallback.', err);
        setDesign({ settings: defaultThemes[0] as unknown as AgenceSettings, themes: defaultThemes });
      }
    };

    fetchDesign();
  }, []);

  return design;
}
