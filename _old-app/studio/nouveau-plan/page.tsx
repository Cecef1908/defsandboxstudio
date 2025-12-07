'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Save, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Target, Home, Layout, Trash2, Check, Eye, MousePointerClick, PlayCircle, 
  Settings, AlertCircle, BarChart3, TrendingUp, X, Calendar, Building2, 
  Tag, DollarSign, Percent, Users, Zap, Sparkles, Briefcase, Globe
} from 'lucide-react';

import { db, authenticateUser } from '../../lib/firebase';
import { 
  CLIENTS_COLLECTION, ADVERTISERS_COLLECTION, BRANDS_COLLECTION,
  CHANNELS_COLLECTION, FORMATS_COLLECTION, MEDIA_PLANS_COLLECTION, INSERTIONS_COLLECTION
} from '../../lib/collections';
import { collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import StudioLayout from "../../components/StudioLayout"; 
import { useAgenceDesign } from "../../lib/useAgenceDesign";

// ============================================================================
// TYPES
// ============================================================================
interface AdditionalFee {
  id: string;
  name: string;
  type: "percent" | "flat";
  value: number;
  description?: string;
}

interface AgencyFeesConfig {
  commission_rate: number; // % sur média (ex: 15)
  management_fee_type: "percent" | "flat";
  management_fee_value: number; // % ou montant fixe
  additional_fees: AdditionalFee[];
}

interface PlanFormData {
  name: string;
  description: string;
  client_id: string;
  advertiser_id: string;
  brand_id: string;
  objectives: string[];
  start_date: string;
  end_date: string;
  currency: string;
  // Lien de redirection par défaut (hérité par les insertions)
  default_redirect_url: string;
  // Nouvelle structure de frais d'agence
  agency_fees: AgencyFeesConfig;
  show_fees: boolean;
  show_commission: boolean;
  show_additional_fees: boolean;
  default_benchmarks: {
    ctr_display: number;
    ctr_search: number;
    vtr_video: number;
    conversion_rate: number;
  };
}

interface DraftInsertion {
  id: string;
  name: string; // Libellé personnalisé (auto-généré si vide)
  channel_id: string;
  format_ids: string[]; // MULTI-SELECT: plusieurs formats possibles
  buying_model: string;
  unit_cost: number;
  quantity: number;
  total_cost: number;
  // Dates spécifiques (optionnel - sinon hérite du plan)
  use_custom_dates: boolean;
  start_date: string;
  end_date: string;
  // Options avancées
  notes: string;
  redirect_url: string; // URL de redirection spécifique
  targeting_notes: string; // Notes de ciblage (simplifié pour MVP)
  // UI State
  expanded: boolean;
  showAdvanced: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const OBJECTIVES = [
  { id: 'AWARENESS', label: 'Notoriété', icon: Eye, color: 'blue', desc: 'Faire connaître la marque' },
  { id: 'TRAFFIC', label: 'Trafic', icon: MousePointerClick, color: 'purple', desc: 'Générer des visites' },
  { id: 'ENGAGEMENT', label: 'Engagement', icon: Users, color: 'pink', desc: 'Interactions et partages' },
  { id: 'LEAD', label: 'Leads', icon: Target, color: 'orange', desc: 'Collecter des contacts' },
  { id: 'CONVERSION', label: 'Conversion', icon: Zap, color: 'emerald', desc: 'Générer des ventes' },
];

const BUYING_MODELS = [
  { id: 'CPM', label: 'CPM', desc: 'Coût par Mille impressions' },
  { id: 'CPC', label: 'CPC', desc: 'Coût par Clic' },
  { id: 'CPV', label: 'CPV', desc: 'Coût par Vue vidéo' },
  { id: 'CPA', label: 'CPA', desc: 'Coût par Action' },
  { id: 'FLAT', label: 'Forfait', desc: 'Prix fixe' },
];

const DEFAULT_AGENCY_FEES: AgencyFeesConfig = {
  commission_rate: 15,
  management_fee_type: "percent",
  management_fee_value: 5,
  additional_fees: [],
};

const DEFAULT_PLAN: PlanFormData = {
  name: '',
  description: '',
  client_id: '',
  advertiser_id: '',
  brand_id: '',
  objectives: [],
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'MAD',
  default_redirect_url: '',
  agency_fees: { ...DEFAULT_AGENCY_FEES },
  show_fees: true,
  show_commission: true,
  show_additional_fees: true,
  default_benchmarks: {
    ctr_display: 0.2,
    ctr_search: 5.0,
    vtr_video: 45.0,
    conversion_rate: 2.0,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function NewPlanPage() {
  const router = useRouter();
  const design = useAgenceDesign();
  const mainLogoUrl = design?.settings?.logoLightUrl || design?.settings?.logoDarkUrl || null;

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'insertions' | 'settings'>('info');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [plan, setPlan] = useState<PlanFormData>(DEFAULT_PLAN);
  const [insertions, setInsertions] = useState<DraftInsertion[]>([]);

  // Reference Data
  const [clients, setClients] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [formats, setFormats] = useState<any[]>([]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        await authenticateUser();
        const [clientsSnap, advSnap, brandsSnap, channelsSnap, formatsSnap] = await Promise.all([
          getDocs(collection(db, CLIENTS_COLLECTION)),
          getDocs(collection(db, ADVERTISERS_COLLECTION)),
          getDocs(collection(db, BRANDS_COLLECTION)),
          getDocs(collection(db, CHANNELS_COLLECTION)),
          getDocs(collection(db, FORMATS_COLLECTION)),
        ]);

        setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; name?: string; [key: string]: any })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        setAdvertisers(advSnap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; name?: string; [key: string]: any })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        setBrands(brandsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setChannels(channelsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((c: any) => !c.is_regie));
        setFormats(formatsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement:', err);
        setError('Impossible de charger les données');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const filteredAdvertisers = useMemo(() => 
    plan.client_id ? advertisers.filter(a => a.client_id === plan.client_id) : advertisers
  , [plan.client_id, advertisers]);

  const filteredBrands = useMemo(() => {
    if (plan.advertiser_id) return brands.filter(b => b.advertiser_id === plan.advertiser_id);
    if (plan.client_id) return brands.filter(b => b.client_id === plan.client_id);
    return brands;
  }, [plan.client_id, plan.advertiser_id, brands]);

  const totalBudget = useMemo(() => 
    insertions.reduce((sum, ins) => sum + (ins.total_cost || 0), 0)
  , [insertions]);

  const totalWithFees = useMemo(() => {
    let total = totalBudget;
    // Commission agence
    if (plan.show_commission) {
      total += totalBudget * (plan.agency_fees.commission_rate / 100);
    }
    // Frais de gestion
    if (plan.show_fees) {
      if (plan.agency_fees.management_fee_type === "percent") {
        total += totalBudget * (plan.agency_fees.management_fee_value / 100);
      } else {
        total += plan.agency_fees.management_fee_value;
      }
    }
    // Frais additionnels
    if (plan.show_additional_fees && plan.agency_fees.additional_fees) {
      plan.agency_fees.additional_fees.forEach(fee => {
        if (fee.type === "percent") {
          total += totalBudget * (fee.value / 100);
        } else {
          total += fee.value;
        }
      });
    }
    return total;
  }, [totalBudget, plan.agency_fees, plan.show_fees, plan.show_commission, plan.show_additional_fees]);

  const isValid = useMemo(() => 
    plan.name.trim() !== '' && plan.objectives.length > 0
  , [plan.name, plan.objectives]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleAddInsertion = () => {
    const newInsertion: DraftInsertion = {
      id: `draft_${Date.now()}`,
      name: '',
      channel_id: channels[0]?.id || '',
      format_ids: [], // Multi-select
      buying_model: 'CPM',
      unit_cost: 0,
      quantity: 0,
      total_cost: 0,
      use_custom_dates: false,
      start_date: plan.start_date,
      end_date: plan.end_date,
      notes: '',
      redirect_url: '',
      targeting_notes: '',
      expanded: true,
      showAdvanced: false,
    };
    setInsertions([...insertions, newInsertion]);
  };

  const handleUpdateInsertion = (id: string, field: keyof DraftInsertion, value: any) => {
    setInsertions(prev => prev.map(ins => {
      if (ins.id !== id) return ins;
      const updated = { ...ins, [field]: value };
      
      // Recalculate total cost
      if (field === 'unit_cost' || field === 'quantity' || field === 'buying_model') {
        const qty = Number(updated.quantity) || 0;
        const cost = Number(updated.unit_cost) || 0;
        if (updated.buying_model === 'CPM') {
          updated.total_cost = (qty / 1000) * cost;
        } else if (updated.buying_model === 'FLAT') {
          updated.total_cost = cost;
        } else {
          updated.total_cost = qty * cost;
        }
      }
      
      // Auto-generate name if empty and channel selected
      if (!updated.name && updated.channel_id) {
        const channel = channels.find((c: any) => c.id === updated.channel_id);
        const formatNames = updated.format_ids
          .map((fid: string) => formats.find((f: any) => f.id === fid)?.name)
          .filter(Boolean)
          .join(', ');
        updated.name = `${channel?.name || 'Canal'}${formatNames ? ` - ${formatNames}` : ''}`;
      }
      
      return updated;
    }));
  };

  const handleDeleteInsertion = (id: string) => {
    setInsertions(prev => prev.filter(ins => ins.id !== id));
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);

    try {
      await authenticateUser();
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();

      // Generate Plan ID
      const year = new Date().getFullYear();
      const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const random = Math.floor(1000 + Math.random() * 9000);
      const planId = `mp_${year}_Q${quarter}_${random}`;

      // Create Plan Document
      const planRef = doc(db, MEDIA_PLANS_COLLECTION, planId);
      const planData = {
        id: planId,
        plan_id: planId.toUpperCase(),
        planName: plan.name,
        name: plan.name,
        description: plan.description,
        client_id: plan.client_id,
        advertiser_id: plan.advertiser_id,
        brand_id: plan.brand_id,
        objectives: plan.objectives,
        objectifPrincipal: plan.objectives.slice(0, 1),
        dateDebut: { seconds: Math.floor(new Date(plan.start_date).getTime() / 1000), nanoseconds: 0 },
        dateFin: { seconds: Math.floor(new Date(plan.end_date).getTime() / 1000), nanoseconds: 0 },
        start_date: plan.start_date,
        end_date: plan.end_date,
        currency: plan.currency,
        default_redirect_url: plan.default_redirect_url || null,
        total_budget_ht: totalBudget,
        budgetTotal: totalBudget,
        agency_fees: plan.agency_fees,
        show_fees: plan.show_fees,
        show_commission: plan.show_commission,
        show_additional_fees: plan.show_additional_fees,
        default_benchmarks: plan.default_benchmarks,
        status: 'DRAFT',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      batch.set(planRef, planData);

      // Create Insertions
      insertions.forEach((ins, idx) => {
        const insId = `ins_${planId}_${idx + 1}`;
        const insRef = doc(db, INSERTIONS_COLLECTION, insId);
        const channel = channels.find((c: any) => c.id === ins.channel_id);
        const formatNames = ins.format_ids
          .map((fid: string) => formats.find((f: any) => f.id === fid)?.name)
          .filter(Boolean);
        
        batch.set(insRef, {
          id: insId,
          insertion_id: insId.toUpperCase(),
          plan_id: planId,
          planRef: planId,
          name: ins.name || `${channel?.name || 'Canal'}${formatNames.length ? ` - ${formatNames.join(', ')}` : ''}`,
          support: channel?.name || '',
          canal: channel?.name || '',
          channel_id: ins.channel_id,
          format: formatNames.join(', ') || '',
          format_ids: ins.format_ids,
          modeleAchat: ins.buying_model,
          buying_model_id: `bm_${ins.buying_model.toLowerCase()}`,
          coutUnitaire: ins.unit_cost,
          unit_cost: ins.unit_cost,
          quantiteAchetee: ins.quantity,
          quantity: ins.quantity,
          coutEstime: ins.total_cost,
          total_cost_ht: ins.total_cost,
          // Dates: utiliser les dates custom si activées, sinon celles du plan
          start_date: ins.use_custom_dates ? ins.start_date : plan.start_date,
          end_date: ins.use_custom_dates ? ins.end_date : plan.end_date,
          use_custom_dates: ins.use_custom_dates,
          notes: ins.notes,
          redirect_url: ins.redirect_url || null,
          targeting_notes: ins.targeting_notes || null,
          status: 'PLANNED',
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });

      await batch.commit();
      router.push(`/studio/plan-media?planId=${planId}`);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la création: ' + err.message);
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const renderHeader = () => (
    <div className="h-16 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {mainLogoUrl ? (
          <img src={mainLogoUrl} alt="Logo" className="h-8 w-auto" />
        ) : (
          <div className="h-8 px-3 bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg flex items-center text-white font-bold text-sm">
            STUDIO
          </div>
        )}
        <div className="h-6 w-px bg-slate-700" />
        <div>
          <h1 className="text-white font-bold text-lg">Nouveau Plan Média</h1>
          <p className="text-slate-500 text-xs">Créez votre campagne en quelques clics</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/studio/portefeuille" className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors">
          Annuler
        </Link>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
            isValid && !saving
              ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/25'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Création...' : 'Créer le Plan'}
        </button>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
      {[
        { id: 'info', label: 'Informations', icon: Briefcase },
        { id: 'insertions', label: `Insertions (${insertions.length})`, icon: Layout },
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === tab.id
              ? 'bg-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderInfoTab = () => (
    <div className="space-y-4">
      {/* Nom & Description */}
      <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Tag size={16} className="text-pink-500" />
          Informations Principales
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">
              Nom de la campagne <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={plan.name}
              onChange={e => setPlan({ ...plan, name: e.target.value })}
              placeholder="Ex: Lancement Produit Q1 2025"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Description</label>
            <textarea
              value={plan.description}
              onChange={e => setPlan({ ...plan, description: e.target.value })}
              placeholder="Objectifs, contexte, notes importantes..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Client / Annonceur / Marque */}
      <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Building2 size={16} className="text-pink-500" />
          Client & Annonceur
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Client</label>
            <select
              value={plan.client_id}
              onChange={e => setPlan({ ...plan, client_id: e.target.value, advertiser_id: '', brand_id: '' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">Tous les clients</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Annonceur</label>
            <select
              value={plan.advertiser_id}
              onChange={e => setPlan({ ...plan, advertiser_id: e.target.value, brand_id: '' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {filteredAdvertisers.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Marque</label>
            <select
              value={plan.brand_id}
              onChange={e => setPlan({ ...plan, brand_id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {filteredBrands.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dates & URL */}
      <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-pink-500" />
          Période & Redirection
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Date de début</label>
            <input
              type="date"
              value={plan.start_date}
              onChange={e => setPlan({ ...plan, start_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Date de fin</label>
            <input
              type="date"
              value={plan.end_date}
              onChange={e => setPlan({ ...plan, end_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">URL de redirection par défaut</label>
            <input
              type="url"
              value={plan.default_redirect_url}
              onChange={e => setPlan({ ...plan, default_redirect_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Target size={16} className="text-pink-500" />
          Objectifs <span className="text-pink-500">*</span>
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {OBJECTIVES.map(obj => {
            const isSelected = plan.objectives.includes(obj.id);
            const isPrimary = plan.objectives[0] === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => {
                  const newObjectives = isSelected
                    ? plan.objectives.filter(o => o !== obj.id)
                    : [...plan.objectives, obj.id];
                  setPlan({ ...plan, objectives: newObjectives });
                }}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? `bg-${obj.color}-500/20 border-${obj.color}-500`
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                }`}
              >
                <obj.icon size={20} className={`mx-auto mb-1 ${isSelected ? `text-${obj.color}-400` : 'text-slate-500'}`} />
                <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {obj.label}
                </div>
                {isPrimary && (
                  <div className="mt-1 text-[9px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                    Principal
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {plan.objectives.length === 0 && (
          <p className="text-xs text-red-400 mt-2">Sélectionnez au moins un objectif</p>
        )}
      </div>
    </div>
  );

  const renderInsertionsTab = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">Plan Média</h3>
          <p className="text-slate-500 text-sm">Ajoutez vos lignes d'achat média</p>
        </div>
        <button
          onClick={handleAddInsertion}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Ajouter une ligne
        </button>
      </div>

      {/* Empty State */}
      {insertions.length === 0 && (
        <div className="bg-slate-800/30 rounded-xl p-12 border-2 border-dashed border-slate-700 text-center">
          <Layout size={48} className="mx-auto text-slate-600 mb-4" />
          <h4 className="text-white font-bold mb-2">Aucune insertion</h4>
          <p className="text-slate-500 text-sm mb-4">Commencez par ajouter une ligne d'achat média</p>
          <button
            onClick={handleAddInsertion}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>
      )}

      {/* Insertions List */}
      {insertions.map((ins, idx) => (
        <div
          key={ins.id}
          className={`bg-slate-800/30 rounded-xl border transition-all ${
            ins.expanded ? 'border-pink-500/50' : 'border-slate-700/50'
          }`}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => handleUpdateInsertion(ins.id, 'expanded', !ins.expanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm">
                {idx + 1}
              </div>
              <div>
                <div className="text-white font-medium">
                  {ins.name || `Ligne ${idx + 1}`}
                </div>
                <div className="text-slate-500 text-xs flex items-center gap-2">
                  <span>{channels.find((c: any) => c.id === ins.channel_id)?.name || 'Canal'}</span>
                  <span>•</span>
                  <span>{ins.buying_model}</span>
                  {ins.format_ids.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-pink-400/70">
                        {ins.format_ids.length} format{ins.format_ids.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {ins.use_custom_dates && (
                    <>
                      <span>•</span>
                      <Calendar size={10} className="text-blue-400" />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-emerald-400 font-bold">{ins.total_cost.toLocaleString()} MAD</div>
                <div className="text-slate-500 text-xs">
                  {ins.buying_model === 'FLAT' ? 'Forfait' : `${ins.quantity.toLocaleString()} ${ins.buying_model === 'CPM' ? 'impr.' : ins.buying_model === 'CPC' ? 'clics' : 'unités'}`}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteInsertion(ins.id); }}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              {ins.expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </div>
          </div>

          {/* Expanded Content */}
          {ins.expanded && (
            <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 space-y-4">
              {/* ROW 1: Canal, Formats (multi), Modèle d'achat */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Canal *</label>
                  <select
                    value={ins.channel_id}
                    onChange={e => handleUpdateInsertion(ins.id, 'channel_id', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {channels.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Formats <span className="text-slate-500 font-normal">(multi-sélection)</span>
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 bg-slate-900 border border-slate-700 rounded-lg min-h-[38px]">
                    {ins.format_ids.length === 0 && (
                      <span className="text-slate-500 text-sm">Cliquez pour ajouter...</span>
                    )}
                    {ins.format_ids.map((fid: string) => {
                      const fmt = formats.find((f: any) => f.id === fid);
                      return (
                        <span key={fid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs">
                          {fmt?.name || fid}
                          <button onClick={() => handleUpdateInsertion(ins.id, 'format_ids', ins.format_ids.filter((id: string) => id !== fid))} className="hover:text-pink-200">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value && !ins.format_ids.includes(e.target.value)) {
                        handleUpdateInsertion(ins.id, 'format_ids', [...ins.format_ids, e.target.value]);
                      }
                    }}
                    className="w-full mt-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-400 focus:border-pink-500 focus:outline-none"
                  >
                    <option value="">+ Ajouter un format...</option>
                    {formats
                      .filter((f: any) => !ins.channel_id || f.compatible_channels?.includes(ins.channel_id))
                      .filter((f: any) => !ins.format_ids.includes(f.id))
                      .map((f: any) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Modèle d'achat *</label>
                  <select
                    value={ins.buying_model}
                    onChange={e => handleUpdateInsertion(ins.id, 'buying_model', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  >
                    {BUYING_MODELS.map(bm => (
                      <option key={bm.id} value={bm.id}>{bm.label} - {bm.desc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROW 2: Coût, Quantité, Budget, Libellé */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Coût unitaire ({ins.buying_model === 'CPM' ? 'MAD/1000' : ins.buying_model === 'FLAT' ? 'Forfait' : 'MAD'})
                  </label>
                  <input
                    type="number"
                    value={ins.unit_cost || ''}
                    onChange={e => handleUpdateInsertion(ins.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Quantité {ins.buying_model === 'FLAT' ? <span className="text-slate-600">(N/A)</span> : ''}
                  </label>
                  <input
                    type="number"
                    value={ins.quantity || ''}
                    onChange={e => handleUpdateInsertion(ins.id, 'quantity', parseInt(e.target.value) || 0)}
                    disabled={ins.buying_model === 'FLAT'}
                    placeholder={ins.buying_model === 'CPM' ? 'Impressions' : ins.buying_model === 'CPC' ? 'Clics' : 'Unités'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Budget HT</label>
                  <div className="bg-slate-900/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-400 font-bold text-sm">
                    {ins.total_cost.toLocaleString()} MAD
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Libellé</label>
                  <input
                    type="text"
                    value={ins.name}
                    onChange={e => handleUpdateInsertion(ins.id, 'name', e.target.value)}
                    placeholder="Auto-généré si vide"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggle Options Avancées */}
              <button
                onClick={() => handleUpdateInsertion(ins.id, 'showAdvanced', !ins.showAdvanced)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {ins.showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <Settings size={14} />
                Options avancées
              </button>

              {/* Options Avancées (collapsible) */}
              {ins.showAdvanced && (
                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 space-y-4">
                  {/* Dates spécifiques */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <input
                        type="checkbox"
                        checked={ins.use_custom_dates}
                        onChange={e => handleUpdateInsertion(ins.id, 'use_custom_dates', e.target.checked)}
                        className="rounded"
                      />
                      <Calendar size={14} />
                      Dates spécifiques à cette insertion
                    </label>
                    {ins.use_custom_dates && (
                      <div className="grid grid-cols-2 gap-4 mt-2 ml-6">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Début</label>
                          <input
                            type="date"
                            value={ins.start_date}
                            onChange={e => handleUpdateInsertion(ins.id, 'start_date', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Fin</label>
                          <input
                            type="date"
                            value={ins.end_date}
                            onChange={e => handleUpdateInsertion(ins.id, 'end_date', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL de redirection */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                      URL de redirection spécifique
                    </label>
                    <input
                      type="url"
                      value={ins.redirect_url}
                      onChange={e => handleUpdateInsertion(ins.id, 'redirect_url', e.target.value)}
                      placeholder="https://... (laissez vide pour utiliser l'URL par défaut du plan)"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Notes de ciblage */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                      Notes de ciblage
                    </label>
                    <textarea
                      value={ins.targeting_notes}
                      onChange={e => handleUpdateInsertion(ins.id, 'targeting_notes', e.target.value)}
                      placeholder="Ex: Femmes 25-45, Casablanca, intérêt mode & beauté..."
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Notes générales */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Notes internes</label>
                    <input
                      type="text"
                      value={ins.notes}
                      onChange={e => handleUpdateInsertion(ins.id, 'notes', e.target.value)}
                      placeholder="Notes pour l'équipe..."
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Commission Agence */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Percent size={18} className="text-pink-500" />
          Commission & Frais Agence
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Commission */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 uppercase font-bold">Commission Agence (%)</label>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={plan.show_commission}
                  onChange={e => setPlan({ ...plan, show_commission: e.target.checked })}
                  className="rounded"
                />
                Afficher
              </label>
            </div>
            <input
              type="number"
              value={plan.agency_fees.commission_rate}
              onChange={e => setPlan({ 
                ...plan, 
                agency_fees: { ...plan.agency_fees, commission_rate: parseFloat(e.target.value) || 0 }
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          {/* Frais de gestion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 uppercase font-bold">Frais de Gestion</label>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={plan.show_fees}
                  onChange={e => setPlan({ ...plan, show_fees: e.target.checked })}
                  className="rounded"
                />
                Afficher
              </label>
            </div>
            <div className="flex gap-2">
              <select
                value={plan.agency_fees.management_fee_type}
                onChange={e => setPlan({ 
                  ...plan, 
                  agency_fees: { ...plan.agency_fees, management_fee_type: e.target.value as "percent" | "flat" }
                })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:border-pink-500 focus:outline-none"
              >
                <option value="percent">%</option>
                <option value="flat">MAD</option>
              </select>
              <input
                type="number"
                value={plan.agency_fees.management_fee_value}
                onChange={e => setPlan({ 
                  ...plan, 
                  agency_fees: { ...plan.agency_fees, management_fee_value: parseFloat(e.target.value) || 0 }
                })}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frais Additionnels */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Plus size={18} className="text-pink-500" />
            Frais Additionnels
          </h3>
          <button
            onClick={() => {
              const newFee: AdditionalFee = {
                id: `fee_${Date.now()}`,
                name: '',
                type: 'flat',
                value: 0,
              };
              setPlan({
                ...plan,
                agency_fees: {
                  ...plan.agency_fees,
                  additional_fees: [...plan.agency_fees.additional_fees, newFee]
                }
              });
            }}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>
        
        {plan.agency_fees.additional_fees.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun frais additionnel. Cliquez sur "Ajouter" pour en créer.</p>
        ) : (
          <div className="space-y-3">
            {plan.agency_fees.additional_fees.map((fee, idx) => (
              <div key={fee.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <input
                  type="text"
                  value={fee.name}
                  onChange={e => {
                    const updated = [...plan.agency_fees.additional_fees];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setPlan({ ...plan, agency_fees: { ...plan.agency_fees, additional_fees: updated } });
                  }}
                  placeholder="Nom du frais (ex: Déclinaisons bannières)"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                />
                <select
                  value={fee.type}
                  onChange={e => {
                    const updated = [...plan.agency_fees.additional_fees];
                    updated[idx] = { ...updated[idx], type: e.target.value as "percent" | "flat" };
                    setPlan({ ...plan, agency_fees: { ...plan.agency_fees, additional_fees: updated } });
                  }}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm text-white"
                >
                  <option value="percent">%</option>
                  <option value="flat">MAD</option>
                </select>
                <input
                  type="number"
                  value={fee.value}
                  onChange={e => {
                    const updated = [...plan.agency_fees.additional_fees];
                    updated[idx] = { ...updated[idx], value: parseFloat(e.target.value) || 0 };
                    setPlan({ ...plan, agency_fees: { ...plan.agency_fees, additional_fees: updated } });
                  }}
                  className="w-24 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const updated = plan.agency_fees.additional_fees.filter((_, i) => i !== idx);
                    setPlan({ ...plan, agency_fees: { ...plan.agency_fees, additional_fees: updated } });
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benchmarks */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-pink-500" />
          Benchmarks par Défaut
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">CTR Display (%)</label>
            <input
              type="number"
              step="0.1"
              value={plan.default_benchmarks.ctr_display}
              onChange={e => setPlan({
                ...plan,
                default_benchmarks: { ...plan.default_benchmarks, ctr_display: parseFloat(e.target.value) || 0 }
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">CTR Search (%)</label>
            <input
              type="number"
              step="0.1"
              value={plan.default_benchmarks.ctr_search}
              onChange={e => setPlan({
                ...plan,
                default_benchmarks: { ...plan.default_benchmarks, ctr_search: parseFloat(e.target.value) || 0 }
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">VTR Vidéo (%)</label>
            <input
              type="number"
              step="0.1"
              value={plan.default_benchmarks.vtr_video}
              onChange={e => setPlan({
                ...plan,
                default_benchmarks: { ...plan.default_benchmarks, vtr_video: parseFloat(e.target.value) || 0 }
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Taux Conv. (%)</label>
            <input
              type="number"
              step="0.1"
              value={plan.default_benchmarks.conversion_rate}
              onChange={e => setPlan({
                ...plan,
                default_benchmarks: { ...plan.default_benchmarks, conversion_rate: parseFloat(e.target.value) || 0 }
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Devise */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Globe size={18} className="text-pink-500" />
          Devise
        </h3>
        <select
          value={plan.currency}
          onChange={e => setPlan({ ...plan, currency: e.target.value })}
          className="w-48 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
        >
          <option value="MAD">MAD - Dirham Marocain</option>
          <option value="EUR">EUR - Euro</option>
          <option value="USD">USD - Dollar US</option>
        </select>
      </div>
    </div>
  );

  const renderBudgetSummary = () => {
    // Calcul des montants pour affichage
    const commissionAmount = totalBudget * (plan.agency_fees.commission_rate / 100);
    const managementFeeAmount = plan.agency_fees.management_fee_type === "percent" 
      ? totalBudget * (plan.agency_fees.management_fee_value / 100)
      : plan.agency_fees.management_fee_value;
    
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50 sticky top-24">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-500" />
          Récapitulatif Budget
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Budget Média HT</span>
            <span className="text-white font-medium">{totalBudget.toLocaleString()} {plan.currency}</span>
          </div>
          
          {plan.show_commission && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Commission ({plan.agency_fees.commission_rate}%)</span>
              <span className="text-white font-medium">
                {commissionAmount.toLocaleString()} {plan.currency}
              </span>
            </div>
          )}
          
          {plan.show_fees && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                Frais ({plan.agency_fees.management_fee_type === "percent" 
                  ? `${plan.agency_fees.management_fee_value}%` 
                  : `${plan.agency_fees.management_fee_value} ${plan.currency}`})
              </span>
              <span className="text-white font-medium">
                {managementFeeAmount.toLocaleString()} {plan.currency}
              </span>
            </div>
          )}

          {/* Frais additionnels */}
          {plan.show_additional_fees && plan.agency_fees.additional_fees.map(fee => (
            <div key={fee.id} className="flex justify-between text-sm">
              <span className="text-slate-400">
                {fee.name || "Frais"} ({fee.type === "percent" ? `${fee.value}%` : `${fee.value} ${plan.currency}`})
              </span>
              <span className="text-white font-medium">
                {(fee.type === "percent" ? totalBudget * fee.value / 100 : fee.value).toLocaleString()} {plan.currency}
              </span>
            </div>
          ))}
          
          <div className="border-t border-slate-700 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-2xl font-bold text-emerald-400">
                {totalWithFees.toLocaleString()} {plan.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 uppercase font-bold mb-2">Statistiques</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-white font-bold">{insertions.length}</div>
              <div className="text-slate-500 text-xs">Insertions</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-white font-bold">{plan.objectives.length}</div>
              <div className="text-slate-500 text-xs">Objectifs</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {renderHeader()}
      
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3 space-y-6">
            {renderTabs()}
            
            <div className="min-h-[500px]">
              {activeTab === 'info' && renderInfoTab()}
              {activeTab === 'insertions' && renderInsertionsTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            {renderBudgetSummary()}
          </div>
        </div>
      </div>
    </div>
  );
}
