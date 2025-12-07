// ============================================================================
// BRANDING CONFIGURATION - Configuration visuelle centralisée
// ============================================================================
// 🎨 MODIFIER CE FICHIER POUR CHANGER L'APPARENCE DE TOUTE L'APP
// ============================================================================

/**
 * LOGOS
 * Chemins vers les fichiers logo (relatifs à /public ou URLs absolues)
 */
export const BRANDING_LOGOS = {
  // Logo principal (mode sombre)
  main: '/logos/logo-dark.svg',
  
  // Logo mode clair (optionnel)
  light: '/logos/logo-light.svg',
  
  // Icône seule (pour sidebar collapsed)
  icon: '/logos/icon.svg',
  
  // Favicon
  favicon: '/favicon.ico',
  
  // Fallback si pas de logo uploadé
  fallback: {
    text: 'AH',           // Texte à afficher
    showFullName: true    // Afficher "Agence Hub" à côté
  }
};

/**
 * COULEURS PAR MODULE
 * Palette de couleurs Tailwind pour chaque module
 */
export const BRANDING_COLORS = {
  // Module Admin
  admin: {
    primary: 'rose',      // Couleur principale
    secondary: 'pink',    // Couleur secondaire
    accent: 'rose',       // Couleur d'accent
    gradient: {
      from: 'rose-500',
      to: 'pink-600'
    }
  },
  
  // Module Média
  media: {
    primary: 'indigo',
    secondary: 'violet',
    accent: 'indigo',
    gradient: {
      from: 'indigo-500',
      to: 'violet-600'
    }
  },
  
  // Module Social (futur)
  social: {
    primary: 'purple',
    secondary: 'fuchsia',
    accent: 'purple',
    gradient: {
      from: 'purple-500',
      to: 'fuchsia-600'
    }
  },
  
  // Module Web (futur)
  web: {
    primary: 'cyan',
    secondary: 'blue',
    accent: 'cyan',
    gradient: {
      from: 'cyan-500',
      to: 'blue-600'
    }
  },
  
  // Module Projets (futur)
  projects: {
    primary: 'emerald',
    secondary: 'teal',
    accent: 'emerald',
    gradient: {
      from: 'emerald-500',
      to: 'teal-600'
    }
  }
};

/**
 * TYPOGRAPHIE
 * Configuration des polices
 */
export const BRANDING_FONTS = {
  // Police principale (corps de texte)
  sans: {
    name: 'Inter',
    fallback: 'system-ui, -apple-system, sans-serif',
    // URL Google Fonts (optionnel)
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  },
  
  // Police pour les titres (optionnel, sinon utilise sans)
  heading: {
    name: 'Inter',
    fallback: 'system-ui, -apple-system, sans-serif',
    weight: '700' // Bold par défaut pour les titres
  },
  
  // Police monospace (code, données)
  mono: {
    name: 'JetBrains Mono',
    fallback: 'Consolas, Monaco, monospace',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
  }
};

/**
 * INFORMATIONS AGENCE
 * Textes et métadonnées
 */
export const BRANDING_INFO = {
  // Nom de l'agence
  name: 'Agence Hub',
  
  // Slogan/tagline
  tagline: 'Votre partenaire digital',
  
  // Coordonnées
  contact: {
    email: 'contact@agencehub.com',
    phone: '+212 XXX XXX XXX',
    address: 'Casablanca, Maroc'
  },
  
  // Réseaux sociaux
  social: {
    linkedin: 'https://linkedin.com/company/agencehub',
    twitter: 'https://twitter.com/agencehub',
    instagram: 'https://instagram.com/agencehub'
  }
};

/**
 * THÈME GLOBAL
 * Paramètres visuels généraux
 */
export const BRANDING_THEME = {
  // Mode par défaut
  defaultMode: 'dark' as 'light' | 'dark',
  
  // Permettre le changement de mode
  allowModeToggle: true,
  
  // Rayon des bordures (border-radius)
  borderRadius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem'    // 24px
  },
  
  // Ombres
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
};

// ============================================================================
// HELPERS - Ne pas modifier (sauf si tu sais ce que tu fais)
// ============================================================================

/**
 * Obtenir la configuration de couleurs pour un module
 */
export function getModuleColors(module: keyof typeof BRANDING_COLORS) {
  return BRANDING_COLORS[module] || BRANDING_COLORS.media;
}

/**
 * Obtenir le logo selon le mode
 */
export function getLogo(mode: 'light' | 'dark' = 'dark'): string | null {
  if (mode === 'light' && BRANDING_LOGOS.light) {
    return BRANDING_LOGOS.light;
  }
  return BRANDING_LOGOS.main || null;
}

/**
 * Obtenir le texte de fallback du logo
 */
export function getLogoFallbackText(): string {
  return BRANDING_LOGOS.fallback.text;
}

/**
 * Vérifier si on affiche le nom complet à côté du logo
 */
export function shouldShowFullName(): boolean {
  return BRANDING_LOGOS.fallback.showFullName;
}

/**
 * Générer les classes CSS pour le gradient d'un module
 */
export function getGradientClasses(module: keyof typeof BRANDING_COLORS): string {
  const colors = getModuleColors(module);
  return `bg-gradient-to-br from-${colors.gradient.from} to-${colors.gradient.to}`;
}

/**
 * Obtenir la police principale
 */
export function getPrimaryFont(): string {
  return `${BRANDING_FONTS.sans.name}, ${BRANDING_FONTS.sans.fallback}`;
}

/**
 * Obtenir la police monospace
 */
export function getMonoFont(): string {
  return `${BRANDING_FONTS.mono.name}, ${BRANDING_FONTS.mono.fallback}`;
}
