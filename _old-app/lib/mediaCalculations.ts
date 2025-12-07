import { 
  MediaPlanEntity, 
  InsertionEntity, 
  AgencyFeesConfig,
  ClientEntity,
  BuyingModelEntity,
  MediaFormatEntity
} from '../types/agence';

// ============================================================================
// CALCULATION ENGINE - Moteur de Calcul Média
// ============================================================================

export interface CalculationContext {
  plan: MediaPlanEntity;
  insertions: InsertionEntity[];
  client?: ClientEntity;
  buyingModels: Record<string, BuyingModelEntity>;
  formats: Record<string, MediaFormatEntity>;
}

export interface InsertionCalculations {
  // Base metrics
  costHt: number;
  costTtc: number;
  quantity: number;
  
  // Performance estimations
  estimatedImpressions?: number;
  estimatedClicks?: number;
  estimatedViews?: number;
  estimatedConversions?: number;
  
  // Agency fees
  agencyCommission: number;
  managementFees: number;
  additionalFeesTotal: number;
  totalWithFees: number;
  
  // KPIs
  cpm?: number;
  cpc?: number;
  cpcv?: number;
  cpa?: number;
  roi?: number;
}

export interface PlanCalculations {
  // Totals
  totalCostHt: number;
  totalCostTtc: number;
  totalAgencyCommission: number;
  totalManagementFees: number;
  totalAdditionalFees: number;
  grandTotal: number;
  
  // Performance
  totalImpressions: number;
  totalClicks: number;
  totalViews: number;
  totalConversions: number;
  
  // KPIs
  averageCpm: number;
  averageCpc: number;
  weightedCtr: number;
  estimatedCpa: number;
  
  // Distribution
  budgetByChannel: Record<string, number>;
  budgetByFormat: Record<string, number>;
  budgetByStatus: Record<string, number>;
  
