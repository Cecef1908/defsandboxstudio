// ============================================================================
// THEME CONFIGURATION - Système de thème centralisé
// Architecture: Configuration des couleurs, logos et styles par contexte
// ============================================================================

import { 
  BRANDING_LOGOS, 
  BRANDING_COLORS, 
  BRANDING_INFO,
  getModuleColors,
  getLogo,
  getLogoFallbackText,
  shouldShowFullName
} from './branding';

/**
 * Configuration de thème pour un contexte
 */
export interface ThemeConfig {
  // Couleurs
  primary: string;      // Couleur principale (ex: 'indigo', 'rose')
  secondary: string;    // Couleur secondaire (ex: 'violet', 'pink')
  accent: string;       // Couleur d'accent pour les highlights
  
  // Gradient (pour les logos et boutons)
  gradient: {
    from: string;
    to: string;
  };
  
  // Logo
  logo?: {
    light?: string;     // URL du logo en mode clair
    dark?: string;      // URL du logo en mode sombre
    icon?: string;      // URL de l'icône seule
    fallback: string;   // Texte de fallback si pas de logo
    showFullName: boolean; // Afficher le nom complet
  };
  
  // Métadonnées
  label: string;        // Label du contexte (ex: 'Admin', 'Media')
  description?: string; // Description optionnelle
}

// ============================================================================
// THÈMES PAR DÉFAUT (générés depuis branding.ts)
// ============================================================================

/**
 * Thème Admin
 */
export const ADMIN_THEME: ThemeConfig = {
  ...getModuleColors('admin'),
  logo: {
    light: BRANDING_LOGOS.light || undefined,
    dark: BRANDING_LOGOS.main || undefined,
    icon: BRANDING_LOGOS.icon || undefined,
    fallback: getLogoFallbackText(),
    showFullName: shouldShowFullName(),
  },
  label: 'Admin',
  description: 'Interface d\'administration',
};

/**
 * Thème Media (ex-Studio)
 */
export const MEDIA_THEME: ThemeConfig = {
  ...getModuleColors('media'),
  logo: {
    light: BRANDING_LOGOS.light || undefined,
    dark: BRANDING_LOGOS.main || undefined,
    icon: BRANDING_LOGOS.icon || undefined,
    fallback: getLogoFallbackText(),
    showFullName: shouldShowFullName(),
  },
  label: 'Studio Média',
  description: 'Planification et gestion média',
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtenir la configuration de thème selon le contexte
 */
export function getThemeConfig(context: 'admin' | 'media'): ThemeConfig {
  return context === 'admin' ? ADMIN_THEME : MEDIA_THEME;
}

/**
 * Générer les classes Tailwind pour un gradient
 */
export function getGradientClasses(theme: ThemeConfig): string {
  return `bg-gradient-to-br from-${theme.gradient.from} to-${theme.gradient.to}`;
}

/**
 * Générer les classes Tailwind pour la couleur primaire
 */
export function getPrimaryColorClasses(theme: ThemeConfig, variant: 'bg' | 'text' | 'border' = 'bg'): string {
  const intensity = variant === 'bg' ? '500' : '400';
  return `${variant}-${theme.primary}-${intensity}`;
}

/**
 * Obtenir le logo à afficher (avec fallback)
 */
export function getLogoUrl(theme: ThemeConfig, mode: 'light' | 'dark' = 'dark'): string | null {
  if (!theme.logo) return null;
  return mode === 'light' ? theme.logo.light || null : theme.logo.dark || null;
}

/**
 * Obtenir le texte de fallback du logo
 */
export function getLogoFallback(theme: ThemeConfig): string {
  return theme.logo?.fallback || theme.label.charAt(0).toUpperCase();
}

// ============================================================================
// TYPES EXPORTS
// ============================================================================

export type ThemeContext = 'admin' | 'media' | 'social' | 'web' | 'projects';
