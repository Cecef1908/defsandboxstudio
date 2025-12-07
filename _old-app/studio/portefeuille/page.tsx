'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Database, Loader2, Search, Filter, Home, TrendingUp, DollarSign, Target, Briefcase, ChevronDown, Check, RotateCcw, Zap, Calendar, Layout, Tag, PieChart, BarChart3, Trophy, Plus
} from 'lucide-react'; 

// UI
import StudioLayout from "../../components/StudioLayout";
import StudioSidebarContent from "../../components/StudioSidebarContent";
import DashboardRenderer from "../../components/DashboardRenderer"; 

// Firebase
import { 
    db, 
    authenticateUser, 
    MEDIA_PLANS_COLLECTION, 
    INSERTIONS_COLLECTION, 
    ANNONCEURS_COLLECTION, 
    BUYING_MODELS_COLLECTION, 
    CANAUX_COLLECTION,
    AGENCE_SETTINGS_COLLECTION,
    THEMES_COLLECTION
} from '../../lib/firebase'; 
import { collection, getDocs, onSnapshot, query, DocumentData, doc, getDoc } from 'firebase/firestore'; 
import { AgenceSettings, Theme } from "../../types/agence"; 

// --- TYPES ---

interface InsertionData extends DocumentData {
    id: string;
    planRef: string;
    canal: string;
    modeleAchat: string;
    coutEstime: number; 
}

interface PlanData extends DocumentData {
    id: string;
    nomPlan: string;
    annonceurRef: string;
    budgetTotal: number;
    objectifPrincipal: string;
}

interface AnnonceurData extends DocumentData {
    id: string;
    nomAnnonceur: string;
}

interface ReferenceData {
    id: string;
    name: string;
}

interface AggregatedBreakdown {
    canal: { name: string, value: number, fill: string }[];
    modele: { name: string, value: number, fill: string }[];
    annonceur: { name: string, value: number, totalPlans: number }[];
    timeline: { date: string, value: number }[]; 
}

interface GlobalMediaData {
    plans: PlanData[];
    insertions: InsertionData[];
    annonceurs: AnnonceurData[];
    canaux: ReferenceData[];
    models: ReferenceData[];
}

