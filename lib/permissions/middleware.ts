// ============================================================================
// PERMISSIONS MIDDLEWARE - Layer de contrôle des permissions
// ============================================================================
// Contrôle l'accès aux modules, pages et actions
// ============================================================================

import React from 'react';
import { UserEntity, AppModule, PermissionAction } from '@/types';
import { Permissions } from '../permissions';

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionCheck {
  module: AppModule;
  action: PermissionAction;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Vérifie si un utilisateur peut accéder à un module
 */
export function canAccessModule(
  user: UserEntity | null,
  module: AppModule
): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Non connecté' };
  }

  if (user.status !== 'active') {
    return { allowed: false, reason: 'Compte inactif' };
  }

  const hasPermission = Permissions.can(user, module, 'view');
  
  if (!hasPermission) {
    return { allowed: false, reason: 'Permission refusée' };
  }

  return { allowed: true };
}

/**
 * Vérifie si un utilisateur peut effectuer une action
 */
export function canPerformAction(
  user: UserEntity | null,
  module: AppModule,
  action: PermissionAction
): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Non connecté' };
  }

  if (user.status !== 'active') {
    return { allowed: false, reason: 'Compte inactif' };
  }

  const hasPermission = Permissions.can(user, module, action);
  
  if (!hasPermission) {
    return { allowed: false, reason: `Action '${action}' non autorisée` };
  }

  return { allowed: true };
}

/**
 * Vérifie plusieurs permissions en même temps
 */
export function canPerformMultiple(
  user: UserEntity | null,
  checks: PermissionCheck[]
): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Non connecté' };
  }

  if (user.status !== 'active') {
    return { allowed: false, reason: 'Compte inactif' };
  }

  for (const check of checks) {
    const hasPermission = Permissions.can(user, check.module, check.action);
    if (!hasPermission) {
      return { 
        allowed: false, 
        reason: `Permission refusée: ${check.module}.${check.action}` 
      };
    }
  }

  return { allowed: true };
}

/**
 * Vérifie si un utilisateur est admin (super_admin ou admin)
 */
export function isAdmin(user: UserEntity | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Vérifie si un utilisateur est super admin
 */
export function isSuperAdmin(user: UserEntity | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * Filtre une liste d'items selon les permissions de l'utilisateur
 */
export function filterByPermission<T>(
  user: UserEntity | null,
  items: T[],
  getPermission: (item: T) => PermissionCheck
): T[] {
  if (!user) return [];
  
  return items.filter(item => {
    const check = getPermission(item);
    return Permissions.can(user, check.module, check.action);
  });
}

// ============================================================================
// GUARDS (Pour les composants React)
// ============================================================================

/**
 * HOC pour protéger un composant par permission
 * @deprecated Utiliser canPerformAction() directement dans les composants
 */
export function withPermission(
  module: AppModule,
  action: PermissionAction = 'view'
) {
  return function <P extends object>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    // Retourner le composant tel quel
    // La vérification des permissions doit être faite dans le composant avec useAuth
    return Component;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Génère un message d'erreur personnalisé selon le contexte
 */
export function getPermissionErrorMessage(
  module: AppModule,
  action: PermissionAction
): string {
  const messages: Record<string, string> = {
    'admin.view': 'Vous n\'avez pas accès à l\'administration',
    'admin.edit': 'Vous ne pouvez pas modifier les paramètres',
    'admin.delete': 'Vous ne pouvez pas supprimer cet élément',
    'studio.create': 'Vous ne pouvez pas créer de plans média',
    'studio.edit': 'Vous ne pouvez pas modifier ce plan média',
    'studio.delete': 'Vous ne pouvez pas supprimer ce plan média',
  };

  const key = `${module}.${action}`;
  return messages[key] || `Permission refusée: ${module}.${action}`;
}

/**
 * Log les tentatives d'accès non autorisées (pour audit)
 */
export function logUnauthorizedAccess(
  user: UserEntity | null,
  module: AppModule,
  action: PermissionAction,
  resource?: string
) {
  console.warn('[SECURITY] Unauthorized access attempt:', {
    user: user?.email || 'anonymous',
    role: user?.role || 'none',
    module,
    action,
    resource,
    timestamp: new Date().toISOString(),
  });
  
  // TODO: Enregistrer dans Firestore (activity_logs collection)
}
