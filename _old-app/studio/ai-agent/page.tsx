'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, User, Loader2, Save, 
  Layout, Calendar, Target, DollarSign, RefreshCw,
  CheckCircle2, AlertCircle, ChevronRight, Database,
  BrainCircuit, Activity, Command, Monitor, Smartphone,
  Type, FileText, MousePointer, Clock
} from 'lucide-react';
import { 
  db, 
  CHANNELS_COLLECTION, 
  FORMATS_COLLECTION, 
  BUYING_MODELS_COLLECTION, 
  OBJECTIVES_COLLECTION 
} from '../../lib/firebase';
import { 
  InsertionEntity, 
  MediaPlanEntity, 
  MediaChannelEntity,
  MediaFormatEntity,
  BuyingModelEntity,
  CampaignObjectiveEntity,
  TargetingConfig,
  estimateInsertionKPIs
} from '../../types/agence';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// --- TYPES ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relatedPlanId?: string;
  thoughtProcess?: string[]; // AI reasoning steps
}

interface DraftPlan extends Partial<MediaPlanEntity> {
  insertions?: (Partial<InsertionEntity> & {
    estimated_kpis?: {
      impressions: number;
      clicks: number;
      views?: number;
      ctr: number;
    };
    format_details?: MediaFormatEntity;
    suggested_content?: {
      type: string;
      headline: string;
      description: string;
    };
  })[];
  targeting?: TargetingConfig;
  recommendations?: string[];
  aggregated_kpis?: {
    total_reach: number;
    avg_cpm: number;
    avg_ctr: number;
    total_clicks: number;
  };
}

interface KnowledgeBase {
  channels: Record<string, MediaChannelEntity>;
  formats: Record<string, MediaFormatEntity>;
  buyingModels: Record<string, BuyingModelEntity>;
  objectives: Record<string, CampaignObjectiveEntity>;
}

// --- AI LOGIC (Simulated Command Center) ---

