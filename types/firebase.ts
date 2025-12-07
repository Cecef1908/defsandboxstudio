// ============================================================================
// TYPES FIREBASE - Structure de données Firestore
// Architecture: Typage strict pour la cohérence des données
// ============================================================================

/**
 * Timestamp Firebase
 * @description Type standard pour les dates dans Firestore
 */
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// ============================================================================
// MEDIA PLANS
// ============================================================================

/**
 * Plan média dans Firestore
 * @description Structure complète d'un plan de campagne média
 */
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

// ============================================================================
// INSERTIONS
// ============================================================================

/**
 * Insertion (ligne de plan média) dans Firestore
 * @description Représente une ligne d'achat média
 */
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

// ============================================================================
// CRM - CLIENTS & ANNONCEURS
// ============================================================================

/**
 * Annonceur dans Firestore
 * @description Entité cliente principale
 */
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

/**
 * Marque dans Firestore
 * @description Sous-entité d'un annonceur
 */
export interface MarqueFirebase {
  id: string;
  idMarque: string;
  nomMarque: string;
  annonceurRef: string;
  secteur?: string;
  statutSandbox?: 'Actif' | 'Inactif';
}

// ============================================================================
// RÉFÉRENTIELS MÉDIA
// ============================================================================

/**
 * Format publicitaire dans Firestore
 * @description Spécifications techniques d'un format
 */
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

/**
 * Canal média dans Firestore
 * @description Canal de diffusion (Display, Search, Social, etc.)
 */
export interface CanalFirebase {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

/**
 * Modèle d'achat dans Firestore
 * @description Type de facturation (CPM, CPC, etc.)
 */
export interface BuyingModelFirebase {
  id: string;
  name: string;
  description?: string;
  unit: string;
}

// ============================================================================
// TYPES ENRICHIS POUR L'APPLICATION
// ============================================================================

/**
 * Plan média enrichi avec toutes ses données liées
 * @description Vue complète pour l'affichage
 */
export interface MediaPlanEnriched {
  plan: MediaPlanFirebase;
  annonceur: AnnonceurFirebase | null;
  marques: MarqueFirebase[];
  insertions: InsertionFirebase[];
  formats: FormatFirebase[];
}

/**
 * Données d'édition pour le formulaire de plan média
 * @description Structure optimisée pour les formulaires
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
 * @description Structure pour l'édition d'une ligne
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
 * @description Payload pour la création d'une insertion
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

// ============================================================================
// HELPERS - Fonctions utilitaires
// ============================================================================

/**
 * Convertit un timestamp Firebase en Date JavaScript
 * @param timestamp - Timestamp Firestore
 * @returns Date JavaScript
 */
export function timestampToDate(timestamp: FirebaseTimestamp): Date {
  return new Date(timestamp.seconds * 1000);
}

/**
 * Convertit une Date JavaScript en timestamp Firebase
 * @param date - Date JavaScript
 * @returns Timestamp Firestore
 */
export function dateToTimestamp(date: Date): FirebaseTimestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  };
}

/**
 * Calcule le coût estimé d'une insertion
 * @param modeleAchat - Type de modèle d'achat
 * @param coutUnitaire - Coût unitaire
 * @param quantiteAchetee - Quantité achetée
 * @returns Coût total estimé
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

/**
 * Formate un timestamp Firebase en string lisible
 * @param timestamp - Timestamp Firestore
 * @param locale - Locale pour le formatage (défaut: 'fr-FR')
 * @returns String formatée
 */
export function formatFirebaseDate(
  timestamp: FirebaseTimestamp,
  locale: string = 'fr-FR'
): string {
  const date = timestampToDate(timestamp);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Vérifie si un timestamp Firebase est dans le passé
 * @param timestamp - Timestamp Firestore
 * @returns true si la date est passée
 */
export function isFirebaseDatePast(timestamp: FirebaseTimestamp): boolean {
  const date = timestampToDate(timestamp);
  return date < new Date();
}

/**
 * Calcule la durée entre deux timestamps Firebase en jours
 * @param start - Timestamp de début
 * @param end - Timestamp de fin
 * @returns Nombre de jours
 */
export function getFirebaseDateDiffInDays(
  start: FirebaseTimestamp,
  end: FirebaseTimestamp
): number {
  const startDate = timestampToDate(start);
  const endDate = timestampToDate(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
