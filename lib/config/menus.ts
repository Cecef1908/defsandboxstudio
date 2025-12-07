// ============================================================================
// MENU CONFIGURATION - Configuration centralisée des menus
// Architecture: Fichier de config séparé pour faciliter la maintenance
// ============================================================================

import { LucideIcon } from 'lucide-react';
import { AppModule, PermissionAction } from '@/types';

/**
 * Item de menu
 */
export interface MenuItem {
  label: string;
  href: string;
  icon: string; // Nom de l'icône Lucide (ex: 'LayoutDashboard')
  exact?: boolean; // true si le match doit être exact
  permission?: {
    module: AppModule;
    action: PermissionAction;
  };
}

/**
 * Séparateur de menu
 */
export interface MenuDivider {
  type: 'divider';
  label: string;
}

/**
 * Configuration de menu (items + dividers)
 */
export type MenuConfig = (MenuItem | MenuDivider)[];

// ============================================================================
// MENU ADMIN
// ============================================================================

export const ADMIN_MENU: MenuConfig = [
  {
    label: "Vue d'ensemble",
    href: "/admin",
    icon: "LayoutDashboard",
    exact: true,
    permission: { module: 'admin', action: 'view' }
  },
  
  // --- CRM & Données ---
  { type: 'divider', label: 'CRM & Données' },
  
  {
    label: "Clients",
    href: "/admin/clients",
    icon: "Users",
    permission: { module: 'admin', action: 'view' }
  },
  {
    label: "Annonceurs",
    href: "/admin/advertisers",
    icon: "Building2",
    permission: { module: 'admin', action: 'view' }
  },
  {
    label: "Marques",
    href: "/admin/brands",
    icon: "Tag",
    permission: { module: 'admin', action: 'view' }
  },
  {
    label: "Contacts",
    href: "/admin/contacts",
    icon: "UserCircle",
    permission: { module: 'admin', action: 'view' }
  },
  
  // --- Médias ---
  { type: 'divider', label: 'Médias' },
  
  {
    label: "Médiathèque",
    href: "/admin/media-library",
    icon: "Database",
    permission: { module: 'admin', action: 'view' }
  },
  
  // --- Système ---
  { type: 'divider', label: 'Système' },
  
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: "Users",
    permission: { module: 'admin', action: 'edit' }
  },
  {
    label: "Rôles & permissions",
    href: "/admin/roles",
    icon: "ShieldCheck",
    permission: { module: 'admin', action: 'admin' }
  },
  {
    label: "Configuration",
    href: "/admin/settings",
    icon: "Settings",
    permission: { module: 'admin', action: 'edit' }
  },
  {
    label: "Maintenance BDD",
    href: "/admin/database-setup",
    icon: "Database",
    permission: { module: 'admin', action: 'admin' }
  },
];

// ============================================================================
// MENU MEDIA (Studio Média)
// ============================================================================

export const MEDIA_MENU: MenuConfig = [
  {
    label: "Vue d'ensemble",
    href: "/media",
    icon: "LayoutDashboard",
    exact: true,
    permission: { module: 'studio', action: 'view' }
  },
  
  // --- Production ---
  { type: 'divider', label: 'Production' },
  
  {
    label: "Nouveau Plan",
    href: "/media/nouveau-plan",
    icon: "Plus",
    permission: { module: 'studio', action: 'create' }
  },
  {
    label: "Plan Média",
    href: "/media/plan-media",
    icon: "Layers",
    permission: { module: 'studio', action: 'view' }
  },
  {
    label: "AI Media Planner",
    href: "/media/ai-agent",
    icon: "Sparkles",
    permission: { module: 'studio', action: 'create' }
  },
  
  // --- Analyse ---
  { type: 'divider', label: 'Analyse' },
  
  {
    label: "Portefeuille",
    href: "/media/portefeuille",
    icon: "Briefcase",
    permission: { module: 'studio', action: 'view' }
  },
  {
    label: "Bilans",
    href: "/media/bilan",
    icon: "BarChart3",
    permission: { module: 'studio', action: 'view' }
  },
  {
    label: "Smart Import",
    href: "/media/smart-import",
    icon: "Upload",
    permission: { module: 'studio', action: 'create' }
  },
  
  // --- Outils ---
  { type: 'divider', label: 'Outils' },
  
  {
    label: "Paramètres",
    href: "/media/settings",
    icon: "Settings",
    permission: { module: 'studio', action: 'view' }
  },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtenir la configuration de menu selon le contexte
 */
export function getMenuConfig(context: 'admin' | 'media'): MenuConfig {
  return context === 'admin' ? ADMIN_MENU : MEDIA_MENU;
}

/**
 * Filtrer les items de menu selon les permissions de l'utilisateur
 */
export function filterMenuByPermissions(
  menu: MenuConfig,
  canAccess: (module: AppModule, action: PermissionAction) => boolean
): MenuConfig {
  return menu.filter(item => {
    // Les dividers sont toujours affichés
    if ('type' in item && item.type === 'divider') {
      return true;
    }
    
    // Vérifier les permissions
    const menuItem = item as MenuItem;
    if (menuItem.permission) {
      return canAccess(menuItem.permission.module, menuItem.permission.action);
    }
    
    // Pas de permission = visible par défaut
    return true;
  });
}
