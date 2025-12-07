// ============================================================================
// TYPES UTILISATEURS & AUTHENTIFICATION
// ============================================================================

/**
 * Utilisateur de la plateforme
 */
export interface UserEntity {
  id: string; // Firebase Auth UID
  email: string;
  display_name: string;
  avatar_url?: string;
  phone?: string;
  
  // Rôle et permissions
  role: UserRole;
  custom_permissions?: PermissionOverride[]; // Overrides spécifiques
  
  // Rattachement organisationnel
  team_id?: string; // Équipe (si applicable)
  department?: 'media' | 'social' | 'web' | 'project' | 'admin';
  
  // Accès clients (pour limiter la visibilité)
  client_access: 'all' | 'assigned'; // Tous les clients ou seulement assignés
  assigned_client_ids?: string[]; // Si client_access = 'assigned'
  
  // Préférences
  preferences?: UserPreferences;
  
  // Métadonnées
  status: 'active' | 'inactive' | 'pending';
  last_login?: any; // Firestore Timestamp
  created_by?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Rôles disponibles dans la plateforme
 */
export type UserRole = 
  | 'super_admin'    // Accès total + configuration technique
  | 'admin'          // Admin agence (gestion users, settings)
  | 'manager'        // Chef de projet / Account Manager
  | 'media_buyer'    // Acheteur média (Studio)
  | 'social_manager' // Community Manager (Social)
  | 'web_analyst'    // Analyste web (Web Analytics)
  | 'project_lead'   // Chef de projet (Projet Manager)
  | 'analyst'        // Lecture seule + exports
  | 'client';        // Accès client externe (vue limitée)

/**
 * Définition d'un rôle avec ses permissions par défaut
 */
export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  color: string; // Pour l'UI (badge)
  icon: string; // Nom de l'icône Lucide
  
  // Permissions par module
  permissions: ModulePermissions;
  
  // Restrictions
  is_internal: boolean; // false = peut être assigné à des externes (clients)
  can_be_deleted: boolean; // false pour les rôles système
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'ar';
  notifications: {
    email: boolean;
    push: boolean;
    digest: 'daily' | 'weekly' | 'never';
  };
  default_module: 'studio' | 'social' | 'web' | 'projet' | 'admin';
  dashboard_layout?: any; // Configuration personnalisée du dashboard
}

/**
 * Override de permission spécifique à un utilisateur
 * Permet d'ajouter ou retirer des permissions au-delà du rôle
 */
export interface PermissionOverride {
  module: AppModule;
  action: PermissionAction;
  granted: boolean; // true = ajouté, false = retiré
  reason?: string; // Justification de l'override
  granted_by?: string; // User ID qui a accordé
  granted_at?: any;
}

// ============================================================================
// ÉQUIPES
// ============================================================================

/**
 * Équipe (regroupement d'utilisateurs)
 */
export interface TeamEntity {
  id: string;
  name: string;
  description?: string;
  
  // Membres
  lead_user_id?: string; // Chef d'équipe
  member_ids: string[];
  
  // Spécialisation
  specialization?: 'media' | 'social' | 'web' | 'project' | 'mixed';
  
  // Clients assignés à l'équipe
  assigned_client_ids?: string[];
  
  // Métadonnées
  color?: string;
  createdAt?: any;
  updatedAt?: any;
}

// ============================================================================
// SESSIONS & AUDIT
// ============================================================================

/**
 * Log d'activité utilisateur (audit trail)
 */
export interface UserActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  
  // Action
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'view';
  module: AppModule;
  resource_type?: string; // Ex: 'media_plan', 'insertion', 'client'
  resource_id?: string;
  
  // Détails
  description: string;
  metadata?: Record<string, any>; // Données additionnelles
  
  // Contexte
  ip_address?: string;
  user_agent?: string;
  
  timestamp: any;
}

// ============================================================================
// INVITATIONS
// ============================================================================

/**
 * Invitation à rejoindre la plateforme
 */
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  
  // Pré-configuration
  assigned_client_ids?: string[];
  team_id?: string;
  
  // Statut
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: any;
  
  // Tracking
  invited_by: string;
  invited_at: any;
  accepted_at?: any;
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

export type AppModule = 'studio' | 'social' | 'web' | 'projet' | 'admin' | 'global';

