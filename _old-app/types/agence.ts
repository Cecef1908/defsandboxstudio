// --- ENTITÉS ADMINISTRATIVES (CORE) ---

/**
 * FRAIS D'AGENCE - Structure réutilisable
 * Peut être défini au niveau: Client (défaut) → Plan Média (override) → Insertion (override)
 */
export interface AgencyFeesConfig {
    // Commission agence sur média (%)
    commission_rate: number; // ex: 15 (= 15%)
    
    // Frais de gestion
    management_fee_type: "percent" | "flat"; // % ou montant fixe
    management_fee_value: number; // ex: 5 (= 5%) ou 500 (= 500 MAD)
    
    // Frais additionnels (nommés librement)
    additional_fees?: AdditionalFee[];
}

export interface AdditionalFee {
    id: string; // Unique ID
    name: string; // ex: "Déclinaisons bannières", "Préqualif leads"
    type: "percent" | "flat"; // % sur total insertions ou montant fixe
    value: number; // ex: 10 (= 10%) ou 2000 (= 2000 MAD)
    description?: string;
}

// Valeurs par défaut des frais agence
export const DEFAULT_AGENCY_FEES: AgencyFeesConfig = {
    commission_rate: 15,
    management_fee_type: "percent",
    management_fee_value: 5,
    additional_fees: []
};

export interface ClientEntity {
    id: string; // Firestore Doc ID
    client_id: string; // Custom ID (ex: CL_LOREAL)
    name: string;
    type: "direct" | "agency" | "holding";
    contact_email?: string;
    vat_number?: string;
    billing_address?: string; // AJOUTÉ : Pour ne pas perdre l'adresse des CSV
    
    // Frais agence par défaut pour ce client
    default_agency_fees?: AgencyFeesConfig;
    
    createdAt?: any;
    updatedAt?: any;
}

export interface AdvertiserEntity {
    id: string;
    advertiser_id: string; // Custom ID (ex: ADV_LOREAL_LUXE)
    name: string;
    client_id: string; // Reference to ClientEntity
    contact_email?: string;
    createdAt?: any;
}

export interface BrandEntity {
    id: string;
    brand_id: string; // Custom ID (ex: BRAND_LANCOME)
    name: string;
    client_id: string; // Mandatory Reference
    advertiser_id?: string; // Optional Reference
    createdAt?: any;
}

export interface ContactEntity {
    id: string;
    name: string;
    email: string;
    phone?: string;
    job_title?: string;
    linked_client?: string; // Optional Link
    linked_advertiser?: string; // Optional Link
    linked_brand?: string; // Optional Link
    createdAt?: any;
}

// --- DONNÉES TRANSFORMÉES (SEED DATA) ---

