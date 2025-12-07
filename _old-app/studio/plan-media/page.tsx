'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, 
  Target, Zap, Filter, Download, Share2, 
  Layout, Eye, Layers, CreditCard, Hash,
  AlertCircle, CheckCircle2, PieChart as PieChartIcon,
  ChevronDown, Search, Briefcase,
  Activity, MousePointer, Users
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  collection, query, where, onSnapshot, getDocs, orderBy
} from 'firebase/firestore';
import { 
  db, 
  MEDIA_PLANS_COLLECTION, 
  INSERTIONS_COLLECTION, 
  CHANNELS_COLLECTION,
  CLIENTS_COLLECTION,
  BRANDS_COLLECTION,
  FORMATS_COLLECTION,
  BUYING_MODELS_COLLECTION
} from '../../lib/firebase';
import { 
  InsertionEntity, 
  MediaPlanEntity,
  MediaChannelEntity,
  ClientEntity,
  BrandEntity,
  MediaFormatEntity,
  BuyingModelEntity
} from '../../types/agence';
import { 
  calculatePlanMetrics,
  CalculationContext,
  formatCurrency,
  formatLargeNumber,
  formatPercentage
} from '../../lib/mediaCalculations';

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PLANNED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    LIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse',
    ENDED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PAUSED: 'bg-red-500/10 text-red-400 border-red-500/20',
    VALIDATED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ARCHIVED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.ENDED}`}>
      {status}
    </span>
  );
};

const KPIBox = ({ label, value, subvalue, icon: Icon, color }: any) => (
  <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300">
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
    
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
    
    {subvalue && (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp size={14} className={`text-${color}-400`} />
        <span className="text-slate-400">{subvalue}</span>
      </div>
    )}
  </div>
);

const DetailCard = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-lg ${className}`}>
    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
      <Icon className="text-indigo-400" size={18} />
      <h3 className="font-bold text-white">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

// View modes
type ViewMode = 'compact' | 'standard' | 'detailed';

