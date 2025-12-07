// ============================================================================
// SYSTÈME DE PERMISSIONS
// Gestion centralisée des accès et autorisations
// ============================================================================

import { 
  UserEntity, 
  UserRole, 
  AppModule, 
  PermissionAction,
  getRoleDefinition,
  roleHasPermission,
  PermissionOverride
} from '../types/users';

// ============================================================================
// VÉRIFICATION DES PERMISSIONS
// ============================================================================

/**
 * Vérifie si un utilisateur a une permission spécifique
 * Prend en compte le rôle ET les overrides personnalisés
 */
export const hasPermission = (
  user: UserEntity | null,
  module: AppModule,
  action: PermissionAction
): boolean => {
  if (!user) return false;
  
  // Super admin a toujours accès
  if (user.role === 'super_admin') return true;
  
  // Vérifier les overrides personnalisés d'abord
  if (user.custom_permissions) {
    const override = user.custom_permissions.find(
      p => p.module === module && p.action === action
    );
    if (override) return override.granted;
  }
  
  // Sinon, vérifier les permissions du rôle
  return roleHasPermission(user.role, module, action);
};

/**
 * Vérifie si un utilisateur peut accéder à un module
 */
export const canAccessModule = (
  user: UserEntity | null,
  module: AppModule
): boolean => {
  return hasPermission(user, module, 'view');
};

/**
 * Vérifie si un utilisateur peut voir un client spécifique
 */
export const canAccessClient = (
  user: UserEntity | null,
  clientId: string
): boolean => {
  if (!user) return false;
  
  // Super admin et admin voient tout
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Si accès à tous les clients
  if (user.client_access === 'all') return true;
  
  // Sinon vérifier les clients assignés
  return user.assigned_client_ids?.includes(clientId) ?? false;
};

/**
 * Obtient la liste des modules accessibles pour un utilisateur
 */
export const getAccessibleModules = (user: UserEntity | null): AppModule[] => {
  if (!user) return [];
  
  const modules: AppModule[] = ['studio', 'social', 'web', 'projet', 'admin'];
  return modules.filter(module => canAccessModule(user, module));
};

/**
 * Obtient toutes les permissions d'un utilisateur pour un module
 */
export const getModulePermissions = (
  user: UserEntity | null,
  module: AppModule
): PermissionAction[] => {
  if (!user) return [];
  
  const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'];
  return actions.filter(action => hasPermission(user, module, action));
};

// ============================================================================
// HELPERS POUR L'UI
// ============================================================================

/**
 * Génère un objet de permissions pour l'UI
 * Utile pour les composants qui ont besoin de connaître plusieurs permissions
 */
export const getUIPermissions = (user: UserEntity | null, module: AppModule) => ({
  canView: hasPermission(user, module, 'view'),
  canCreate: hasPermission(user, module, 'create'),
  canEdit: hasPermission(user, module, 'edit'),
  canDelete: hasPermission(user, module, 'delete'),
  canExport: hasPermission(user, module, 'export'),
  canApprove: hasPermission(user, module, 'approve'),
  canAssign: hasPermission(user, module, 'assign'),
  canAdmin: hasPermission(user, module, 'admin'),
});

/**
 * Vérifie si un utilisateur peut gérer un autre utilisateur
 * (modifier son rôle, le désactiver, etc.)
 */
export const canManageUser = (
  currentUser: UserEntity | null,
  targetUser: UserEntity
): boolean => {
  if (!currentUser) return false;
  
  // On ne peut pas se gérer soi-même (sauf préférences)
  if (currentUser.id === targetUser.id) return false;
  
  // Super admin peut tout faire
  if (currentUser.role === 'super_admin') return true;
  
  // Admin peut gérer tout le monde sauf super_admin
  if (currentUser.role === 'admin' && targetUser.role !== 'super_admin') return true;
  
  // Manager peut gérer son équipe (si implémenté)
  // TODO: Implémenter la logique d'équipe
  
  return false;
};

/**
 * Vérifie si un utilisateur peut assigner un rôle spécifique
 */
