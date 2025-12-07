// ============================================================================
// FIREBASE COLLECTIONS - Référentiel unique
// Architecture: Single source of truth pour les noms de collections
// ============================================================================

/**
 * SCHÉMA RELATIONNEL:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                           ENTITÉS ADMINISTRATIVES                           │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │                                                                             │
 * │   clients ◄──────────────┬──────────────────┬──────────────────┐           │
 * │   (client_id)            │                  │                  │           │
 * │                          ▼                  ▼                  ▼           │
 * │                    advertisers          brands            contacts         │
 * │                    (client_id)       (client_id)      (linked_client)      │
 * │                          │           (advertiser_id)  (linked_advertiser)  │
 * │                          │                  │         (linked_brand)       │
 * │                          └────────┬─────────┘                              │
 * │                                   │                                        │
 * │                          Cohérence: brand.client_id === advertiser.client_id│
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                           RÉFÉRENTIELS MÉDIA                                │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │                                                                             │
 * │   channels ◄─────────────┬──────────────────┐                              │
 * │   (id)                   │                  │                              │
 * │                          ▼                  ▼                              │
 * │                       formats          placements                          │
 * │                    (channelId)        (channel_id)                         │
 * │                                                                             │
 * │   buyingModels ◄─────── formats.compatible_buying_models                   │
 * │   publishers ◄───────── channels.publisher_id                              │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                           DONNÉES OPÉRATIONNELLES                           │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │                                                                             │
 * │   media-plans ◄──────────┬──────────────────┬──────────────────┐           │
 * │   (id)                   │                  │                  │           │
 * │   (client_id)            ▼                  ▼                  ▼           │
 * │                     insertions          contents         targetings        │
 * │                     (planRef)          (plan_id)         (plan_id)         │
 * │                          │             (insertion_id)    (insertion_id)    │
 * │                          │                                                 │
 * │                          ▼                                                 │
 * │                    redirect-links                                          │
 * │                    (plan_id)                                               │
 * │                    (insertion_id)                                          │
 * │                                                                             │
 * │   Priorité héritage: insertion > plan (pour redirect_url, targeting)       │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// ENTITÉS ADMINISTRATIVES (CORE)
// ============================================================================

/** Clients - Entités légales/facturables */
export const CLIENTS_COLLECTION = "clients";

/** Annonceurs - Projets/divisions rattachés à un client */
export const ADVERTISERS_COLLECTION = "advertisers";

/** Marques - Marques rattachées à un client (et optionnellement un annonceur) */
export const BRANDS_COLLECTION = "brands";

/** Contacts - Interlocuteurs CRM */
export const CONTACTS_COLLECTION = "contacts";

// ============================================================================
// RÉFÉRENTIELS MÉDIA (MEDIA LIBRARY)
// Note: Ces collections utilisent le préfixe "ref_" car elles sont seedées
// par le batch d'initialisation dans database-setup
// ============================================================================

/** Canaux - Facebook, Instagram, YouTube, etc. */
export const CHANNELS_COLLECTION = "ref_channels";

/** Formats - Post Carré, Story 9:16, Video In-Stream, etc. */
export const FORMATS_COLLECTION = "ref_formats";

/** Emplacements - Feed, Stories, Reels, etc. */
export const PLACEMENTS_COLLECTION = "ref_placements";

/** Modèles d'achat - CPM, CPC, CPV, Forfait, etc. */
export const BUYING_MODELS_COLLECTION = "ref_buying_models";

/** Éditeurs/Régies - Meta, Google, TikTok, etc. */
export const PUBLISHERS_COLLECTION = "ref_publishers";

/** Catégories de canaux - Social, Search, Display, Video, Audio */
export const CHANNEL_CATEGORIES_COLLECTION = "ref_channel_categories";

/** Objectifs de campagne - Awareness, Traffic, Conversion, etc. */
export const OBJECTIVES_COLLECTION = "ref_objectives";

/** Unités d'achat - Impressions, Clics, Vues, etc. */
export const BUYING_UNITS_COLLECTION = "ref_buying_units";

// ============================================================================
// DONNÉES OPÉRATIONNELLES (PLANS MÉDIA)
// ============================================================================

/** Plans Média - Document principal de planification */
export const MEDIA_PLANS_COLLECTION = "media-plans";

/** Insertions - Lignes d'achat média (liées à un plan via planRef) */
export const INSERTIONS_COLLECTION = "insertions";

/** Contenus - Créatifs liés à un plan ou une insertion */
export const CONTENTS_COLLECTION = "contents";

/** Liens de redirection - URLs avec tracking UTM */
export const REDIRECT_LINKS_COLLECTION = "redirect-links";

/** Ciblages - Configurations de targeting */
export const TARGETINGS_COLLECTION = "targetings";

// ============================================================================
// UTILISATEURS & PERMISSIONS
// ============================================================================

/** Utilisateurs - Profils et permissions */
export const USERS_COLLECTION = "users";

/** Équipes - Regroupement d'utilisateurs */
export const TEAMS_COLLECTION = "teams";

/** Invitations - Invitations en attente */
export const INVITATIONS_COLLECTION = "invitations";

/** Logs d'activité - Audit trail */
export const ACTIVITY_LOGS_COLLECTION = "activity_logs";

// ============================================================================
// SYSTÈME & CONFIGURATION
// ============================================================================

/** Paramètres agence - Logos, taux de commission, etc. */
export const AGENCE_SETTINGS_COLLECTION = "agenceSettings";

/** Thèmes - Thèmes de design personnalisés */
export const THEMES_COLLECTION = "themes";

/** Logos - Bibliothèque de logos */
export const LOGOS_COLLECTION = "logos";

/** Assets agence - Ressources partagées */
export const AGENCY_ASSETS_COLLECTION = "agency_assets";

// ============================================================================
// HELPERS - Fonctions utilitaires
// ============================================================================

/**
 * Obtenir toutes les collections définies
 * @description Utile pour les opérations de migration ou backup
 */
export function getAllCollections(): Record<string, string> {
  return {
    // Core
    CLIENTS_COLLECTION,
    ADVERTISERS_COLLECTION,
    BRANDS_COLLECTION,
    CONTACTS_COLLECTION,
    // Media Library
    CHANNELS_COLLECTION,
    FORMATS_COLLECTION,
    PLACEMENTS_COLLECTION,
    BUYING_MODELS_COLLECTION,
    PUBLISHERS_COLLECTION,
    CHANNEL_CATEGORIES_COLLECTION,
    OBJECTIVES_COLLECTION,
    BUYING_UNITS_COLLECTION,
    // Operational
    MEDIA_PLANS_COLLECTION,
    INSERTIONS_COLLECTION,
    CONTENTS_COLLECTION,
    REDIRECT_LINKS_COLLECTION,
    TARGETINGS_COLLECTION,
    // Users
    USERS_COLLECTION,
    TEAMS_COLLECTION,
    INVITATIONS_COLLECTION,
    ACTIVITY_LOGS_COLLECTION,
    // System
    AGENCE_SETTINGS_COLLECTION,
    THEMES_COLLECTION,
    LOGOS_COLLECTION,
    AGENCY_ASSETS_COLLECTION,
  };
}

/**
 * Vérifier si une collection est un référentiel (préfixe ref_)
 */
export function isReferenceCollection(collectionName: string): boolean {
  return collectionName.startsWith('ref_');
}

/**
 * Obtenir le nom de collection sans préfixe
 */
export function getCollectionBaseName(collectionName: string): string {
  return collectionName.replace(/^ref_/, '');
}