// Utility functions (using calculation engine)
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
};
export default function MediaPlanPage() {
  const [plans, setPlans] = useState<MediaPlanEntity[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [insertions, setInsertions] = useState<InsertionEntity[]>([]);
  const [channels, setChannels] = useState<Record<string, MediaChannelEntity>>({});
  const [clients, setClients] = useState<Record<string, ClientEntity>>({});
  const [brands, setBrands] = useState<Record<string, BrandEntity>>({});
  const [formats, setFormats] = useState<Record<string, MediaFormatEntity>>({});
  const [buyingModels, setBuyingModels] = useState<Record<string, BuyingModelEntity>>({});
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  // Fetch Metadata (Channels, Clients, Brands, Formats)
  useEffect(() => {
    const fetchMetadata = async () => {
      // Fetch Channels
      const channelsSnapshot = await getDocs(collection(db, CHANNELS_COLLECTION));
      const channelMap: Record<string, MediaChannelEntity> = {};
      channelsSnapshot.docs.forEach(doc => {
        channelMap[doc.id] = { id: doc.id, ...doc.data() } as MediaChannelEntity;
      });
      setChannels(channelMap);

      // Fetch Clients
      const clientsSnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
      const clientMap: Record<string, ClientEntity> = {};
      const clientMapByBusinessId: Record<string, ClientEntity> = {};
      clientsSnapshot.docs.forEach(doc => {
        const client = { id: doc.id, ...doc.data() } as ClientEntity;
        clientMap[doc.id] = client;
        // Also map by business_id for easier lookup
        if (client.client_id) {
          clientMapByBusinessId[client.client_id] = client;
        }
      });
      setClients(clientMapByBusinessId);

      // Fetch Brands
      const brandsSnapshot = await getDocs(collection(db, BRANDS_COLLECTION));
      const brandMap: Record<string, BrandEntity> = {};
      brandsSnapshot.docs.forEach(doc => {
        brandMap[doc.id] = { id: doc.id, ...doc.data() } as BrandEntity;
      });
      setBrands(brandMap);

      // Fetch Formats
      const formatsSnapshot = await getDocs(collection(db, FORMATS_COLLECTION));
      const formatMap: Record<string, MediaFormatEntity> = {};
      formatsSnapshot.docs.forEach(doc => {
        formatMap[doc.id] = { id: doc.id, ...doc.data() } as MediaFormatEntity;
      });
      setFormats(formatMap);

      // Fetch Buying Models
      const buyingModelsSnapshot = await getDocs(collection(db, BUYING_MODELS_COLLECTION));
      const buyingModelMap: Record<string, BuyingModelEntity> = {};
      buyingModelsSnapshot.docs.forEach(doc => {
        buyingModelMap[doc.id] = { id: doc.id, ...doc.data() } as BuyingModelEntity;
      });
      setBuyingModels(buyingModelMap);
    };
    fetchMetadata();
  }, []);

  // Fetch Plans
  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, MEDIA_PLANS_COLLECTION), orderBy('createdAt', 'desc')), (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaPlanEntity));
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0 && !selectedPlanId) {
        setSelectedPlanId(fetchedPlans[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Insertions for Selected Plan
  useEffect(() => {
    if (!selectedPlanId) return;

    const unsubscribe = onSnapshot(query(collection(db, INSERTIONS_COLLECTION), where('plan_id', '==', selectedPlanId)), (snapshot) => {
      const fetchedInsertions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InsertionEntity));
      setInsertions(fetchedInsertions);
    });
    return () => unsubscribe();
  }, [selectedPlanId]);

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  // Apply filters to insertions
  const filteredInsertions = useMemo(() => {
    return insertions.filter(ins => {
      if (filterStatus !== 'all' && ins.status !== filterStatus) return false;
      return true;
    });
  }, [insertions, filterStatus]);

  // Create calculation context
  const calculationContext = useMemo<CalculationContext>(() => ({
    plan: selectedPlan!,
    insertions: filteredInsertions,
    client: selectedPlan?.client_id ? clients[selectedPlan.client_id] : undefined,
    buyingModels,
    formats
  }), [selectedPlan, filteredInsertions, clients, buyingModels, formats]);

  // Calculate metrics using the engine
  const calculations = useMemo(() => {
    if (!selectedPlan) return null;
    return calculatePlanMetrics(calculationContext);
  }, [calculationContext]);

  // Generate pie chart data from calculations
  const pieData = useMemo(() => {
    if (!calculations) return [];
    return Object.entries(calculations.budgetByChannel).map(([name, value]) => ({ name, value }));
  }, [calculations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      {/* Header with Glow Effect */}
      <div className="relative mb-8">
        <div className="absolute -left-4 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-2">
              Media Plan Simulator
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <select 
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors w-64"
                >
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {clients[plan.client_id]?.name || 'Client Inconnu'} - {plan.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedPlan?.status === 'VALIDATED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-slate-400 text-sm">
                  {selectedPlan?.status || 'N/A'} • {selectedPlan?.currency || 'MAD'}
                </span>
              </div>
              {selectedPlan?.client_id && (
                <span className="text-indigo-400 text-sm font-medium">
                  Client: {clients[selectedPlan.client_id]?.name || 'Inconnu'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  viewMode === 'compact' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => setViewMode('standard')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  viewMode === 'standard' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  viewMode === 'detailed' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Détaillé
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-sm font-medium">
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 rounded-lg transition-all text-sm font-medium">
              <Target size={16} />
              Optimiser avec IA
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid - Conditional rendering based on view mode */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
          <KPIBox 
            label="Budget Total" 
            value={formatCurrency(calculations?.totalCostHt || 0, selectedPlan?.currency)} 
            subvalue="Budget Planifié"
            icon={DollarSign}
            color="emerald"
          />
          <KPIBox 
            label="Campagnes Actives" 
            value={filteredInsertions.filter(i => ['LIVE', 'PLANNED'].includes(i.status)).length} 
            subvalue={`${filterStatus === 'all' ? filteredInsertions.length : filteredInsertions.length} sur ${insertions.length} planifiées`}
            icon={Activity}
            color="pink"
          />
        </div>
      )}

      {(viewMode === 'standard' || viewMode === 'detailed') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          <KPIBox 
            label="Budget Total" 
            value={formatCurrency(calculations?.totalCostHt || 0, selectedPlan?.currency)} 
            subvalue="Budget Planifié"
            icon={DollarSign}
            color="emerald"
          />
          <KPIBox 
            label="Volume Estimé" 
            value={formatLargeNumber(calculations?.totalImpressions || 0)} 
            subvalue="Impressions Totales"
            icon={Eye}
            color="indigo"
          />
          <KPIBox 
            label="Campagnes Actives" 
            value={filteredInsertions.filter(i => ['LIVE', 'PLANNED'].includes(i.status)).length} 
            subvalue={`${filterStatus === 'all' ? filteredInsertions.length : filteredInsertions.length} sur ${insertions.length} planifiées`}
            icon={Activity}
            color="pink"
          />
        </div>
      )}

      {/* Additional KPIs for detailed view */}
      {viewMode === 'detailed' && calculations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
          <KPIBox 
            label="CPM Moyen" 
            value={formatCurrency(calculations.averageCpm, selectedPlan?.currency)} 
            subvalue="Coût pour 1000 impressions"
            icon={TrendingUp}
            color="blue"
          />
          <KPIBox 
            label="CTR Estimé" 
            value={formatPercentage(calculations.weightedCtr)} 
            subvalue="Taux de clics moyen"
            icon={MousePointer}
            color="purple"
          />
          <KPIBox 
            label="CPA Estimé" 
            value={formatCurrency(calculations.estimatedCpa, selectedPlan?.currency)} 
            subvalue="Coût par acquisition"
            icon={Target}
            color="orange"
          />
          <KPIBox 
            label="Frais Agence" 
            value={formatCurrency(calculations.totalAgencyCommission + calculations.totalManagementFees, selectedPlan?.currency)} 
            subvalue="Commission + Gestion"
            icon={Users}
            color="teal"
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Plan Details Card */}
        <DetailCard title="Informations Plan" icon={Layout}>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedPlan?.description || "Aucune description disponible pour ce plan."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Date Début</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400" />
                  {formatDate(selectedPlan?.start_date)}
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Date Fin</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400" />
                  {formatDate(selectedPlan?.end_date)}
                </div>
              </div>
            </div>
            {selectedPlan?.brand_id && (
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Marque</div>
                <div className="text-white font-medium">
                  {brands[selectedPlan.brand_id]?.name || 'Marque Inconnue'}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Objectifs</div>
              <div className="flex flex-wrap gap-2">
                {selectedPlan?.objectives?.map(obj => (
                  <span key={obj} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                    {obj}
                  </span>
                )) || <span className="text-slate-500 text-sm italic">Aucun objectif défini</span>}
              </div>
            </div>
          </div>
        </DetailCard>

        {/* Budget Distribution Chart */}
        <DetailCard title="Répartition Budget" icon={PieChartIcon}>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => `${value.toLocaleString()} MAD`}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DetailCard>

        {/* Performance Metrics */}
        <DetailCard title="Métriques Clés" icon={BarChart3}>
          <div className="space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Budget Total</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(calculations?.totalCostHt || 0, selectedPlan?.currency)}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Volume Total</div>
              <div className="text-white font-bold text-lg">
                {formatLargeNumber(calculations?.totalImpressions || 0)}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Coût Moyen</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(calculations?.averageCpm || 0, selectedPlan?.currency)}
              </div>
            </div>
          </div>
        </DetailCard>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="text-indigo-400" size={20} />
            Détail des Insertions
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950/50 border border-slate-800 rounded-lg py-1.5 pl-9 pr-8 text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="PLANNED">Planifié</option>
                <option value="LIVE">En cours</option>
                <option value="ENDED">Terminé</option>
                <option value="PAUSED">En pause</option>
                <option value="DRAFT">Brouillon</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-slate-950/50 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="px-6 py-4">Canal & Support</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Modèle d'Achat</th>
                <th className="px-6 py-4 text-right">Volume Estimé</th>
                <th className="px-6 py-4 text-right">Prix Unitaire</th>
                <th className="px-6 py-4 text-right">Budget Total</th>
                <th className="px-6 py-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredInsertions.length > 0 ? (
                filteredInsertions.map((insertion) => {
                  const channel = channels[insertion.channel_id];
                  const format = insertion.format_id ? formats[insertion.format_id] : undefined;
                  const buyingModel = insertion.buying_model_id ? buyingModels[insertion.buying_model_id] : undefined;
                  const channelName = channel?.name || 'Inconnu';
                  const formatName = format?.name || 'N/A';
                  const buyingModelName = buyingModel?.name || insertion.buying_model_id || 'N/A';
                  
                  return (
                    <tr 
                      key={insertion.id} 
                      className="group hover:bg-slate-800/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-800 text-indigo-400`}>
                            <Hash size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-white">{channelName}</div>
                            <div className="text-xs text-slate-500">{insertion.support}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layout size={14} className="text-slate-500" />
                          <span className="text-slate-300 text-sm font-medium">
                            {formatName}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                          <CreditCard size={12} />
                          {buyingModelName}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right font-mono text-slate-300">
                        {(insertion.quantity || 0).toLocaleString()}
                      </td>
                      
                      <td className="px-6 py-4 text-right font-mono text-slate-400">
                        {(insertion.unit_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-slate-600">MAD</span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-400 font-mono">
                          {(insertion.total_cost_ht || 0).toLocaleString()} MAD
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={insertion.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Layers size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aucune insertion trouvée pour ce plan.</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-950/30 border-t border-slate-800 font-bold">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-right text-slate-400 uppercase text-xs tracking-wider">
                  Total Estimé HT
                </td>
                <td className="px-6 py-4 text-right text-xl text-white">
                  {formatCurrency(calculations?.totalCostHt || 0, selectedPlan?.currency)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