  // Agency fees breakdown
  feesBreakdown: {
    commission: number;
    management: number;
    additional: Array<{ name: string; amount: number }>;
  };
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calcule le coût d'une insertion selon son modèle d'achat
 */
export function calculateInsertionCost(
  insertion: InsertionEntity,
  buyingModel: BuyingModelEntity | undefined
): number {
  if (!buyingModel) return insertion.total_cost_ht || 0;
  
  const code = buyingModel.code?.toUpperCase();
  const unitCost = insertion.unit_cost || 0;
  const quantity = insertion.quantity || 0;
  
  switch (code) {
    case 'FORFAIT':
    case 'FLAT':
      return unitCost; // Le coût unitaire EST le forfait
    
    case 'CPM':
      return (quantity / 1000) * unitCost;
    
    case 'CPC':
    case 'CPV':
    case 'CPA':
    case 'CPL':
    default:
      return unitCost * quantity;
  }
}

/**
 * Calcule les frais agence pour une insertion
 */
export function calculateAgencyFees(
  costHt: number,
  feesConfig: AgencyFeesConfig
): {
  commission: number;
  management: number;
  additional: number;
  total: number;
} {
  const commission = costHt * (feesConfig.commission_rate / 100);
  
  let management = 0;
  if (feesConfig.management_fee_type === 'percent') {
    management = costHt * (feesConfig.management_fee_value / 100);
  } else {
    management = feesConfig.management_fee_value;
  }
  
  const additional = (feesConfig.additional_fees || []).reduce((sum, fee) => {
    if (fee.type === 'percent') {
      return sum + (costHt * (fee.value / 100));
    } else {
      return sum + fee.value;
    }
  }, 0);
  
  return {
    commission,
    management,
    additional,
    total: commission + management + additional
  };
}

/**
 * Estime les performances d'une insertion
 */
export function estimateInsertionPerformance(
  insertion: InsertionEntity,
  buyingModel: BuyingModelEntity | undefined,
  benchmarks: {
    ctr_display?: number;
    ctr_search?: number;
    vtr_video?: number;
    conversion_rate?: number;
  } = {}
): {
  impressions?: number;
  clicks?: number;
  views?: number;
  conversions?: number;
} {
  const code = buyingModel?.code?.toUpperCase();
  const quantity = insertion.quantity || 0;
  
  let impressions: number | undefined;
  let clicks: number | undefined;
  let views: number | undefined;
  let conversions: number | undefined;
  
  // Base metrics
  if (code === 'CPM' || code === 'CPV') {
    impressions = quantity;
  } else if (code === 'CPC') {
    clicks = quantity;
    // Estimate impressions from CTR
    const ctr = benchmarks.ctr_display || 0.002; // 0.2% default
    impressions = clicks / ctr;
  } else if (code === 'CPA' || code === 'CPL') {
    conversions = quantity;
    // Estimate clicks from conversion rate
    const convRate = benchmarks.conversion_rate || 0.02; // 2% default
    clicks = conversions / convRate;
    const ctr = benchmarks.ctr_display || 0.002;
    impressions = clicks / ctr;
  }
  
  // Video views for CPV
  if (code === 'CPV' && impressions) {
    const vtr = benchmarks.vtr_video || 0.45; // 45% default
    views = impressions * vtr;
  }
  
  // Calculate derived metrics if not directly available
  if (impressions && !clicks) {
    const ctr = benchmarks.ctr_display || 0.002;
    clicks = impressions * ctr;
  }
  
  if (clicks && !conversions) {
    const convRate = benchmarks.conversion_rate || 0.02;
    conversions = clicks * convRate;
  }
  
  return {
    impressions: impressions ? Math.round(impressions) : undefined,
    clicks: clicks ? Math.round(clicks) : undefined,
    views: views ? Math.round(views) : undefined,
    conversions: conversions ? Math.round(conversions) : undefined
  };
}

// ============================================================================
// MAIN CALCULATION ENGINE
// ============================================================================

/**
 * Calcule toutes les métriques pour un plan média
 */
export function calculatePlanMetrics(context: CalculationContext): PlanCalculations {
  const { plan, insertions, buyingModels, formats } = context;
  
  // Initialize totals
  let totalCostHt = 0;
  let totalAgencyCommission = 0;
  let totalManagementFees = 0;
  let totalAdditionalFees = 0;
  
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalViews = 0;
  let totalConversions = 0;
  
  const budgetByChannel: Record<string, number> = {};
  const budgetByFormat: Record<string, number> = {};
  const budgetByStatus: Record<string, number> = {};
  
  // Calculate for each insertion
  insertions.forEach(insertion => {
    const buyingModel = buyingModels[insertion.buying_model_id];
    const format = formats[insertion.format_id || ''];
    
    // Cost calculation
    const costHt = calculateInsertionCost(insertion, buyingModel);
    totalCostHt += costHt;
    
    // Agency fees
    const feesConfig = plan.agency_fees || context.client?.default_agency_fees || {
      commission_rate: 15,
      management_fee_type: 'percent' as const,
      management_fee_value: 5,
      additional_fees: []
    };
    
    const fees = calculateAgencyFees(costHt, feesConfig);
    totalAgencyCommission += fees.commission;
    totalManagementFees += fees.management;
    totalAdditionalFees += fees.additional;
    
    // Performance estimates
    const performance = estimateInsertionPerformance(insertion, buyingModel, plan.default_benchmarks || {});
    totalImpressions += performance.impressions || 0;
    totalClicks += performance.clicks || 0;
    totalViews += performance.views || 0;
    totalConversions += performance.conversions || 0;
    
    // Distribution tracking
    const channelName = buyingModel?.name || 'Autre';
    const formatName = format?.name || 'N/A';
    
    budgetByChannel[channelName] = (budgetByChannel[channelName] || 0) + costHt;
    budgetByFormat[formatName] = (budgetByFormat[formatName] || 0) + costHt;
    budgetByStatus[insertion.status] = (budgetByStatus[insertion.status] || 0) + costHt;
  });
  
  // Calculate totals and KPIs
  const totalCostTtc = totalCostHt * 1.2; // TVA 20%
  const grandTotal = totalCostTtc + totalAgencyCommission + totalManagementFees + totalAdditionalFees;
  
  const averageCpm = totalImpressions > 0 ? (totalCostHt / totalImpressions) * 1000 : 0;
  const averageCpc = totalClicks > 0 ? totalCostHt / totalClicks : 0;
  const weightedCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const estimatedCpa = totalConversions > 0 ? totalCostHt / totalConversions : 0;
  
  return {
    totalCostHt,
    totalCostTtc,
    totalAgencyCommission,
    totalManagementFees,
    totalAdditionalFees,
    grandTotal,
    totalImpressions,
    totalClicks,
    totalViews,
    totalConversions,
    averageCpm,
    averageCpc,
    weightedCtr,
    estimatedCpa,
    budgetByChannel,
    budgetByFormat,
    budgetByStatus,
    feesBreakdown: {
      commission: totalAgencyCommission,
      management: totalManagementFees,
      additional: context.plan.agency_fees?.additional_fees?.map(fee => ({
        name: fee.name,
        amount: fee.type === 'percent' ? (totalCostHt * fee.value / 100) : fee.value
      })) || []
    }
  };
}

/**
 * Calcule les métriques détaillées pour une seule insertion
 */
export function calculateInsertionMetrics(
  insertion: InsertionEntity,
  context: Pick<CalculationContext, 'plan' | 'client' | 'buyingModels' | 'formats'>
): InsertionCalculations {
  const buyingModel = context.buyingModels[insertion.buying_model_id];
  
  // Base cost
  const costHt = calculateInsertionCost(insertion, buyingModel);
  const costTtc = costHt * 1.2; // TVA 20%
  
  // Agency fees
  const feesConfig = context.plan.agency_fees || context.client?.default_agency_fees || {
    commission_rate: 15,
    management_fee_type: 'percent' as const,
    management_fee_value: 5,
    additional_fees: []
  };
  
  const fees = calculateAgencyFees(costHt, feesConfig);
  
  // Performance estimates
  const performance = estimateInsertionPerformance(insertion, buyingModel, context.plan.default_benchmarks || {});
  
  // Calculate KPIs
  const cpm = performance.impressions ? (costHt / performance.impressions) * 1000 : undefined;
  const cpc = performance.clicks ? costHt / performance.clicks : undefined;
  const cpcv = performance.views ? costHt / performance.views : undefined;
  const cpa = performance.conversions ? costHt / performance.conversions : undefined;
  
  return {
    costHt,
    costTtc,
    quantity: insertion.quantity || 0,
    estimatedImpressions: performance.impressions,
    estimatedClicks: performance.clicks,
    estimatedViews: performance.views,
    estimatedConversions: performance.conversions,
    agencyCommission: fees.commission,
    managementFees: fees.management,
    additionalFeesTotal: fees.additional,
    totalWithFees: costHt + fees.total,
    cpm,
    cpc,
    cpcv,
    cpa,
    roi: cpa && cpa > 0 ? (100 / cpa) * 100 : undefined // Simple ROI estimation
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formate un montant en devise
 */
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currency === 'MAD' ? 'MAD' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('MAD', 'MAD');
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formate un grand nombre avec unités
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calcule le score de performance d'un plan (0-100)
 */
export function calculatePerformanceScore(calculations: PlanCalculations): number {
  let score = 50; // Base score
  
  // Budget efficiency
  if (calculations.averageCpm > 0 && calculations.averageCpm < 50) score += 10;
  if (calculations.weightedCtr > 0.002) score += 10; // > 0.2% CTR
  if (calculations.estimatedCpa > 0 && calculations.estimatedCpa < 100) score += 10;
  
  // Channel diversity
  const channelCount = Object.keys(calculations.budgetByChannel).length;
  if (channelCount >= 3) score += 10;
  if (channelCount >= 5) score += 10;
  
  // Status distribution
  const activeRatio = (calculations.budgetByStatus['LIVE'] || 0) / calculations.totalCostHt;
  if (activeRatio > 0.5) score += 10;
  
  return Math.min(100, score);
}
