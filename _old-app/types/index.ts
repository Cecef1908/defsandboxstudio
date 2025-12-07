/**
 * INDEX DES TYPES - Point d'entrée unique pour tous les types
 * 
 * Usage:
 * import { ClientEntity, MediaPlanEntity, calculateInsertionCost } from '@/app/types';
 */

// ============================================================================
// ENTITÉS CORE (CRM)
// ============================================================================

export type {
  ClientEntity,
  AdvertiserEntity,
  BrandEntity,
  ContactEntity,
} from './agence';

// ============================================================================
// RÉFÉRENTIELS MÉDIA (Media Library)
// ============================================================================

export type {
  ChannelCategoryEntity,
  BuyingModelEntity,
  BuyingUnitEntity,
  CampaignObjectiveEntity,
  PublisherEntity,
  MediaChannelEntity,
  MediaFormatEntity,
  MediaPlacementEntity,
} from './agence';

// ============================================================================
// DONNÉES OPÉRATIONNELLES (Plans Média)
// ============================================================================

export type {
  MediaPlanEntity,
  InsertionEntity,
  ContentEntity,
  RedirectLinkEntity,
  TargetingEntity,
  TargetingConfig,
} from './agence';

// ============================================================================
// AI-READY (Embeddings & Search)
// ============================================================================

export type {
  MediaPlanEmbeddingData,
  InsertionEmbeddingData,
  SemanticSearchQuery,
  SemanticSearchResult,
} from './agence';

// ============================================================================
// SYSTÈME & CONFIGURATION
// ============================================================================

export type {
  AgenceSettings,
  Theme,
} from './agence';

// ============================================================================
// HELPERS & FONCTIONS UTILITAIRES
// ============================================================================

export {
  generatePlanSearchableText,
  calculateInsertionCost,
  estimateInsertionKPIs,
  generateBusinessId,
} from './agence';

// ============================================================================
// DONNÉES DE SEED (pour référence)
// ============================================================================

export {
  clients,
  advertisers,
  contacts,
  defaultThemes,
} from './agence';

// ============================================================================
// TYPES FIREBASE (pour les opérations DB)
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
} from './firebase';
