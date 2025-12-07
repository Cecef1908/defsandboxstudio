/**
 * Types TypeScript pour la structure Firebase
 * Générés à partir de la structure réelle de la base de données
 */

// ==================== TYPES DE BASE ====================

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// ==================== MEDIA PLANS ====================

export interface MediaPlanFirebase {
  id: string;
  idPlan: string;
  nomPlan: string;
  description?: string;
  annonceurRef: string;
  marquesRefs: string | string[];
  
  // Dates
  dateDebut: FirebaseTimestamp;
  dateFin: FirebaseTimestamp;
  
  // Budget
  budgetTotal: number;
  
  // Benchmarks / KPIs
  ctrDisplay: number;
  ctrSearch: number;
  vtrVideo: number;
  convRate: number;
  
  // Objectifs
  objectifPrincipal?: string[];
  
  // Frais et commissions
  feesRate?: number;
  commissionRate?: number;
  agencyCommission?: number;
  showFees?: boolean;
  showCommission?: boolean;
  
  // Statut
  status: 'Brouillon' | 'Planifié' | 'En cours' | 'Terminé' | 'Archivé';
  
  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

// ==================== INSERTIONS ====================

export interface InsertionFirebase {
  id: string;
  idInsertion: string;
  planRef: string;
  marqueRef: string;
  
  // Canal et Format
  canal: string;
  format: string;
  
  // Modèle d'achat
  modeleAchat: 'CPM' | 'CPC' | 'CPV' | 'CPA' | 'Forfait' | 'CPL';
  
  // Coûts
  coutUnitaire: number;
  coutEstime: number;
  
  // Volume
  quantiteAchetee: number;
  
  // Ciblage
  targeting?: string;
  
  // Performances (optionnels)
  impressions?: number;
  clics?: number;
  conversions?: number;
  vues?: number;
  
  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

// ==================== ANNONCEURS ====================

export interface AnnonceurFirebase {
  id: string;
  idAnnonceur: string;
  nomAnnonceur: string;
  ice?: string;
  adresseFacturation?: string;
  clientGroupeRef?: string;
  marquesRefs?: string | string[];
  logoUrl?: string;
}

// ==================== MARQUES ====================

export interface MarqueFirebase {
  id: string;
  idMarque: string;
  nomMarque: string;
  annonceurRef: string;
  secteur?: string;
  statutSandbox?: 'Actif' | 'Inactif';
}

// ==================== FORMATS ====================

export interface FormatFirebase {
  id: string;
  name: string;
  channelId: string;
  placement: string;
  
  // Spécifications techniques
  specsDimensions: string;
  specsRatio: string;
  specsFileType: string;
  specsMaxWeight: string;
  specsDurationLimit: string;
  specsTechnicalNotes?: string;
}

// ==================== CANAUX ====================

export interface CanalFirebase {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

// ==================== BUYING MODELS ====================

export interface BuyingModelFirebase {
  id: string;
  name: string;
  description?: string;
  unit: string;
}

// ==================== TYPES POUR L'APPLICATION ====================

/**
 * Version enrichie d'un plan média avec toutes ses données liées
 */
export interface MediaPlanEnriched {
  plan: MediaPlanFirebase;
  annonceur: AnnonceurFirebase | null;
  marques: MarqueFirebase[];
  insertions: InsertionFirebase[];
  formats: FormatFirebase[];
}

/**
 * Données d'édition pour le formulaire
 */
export interface MediaPlanEditData {
  plan: {
    ctrDisplay: number;
    ctrSearch: number;
    vtrVideo: number;
    convRate: number;
    [key: string]: any;
  };
  insertions: InsertionEditData[];
}

/**
 * Données d'édition pour une insertion
 */
export interface InsertionEditData {
  id: string;
  support: string;
  canal: string;
  format: string;
  modeleAchat: string;
  coutUnitaire: number;
  coutEstime: number;
  quantiteAchetee: number;
  targeting?: string;
  clics: number;
  conversions: number;
}

/**
 * Nouvelle insertion à créer
 */
export interface NewInsertionData {
  planRef: string;
  marqueRef: string;
  canal: string;
  format: string;
  modeleAchat: string;
  coutUnitaire: number;
  quantiteAchetee: number;
  targeting?: string;
}

// ==================== HELPERS ====================

/**
 * Convertit un timestamp Firebase en Date JavaScript
 */
export function timestampToDate(timestamp: FirebaseTimestamp): Date {
  return new Date(timestamp.seconds * 1000);
}

/**
 * Convertit une Date JavaScript en timestamp Firebase
 */
export function dateToTimestamp(date: Date): FirebaseTimestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  };
}

/**
 * Calcule le coût estimé d'une insertion
 */
export function calculateCoutEstime(
  modeleAchat: string,
  coutUnitaire: number,
  quantiteAchetee: number
): number {
  if (modeleAchat === 'Forfait') {
    return coutUnitaire;
  }
  return coutUnitaire * quantiteAchetee;
}