const generateAIResponse = async (
  input: string, 
  knowledge: KnowledgeBase
): Promise<{ text: string; planDraft?: DraftPlan; thoughts: string[] }> => {
  const thoughts: string[] = [];
  thoughts.push("Analyse sémantique de la demande...");
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const lowerInput = input.toLowerCase();
  
  // Robust Budget Parsing
  const budgetMatch = input.match(/(\d+)(?:\s?)(k|m|millions|mille)?/i);
  let budget = 50000; // Default substantial budget
  if (budgetMatch) {
    const rawValue = parseInt(budgetMatch[1]);
    const multiplier = budgetMatch[2]?.toLowerCase().startsWith('k') || budgetMatch[2]?.toLowerCase().startsWith('mille') ? 1000 : 
                       budgetMatch[2]?.toLowerCase().startsWith('m') ? 1000000 : 1;
    // Only apply if rawValue is "small" (e.g. 50) implying K, otherwise use raw
    budget = rawValue < 1000 ? rawValue * multiplier : rawValue;
  }
  
  // 1. TARGETING INFERENCE (Enhanced)
  thoughts.push("Déduction du profil d'audience...");
  const targeting: TargetingConfig = {
    geo_countries: ["Maroc"],
    geo_cities: [],
    age_min: 18,
    age_max: 65,
    audience_segments: []
  };

  // Geo
  if (lowerInput.includes("casa")) targeting.geo_cities?.push("Casablanca");
  if (lowerInput.includes("rabat")) targeting.geo_cities?.push("Rabat");
  if (lowerInput.includes("marrakech")) targeting.geo_cities?.push("Marrakech");
  if (lowerInput.includes("tanger")) targeting.geo_cities?.push("Tanger");

  // Demographics & Interests
  let audienceLabel = "Grand Public (18-65+)";
  
  if (lowerInput.includes("jeunes") || lowerInput.includes("gen z") || lowerInput.includes("etudiants")) {
    targeting.age_min = 18;
    targeting.age_max = 25;
    audienceLabel = "Gen Z & Étudiants";
    targeting.audience_segments?.push("Education", "Gaming", "Mode");
  } else if (lowerInput.includes("cadres") || lowerInput.includes("pro") || lowerInput.includes("b2b")) {
    targeting.age_min = 28;
    targeting.age_max = 55;
    audienceLabel = "CSP+ & Décideurs";
    targeting.audience_segments?.push("Business", "Finance", "Management");
  } else if (lowerInput.includes("famille") || lowerInput.includes("parents")) {
    targeting.age_min = 30;
    targeting.age_max = 50;
    audienceLabel = "Familles & Parents";
    targeting.audience_segments?.push("Parenting", "Maison", "Achats");
  }

  // 2. CHANNEL STRATEGY
  thoughts.push("Sélection des canaux via Knowledge Graph...");
  const selectedChannels: MediaChannelEntity[] = [];
  const allChannels = Object.values(knowledge.channels);
  const recommendations: string[] = [];
  
  // Explicit selection
  if (lowerInput.includes('social') || lowerInput.includes('meta') || lowerInput.includes('facebook')) {
    const meta = allChannels.find(c => c.name.toLowerCase().includes('meta') || c.name.toLowerCase().includes('facebook'));
    if (meta) selectedChannels.push(meta);
  }
  if (lowerInput.includes('search') || lowerInput.includes('google')) {
    const google = allChannels.find(c => c.name.toLowerCase().includes('google'));
    if (google) selectedChannels.push(google);
  }
  if (lowerInput.includes('linkedin') || lowerInput.includes('pro')) {
    const linkedin = allChannels.find(c => c.name.toLowerCase().includes('linkedin'));
    if (linkedin) selectedChannels.push(linkedin);
  }
  if (lowerInput.includes('tiktok') || lowerInput.includes('jeune')) {
    const tiktok = allChannels.find(c => c.name.toLowerCase().includes('tiktok'));
    if (tiktok) selectedChannels.push(tiktok);
  }
  
  // Fallback / Smart Defaults
  if (selectedChannels.length === 0) {
    thoughts.push("Aucun canal spécifique détecté. Activation de la stratégie Mix-Média optimisée.");
    
    if ((targeting.age_max || 65) <= 25) {
       // Young audience default
       const tiktok = allChannels.find(c => c.name.toLowerCase().includes('tiktok'));
       const instagram = allChannels.find(c => c.name.toLowerCase().includes('meta') || c.name.toLowerCase().includes('instagram'));
       if (tiktok) selectedChannels.push(tiktok);
       if (instagram) selectedChannels.push(instagram);
       recommendations.push("Focus sur TikTok et Instagram pour maximiser l'affinité avec la cible Gen Z.");
    } else if (targeting.audience_segments?.includes("Business")) {
       // Pro audience default
       const linkedin = allChannels.find(c => c.name.toLowerCase().includes('linkedin'));
       const google = allChannels.find(c => c.name.toLowerCase().includes('google'));
       if (linkedin) selectedChannels.push(linkedin);
       if (google) selectedChannels.push(google);
       recommendations.push("Combinaison LinkedIn + Search pour toucher les décideurs en phase de recherche active.");
    } else {
       // Generic default
       const meta = allChannels.find(c => c.name.toLowerCase().includes('meta'));
       const google = allChannels.find(c => c.name.toLowerCase().includes('google'));
       if (meta) selectedChannels.push(meta);
       if (google) selectedChannels.push(google);
       recommendations.push("Mix classique Meta + Google pour une couverture optimale du marché marocain.");
    }
  } else {
    recommendations.push(`Sélection stratégique de ${selectedChannels.length} canaux pour répondre aux objectifs.`);
  }

  // 3. INSERTION GENERATION & KPI ESTIMATION
  await new Promise(resolve => setTimeout(resolve, 800));
  thoughts.push("Calcul des projections de performance (CTR/VTR)...");

  const insertions: DraftPlan['insertions'] = [];
  let remainingBudget = budget;
  let totalImpressions = 0;
  let totalClicks = 0;
  
  selectedChannels.forEach((channel, index) => {
    const allocation = index === selectedChannels.length - 1 ? remainingBudget : Math.floor(budget / selectedChannels.length);
    remainingBudget -= allocation;

    // Intelligent Format Selection
    const format = Object.values(knowledge.formats).find(f => f.compatible_channels.includes(channel.id)) || Object.values(knowledge.formats)[0];
    const buyingModelId = channel.allowed_buying_models?.[0] || 'CPM';
    
    // Benchmarks based on channel type (Simulated intelligence)
    const isVideo = format?.type === 'video';
    const isSearch = channel.name.toLowerCase().includes('google');
    
    const benchmarkCTR = isSearch ? 0.045 : (isVideo ? 0.008 : 0.012); // 4.5% search, 0.8% video, 1.2% image
    const benchmarkVTR = isVideo ? 0.35 : 0;
    const unitCost = buyingModelId === 'CPM' ? (isVideo ? 45 : 15) : (isSearch ? 3.5 : 5); // Higher cost for video
    
    const quantity = buyingModelId === 'CPM' 
      ? Math.floor((allocation / unitCost) * 1000)
      : Math.floor(allocation / unitCost);

    const estimatedImpressions = buyingModelId === 'CPM' ? quantity : Math.floor(quantity / benchmarkCTR);
    const estimatedClicks = Math.floor(estimatedImpressions * benchmarkCTR);
    
    totalImpressions += estimatedImpressions;
    totalClicks += estimatedClicks;

    insertions.push({
      name: `Campagne ${channel.name} - ${format?.name || 'Standard'}`,
      support: channel.name,
      channel_id: channel.id,
      format_id: format?.id,
      buying_model_id: buyingModelId,
      quantity: quantity,
      unit_cost: unitCost,
      total_cost_ht: allocation,
      status: "PLANNED",
      format_details: format,
      suggested_content: {
        type: format?.type || 'image',
        headline: isSearch ? "Top Recherche: Meilleure offre 2025" : "Découvrez la nouvelle collection",
        description: isSearch 
          ? "Cliquez ici pour profiter de nos offres exclusives. Livraison gratuite." 
          : "Une expérience immersive qui met en valeur votre style unique. #Mode #Tendance"
      },
      estimated_kpis: {
        impressions: estimatedImpressions,
        clicks: estimatedClicks,
        views: isVideo ? Math.floor(estimatedImpressions * benchmarkVTR) : undefined,
        ctr: benchmarkCTR
      }
    });
  });

  // 4. AGGREGATION
  const aggregated_kpis = {
    total_reach: Math.floor(totalImpressions * 0.7), // Approx deduplication
    avg_cpm: (budget / totalImpressions) * 1000,
    avg_ctr: totalClicks / totalImpressions,
    total_clicks: totalClicks
  };

  thoughts.push("Plan finalisé avec succès.");

  return {
    text: `Stratégie générée : Plan "Full Funnel" avec un budget de ${budget.toLocaleString()} MAD. Ciblage précis ${targeting.age_min}-${targeting.age_max} ans (${audienceLabel}). Estimation de ${(aggregated_kpis.avg_ctr * 100).toFixed(2)}% de CTR global.`,
    thoughts,
    planDraft: {
      name: `Stratégie Digitale Q${Math.floor((new Date().getMonth() + 3) / 3)} - ${audienceLabel}`,
      total_budget_ht: budget,
      currency: "MAD",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      objectives: ["AWARENESS", "CONVERSION"],
      description: `Dispositif multi-leviers ciblant les ${audienceLabel} (${targeting.age_min}-${targeting.age_max} ans).`,
      insertions,
      targeting,
      recommendations,
      aggregated_kpis
    }
  };
};

