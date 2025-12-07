// ============================================================================
// PERMISSIONS SYSTEM - Système de contrôle d'accès granulaire
// Architecture: RBAC (Role-Based Access Control) avec overrides personnalisés
// ============================================================================

import { UserEntity, AppModule, PermissionAction, userHasPermission } from '@/types';

// ============================================================================
// PERMISSION CHECKER
// ============================================================================

/**
 * Vérifier si un utilisateur peut effectuer une action sur un module
 * @param user - Utilisateur à vérifier
 * @param module - Module de l'application
 * @param action - Action à vérifier
 * @returns true si l'utilisateur a la permission
 */
export function can(
  user: UserEntity | null,
  module: AppModule,
  action: PermissionAction
): boolean {
  if (!user) return false;
  
  // Les utilisateurs inactifs n'ont aucune permission
  if (user.status === 'inactive') return false;
  
  // Les utilisateurs en attente ont un accès très limité
  if (user.status === 'pending' && action !== 'view') return false;
  
  return userHasPermission(user, module, action);
}

/**
 * Vérifier si un utilisateur peut effectuer TOUTES les actions listées
 * @param user - Utilisateur à vérifier
 * @param module - Module de l'application
 * @param actions - Liste d'actions à vérifier
 * @returns true si l'utilisateur a toutes les permissions
 */
export function canAll(
  user: UserEntity | null,
  module: AppModule,
  actions: PermissionAction[]
): boolean {
  return actions.every(action => can(user, module, action));
}

/**
 * Vérifier si un utilisateur peut effectuer AU MOINS UNE des actions listées
 * @param user - Utilisateur à vérifier
 * @param module - Module de l'application
 * @param actions - Liste d'actions à vérifier
 * @returns true si l'utilisateur a au moins une permission
 */
export function canAny(
  user: UserEntity | null,
  module: AppModule,
  actions: PermissionAction[]
): boolean {
  return actions.some(action => can(user, module, action));
}

// ============================================================================
// PERMISSION GUARDS - Vérifications spécifiques
// ============================================================================

/**
 * Vérifier si un utilisateur peut accéder à un client spécifique
 * @param user - Utilisateur à vérifier
 * @param clientId - ID du client
 * @returns true si l'utilisateur peut accéder au client
 */
export function canAccessClient(
  user: UserEntity | null,
  clientId: string
): boolean {
  if (!user) return false;
  
  // Super admin et admin ont accès à tous les clients
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Vérifier l'accès client
  if (user.client_access === 'all') return true;
  
  // Vérifier si le client est dans la liste assignée
  return user.assigned_client_ids?.includes(clientId) ?? false;
}

/**
 * Vérifier si un utilisateur peut gérer d'autres utilisateurs
 * @param user - Utilisateur à vérifier
 * @param targetUser - Utilisateur cible (optionnel)
 * @returns true si l'utilisateur peut gérer les utilisateurs
 */
export function canManageUsers(
  user: UserEntity | null,
  targetUser?: UserEntity
): boolean {
  if (!user) return false;
  
  // Seuls les admins peuvent gérer les utilisateurs
  if (!can(user, 'admin', 'edit')) return false;
  
  // Si pas d'utilisateur cible, vérifier juste la permission générale
  if (!targetUser) return true;
  
  // Super admin peut tout faire
  if (user.role === 'super_admin') return true;
  
  // Admin ne peut pas modifier un super_admin
  if (user.role === 'admin' && targetUser.role === 'super_admin') return false;
  
  // Admin ne peut pas se modifier lui-même (sécurité)
  if (user.id === targetUser.id) return false;
  
  return true;
}

/**
 * Vérifier si un utilisateur peut exporter des données
 * @param user - Utilisateur à vérifier
 * @param module - Module concerné
 * @returns true si l'utilisateur peut exporter
 */
export function canExport(
  user: UserEntity | null,
  module: AppModule
): boolean {
  return can(user, module, 'export');
}

/**
 * Vérifier si un utilisateur peut approuver des éléments
 * @param user - Utilisateur à vérifier
 * @param module - Module concerné
 * @returns true si l'utilisateur peut approuver
 */
export function canApprove(
  user: UserEntity | null,
  module: AppModule
): boolean {
  return can(user, module, 'approve');
}

/**
 * Vérifier si un utilisateur est admin du système
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur est admin
 */
export function isAdmin(user: UserEntity | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Vérifier si un utilisateur est super admin
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur est super admin
 */
export function isSuperAdmin(user: UserEntity | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

// ============================================================================
// PERMISSION FILTERS - Filtrage de données selon les permissions
// ============================================================================

/**
 * Filtrer une liste de clients selon les permissions de l'utilisateur
 * @param user - Utilisateur
 * @param clients - Liste de clients
 * @returns Liste filtrée
 */
export function filterAccessibleClients<T extends { id: string }>(
  user: UserEntity | null,
  clients: T[]
): T[] {
  if (!user) return [];
  
  // Admin voit tout
  if (isAdmin(user)) return clients;
  
  // Accès à tous les clients
  if (user.client_access === 'all') return clients;
  
  // Filtrer selon les clients assignés
  return clients.filter(client => 
    user.assigned_client_ids?.includes(client.id) ?? false
  );
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Obtenir la liste des modules accessibles pour un utilisateur
 * @param user - Utilisateur
 * @returns Liste des modules avec au moins une permission
 */
export function getAccessibleModules(user: UserEntity | null): AppModule[] {
  if (!user) return [];
  
  const modules: AppModule[] = ['studio', 'social', 'web', 'projet', 'admin', 'global'];
  
  return modules.filter(module => 
    can(user, module, 'view')
  );
}

/**
 * Obtenir les actions disponibles pour un utilisateur sur un module
 * @param user - Utilisateur
 * @param module - Module
 * @returns Liste des actions autorisées
 */
export function getAvailableActions(
  user: UserEntity | null,
  module: AppModule
): PermissionAction[] {
  if (!user) return [];
  
  const allActions: PermissionAction[] = [
    'view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'
  ];
  
  return allActions.filter(action => can(user, module, action));
}

/**
 * Générer un résumé des permissions d'un utilisateur
 * @param user - Utilisateur
 * @returns Objet avec les permissions par module
 */
export function getPermissionsSummary(user: UserEntity | null): Record<AppModule, PermissionAction[]> {
  const modules: AppModule[] = ['studio', 'social', 'web', 'projet', 'admin', 'global'];
  
  return modules.reduce((acc, module) => {
    acc[module] = getAvailableActions(user, module);
    return acc;
  }, {} as Record<AppModule, PermissionAction[]>);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Permissions = {
  can,
  canAll,
  canAny,
  canAccessClient,
  canManageUsers,
  canExport,
  canApprove,
  isAdmin,
  isSuperAdmin,
  filterAccessibleClients,
  getAccessibleModules,
  getAvailableActions,
  getPermissionsSummary,
};