// 1. CLIENTS (Entités Légales)
export const clients: ClientEntity[] = [
  {
    id: "cl_casa_temara",
    client_id: "CL_CASA_TEMARA",
    name: "Casa Temara Developpement",
    type: "direct",
    vat_number: "002723212000052",
    billing_address: "Avenue Mohammed VI, km 4,3, - rue Aknoul, villa n°4 - Rabat-Souissi"
  },
  {
    id: "cl_sanlam",
    client_id: "CL_SANLAM",
    name: "Sanlam Maroc",
    type: "direct",
    vat_number: "000230054000034",
    billing_address: "216 BOULEVARD MOHAMED ZERKTOUNI - CASABLANCA"
  },
  {
    id: "cl_fledge",
    client_id: "CL_FLEDGE",
    name: "Fledge Branding and Design Studio",
    type: "agency",
    vat_number: "000082490000084",
    billing_address: "22, rue d'ifrane CIL, Casablanca"
  },
  {
    id: "cl_palmier_bleu",
    client_id: "CL_PALMIER_BLEU",
    name: "LE PALMIER BLEU",
    type: "direct",
    vat_number: "000514383000022",
    billing_address: "BD Biarritz Sidi Abderrahman PB 125 139 Ain Diab"
  },
  {
    id: "cl_night_golf",
    client_id: "CL_NIGHT_GOLF",
    name: "Night Golf Morocco",
    type: "direct",
    vat_number: "003579199000011",
    billing_address: "-"
  },
  {
    id: "cl_padel_event",
    client_id: "CL_PADEL_EVENT",
    name: "Padel Event",
    type: "direct",
    vat_number: "002972211000052",
    billing_address: "-"
  },
  {
    id: "cl_domaine_palm",
    client_id: "CL_DOMAINE_PALM",
    name: "DOMAINE PALM MARRAKECH",
    type: "direct",
    vat_number: "001529823000095",
    billing_address: "BP 2470,KM 12 ROUTE AMIZMIZ - MARRAKECH"
  },
  {
    id: "cl_yamed",
    client_id: "CL_YAMED",
    name: "YAMED Capital",
    type: "holding",
    vat_number: "000005881000002",
    billing_address: "12, rue de l'Ile de Timor, Angle Côte d'Emeraude - Casablanca"
  },
  {
    id: "cl_africa_retail",
    client_id: "CL_AFRICA_RETAIL",
    name: "Africa Retail Market",
    type: "direct",
    vat_number: "002100261000026",
    billing_address: "LOTISSEMENT AL KASR ZONE INDUSTRIELLE SBV OUED YKEM - SKHIRAT"
  },
  {
    id: "cl_honoris",
    client_id: "CL_HONORIS",
    name: "Honoris",
    type: "holding",
    vat_number: "001594224000090",
    billing_address: "Aéropole de Formation ,20180  Zone de NoucerCasablanca"
  },
  {
    id: "cl_eleven_media",
    client_id: "CL_ELEVEN_MEDIA",
    name: "Eleven media",
    type: "agency",
    vat_number: "000050701000034",
    billing_address: "Printemps d'Anfa – 4ème étage N°43 - Casablanca"
  },
  {
    id: "cl_ivder",
    client_id: "CL_IVDER",
    name: "Ivder Invest",
    type: "direct",
    vat_number: "002422003000021",
    billing_address: "Avenue Mohammed VI, km 4,3, - rue Aknoul, villa n°4 - Rabat-Souissi"
  },
  {
    id: "cl_tgcc",
    client_id: "CL_TGCC",
    name: "TGCC Immobilier",
    type: "direct",
    billing_address: "4, rue Al Imam Mouslim, Oasis - Casablanca"
  },
  {
    id: "cl_mse",
    client_id: "CL_MSE",
    name: "Madaëf Sports & Events",
    type: "direct",
    billing_address: "Place Carrée Mahaj Ryad Center Batiment 6,3éme étage - Rabat"
  },
  {
    id: "cl_cfa",
    client_id: "CL_CFA",
    name: "Club des Femmes Administrateurs",
    type: "direct",
    vat_number: "0025711250056",
    billing_address: "38 Bd Moulay Youssef, Casablanca"
  },
  {
    id: "cl_sofitel",
    client_id: "CL_SOFITEL",
    name: "Sofitel Marrakesh",
    type: "direct",
    vat_number: "001534810000082",
    billing_address: "Rue Haroun Errachid - 40 000 Marrakech"
  },
  {
    id: "cl_109_agency",
    client_id: "CL_109_AGENCY",
    name: "109 Agency",
    type: "agency",
    vat_number: "001673400000024",
    billing_address: "Continental Business Center, Immeuble B – 1er étage CFC"
  }
];