// --- DATA HOOK GLOBAL (Chargement et Aggregation) ---
function useGlobalMediaData() {
    const [data, setData] = useState<GlobalMediaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                await authenticateUser();

                // On récupère tout en une fois
                const [plansSnap, insertionsSnap, annonceursSnap, canauxSnap, modelsSnap] = await Promise.all([
                    getDocs(collection(db, MEDIA_PLANS_COLLECTION)),
                    getDocs(collection(db, INSERTIONS_COLLECTION)),
                    getDocs(collection(db, ANNONCEURS_COLLECTION)),
                    getDocs(collection(db, CANAUX_COLLECTION)),
                    getDocs(collection(db, BUYING_MODELS_COLLECTION)),
                ]);

                const plans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as PlanData));
                const insertions = insertionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as InsertionData));
                const annonceurs = annonceursSnap.docs.map(d => ({ id: d.id, ...d.data() } as AnnonceurData));
                const canaux = canauxSnap.docs.map(d => ({ id: d.id, ...d.data() } as ReferenceData));
                const models = modelsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ReferenceData));

                setData({ plans, insertions, annonceurs, canaux, models });

            } catch (err: any) {
                console.error("Erreur de chargement global BDD:", err);
                setError("Erreur de connexion aux collections. Vérifiez les règles de sécurité.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return { data, loading, error };
}

// --- HOOK POUR CHARGER LES SETTINGS DE L'AGENCE ---
function useAgenceSettings() {
    const [design, setDesign] = useState<{ settings: AgenceSettings | null, themes: Theme[] }>({ settings: null, themes: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDesign = async () => {
            try {
                await authenticateUser();
                
                // Charger les settings
                const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, 'main');
                const settingsSnap = await getDoc(settingsRef);
                const settings = settingsSnap.exists() ? settingsSnap.data() as AgenceSettings : {} as AgenceSettings;
                
                // Charger les thèmes
                const themesRef = doc(db, THEMES_COLLECTION, 'list');
                const themesSnap = await getDoc(themesRef);
                const themes = themesSnap.exists() && themesSnap.data().availableThemes ? themesSnap.data().availableThemes as Theme[] : [];
                
                setDesign({ settings, themes });
            } catch (err: any) {
                console.error("Erreur chargement settings:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        loadDesign();
    }, []);

    return { design, loading, error };
}

// --- LOGIQUE METIER ET FILTRES ---

function useFilteredData(data: GlobalMediaData | null, settings: AgenceSettings | null) {
    const [filters, setFilters] = useState({
        annonceurId: 'all',
        canalId: 'all', // Remplacé modeleAchatId par canalId
    });

    // Aggrégation et jointures
    const aggregatedData = useMemo(() => {
        if (!data) return { 
            totalBudget: 0, 
            commissionEstimee: 0, 
            plans: [], 
            filteredInsertions: [],
            breakdowns: { canal: [], modele: [], annonceur: [], timeline: [] } as AggregatedBreakdown
        };
        
        type PlanWithAnnName = PlanData & { nomAnnonceur: string };
        
        // 1. Jointure Plans <-> Annonceurs
        const plansMap = new Map<string, PlanWithAnnName>(
            data.plans.map((p: PlanData) => [p.id, { 
                ...p, 
                nomAnnonceur: data.annonceurs.find((a: AnnonceurData) => a.id === p.annonceurRef)?.nomAnnonceur || p.annonceurRef 
            }])
        );

        // 2. Filtrage des Insertions
        const filteredInsertions = data.insertions.filter((ins: InsertionData) => {
            const plan = plansMap.get(ins.planRef);
            if (!plan) return false; 

            // Filtrage par Annonceur (par ID)
            const matchesAnnonceur = filters.annonceurId === 'all' || plan.annonceurRef === filters.annonceurId;

            // Filtrage par Canal (par ID uniquement)
            const matchesCanal = filters.canalId === 'all' || ins.canal === filters.canalId;

            return matchesAnnonceur && matchesCanal;
        });

        // 3. Calculs Agrégés
        const totalBudget = filteredInsertions.reduce((sum: number, ins: InsertionData) => sum + (ins.coutEstime || 0), 0); 
        
        // Calcul Commission Agence
        const commissionRate = settings?.commissionRate || 15;
        const commissionEstimee = (totalBudget * commissionRate) / 100;

        // 4. Breakdowns (Ventilation)
        const breakdowns = filteredInsertions.reduce((acc: AggregatedBreakdown, ins: InsertionData) => { 
            const plan = plansMap.get(ins.planRef);
            const budget = ins.coutEstime || 0;
            if (!plan) return acc; 

            // Ventilation par Canal
            const canalObj = data.canaux.find((c: ReferenceData) => c.id === ins.canal);
            const canalName = canalObj ? canalObj.name : `Canal ID: ${ins.canal}`; 
            const existingCanal = acc.canal.find((item: { name: string }) => item.name === canalName); 
            if (existingCanal) existingCanal.value += budget;
            else acc.canal.push({ name: canalName, value: budget, fill: '#6366f1' }); 

            // Ventilation par Modèle d'Achat
            const modeleObj = data.models.find((m: ReferenceData) => m.id === ins.modeleAchat);
            const modeleName = modeleObj ? modeleObj.name : `Modèle ID: ${ins.modeleAchat}`; 
            const existingModele = acc.modele.find((item: { name: string }) => item.name === modeleName); 
            if (existingModele) existingModele.value += budget;
            else acc.modele.push({ name: modeleName, value: budget, fill: '#10b981' }); 
            
            // Ventilation par Annonceur (pour le tableau)
            const annonceurName = plan.nomAnnonceur || 'Inconnu'; 
            const existingAnnonceur = acc.annonceur.find((item: { name: string }) => item.name === annonceurName); 
            if (existingAnnonceur) {
                existingAnnonceur.value += budget;
                existingAnnonceur.totalPlans += 1;
            } else {
                 acc.annonceur.push({ name: annonceurName, value: budget, totalPlans: 1 });
            }

            // Ventilation Temporelle (Timeline par Mois)
            // On utilise la date de début du plan ou de l'insertion si dispo, sinon aujourd'hui
            const dateRef = ins.dateDebut || (plan as any).dateDebut || new Date().toISOString();
            const dateObj = new Date(dateRef);
            const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            
            const existingTime = acc.timeline.find(t => t.date === monthKey);
            if (existingTime) existingTime.value += budget;
            else acc.timeline.push({ date: monthKey, value: budget });

            return acc;
        }, { canal: [], modele: [], annonceur: [], timeline: [] } as AggregatedBreakdown); 

        // Tris
        breakdowns.canal.sort((a,b) => b.value - a.value);
        breakdowns.modele.sort((a,b) => b.value - a.value);
        breakdowns.annonceur.sort((a,b) => b.value - a.value);
        breakdowns.timeline.sort((a,b) => a.date.localeCompare(b.date)); // Tri chronologique

        return {
            totalBudget,
            commissionEstimee,
            plans: data.plans, 
            filteredInsertions,
            breakdowns,
        };
    }, [data, filters, settings]);

    // Liste des filtres disponibles pour l'UI
    const filterOptions = useMemo(() => {
        if (!data) return { annonceurs: [], modeles: [], canaux: [], models: [] }; 

        const annOptions = data.annonceurs.map((a: AnnonceurData) => ({ id: a.id, name: a.nomAnnonceur })); 
        const modelOptions = data.models.map((m: ReferenceData) => ({ id: m.id, name: m.name })); 
        
        return {
            annonceurs: annOptions,
            modeles: modelOptions,
            canaux: data.canaux, 
            models: data.models,
        };
    }, [data]);

    return { 
        aggregatedData, 
        filters, 
        setFilters, 
        filterOptions 
    };
}


// --- CODE REACT LIVE POUR LE RENDU DU DASHBOARD AGRÉGÉ ---
const PORTFOLIO_DASHBOARD_CODE = (
`const { totalBudget, commissionEstimee, breakdowns, filterOptions, filters, setFilters, plans } = rawPlanData;

// Composant de sélection (pour les filtres)
const FilterSelect = ({ options, currentId, onChange, icon: Icon, label }) => {
    const currentName = options.find(o => o.id === currentId)?.name || 'Tous';
    
    return (
        <div className="relative w-full">
            <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</label>
            <div className="relative group/input">
                <Icon size={16} className="absolute left-3 top-3 text-slate-500"/>
                <select
                    value={currentId}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-700 rounded-xl py-2 pl-10 pr-10 text-sm text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none appearance-none transition-all cursor-pointer"
                >
                    <option value="all">Tous les \${label.toLowerCase()}</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
            </div>
        </div>
    );
};

// COMPOSANT PRINCIPAL
const PortfolioDashboard = () => {
    const CANAL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06B6D4', '#EC4899'];
    const MODELE_COLORS = ['#06B6D4', '#F472B6', '#FBBF24', '#34D399', '#A78BFA', '#1D4ED8'];
    
    const totalPlans = plans.length;
    
    // Calcul des stats financières
    const budgetMoyen = totalPlans > 0 ? totalBudget / totalPlans : 0;
    
    // Préparation Timeline
    const timelineData = breakdowns.timeline || [];

    const kpis = [
      { label: "Investissement Média Net", val: totalBudget.toLocaleString('fr-FR', { maximumFractionDigits: 0 }), unit: "MAD", icon: Lucide.DollarSign, color: "text-violet-400", bg: "bg-violet-500/10" },
      { label: "Commissions Agence (Est.)", val: commissionEstimee.toLocaleString('fr-FR', { maximumFractionDigits: 0 }), unit: "MAD", icon: Lucide.TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { label: "Panier Moyen / Campagne", val: budgetMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 }), unit: "MAD", icon: Lucide.Target, color: "text-amber-400", bg: "bg-amber-500/10" },
      { label: "Campagnes Actives", val: totalPlans, unit: "", icon: Lucide.Layout, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    ];
    
    const isFiltered = filters.annonceurId !== 'all' || filters.canalId !== 'all';
    
    const dataCanal = breakdowns.canal.map((item, index) => ({
        ...item,
        fill: CANAL_COLORS[index % CANAL_COLORS.length]
    }));
    
    const dataModele = breakdowns.modele.map((item, index) => ({
        ...item,
        fill: MODELE_COLORS[index % MODELE_COLORS.length]
    }));

    return (
      <div className="min-h-full bg-[#020617] font-sans text-slate-100 pb-20 selection:bg-violet-500/30">
        
        {/* Header Stratégique */}
        <div className="bg-gradient-to-b from-[#1E293B]/50 to-[#0F172A] border-b border-slate-800/50 px-8 py-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                     <div className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                        Vue Direction
                     </div>
                     <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
                     </div>
                 </div>
                 <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Portefeuille Global</h1>
                 <p className="text-slate-400 text-sm max-w-xl">
                    Pilotage consolidé des investissements, de la performance et de la rentabilité agence.
                 </p>
             </div>
             
             <div className="flex gap-2">
                 <div className="text-right">
                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dernière Mise à Jour</div>
                     <div className="text-sm font-mono text-slate-300">{new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                 </div>
             </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-7xl mx-auto space-y-8 -mt-8">
          
          {/* Filtres Rapides */}
          <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-800 shadow-xl backdrop-blur-xl">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FilterSelect 
                    options={filterOptions.annonceurs} 
                    currentId={filters.annonceurId} 
                    onChange={(id) => setFilters(prev => ({ ...prev, annonceurId: id }))}
                    icon={Lucide.Briefcase}
                    label="Filtrer par Annonceur"
                />
                <FilterSelect 
                    options={filterOptions.canaux} 
                    currentId={filters.canalId} 
                    onChange={(id) => setFilters(prev => ({ ...prev, canalId: id }))}
                    icon={Lucide.Target}
                    label="Filtrer par Canal"
                />
                <div className="flex items-end">
                    <button 
                        onClick={() => setFilters({ annonceurId: 'all', canalId: 'all' })}
                        disabled={!isFiltered}
                        className={\`w-full h-[42px] rounded-xl text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 border border-slate-700 \${isFiltered ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'}\`}
                    >
                        <Lucide.RotateCcw size={14} /> Réinitialiser
                    </button>
                </div>
             </div>
          </div>
          
          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {kpis.map((kpi, i) => (
               <div key={i} className="bg-[#1E293B] p-6 rounded-xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className={\`p-3 rounded-lg \${kpi.bg}\`}>
                        <kpi.icon size={20} className={kpi.color} />
                     </div>
                     {i === 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+12% vs N-1</span>}
                  </div>
                  <div className="text-3xl font-bold text-white font-mono tracking-tight mb-1">
                     {kpi.val}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                     {kpi.label}
                  </div>
               </div>
             ))}
          </div>

          {/* Timeline & Répartition */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Évolution Temporelle (AreaChart) */}
             <div className="lg:col-span-2 bg-[#1E293B] rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2">
                       <Lucide.Calendar size={16} className="text-indigo-400"/> Évolution des Investissements
                    </h3>
                </div>
                <div className="flex-1 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorBudgetPortfolio" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                       <XAxis 
                            dataKey="date" 
                            stroke="#94A3B8" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={10}
                            tickFormatter={(val) => {
                                try {
                                    const [y, m] = val.split('-');
                                    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                                    return \`\${months[parseInt(m)-1]} \${y.slice(2)}\`;
                                } catch (e) { return val; }
                            }}
                       />
                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => \`\${val/1000}k\`} />
                       <Tooltip 
                          contentStyle={{borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#fff'}}
                          formatter={(val) => [\`\${val.toLocaleString()} MAD\`, 'Budget']}
                          labelFormatter={(label) => \`Mois : \${label}\`}
                       />
                       <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBudgetPortfolio)" />
                     </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Bar Chart Mix Média (Canaux) - Remplacement du PieChart */}
             <div className="bg-[#1E293B] rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col min-h-[400px]">
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                   <Lucide.PieChart size={16} className="text-emerald-400"/> Mix Média (Canaux)
                </h3>
                <div className="flex-1 relative">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={dataCanal} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94A3B8" fontSize={10} tickFormatter={(value) => \`\${value / 1000}k\`} />
                        <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#fff'}}
                            formatter={(val) => \`\${val.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD\`}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {dataCanal.map((entry, index) => <Cell key={\`cell-canal-\${index}\`} fill={entry.fill} />)}
                        </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
          
          {/* Tableau Top Annonceurs */}
          <div className="bg-[#1E293B] rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-lg">
             <div className="px-6 py-5 border-b border-slate-800 bg-[#1E293B] flex justify-between items-center">
                   <h3 className="font-bold text-white text-sm flex items-center gap-2 uppercase tracking-widest">
                      <Lucide.Trophy size={16} className="text-amber-500"/>
                      Top 10 Annonceurs (Performance)
                   </h3>
                   <button className="text-xs text-violet-400 hover:text-white transition-colors font-bold uppercase tracking-wide">Voir tout</button>
             </div>
             <div className="overflow-x-auto">
                   <table className="w-full text-xs text-left">
                     <thead className="text-[10px] text-slate-400 uppercase font-bold bg-[#020617]/50 border-b border-slate-700">
                       <tr>
                         <th className="px-6 py-4">Annonceur</th>
                         <th className="px-6 py-4 text-right">Plans Actifs</th>
                         <th className="px-6 py-4 text-right">Budget Net</th>
                         <th className="px-6 py-4 text-right">Part de Voix</th>
                         <th className="px-6 py-4 text-right">Marge Est.</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                       {breakdowns.annonceur.slice(0, 10).map((ann, i) => {
                         const part = totalBudget > 0 ? (ann.value / totalBudget) * 100 : 0;
                         return (
                         <tr key={i} className="hover:bg-white/5 transition-colors group">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                 <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold \${i < 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}\`}>
                                     {i + 1}
                                 </div>
                                 <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{ann.name}</div>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-right font-mono text-slate-400">
                              {ann.totalPlans}
                           </td>
                           <td className="px-6 py-4 text-right font-bold text-emerald-400 font-mono">
                              {ann.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-violet-500" style={{width: \`\${part}%\`}}></div>
                                  </div>
                                  <span className="w-8 text-slate-400 font-mono">{part.toFixed(1)}%</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right text-slate-500 font-mono group-hover:text-slate-300">
                              {(ann.value * 0.15).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                           </td>
                         </tr>
                       )})}
                     </tbody>
                   </table>
             </div>
          </div>
          
        </div>
      </div>
    );
};

render(<PortfolioDashboard />);
`
);


export default function PortefeuillePage() {
    const { data, loading, error } = useGlobalMediaData();
    const { design } = useAgenceSettings();
    const { aggregatedData, filters, setFilters, filterOptions } = useFilteredData(data, design?.settings || null);
    
    // Obtenir l'icône en fonction du thème actuel
    const activeTheme = design?.themes.find(t => t.id === design?.settings?.activeThemeId) || design?.themes[0];
    const isLight = activeTheme?.themeColors?.background.toLowerCase().includes('fff');
    const iconeUrl = isLight ? design?.settings?.iconeLightUrl : design?.settings?.iconeDarkUrl;
    const mainLogoUrl = design?.settings?.logoLightUrl || design?.settings?.logoDarkUrl || null;

    const rawDataForDashboard = useMemo(() => {
        if (!data) return {};
        return {
            ...aggregatedData, 
            filterOptions,
            filters,
            setFilters, 
            plans: data.plans, 
        };
    }, [aggregatedData, data, filters, filterOptions]);

    return (
        <div className="flex flex-col h-full bg-[#020617] animate-in fade-in duration-500">
            {/* Header spécifique module Portefeuille */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Portefeuille Global</h1>
                    <p className="text-slate-400">Pilotage consolidé des investissements et de la performance.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Live Analysis</span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative min-h-[600px] rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-violet-400 gap-4">
                        <Loader2 size={48} className="animate-spin" />
                        <p className="text-sm">Chargement et agrégation des {MEDIA_PLANS_COLLECTION} et {INSERTIONS_COLLECTION}...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4 p-8">
                        <Database size={48} />
                        <p className="text-lg font-bold">Erreur de Données</p>
                        <p className="text-sm text-center max-w-lg">{error}</p>
                    </div>
                ) : (
                    <DashboardRenderer 
                        code={PORTFOLIO_DASHBOARD_CODE} 
                        rawPlanData={rawDataForDashboard} 
                    />
                )}
            </div>
            
            <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                <span>MODULE PORTEFEUILLE v1.0</span>
                <span>DONNÉES AGRÉGÉES EN TEMPS RÉEL</span>
            </div>
        </div>
    );
}