export const canAssignRole = (
  currentUser: UserEntity | null,
  roleToAssign: UserRole
): boolean => {
  if (!currentUser) return false;
  
  // Hiérarchie des rôles (du plus élevé au plus bas)
  const roleHierarchy: UserRole[] = [
    'super_admin',
    'admin',
    'manager',
    'project_lead',
    'media_buyer',
    'social_manager',
    'web_analyst',
    'analyst',
    'client'
  ];
  
  const currentRoleIndex = roleHierarchy.indexOf(currentUser.role);
  const targetRoleIndex = roleHierarchy.indexOf(roleToAssign);
  
  // On ne peut assigner que des rôles inférieurs au sien
  // Exception: super_admin peut tout assigner
  if (currentUser.role === 'super_admin') return true;
  
  return currentRoleIndex < targetRoleIndex;
};

// ============================================================================
// FILTRAGE DES DONNÉES
// ============================================================================

/**
 * Filtre une liste de clients selon les accès de l'utilisateur
 */
export const filterClientsByAccess = <T extends { id: string }>(
  user: UserEntity | null,
  clients: T[]
): T[] => {
  if (!user) return [];
  
  if (user.client_access === 'all' || user.role === 'super_admin' || user.role === 'admin') {
    return clients;
  }
  
  return clients.filter(client => 
    user.assigned_client_ids?.includes(client.id) ?? false
  );
};

/**
 * Filtre une liste de plans média selon les accès client de l'utilisateur
 */
export const filterPlansByClientAccess = <T extends { client_id: string }>(
  user: UserEntity | null,
  plans: T[]
): T[] => {
  if (!user) return [];
  
  if (user.client_access === 'all' || user.role === 'super_admin' || user.role === 'admin') {
    return plans;
  }
  
  return plans.filter(plan => 
    user.assigned_client_ids?.includes(plan.client_id) ?? false
  );
};

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

/**
 * Crée un log d'activité (à sauvegarder en base)
 */
export const createActivityLog = (
  user: UserEntity,
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'view',
  module: AppModule,
  description: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
) => ({
  id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  user_id: user.id,
  user_email: user.email,
  action,
  module,
  resource_type: resourceType,
  resource_id: resourceId,
  description,
  metadata,
  timestamp: new Date(),
});

// ============================================================================
// PROTECTION DES ROUTES (pour middleware)
// ============================================================================

/**
 * Configuration de protection des routes
 */
export const ROUTE_PROTECTION: Record<string, { module: AppModule; action: PermissionAction }> = {
  // Studio
  '/studio': { module: 'studio', action: 'view' },
  '/studio/nouveau-plan': { module: 'studio', action: 'create' },
  '/studio/plan-media': { module: 'studio', action: 'view' },
  '/studio/portefeuille': { module: 'studio', action: 'view' },
  '/studio/smart-import': { module: 'studio', action: 'create' },
  
  // Social (futur)
  '/social': { module: 'social', action: 'view' },
  '/social/calendrier': { module: 'social', action: 'view' },
  '/social/publications': { module: 'social', action: 'create' },
  
  // Web (futur)
  '/web': { module: 'web', action: 'view' },
  '/web/analytics': { module: 'web', action: 'view' },
  
  // Projet (futur)
  '/projet': { module: 'projet', action: 'view' },
  '/projet/taches': { module: 'projet', action: 'view' },
  
  // Admin
  '/admin': { module: 'admin', action: 'view' },
  '/admin/clients': { module: 'admin', action: 'view' },
  '/admin/contacts': { module: 'admin', action: 'view' },
  '/admin/users': { module: 'admin', action: 'view' },
  '/admin/roles': { module: 'admin', action: 'admin' },
  '/admin/settings': { module: 'admin', action: 'edit' },
  '/admin/database-setup': { module: 'admin', action: 'admin' },
};

/**
 * Vérifie si un utilisateur peut accéder à une route
 */
export const canAccessRoute = (
  user: UserEntity | null,
  pathname: string
): boolean => {
  // Trouver la route la plus spécifique qui match
  const matchingRoutes = Object.keys(ROUTE_PROTECTION)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length); // Plus spécifique d'abord
  
  if (matchingRoutes.length === 0) return true; // Route non protégée
  
  const protection = ROUTE_PROTECTION[matchingRoutes[0]];
  return hasPermission(user, protection.module, protection.action);
};

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

export default {
  hasPermission,
  canAccessModule,
  canAccessClient,
  getAccessibleModules,
  getModulePermissions,
  getUIPermissions,
  canManageUser,
  canAssignRole,
  filterClientsByAccess,
  filterPlansByClientAccess,
  createActivityLog,
  canAccessRoute,
  ROUTE_PROTECTION,
};