// 2. ANNONCEURS (Projets/Marques liés aux Clients)
export const advertisers: AdvertiserEntity[] = [
  { id: "adv_temara", advertiser_id: "ADV_TEMARA", name: "Temara Avenue", client_id: "cl_casa_temara" },
  { id: "adv_sanlam", advertiser_id: "ADV_SANLAM", name: "Sanlam Maroc", client_id: "cl_sanlam" },
  { id: "adv_fledge", advertiser_id: "ADV_FLEDGE", name: "Fledge Branding", client_id: "cl_fledge" },
  { id: "adv_casabotanica", advertiser_id: "ADV_CASABOTANICA", name: "Casabotanica", client_id: "cl_palmier_bleu" },
  { id: "adv_night_golf", advertiser_id: "ADV_NIGHT_GOLF", name: "Night Golf Morocco", client_id: "cl_night_golf" },
  { id: "adv_dislog_padel", advertiser_id: "ADV_DISLOG_PADEL", name: "Dislog Maroc Padel Masters", client_id: "cl_padel_event" },
  { id: "adv_jardin_ocre", advertiser_id: "ADV_JARDIN_OCRE", name: "Jardin Ocre", client_id: "cl_domaine_palm" },
  { id: "adv_ynexis", advertiser_id: "ADV_YNEXIS", name: "Ynexis", client_id: "cl_yamed" },
  { id: "adv_hyper_u", advertiser_id: "ADV_HYPER_U", name: "Hyper U", client_id: "cl_africa_retail" },
  { id: "adv_mundiapolis", advertiser_id: "ADV_MUNDIAPOLIS", name: "Mundiapolis", client_id: "cl_honoris" },
  { id: "adv_emsi", advertiser_id: "ADV_EMSI", name: "EMSI", client_id: "cl_honoris" },
  { id: "adv_eleven_pf", advertiser_id: "ADV_ELEVEN_PF", name: "Portefeuille Auto (Mercedes/BYD)", client_id: "cl_eleven_media" },
  { id: "adv_17_zaer", advertiser_id: "ADV_17_ZAER", name: "17 Zaer Park", client_id: "cl_ivder" },
  { id: "adv_tgcc_proj", advertiser_id: "ADV_TGCC_PROJ", name: "TGCC Projets (Tour 33, Darb...)", client_id: "cl_tgcc" },
  { id: "adv_mse", advertiser_id: "ADV_MSE", name: "MSE / Club Wifaq", client_id: "cl_mse" },
  { id: "adv_cfa", advertiser_id: "ADV_CFA", name: "Club Femmes Admin.", client_id: "cl_cfa" },
  { id: "adv_sofitel", advertiser_id: "ADV_SOFITEL", name: "Sofitel & So Lounge", client_id: "cl_sofitel" },
  { id: "adv_madaef_grp", advertiser_id: "ADV_MADAEF_GRP", name: "Madaef Groupe", client_id: "cl_109_agency" },
];

