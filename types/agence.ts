// ============================================================================
// TYPES MÉTIER - AGENCE
// ============================================================================
// ⚠️ MAPPING EXACT avec l'ancienne DB - NE PAS MODIFIER LES NOMS DE CHAMPS
// ============================================================================

// ============================================================================
// FRAIS D'AGENCE
// ============================================================================

/**
 * Configuration des frais d'agence
 * Cascade: Client (défaut) → Plan Média (override) → Insertion (override)
 */
export interface AgencyFeesConfig {
    commission_rate: number;              // Commission agence (%) ex: 15
    management_fee_type: "percent" | "flat";
    management_fee_value: number;         // Valeur frais de gestion
    additional_fees?: AdditionalFee[];
}

export interface AdditionalFee {
    id: string;
    name: string;                         // ex: "Déclinaisons bannières"
    type: "percent" | "flat";
    value: number;
    description?: string;
}

export const DEFAULT_AGENCY_FEES: AgencyFeesConfig = {
    commission_rate: 15,
    management_fee_type: "percent",
    management_fee_value: 5,
    additional_fees: []
};

// ============================================================================
// ENTITÉS CRM (CORE)
// ============================================================================

export interface ClientEntity {
    id: string;                           // Firestore Doc ID
    client_id: string;                    // Custom ID (ex: CL_LOREAL)
    name: string;
    type: "direct" | "agency" | "holding";
    contact_email?: string;
    vat_number?: string;
    billing_address?: string;
    default_agency_fees?: AgencyFeesConfig;
    createdAt?: any;
    updatedAt?: any;
}

export interface AdvertiserEntity {
    id: string;
    advertiser_id: string;                // Custom ID (ex: ADV_LOREAL_LUXE)
    name: string;
    client_id: string;                    // FK → ClientEntity
    contact_email?: string;
    createdAt?: any;
}

export interface BrandEntity {
    id: string;
    brand_id: string;                     // Custom ID (ex: BRAND_LANCOME)
    name: string;
    client_id: string;                    // FK → ClientEntity (obligatoire)
    advertiser_id?: string;               // FK → AdvertiserEntity (optionnel)
    createdAt?: any;
}

export interface ContactEntity {
    id: string;
    name: string;
    email: string;
    phone?: string;
    job_title?: string;
    linked_client?: string;               // FK → ClientEntity
    linked_advertiser?: string;           // FK → AdvertiserEntity
    linked_brand?: string;                // FK → BrandEntity
    createdAt?: any;
}

// ============================================================================
// DESIGN & BRANDING
// ============================================================================

export interface AgenceSettings {
    iconeDarkUrl: string;
    logoDarkUrl: string;
    iconeLightUrl: string;
    logoLightUrl: string;
    commissionRate: number;
    feesRate: number;
    activeThemeId: string;
}

export interface AgencyAssetEntity {
    id: string;
    name: string;
    type: 'logo_light' | 'logo_dark' | 'icon_light' | 'icon_dark' | 'other';
    url: string;
    createdAt?: any;
}

export interface Theme {
    id: string;
    name: string;
    previewBg: string;
    description: string;
    themeColors: {
        primaryAccent: string;
        secondaryAccent: string;
        warningAccent?: string;
        background: string;
        text: string;
    };
}

// ============================================================================
// RÉFÉRENTIELS MÉDIA
// ============================================================================

