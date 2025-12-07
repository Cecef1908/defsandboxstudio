// ============================================================================
// INDEX DES TYPES - Point d'entrée unique
// Architecture: Barrel export pour une importation simplifiée
// ============================================================================

/**
 * Usage:
 * import { UserEntity, MediaPlanEntity, userHasPermission } from '@/types';
 */

// ============================================================================
// USERS & PERMISSIONS
// ============================================================================

export type {
  UserEntity,
  UserRole,
  RoleDefinition,
  UserPreferences,
  PermissionOverride,
  TeamEntity,
  UserActivityLog,
  UserInvitation,
  AppModule,
  PermissionAction,
  ModulePermissions,
} from './users';

export {
  DEFAULT_ROLES,
  getRoleDefinition,
  roleHasPermission,
  userHasPermission,
  getUserPermissions,
} from './users';

// ============================================================================
// FIREBASE & DATA STRUCTURES
// ============================================================================

export type {
  FirebaseTimestamp,
  MediaPlanFirebase,
  InsertionFirebase,
  AnnonceurFirebase,
  MarqueFirebase,
  FormatFirebase,
  CanalFirebase,
  BuyingModelFirebase,
  MediaPlanEnriched,
  MediaPlanEditData,
  InsertionEditData,
  NewInsertionData,
} from './firebase';

export {
  timestampToDate,
  dateToTimestamp,
  calculateCoutEstime,
  formatFirebaseDate,
  isFirebaseDatePast,
  getFirebaseDateDiffInDays,
} from './firebase';

// ============================================================================
// AGENCE (CRM, MEDIA PLANS, RÉFÉRENTIELS)
// ============================================================================

export * from './agence';