// 3. CONTACTS (Interlocuteurs clés)
export const contacts: ContactEntity[] = [
    // TEMARA AVENUE / 17 ZAER (Même équipe de gestion)
    { id: "ct_sahar_b", name: "Sahar BOUASSEL", email: "sahar.bouassel@mngt-team.com", phone: "212 613 73 86 03", job_title: "Responsable Marketing", linked_advertiser: "adv_temara" },
    { id: "ct_yousra_f", name: "Yousra FADIL", email: "yousra.fadil@mngt-team.com", phone: "212 661-074743", job_title: "Digital Marketing Manager", linked_advertiser: "adv_temara" },
    
    // SANLAM
    { id: "ct_anbar_j", name: "Anbar Jamai", email: "anbar.jamai@sanlam.ma", phone: "212 661-696174", job_title: "Head of Strategy", linked_client: "cl_sanlam" },
    { id: "ct_riad_l", name: "Riad Lazrek", email: "riad.lazrek@sanlam.ma", phone: "212 613-848203", job_title: "Senior Manager", linked_client: "cl_sanlam" },

    // FLEDGE
    { id: "ct_marwane_g", name: "Marwane GUERNI", email: "marwane.guerni@fledgebba.com", phone: "212 6 65 02 17 30", job_title: "Managing Partner", linked_client: "cl_fledge" },
    
    // CASABOTANICA
    { id: "ct_diego_i", name: "Diego IEZZONI", email: "d.iezzoni@casabotanica.ma", phone: "212 671-828397", job_title: "Directeur Jardinerie", linked_advertiser: "adv_casabotanica" },

    // NIGHT GOLF
    { id: "ct_youssef_s", name: "Youssef Sefiani", email: "nightgolfmorocco@gmail.com", phone: "212 641-577070", job_title: "Founder", linked_client: "cl_night_golf" },

    // PADEL
    { id: "ct_omar_y", name: "Omar El Yacoubi", email: "Omar.elyacoubi@gmail.com", phone: "212 661-923707", job_title: "Organisateur", linked_advertiser: "adv_dislog_padel" },

    // JARDIN OCRE
    { id: "ct_dalal_a", name: "DALAL AHAMROUNI", email: "dahamrouni@royalpalmmarrakech.com", phone: "212 661-219872", job_title: "Directrice Sales & Marketing", linked_advertiser: "adv_jardin_ocre" },

    // YNEXIS
    { id: "ct_meryem_a", name: "Meryem EL ARABI", email: "meryem.elarabi@ynexis.com", job_title: "Directrice Marketing", linked_advertiser: "adv_ynexis" },
    { id: "ct_rim_f", name: "Rim FAIQ", email: "rim.faiq@ynexis.com", phone: "212 669‑905268", job_title: "Chargée de Com", linked_advertiser: "adv_ynexis" },

    // HONORIS (Mundiapolis / EMSI)
    { id: "ct_dikra_h", name: "Dikra Hakine", email: "dhakine@honoris.net", job_title: "Directrice Marketing", linked_client: "cl_honoris" },
    { id: "ct_maram_h", name: "Maram EL HILALI", email: "Melhilali@honoris.net", phone: "212 662-030541", job_title: "Marketing & Admissions", linked_advertiser: "adv_emsi" },
    
    // ELEVEN MEDIA
    { id: "ct_mohamed_ad", name: "Mohamed Anass Djebbar", email: "djebbar@elevenmedia.ma", phone: "212 06 61 16 93 49", job_title: "Managing Director", linked_client: "cl_eleven_media" },

    // TGCC
    { id: "ct_aida_w", name: "Aida Wahbi", email: "aida.wahbi@tgcc.ma", job_title: "Directrice Com & Marketing", linked_client: "cl_tgcc" },

    // MSE
    { id: "ct_nadia_g", name: "Nadia Grirrane", email: "n.grirrane@mse.co.ma", phone: "212 631-030395", job_title: "Marketing Director", linked_client: "cl_mse" },

    // SOFITEL
    { id: "ct_lambert_l", name: "Lambert LLORET-BAVAI", email: "Lambert.LLORETBAVAI@sofitel.com", phone: "212 6 60 12 34 39", job_title: "Com & PR", linked_client: "cl_sofitel" },

    // 109 AGENCY (Madaef)
    { id: "ct_zineb_z", name: "Zineb ZAKRAOUI", email: "z.ZAKRAOUI@madaef.ma", phone: "212 684-566191", job_title: "Dir Marketing", linked_advertiser: "adv_madaef_grp" }
];

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

export const defaultThemes: Theme[] = [
    {
        id: 'dark-vibrant',
        name: 'Nuit Vive (Vibrant Dark)',
        previewBg: '#111827',
        description: "Fond sombre, accent bleu moderne.",
        themeColors: {
            primaryAccent: '#3B82F6',
            secondaryAccent: '#8B5CF6',
            background: '#111827',
            text: '#F8FAFC',
        },
    },
    {
        id: 'light-corporate',
        name: 'Clair Pro (Corporate Light)',
        previewBg: '#F0F4F8',
        description: "Fond blanc, look professionnel et aéré.",
        themeColors: {
            primaryAccent: '#0668E1',
            secondaryAccent: '#475569',
            background: '#FFFFFF',
            text: '#0F172A',
        },
    },
    {
        id: 'obsidian-gold',
        name: 'Luxe Obsidian (Premium)',
        previewBg: '#000000',
        description: "Noir pur et accents dorés pour le luxe.",
        themeColors: {
            primaryAccent: '#D4AF37',
            secondaryAccent: '#78716C',
            background: '#020202',
            text: '#E5E5E5',
        },
    },
];