export type PermissionAction = 
  | 'view'      // Voir/lister
  | 'create'    // Créer
  | 'edit'      // Modifier
  | 'delete'    // Supprimer
  | 'export'    // Exporter données
  | 'approve'   // Valider/approuver
  | 'assign'    // Assigner à d'autres
  | 'admin';    // Administration du module

export type ModulePermissions = {
  [key in AppModule]?: PermissionAction[];
};

// ============================================================================
// CONSTANTES - DÉFINITIONS DES RÔLES PAR DÉFAUT
// ============================================================================

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Administrateur',
    description: 'Accès total à la plateforme, configuration technique incluse',
    color: 'red',
    icon: 'Shield',
    is_internal: true,
    can_be_deleted: false,
    permissions: {
      studio: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
      social: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
      web: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
      projet: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
      admin: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
      global: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign', 'admin'],
    }
  },
  {
    id: 'admin',
    name: 'Administrateur',
    description: 'Gestion de l\'agence, utilisateurs et paramètres',
    color: 'orange',
    icon: 'Settings',
    is_internal: true,
    can_be_deleted: false,
    permissions: {
      studio: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      social: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      web: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      projet: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      admin: ['view', 'create', 'edit', 'delete', 'assign'],
      global: ['view', 'export'],
    }
  },
  {
    id: 'manager',
    name: 'Account Manager',
    description: 'Gestion de projets et relation client',
    color: 'blue',
    icon: 'Briefcase',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'create', 'edit', 'export', 'approve'],
      social: ['view', 'create', 'edit', 'export', 'approve'],
      web: ['view', 'export'],
      projet: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      admin: ['view'],
      global: ['view', 'export'],
    }
  },
  {
    id: 'media_buyer',
    name: 'Acheteur Média',
    description: 'Création et gestion des plans média',
    color: 'pink',
    icon: 'TrendingUp',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'create', 'edit', 'export'],
      social: ['view'],
      web: ['view'],
      projet: ['view'],
      admin: [],
      global: ['view'],
    }
  },
  {
    id: 'social_manager',
    name: 'Community Manager',
    description: 'Gestion des réseaux sociaux',
    color: 'purple',
    icon: 'Users',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view'],
      social: ['view', 'create', 'edit', 'delete', 'export'],
      web: ['view'],
      projet: ['view'],
      admin: [],
      global: ['view'],
    }
  },
  {
    id: 'web_analyst',
    name: 'Analyste Web',
    description: 'Suivi et analyse des performances web',
    color: 'cyan',
    icon: 'BarChart3',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'export'],
      social: ['view', 'export'],
      web: ['view', 'create', 'edit', 'export'],
      projet: ['view'],
      admin: [],
      global: ['view', 'export'],
    }
  },
  {
    id: 'project_lead',
    name: 'Chef de Projet',
    description: 'Gestion des projets et coordination',
    color: 'emerald',
    icon: 'FolderKanban',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'export'],
      social: ['view', 'export'],
      web: ['view', 'export'],
      projet: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'],
      admin: [],
      global: ['view', 'export'],
    }
  },
  {
    id: 'analyst',
    name: 'Analyste',
    description: 'Consultation et export des données uniquement',
    color: 'slate',
    icon: 'Eye',
    is_internal: true,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'export'],
      social: ['view', 'export'],
      web: ['view', 'export'],
      projet: ['view', 'export'],
      admin: [],
      global: ['view', 'export'],
    }
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Accès client externe - vue limitée à ses projets',
    color: 'amber',
    icon: 'Building2',
    is_internal: false,
    can_be_deleted: true,
    permissions: {
      studio: ['view', 'export'],
      social: ['view'],
      web: ['view'],
      projet: ['view'],
      admin: [],
      global: ['view'],
    }
  },
];

/**
 * Helper: Obtenir la définition d'un rôle
 */
export const getRoleDefinition = (role: UserRole): RoleDefinition | undefined => {
  return DEFAULT_ROLES.find(r => r.id === role);
};

/**
 * Helper: Vérifier si un rôle a une permission
 */
export const roleHasPermission = (
  role: UserRole, 
  module: AppModule, 
  action: PermissionAction
): boolean => {
  const roleDef = getRoleDefinition(role);
  if (!roleDef) return false;
  return roleDef.permissions[module]?.includes(action) ?? false;
};