// --- COMPONENTS ---

const ThoughtProcess = ({ thoughts }: { thoughts: string[] }) => (
  <div className="mt-3 space-y-1 font-mono text-xs">
    {thoughts.map((t, i) => (
      <div key={i} className="flex items-center gap-2 text-slate-500 animate-in fade-in slide-in-from-left-2 duration-300">
        <ChevronRight size={10} className="text-indigo-500" />
        <span>{t}</span>
      </div>
    ))}
  </div>
);

const ChatMessage = ({ message }: { message: Message }) => (
  <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg
      ${message.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
    `}>
      {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
    </div>
    <div className="max-w-[85%] space-y-2">
      <div className={`
        p-4 rounded-2xl text-sm leading-relaxed shadow-md
        ${message.role === 'user' 
          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none' 
          : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'}
      `}>
        {message.content}
      </div>
      {message.thoughtProcess && <ThoughtProcess thoughts={message.thoughtProcess} />}
    </div>
  </div>
);

const PlanPreview = ({ draft, knowledge }: { draft: DraftPlan, knowledge: KnowledgeBase }) => {
  if (!draft) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
      <BrainCircuit size={64} className="mb-6 opacity-20 text-indigo-500" />
      <h3 className="text-xl font-bold text-slate-300 mb-2">Command Center IA</h3>
      <p className="text-sm max-w-md mx-auto leading-relaxed">
        En attente d'instructions. Connecté à {Object.keys(knowledge.channels).length} canaux et {Object.keys(knowledge.formats).length} formats.
        <br />
        <span className="text-indigo-400 mt-2 block">Prêt à générer.</span>
      </p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Plan Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/80">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} />
                Généré par IA
              </div>
              <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Database size={10} />
                Base Connectée
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{draft.name}</h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white tracking-tight">
              {draft.total_budget_ht?.toLocaleString()} <span className="text-lg text-slate-500">{draft.currency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Budget Total Estimé</div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Calendar size={16} /></div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Période</div>
              <div className="text-sm font-medium text-white">{draft.start_date}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Target size={16} /></div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Audience</div>
              <div className="text-sm font-medium text-white">{draft.targeting?.age_min}-{draft.targeting?.age_max} ans</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Activity size={16} /></div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Reach Est.</div>
              <div className="text-sm font-medium text-white">{(draft.aggregated_kpis?.total_reach || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Target size={16} /></div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">CTR Global</div>
              <div className="text-sm font-medium text-emerald-400">{((draft.aggregated_kpis?.avg_ctr || 0) * 100).toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Rationale */}
      {draft.recommendations && draft.recommendations.length > 0 && (
        <div className="px-6 py-4 bg-indigo-500/5 border-b border-slate-800">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BrainCircuit size={14} />
            Analyse Stratégique
          </h3>
          <div className="space-y-1">
            {draft.recommendations.map((rec, idx) => (
              <p key={idx} className="text-sm text-indigo-200 leading-relaxed flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Plan Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layout size={14} />
          Structure Détaillée ({draft.insertions?.length} insertions)
        </h3>
        
        {draft.insertions?.map((ins, idx) => {
          const channel = knowledge.channels[ins.channel_id || ''] || { color: 'slate', icon: Layout };
          const format = ins.format_details;
          
          return (
            <div key={idx} className="relative group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Header */}
              <div className="p-5 border-b border-slate-800/50 flex justify-between items-start relative z-10">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shadow-inner ring-1 ring-white/10`}>
                    <Layout size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg">{channel.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono uppercase">
                        {format?.name || 'Standard'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Monitor size={10} /> Placement: {ins.support}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Target size={10} /> Objectif: {draft.objectives?.[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white tracking-tight">{ins.total_cost_ht?.toLocaleString()} MAD</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {ins.quantity?.toLocaleString()} {ins.buying_model_id} @ {ins.unit_cost}
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-12 gap-6 relative z-10">
                {/* Creative Brief */}
                <div className="col-span-7 space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-400" />
                    Brief Créatif IA
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <div className="text-sm font-medium text-white mb-1">{ins.suggested_content?.headline}</div>
                    <p className="text-xs text-indigo-200 leading-relaxed opacity-80">
                      {ins.suggested_content?.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {format?.specs?.ratio && (
                      <div className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Layout size={10} /> Ratio: {format.specs.ratio}
                      </div>
                    )}
                    {format?.type === 'video' && (
                      <div className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Clock size={10} /> Max: {format.specs.max_duration_sec}s
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI Projections */}
                <div className="col-span-5 space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={12} className="text-emerald-400" />
                    Performance Estimée
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Impressions</div>
                      <div className="text-sm font-bold text-white font-mono">{ins.estimated_kpis?.impressions.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Clics</div>
                      <div className="text-sm font-bold text-white font-mono">{ins.estimated_kpis?.clicks.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">CTR</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">{((ins.estimated_kpis?.ctr || 0) * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">CPM Est.</div>
                      <div className="text-sm font-bold text-slate-300 font-mono">
                        {Math.round(((ins.total_cost_ht || 0) / (ins.estimated_kpis?.impressions || 1)) * 1000)} MAD
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 w-full bg-slate-800 mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                  style={{ width: `${((ins.total_cost_ht || 0) / (draft.total_budget_ht || 1)) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center">
        <div className="text-xs text-slate-500 italic">
          IA Confidence Score: <span className="text-emerald-400 font-bold">94%</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
            Ajuster
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all">
            <Save size={16} />
            Exporter vers Studio
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Command Center activé. Base de données chargée. Je suis prêt à concevoir votre prochain plan média. Donnez-moi un budget et des objectifs.",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<DraftPlan | null>(null);
  
  // Knowledge Base State
  const [knowledge, setKnowledge] = useState<KnowledgeBase>({
    channels: {},
    formats: {},
    buyingModels: {},
    objectives: {}
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Data from Real DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelsSnap, formatsSnap, modelsSnap, objectivesSnap] = await Promise.all([
          getDocs(collection(db, CHANNELS_COLLECTION)),
          getDocs(collection(db, FORMATS_COLLECTION)),
          getDocs(collection(db, BUYING_MODELS_COLLECTION)),
          getDocs(collection(db, OBJECTIVES_COLLECTION))
        ]);

        const newKnowledge: KnowledgeBase = {
          channels: {},
          formats: {},
          buyingModels: {},
          objectives: {}
        };

        channelsSnap.docs.forEach(doc => newKnowledge.channels[doc.id] = { id: doc.id, ...doc.data() } as MediaChannelEntity);
        formatsSnap.docs.forEach(doc => newKnowledge.formats[doc.id] = { id: doc.id, ...doc.data() } as MediaFormatEntity);
        modelsSnap.docs.forEach(doc => newKnowledge.buyingModels[doc.id] = { id: doc.id, ...doc.data() } as BuyingModelEntity);
        objectivesSnap.docs.forEach(doc => newKnowledge.objectives[doc.id] = { id: doc.id, ...doc.data() } as CampaignObjectiveEntity);

        setKnowledge(newKnowledge);
      } catch (error) {
        console.error("Error loading knowledge base:", error);
      }
    };
    fetchData();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await generateAIResponse(inputValue, knowledge);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        thoughtProcess: response.thoughts
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (response.planDraft) {
        setCurrentDraft(response.planDraft);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex overflow-hidden font-sans">
      {/* Left: Chat Interface */}
      <div className="w-[450px] flex flex-col border-r border-slate-800 bg-[#0F172A]">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/10">
                <Bot size={24} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0F172A] rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">AI Command Center</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {Object.keys(knowledge.channels).length} Canaux • {Object.keys(knowledge.formats).length} Formats
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isProcessing && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                <Bot size={20} />
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-emerald-400" />
                <span className="text-sm text-slate-400 font-mono">Traitement des données...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ex: Plan média branding 50k MAD sur Meta et Google..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500 relative z-10"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all z-20 shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 px-1">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Command size={10} />
              Powered by Agency Brain
            </p>
            <span className="text-[10px] text-indigo-400 font-mono">v2.4.0 (Connected)</span>
          </div>
        </div>
      </div>

      {/* Right: Plan Visualization */}
      <div className="flex-1 p-8 bg-[url('/grid-pattern.svg')] bg-fixed bg-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#020617] to-[#020617] pointer-events-none" />
        
        {/* Background Decor */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 h-full max-w-6xl mx-auto animate-in fade-in duration-700">
          <PlanPreview draft={currentDraft as DraftPlan} knowledge={knowledge} />
        </div>
      </div>
    </div>
  );
}