// --- MÉDIA LIBRARY (RÉFÉRENTIELS TECHNIQUES) ---

export interface ChannelCategoryEntity {
    id: string; // Firestore Doc ID (ex: cat_social)
    name: string;
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface BuyingModelEntity {
    id: string; // Firestore Doc ID (ex: bm_cpm)
    name: string;
    code: "CPM" | "CPC" | "CPV" | "CPA" | "FLAT" | "OTC" | "FIXED_CPM";
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface BuyingUnitEntity {
    id: string; // Firestore Doc ID (ex: unit_imp)
    name: string;
    code: "IMP" | "CLICK" | "VIEW" | "LEAD" | "ACTION" | "DAY";
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface CampaignObjectiveEntity {
    id: string; // Firestore Doc ID (ex: obj_awareness)
    name: string;
    code: "AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT";
    createdAt?: any;
    updatedAt?: any;
}

export interface PublisherEntity {
    id: string; // Firestore Doc ID (ex: pub_meta)
    name: string; // Nom commercial (ex: Meta Platforms Inc.)
    legal_name?: string; // Raison sociale complète
    country: string; // Pays de facturation (ex: USA, France, Maroc)
    vat_number?: string; // Numéro TVA/ICE
    billing_email?: string; // Email de facturation
    payment_terms?: string; // Conditions de paiement (ex: "Net 30", "Prepaid")
    currency: string; // Devise de facturation (ex: USD, EUR, MAD)
    website?: string; // Site web officiel
    notes?: string; // Notes internes
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaChannelEntity {
    id: string; // Firestore Doc ID (ex: ch_facebook)
    name: string;
    category_id: string; // Reference to ChannelCategoryEntity
    publisher_id: string; // OBLIGATOIRE - Reference to PublisherEntity (qui on paie)
    parent_id?: string; // ID de la Régie parente (ex: ch_meta_ads)
    is_regie: boolean; // Si True, c'est un regroupement (ex: Meta Ads)
    description: string;
    allowed_buying_models?: string[]; // Liste des IDs de buying models autorisés
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaFormatEntity {
    id: string; // Firestore Doc ID (ex: fmt_social_post)
    name: string;
    type: "image" | "video" | "carousel" | "text" | "html5";
    specs: {
        ratio?: string;
        width?: number; // px
        height?: number; // px
        max_duration_sec?: number;
        max_weight_mb?: number;
    };
    compatible_channels: string[]; // Liste des IDs de channels compatibles
    compatible_buying_models: string[]; // Liste des IDs de modèles d'achat compatibles
    createdAt?: any;
    updatedAt?: any;
}

export interface MediaPlacementEntity {
    id: string; // Firestore Doc ID (ex: pl_fb_feed)
    name: string;
    channel_id: string; // Lien parent (Ex: Facebook)
    format_ids: string[]; // Formats techniques acceptés (Ex: Post Carré, Video 4:5)
    description: string;
    createdAt?: any;
    updatedAt?: any;
}

// --- DONNÉES OPÉRATIONNELLES (MEDIA PLANS) ---

/**
 * MEDIA PLAN - Document principal contenant les métadonnées du plan
 * Collection: media-plans
 */
export interface MediaPlanEntity {
    id: string; // Firestore Doc ID
    plan_id: string; // Custom ID (ex: MP_2025_SANLAM_Q1)
    name: string; // Nom du plan (ex: "Campagne Notoriété Sanlam Q1 2025")
    description?: string;
    
    // Relations Client/Annonceur/Marque
    client_id: string; // Référence vers ClientEntity.client_id
    advertiser_id?: string; // Référence vers AdvertiserEntity (doc ID)
    brand_id?: string; // Référence vers BrandEntity (doc ID)
    
    // Dates
    start_date: string; // ISO Date
    end_date: string; // ISO Date
    
    // Budget Global
    total_budget_ht: number; // Budget total HT
    currency: string; // MAD, EUR, USD
    
    // Frais Agence (override du client si défini)
    // Si non défini, hérite des frais par défaut du client
    agency_fees?: AgencyFeesConfig;
    
    // Options d'affichage des frais sur les documents
    show_fees?: boolean; // Afficher les frais de gestion
    show_commission?: boolean; // Afficher la commission
    show_additional_fees?: boolean; // Afficher les frais additionnels
    
    // KPIs / Benchmarks par défaut
    default_benchmarks?: {
        ctr_display?: number; // ex: 0.2%
        ctr_search?: number; // ex: 5%
        vtr_video?: number; // ex: 45%
        conversion_rate?: number; // ex: 2%
    };
    
    // Objectifs de campagne
    objectives?: ("AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT")[];
    
    // Lien de redirection par défaut (hérité par les insertions si non défini)
    default_redirect_url?: string;
    
    // Ciblage par défaut (hérité par les insertions si non défini)
    default_targeting?: TargetingConfig;
    
    // Statut
    status: "DRAFT" | "VALIDATED" | "ONGOING" | "COMPLETED" | "ARCHIVED";
    
    // Métadonnées
    created_by?: string;
    createdAt?: any;
    updatedAt?: any;
}

/**
 * INSERTION - Ligne d'achat média dans un plan
 * Collection: insertions (avec planRef pour lier au plan)
 */
export interface InsertionEntity {
    id: string; // Firestore Doc ID
    insertion_id: string; // Custom ID (ex: INS_001_FB_FEED)
    plan_id: string; // Référence vers MediaPlanEntity (doc ID)
    
    // Nom de la ligne
    name: string; // Nom technique (ex: "Facebook Feed - Awareness")
    support: string; // Nom du support (ex: "Facebook", "Le Matin", "2M")
    
    // Structure Technique
    channel_id: string; // Référence vers MediaChannelEntity (doc ID)
    format_id?: string; // Référence vers MediaFormatEntity (doc ID)
    placement_id?: string; // Référence vers MediaPlacementEntity (doc ID)
    
    // Structure Achat
    buying_model_id: string; // Référence vers BuyingModelEntity (doc ID)
    buying_unit_id?: string; // Référence vers BuyingUnitEntity (doc ID)
    
    // Structure Financière
    unit_cost: number; // Coût unitaire (ex: 15 MAD/CPM)
    quantity: number; // Quantité achetée (ex: 100000 impressions)
    total_cost_ht: number; // Coût total HT (calculé ou forfait)
    
    // Frais Agence spécifiques à cette insertion (override du plan si défini)
    // Priorité: Insertion > Plan > Client
    agency_fees_override?: AgencyFeesConfig;
    
    // Dates spécifiques à l'insertion (peut différer du plan)
    start_date?: string;
    end_date?: string;
    
    // Lien vers Contenu (priorité sur le contenu du plan)
    content_id?: string; // Référence vers ContentEntity (doc ID)
    
    // Lien de redirection (priorité: insertion > plan)
    redirect_link_id?: string; // Référence vers RedirectLinkEntity (doc ID)
    
    // Ciblage spécifique (priorité: insertion > plan)
    targeting_id?: string; // Référence vers TargetingEntity (doc ID)
    
    // Performances réelles (optionnel, pour suivi)
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

/**
 * CONTENT - Contenu créatif lié à une insertion
 * Collection: contents
 */
export interface ContentEntity {
    id: string; // Firestore Doc ID
    content_id: string; // Custom ID (ex: CONT_001_VIDEO_SANLAM)
    name: string; // Nom du contenu (ex: "Video 15s - Sanlam Epargne")
    
    // Lien parent (peut être lié à un plan OU une insertion)
    plan_id?: string; // Si contenu au niveau du plan
    insertion_id?: string; // Si contenu spécifique à une insertion
    
    // Type de contenu
    type: "image" | "video" | "carousel" | "text" | "html5" | "audio";
    
    // Détails créatifs
    headline?: string; // Titre principal
    body?: string; // Texte/description
    cta_text?: string; // Call-to-action (ex: "En savoir plus", "Acheter")
    
    // Fichiers/Références
    creative_url?: string; // URL du fichier créatif (Drive, S3, etc.)
    thumbnail_url?: string; // Miniature
    
    // Spécifications techniques
    dimensions?: string; // ex: "1080x1080"
    duration_sec?: number; // Durée en secondes (pour vidéo/audio)
    file_size_mb?: number;
    
    // Statut de validation
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    approval_notes?: string;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

/**
 * REDIRECT LINK - Lien de redirection/tracking
 * Collection: redirect-links
 */
export interface RedirectLinkEntity {
    id: string; // Firestore Doc ID
    link_id: string; // Custom ID (ex: LINK_001_SANLAM_LP)
    name: string; // Nom descriptif (ex: "Landing Page Sanlam Epargne")
    
    // Lien parent (peut être lié à un plan OU une insertion)
    plan_id?: string; // Si lien au niveau du plan (par défaut)
    insertion_id?: string; // Si lien spécifique à une insertion (prioritaire)
    
    // URL
    destination_url: string; // URL finale (landing page)
    tracking_url?: string; // URL avec tracking (UTM, etc.)
    short_url?: string; // URL raccourcie (bit.ly, etc.)
    
    // Paramètres UTM
    utm_source?: string; // ex: "facebook"
    utm_medium?: string; // ex: "paid_social"
    utm_campaign?: string; // ex: "sanlam_q1_2025"
    utm_content?: string; // ex: "video_15s"
    utm_term?: string; // ex: "epargne"
    
    // Tracking tiers
    third_party_trackers?: string[]; // Pixels/tags tiers
    
    // Statut
    is_active: boolean;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

/**
 * TARGETING - Configuration de ciblage
 * Collection: targetings
 */
export interface TargetingEntity {
    id: string; // Firestore Doc ID
    targeting_id: string; // Custom ID (ex: TGT_001_SANLAM_CSP)
    name: string; // Nom descriptif (ex: "CSP+ Casablanca 25-55")
    
    // Lien parent (peut être lié à un plan OU une insertion)
    plan_id?: string; // Si ciblage au niveau du plan (par défaut)
    insertion_id?: string; // Si ciblage spécifique à une insertion (prioritaire)
    
    // Configuration de ciblage
    config: TargetingConfig;
    
    // Métadonnées
    createdAt?: any;
    updatedAt?: any;
}

/**
 * Configuration de ciblage (réutilisable)
 */
export interface TargetingConfig {
    // Géographie
    geo_countries?: string[]; // ex: ["Maroc"]
    geo_regions?: string[]; // ex: ["Casablanca-Settat", "Rabat-Salé-Kénitra"]
    geo_cities?: string[]; // ex: ["Casablanca", "Rabat", "Marrakech"]
    geo_radius_km?: number; // Rayon autour d'un point
    geo_exclude?: string[]; // Zones à exclure
    
    // Démographie
    age_min?: number; // ex: 25
    age_max?: number; // ex: 55
    genders?: ("male" | "female" | "all")[]; // ex: ["male", "female"]
    languages?: string[]; // ex: ["fr", "ar"]
    
    // Audiences
    audience_segments?: string[]; // ex: ["Intérêt: Finance", "Lookalike 1%"]
    custom_audiences?: string[]; // IDs d'audiences personnalisées
    exclude_audiences?: string[]; // Audiences à exclure
    
    // Appareils
    devices?: ("mobile" | "desktop" | "tablet" | "tv")[]; 
    os?: ("ios" | "android" | "windows" | "macos")[];
    
    // Contexte
    placements?: string[]; // ex: ["feed", "stories", "reels"]
    dayparting?: {
        days?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
        hours_start?: number; // 0-23
        hours_end?: number; // 0-23
    };
    
    // Notes
    notes?: string;
}

// ============================================================================
// AI-READY: Structures pour Embeddings et Recherche Sémantique
// ============================================================================

/**
 * Structure pour vectorisation des plans média
 * Utilisé pour la recherche sémantique et les recommandations IA
 */
export interface MediaPlanEmbeddingData {
    // Texte à vectoriser (concaténation des champs pertinents)
    searchable_text: string;
    
    // Métadonnées pour filtrage hybride (vector + metadata)
    metadata: {
        entity_type: "media_plan";
        entity_id: string;
        client_id: string;
        client_name?: string;
        status: string;
        date_start: string;
        date_end: string;
        budget_total: number;
        currency: string;
        channels_used: string[];
        objectives: string[];
        insertion_count: number;
    };
    
    // Vecteur d'embedding (généré par OpenAI ou autre)
    embedding?: number[];
    
    // Timestamp pour invalidation cache
    embedded_at?: any;
}

/**
 * Structure pour vectorisation des insertions
 */
export interface InsertionEmbeddingData {
    searchable_text: string;
    
    metadata: {
        entity_type: "insertion";
        entity_id: string;
        plan_id: string;
        client_id: string;
        channel_id: string;
        channel_name: string;
        format_name?: string;
        buying_model: string;
        budget: number;
        targeting_summary?: string;
    };
    
    embedding?: number[];
    embedded_at?: any;
}

/**
 * Génère le texte searchable pour un plan média
 */
export function generatePlanSearchableText(
    plan: MediaPlanEntity,
    clientName: string,
    insertions: { support: string; canal?: string; targeting?: string }[]
): string {
    const parts = [
        plan.name,
        plan.description || '',
        `Client: ${clientName}`,
        `Objectifs: ${plan.objectives?.join(', ') || 'Non définis'}`,
        `Budget: ${plan.total_budget_ht} ${plan.currency || 'MAD'}`,
        `Statut: ${plan.status}`,
        ...insertions.map(i => `Support: ${i.support} | Canal: ${i.canal || ''} | Ciblage: ${i.targeting || ''}`),
    ];
    return parts.filter(Boolean).join(' | ');
}

/**
 * Structure pour les requêtes de recherche sémantique
 */
export interface SemanticSearchQuery {
    query: string;                    // Requête en langage naturel
    filters?: {
        client_ids?: string[];
        status?: string[];
        date_from?: string;
        date_to?: string;
        budget_min?: number;
        budget_max?: number;
        channels?: string[];
        objectives?: string[];
    };
    limit?: number;
    include_insertions?: boolean;
}

/**
 * Résultat de recherche sémantique
 */
export interface SemanticSearchResult {
    entity_type: "media_plan" | "insertion" | "client" | "contact";
    entity_id: string;
    score: number;                    // Score de similarité (0-1)
    highlight?: string;               // Extrait pertinent
    metadata: Record<string, any>;
}

// ============================================================================
// HELPERS: Fonctions utilitaires pour les calculs métier
// ============================================================================

/**
 * Calcule le coût total d'une insertion selon le modèle d'achat
 */
export function calculateInsertionCost(
    modeleAchat: string,
    coutUnitaire: number,
    quantite: number
): number {
    switch (modeleAchat.toUpperCase()) {
        case 'FORFAIT':
        case 'FLAT':
            return coutUnitaire; // Le coût unitaire EST le forfait
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
 * Calcule les KPIs estimés d'une insertion
 */
export function estimateInsertionKPIs(
    insertion: InsertionEntity,
    benchmarks: { ctr?: number; vtr?: number; convRate?: number }
): { impressions: number; clicks: number; views?: number; conversions?: number } {
    const impressions = insertion.quantity;
    const clicks = Math.round(impressions * (benchmarks.ctr || 0.002));
    const views = benchmarks.vtr ? Math.round(impressions * benchmarks.vtr) : undefined;
    const conversions = benchmarks.convRate ? Math.round(clicks * benchmarks.convRate) : undefined;
    
    return { impressions, clicks, views, conversions };
}

/**
 * Génère un ID business standardisé
 */
export function generateBusinessId(prefix: string, name: string): string {
    const cleanName = name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 20);
    return `${prefix}_${cleanName}`;
}