export interface ChannelCategoryEntity {
    id: string;                           // ex: cat_social
    name: string;
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface BuyingModelEntity {
    id: string;                           // ex: bm_cpm
    name: string;
    code: "CPM" | "CPC" | "CPV" | "CPA" | "FLAT" | "OTC" | "FIXED_CPM";
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface BuyingUnitEntity {
    id: string;                           // ex: unit_imp
    name: string;
    code: "IMP" | "CLICK" | "VIEW" | "LEAD" | "ACTION" | "DAY";
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface CampaignObjectiveEntity {
    id: string;                           // ex: obj_awareness
    name: string;
    code: "AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT";
    createdAt?: any;
    updatedAt?: any;
}

export interface PublisherEntity {
    id: string;                           // ex: pub_meta
    name: string;                         // Nom commercial
    legal_name?: string;                  // Raison sociale
    country: string;                      // Pays de facturation
    vat_number?: string;
    billing_email?: string;
    payment_terms?: string;               // ex: "Net 30"
    currency: string;                     // USD, EUR, MAD
    website?: string;
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaChannelEntity {
    id: string;                           // ex: ch_facebook
    name: string;
    category_id: string;                  // FK → ChannelCategoryEntity
    publisher_id: string;                 // FK → PublisherEntity (obligatoire)
    parent_id?: string;                   // FK → MediaChannelEntity (régie parente)
    is_regie: boolean;                    // True si regroupement
    description: string;
    allowed_buying_models?: string[];     // IDs buying models autorisés
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaFormatEntity {
    id: string;                           // ex: fmt_social_post
    name: string;
    type: "image" | "video" | "carousel" | "text" | "html5";
    specs: {
        ratio?: string;
        width?: number;                   // px
        height?: number;                  // px
        max_duration_sec?: number;
        max_weight_mb?: number;
    };
    compatible_channels: string[];        // IDs channels compatibles
    compatible_buying_models: string[];   // IDs buying models compatibles
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaPlacementEntity {
    id: string;                           // ex: pl_fb_feed
    name: string;
    channel_id: string;                   // FK → MediaChannelEntity
    format_ids: string[];                 // FK → MediaFormatEntity[]
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

// ============================================================================
// DONNÉES OPÉRATIONNELLES - MEDIA PLANS
// ============================================================================

export interface MediaPlanEntity {
    id: string;                           // Firestore Doc ID
    plan_id: string;                      // Custom ID (ex: MP_2025_SANLAM_Q1)
    name: string;
    description?: string;
    
    // Relations
    client_id: string;                    // FK → ClientEntity.client_id
    advertiser_id?: string;               // FK → AdvertiserEntity.id
    brand_id?: string;                    // FK → BrandEntity.id
    
    // Dates
    start_date: string;                   // ISO Date
    end_date: string;                     // ISO Date
    
    // Budget
    total_budget_ht: number;
    currency: string;                     // MAD, EUR, USD
    
    // Frais agence (override client)
    agency_fees?: AgencyFeesConfig;
    
    // Options affichage
    show_fees?: boolean;
    show_commission?: boolean;
    show_additional_fees?: boolean;
    
    // KPIs / Benchmarks
    default_benchmarks?: {
        ctr_display?: number;             // ex: 0.2
        ctr_search?: number;              // ex: 5
        vtr_video?: number;               // ex: 45
        conversion_rate?: number;         // ex: 2
    };
    
    // Objectifs
    objectives?: ("AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT")[];
    
    // Defaults
    default_redirect_url?: string;
    default_targeting?: TargetingConfig;
    
    // Statut
    status: "DRAFT" | "VALIDATED" | "ONGOING" | "COMPLETED" | "ARCHIVED";
    
    // Métadonnées
    created_by?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface InsertionEntity {
    id: string;                           // Firestore Doc ID
    insertion_id: string;                 // Custom ID (ex: INS_001_FB_FEED)
    plan_id: string;                      // FK → MediaPlanEntity.id
    
    // Identification
    name: string;
    support: string;                      // Nom du support
    
    // Structure technique
    channel_id: string;                   // FK → MediaChannelEntity.id
    format_id?: string;                   // FK → MediaFormatEntity.id
    placement_id?: string;                // FK → MediaPlacementEntity.id
    
    // Structure achat
    buying_model_id: string;              // FK → BuyingModelEntity.id
    buying_unit_id?: string;              // FK → BuyingUnitEntity.id
    
    // Financier
    unit_cost: number;
    quantity: number;
    total_cost_ht: number;
    
    // Frais agence (override plan)
    agency_fees_override?: AgencyFeesConfig;
    
    // Dates (override plan)
    start_date?: string;
    end_date?: string;
    
    // Relations
    content_id?: string;                  // FK → ContentEntity.id
    redirect_link_id?: string;            // FK → RedirectLinkEntity.id
    targeting_id?: string;                // FK → TargetingEntity.id
    
    // Performances réelles
    actual_impressions?: number;
    actual_clicks?: number;
    actual_conversions?: number;
    actual_views?: number;
    actual_spend?: number;
    
    // Statut
    status: "PLANNED" | "BOOKED" | "LIVE" | "PAUSED" | "ENDED";
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

export interface ContentEntity {
    id: string;
    content_id: string;                   // Custom ID
    name: string;
    
    // Relations
    plan_id?: string;                     // FK → MediaPlanEntity.id
    insertion_id?: string;                // FK → InsertionEntity.id
    
    // Type
    type: "image" | "video" | "carousel" | "text" | "html5" | "audio";
    
    // Créatif
    headline?: string;
    body?: string;
    cta_text?: string;
    
    // Fichiers
    creative_url?: string;
    thumbnail_url?: string;
    
    // Specs
    dimensions?: string;                  // ex: "1080x1080"
    duration_sec?: number;
    file_size_mb?: number;
    
    // Validation
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    approval_notes?: string;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

export interface RedirectLinkEntity {
    id: string;
    link_id: string;                      // Custom ID
    name: string;
    
    // Relations
    plan_id?: string;                     // FK → MediaPlanEntity.id
    insertion_id?: string;                // FK → InsertionEntity.id
    
    // URLs
    destination_url: string;
    tracking_url?: string;
    short_url?: string;
    
    // UTM
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    
    // Tracking
    third_party_trackers?: string[];
    
    // Statut
    is_active: boolean;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

export interface TargetingEntity {
    id: string;
    targeting_id: string;                 // Custom ID
    name: string;
    
    // Relations
    plan_id?: string;                     // FK → MediaPlanEntity.id
    insertion_id?: string;                // FK → InsertionEntity.id
    
    // Config
    config: TargetingConfig;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

export interface TargetingConfig {
    // Géographie
    geo_countries?: string[];
    geo_regions?: string[];
    geo_cities?: string[];
    geo_radius_km?: number;
    geo_exclude?: string[];
    
    // Démographie
    age_min?: number;
    age_max?: number;
    genders?: ("male" | "female" | "all")[];
    languages?: string[];
    
    // Audiences
    audience_segments?: string[];
    custom_audiences?: string[];
    exclude_audiences?: string[];
    
    // Appareils
    devices?: ("mobile" | "desktop" | "tablet" | "tv")[];
    os?: ("ios" | "android" | "windows" | "macos")[];
    
    // Contexte
    placements?: string[];
    dayparting?: {
        days?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
        hours_start?: number;             // 0-23
        hours_end?: number;               // 0-23
    };
    
    // Notes
    notes?: string;
}

// ============================================================================
// HELPERS - CALCULS
// ============================================================================

/**
 * Calcule le coût total d'une insertion
 */
export function calculateInsertionCost(
    modeleAchat: string,
    coutUnitaire: number,
    quantite: number
): number {
    switch (modeleAchat.toUpperCase()) {
        case 'FORFAIT':
        case 'FLAT':
            return coutUnitaire;
        case 'CPM':
            return (quantite / 1000) * coutUnitaire;
        case 'CPC':
        case 'CPV':
        case 'CPA':
        case 'CPL':
        default:
            return coutUnitaire * quantite;
    }
}

/**
 * Génère un ID business standardisé
 */
export function generateBusinessId(prefix: string, name: string): string {
    const cleanName = name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 20);
    return `${prefix}_${cleanName}`;
}
