'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    Home, Plus, Layout, TrendingUp, BarChart3, ExternalLink, Share2, Clock, 
    Check, Copy, Globe, Calendar, Video, Target, ArrowUpRight, ArrowDownRight, DollarSign, Users, Eye, X
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart
} from 'recharts';
import { useAgenceDesign } from '../../lib/useAgenceDesign';

// --- COMPOSANTS TEMPORAIRES DE REPLACEMENT ---
const StudioLayout = ({ children, leftContent, rightContent, bottomContent }: StudioLayoutProps) => (
  <div className="flex h-screen bg-[#020617]">
    {leftContent && (
      <div className="w-80 border-r border-slate-800">
        {leftContent}
      </div>
    )}
    <div className="flex-1 flex flex-col">
      {rightContent}
      {bottomContent}
    </div>
  </div>
);

const StudioSidebarContent = ({ children, title, subtitle }: StudioSidebarContentProps) => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b border-slate-800">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
    {children}
  </div>
);

const DashboardRenderer = ({ code }: DashboardRendererProps) => (
  <div className="p-4 bg-slate-800 rounded-lg">
    <pre className="text-xs text-slate-400 overflow-x-auto">{code}</pre>
  </div>
);

// --- TYPES ---
interface PublishedReport {
    id: string;
    title: string;
    url: string;
    date: string;
    type: string;
}

interface StudioLayoutProps {
    children: React.ReactNode;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    bottomContent?: React.ReactNode;
}

interface StudioSidebarContentProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

interface DashboardRendererProps {
    code: string;
}

interface CardProps {
    title: string;
    value: string;
    subvalue: string;
    icon: React.ComponentType<{ size?: string | number }>;
    trend?: number;
    color?: string;
}

interface GoogleData {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    cpc: number;
    cpl: number;
}

interface MetaData {
    impressions: number;
    clicks: number;
    leads: number;
    cost: number;
    cpm: number;
    cpl: number;
    videoViews: number;
    video100: number;
}

interface TotalData {
    cost: number;
    leads: number;
    cpl: number;
}

interface WeeklyData {
    week: string;
    weekNum: number;
    google: GoogleData;
    meta: MetaData;
    total: TotalData;
}

interface ProjectedData extends WeeklyData {
    projected: {
        cost: number;
        leads: number;
    };
}

// --- SYSTEM CLOCK ---
function SystemClock() {
    const [time, setTime] = useState<Date | null>(null);
    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return <div className="w-16 h-4 bg-slate-800/50 rounded animate-pulse"></div>;

    return (
        <div className="font-mono text-[10px] text-yellow-500 flex items-center gap-2 bg-[#020617] px-2 py-1 rounded border border-slate-800 shadow-sm">
            <Clock size={10} />
            {time.toLocaleTimeString('fr-FR')}
        </div>
    );
}

// --- TEMPLATE BILAN (AUTO-CONTENU) ---
const DEFAULT_CODE = `
// --- CONFIGURATION ---
const colors = {
  bg: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  muted: '#94A3B8',
  primary: '#EAB308', // Yellow for Bilan
  success: '#10B981',
  grid: '#334155'
};

const dataPerformance = [
  { month: 'Jan', ca: 4000, obj: 2400 },
  { month: 'Fev', ca: 3000, obj: 1398 },
  { month: 'Mar', ca: 2000, obj: 9800 },
  { month: 'Avr', ca: 2780, obj: 3908 },
  { month: 'Mai', ca: 1890, obj: 4800 },
  { month: 'Juin', ca: 2390, obj: 3800 },
  { month: 'Juil', ca: 3490, obj: 4300 },
];

const kpis = [
  { label: "Chiffre d'Affaires", val: "1.2M MAD", sub: "+12% vs N-1", color: "text-white" },
  { label: "Marge Brute", val: "320k MAD", sub: "26% du CA", color: "text-yellow-400" },
  { label: "Clients Actifs", val: "142", sub: "+5 ce mois", color: "text-emerald-400" },
  { label: "NPS", val: "72", sub: "Excellent", color: "text-blue-400" },
];

render(
  <div className="min-h-full bg-[#020617] font-sans text-slate-100 pb-12">
    
    {/* HEADER RAPPORT */}
    <div className="bg-[#1E293B]/30 border-b border-slate-800 px-8 py-10">
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Lucide.BarChart3 size={24} className="text-yellow-500" />
             </div>
             <h1 className="text-4xl font-bold text-white tracking-tight">Bilan Annuel 2025</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Analyse consolidée des performances de l'agence. Ce rapport inclut les données financières, opérationnelles et la satisfaction client.
          </p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Dernière mise à jour</div>
           <div className="font-mono text-sm font-medium text-slate-300 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
             <Lucide.Calendar size={14} className="text-yellow-500" />
             {new Date().toLocaleDateString('fr-FR')}
           </div>
        </div>
      </div>
    </div>

    <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {kpis.map((kpi, i) => (
           <div key={i} className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
              <div className="relative z-10">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</span>
                 <div className={\`text-3xl font-bold mt-2 mb-1 \${kpi.color}\`}>{kpi.val}</div>
                 <span className="text-[10px] text-slate-600 font-medium bg-slate-800 px-1.5 py-0.5 rounded">{kpi.sub}</span>
              </div>
           </div>
         ))}
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
         <div className="lg:col-span-2 bg-[#1E293B] rounded-2xl border border-slate-800 p-6 flex flex-col shadow-lg">
            <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-3 text-xs uppercase tracking-widest">
               <IconActivity size={16} className="text-yellow-500"/>
               Performance Mensuelle
            </h3>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dataPerformance}>
                   <defs>
                     <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value}k\`} />
                   <Tooltip 
                      contentStyle={{borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#fff'}}
                   />
                   <Area type="monotone" dataKey="ca" stroke="#EAB308" strokeWidth={3} fillOpacity={1} fill="url(#colorCa)" />
                   <Area type="monotone" dataKey="obj" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* INFO CARD */}
         <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl border border-yellow-500/20 p-8 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
               <Lucide.Trophy size={32} className="text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Objectifs Atteints</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
               L'équipe a dépassé les objectifs trimestriels de 15%. La stratégie d'acquisition digitale porte ses fruits.
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-sm transition-colors w-full">
               Voir le détail
            </button>
         </div>
      </div>
    </div>
  </div>
);
`;

// --- MOCK DATA GENERATION ---
// Petit PRNG déterministe pour éviter les erreurs d'hydratation
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

function generateWeeklyData() {
  const data = [] as any[];
  const channels = ['Google Search', 'Meta Ads'];

  for (let i = 1; i <= 52; i++) {
    const seasonality = 0.8 + Math.sin((i / 52) * Math.PI * 2) * 0.2; // effet de saison

    // Google Data (seed basé sur la semaine)
    const rand1 = pseudoRandom(i * 10 + 1);
    const rand2 = pseudoRandom(i * 10 + 2);
    const rand3 = pseudoRandom(i * 10 + 3);

    const googleImpr = Math.floor((30000 + rand1 * 10000) * seasonality);
    const googleClicks = Math.floor(googleImpr * (0.08 + rand2 * 0.02)); // High CTR typical for search
    const googleConv = Math.floor(googleClicks * (0.05 + rand3 * 0.02));
    const googleCost = googleClicks * (2 + pseudoRandom(i * 10 + 4)); // CPC autour de 2-3 MAD

    // Meta Data (autre plage de seeds)
    const rand4 = pseudoRandom(i * 10 + 5);
    const rand5 = pseudoRandom(i * 10 + 6);
    const rand6 = pseudoRandom(i * 10 + 7);
    const rand7 = pseudoRandom(i * 10 + 8);

    const metaImpr = Math.floor((500000 + rand4 * 200000) * seasonality);
    const metaClicks = Math.floor(metaImpr * (0.008 + rand5 * 0.004)); // Lower CTR
    const metaLeads = Math.floor(metaClicks * (0.08 + rand6 * 0.03));
    const metaCost = metaImpr / 1000 * (5 + rand7 * 2); // CPM model

    data.push({
      week: `S${i}`,
      weekNum: i,
      google: {
        impressions: googleImpr,
        clicks: googleClicks,
        conversions: googleConv,
        cost: googleCost,
        cpc: googleCost / googleClicks,
        cpl: googleCost / (googleConv || 1)
      },
      meta: {
        impressions: metaImpr,
        clicks: metaClicks,
        leads: metaLeads,
        cost: metaCost,
        cpm: (metaCost / metaImpr) * 1000,
        cpl: metaCost / (metaLeads || 1),
        videoViews: Math.floor(metaImpr * 0.4),
        video100: Math.floor(metaImpr * 0.05)
      },
      total: {
        cost: googleCost + metaCost,
        leads: googleConv + metaLeads,
        cpl: (googleCost + metaCost) / (googleConv + metaLeads)
      }
    });
  }
  return data;
};

const rawData = generateWeeklyData();

// --- COMPONENTS ---

const Card = ({ title, value, subvalue, icon: Icon, trend, color = "blue" }: CardProps) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-xs text-slate-500 mt-1">{subvalue}</div>
    </div>
  </div>
);

// --- TABS ---

interface TabProps {
  data: WeeklyData[];
}

const OverviewTab = ({ data }: TabProps) => {
  const metrics = useMemo(() => {
    const totalSpend = data.reduce((acc: number, curr: WeeklyData) => acc + curr.total.cost, 0);
    const totalLeads = data.reduce((acc: number, curr: WeeklyData) => acc + curr.total.leads, 0);
    const avgCPL = totalSpend / totalLeads;
    const totalImpr = data.reduce((acc: number, curr: WeeklyData) => acc + curr.google.impressions + curr.meta.impressions, 0);
    return { totalSpend, totalLeads, avgCPL, totalImpr };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Budget Investi (2025)" 
          value={`${(metrics.totalSpend).toLocaleString('fr-MA', { maximumFractionDigits: 0 })} MAD`} 
          subvalue="Dépenses totales"
          icon={DollarSign} 
          trend={12} 
          color="blue"
        />
        <Card 
          title="Total Leads & Conversions" 
          value={metrics.totalLeads.toLocaleString()} 
          subvalue="Meta + Google combinés"
          icon={Users} 
          trend={8.5} 
          color="emerald"
        />
        <Card 
          title="CPL Moyen (Global)" 
          value={`${metrics.avgCPL.toFixed(2)} MAD`} 
          subvalue="Objectif: < 150 MAD"
          icon={Target} 
          trend={-5.2} 
          color="purple"
        />
        <Card 
          title="Impressions Totales" 
          value={(metrics.totalImpr / 1000000).toFixed(1) + "M"} 
          subvalue="Visibilité globale"
          icon={Eye} 
          trend={24} 
          color="amber"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Évolution Dépenses vs Leads</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{fontSize: 12}} interval={4} />
                <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="total.cost" name="Dépenses (MAD)" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="total.leads" name="Leads" stroke="#10b981" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Répartition par Canal</h3>
          <div className="h-80 flex flex-col justify-center">
             <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Budget (Meta vs Google)</span>
                        <span>Meta: 65%</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500 w-[65%]"></div>
                        <div className="h-full bg-orange-500 w-[35%]"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Leads (Meta vs Google)</span>
                        <span>Meta: 75%</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 w-[75%]"></div>
                        <div className="h-full bg-emerald-700 w-[25%]"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>CPL Efficacité</span>
                        <span>Google est 40% plus cher</span>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">
                        Bien que Google soit plus cher au CPL, la qualité (intent) est souvent supérieure pour les inscriptions finales.
                     </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformComparisonTab = ({ data }: TabProps) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">CPL : Google vs Meta</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="week" stroke="#94a3b8" interval={4} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Legend />
                        <Line type="monotone" dataKey="google.cpl" name="CPL Google" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="meta.cpl" name="CPL Meta" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Volume : Impressions vs Clics</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="week" stroke="#94a3b8" interval={4} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Legend />
                        <Bar dataKey="meta.clicks" name="Clics Meta" fill="#3b82f6" stackId="a" />
                        <Bar dataKey="google.clicks" name="Clics Google" fill="#f97316" stackId="a" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommandations Stratégiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-bold text-blue-400 mb-2">Meta Ads</h4>
                    <ul className="space-y-2 text-slate-300">
                        <li>• Corrélation Dépense/Lead: <span className="text-white font-bold">0.85 (Forte)</span></li>
                        <li>• Saturation observée au delà de 20k MAD/semaine.</li>
                        <li>• Les vidéos &lt; 15s ont un CPM 20% plus bas.</li>
                    </ul>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-bold text-orange-400 mb-2">Google Ads</h4>
                    <ul className="space-y-2 text-slate-300">
                        <li>• CPC en hausse de 5% vs S15.</li>
                        <li>• Taux de conversion stable (5%).</li>
                        <li>• Recommandation : Augmenter le budget sur "Mot-clés Marque".</li>
                    </ul>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-bold text-emerald-400 mb-2">Actions Requises</h4>
                    <ul className="space-y-2 text-slate-300">
                        <li>1. Basculer 10% du budget Meta vers Google Display (Retargeting).</li>
                        <li>2. Rafraîchir les créas vidéos (fatigue détectée S30).</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

const VideoAnalysisTab = ({ data }: TabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Funnel de Rétention Vidéo (Moyenne)</h3>
                <div className="h-72 flex items-end justify-around px-4">
                    {/* Visual Funnel */}
                    <div className="w-20 bg-blue-500/20 h-full rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500 h-full rounded-t-lg transition-all duration-500"></div>
                        <span className="absolute -top-6 w-full text-center text-xs text-slate-400">100% Impr.</span>
                        <div className="absolute bottom-2 w-full text-center font-bold text-white z-10">Start</div>
                    </div>
                    <div className="w-20 bg-blue-500/20 h-full rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500 h-[45%] rounded-t-lg transition-all duration-500"></div>
                        <span className="absolute top-[55%] w-full text-center text-xs text-slate-400 opacity-0 group-hover:opacity-100">Drop important</span>
                        <div className="absolute bottom-2 w-full text-center font-bold text-white z-10">ThruPlay</div>
                    </div>
                    <div className="w-20 bg-blue-500/20 h-full rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500 h-[25%] rounded-t-lg transition-all duration-500"></div>
                        <div className="absolute bottom-2 w-full text-center font-bold text-white z-10">50%</div>
                    </div>
                    <div className="w-20 bg-blue-500/20 h-full rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500 h-[10%] rounded-t-lg transition-all duration-500"></div>
                        <div className="absolute bottom-2 w-full text-center font-bold text-white z-10">100%</div>
                    </div>
                </div>
                <p className="text-center text-slate-400 text-sm mt-4 italic">Seulement 10% des utilisateurs complètent la vidéo. Le message clé doit être dans les 3 premières secondes.</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tendances Coût par Vue (CPV)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCpv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="week" stroke="#94a3b8" interval={4} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Area type="monotone" dataKey="meta.cpm" name="CPM Vidéo" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCpv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const Projection2026Tab = ({ data }: TabProps) => {
    const [budgetGrowth, setBudgetGrowth] = useState<number>(10);
    const [cplOptimization, setCplOptimization] = useState<number>(5);

    const projectedData = useMemo(() => {
        return data.map((d: WeeklyData) => ({
            ...d,
            projected: {
                cost: d.total.cost * (1 + budgetGrowth / 100),
                leads: d.total.leads * (1 + budgetGrowth / 100) * (1 + cplOptimization / 100),
            }
        }));
    }, [data, budgetGrowth, cplOptimization]);

    const projectedMetrics = useMemo(() => {
        const totalProjectedLeads = projectedData.reduce((acc: number, curr: ProjectedData) => acc + curr.projected.leads, 0);
        const totalCurrentLeads = data.reduce((acc: number, curr: WeeklyData) => acc + curr.total.leads, 0);
        const growth = ((totalProjectedLeads - totalCurrentLeads) / totalCurrentLeads * 100).toFixed(1);
        return { totalProjectedLeads, totalCurrentLeads, growth };
    }, [projectedData, data]);

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Target className="text-yellow-500" />
                    Simulateur Stratégique 2026
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-slate-300 text-sm">Hausse Budget Média (%)</label>
                            <span className="text-yellow-400 font-bold">+{budgetGrowth}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="50" value={budgetGrowth} 
                            onChange={(e) => setBudgetGrowth(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <p className="text-xs text-slate-500">Basé sur l'inflation média et les ambitions de croissance.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-slate-300 text-sm">Gain Productivité CPL (%)</label>
                            <span className="text-emerald-400 font-bold">+{cplOptimization}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="20" value={cplOptimization} 
                            onChange={(e) => setCplOptimization(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <p className="text-xs text-slate-500">Via optimisation des Landing Pages et du Quality Score.</p>
                    </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-sm">Projection Leads 2026</p>
                        <p className="text-3xl font-bold text-white">{Math.round(projectedMetrics.totalProjectedLeads).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm">Croissance vs 2025</p>
                        <p className="text-3xl font-bold text-emerald-400">+{projectedMetrics.growth}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Courbe Prévisionnelle 2026</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="week" stroke="#94a3b8" interval={4} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                            <Legend />
                            <Area type="monotone" dataKey="projected.leads" name="Leads 2026 (Projeté)" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={2} />
                            <Area type="monotone" dataKey="total.leads" name="Leads 2025 (Actuel)" stroke="#64748b" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function BilanStudio() {
    const design = useAgenceDesign();
    const settings = design?.settings || null;
    const mainLogoUrl = settings?.logoLightUrl || settings?.logoDarkUrl || null;

    const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);
    const [historyList, setHistoryList] = useState<PublishedReport[]>([]);
    
    // UI States
    const [activeTab, setActiveTab] = useState<'templates' | 'published'>('templates');
    const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [lastPublishedUrl, setLastPublishedUrl] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const renderContent = () => {
        switch (activeDashboardTab) {
            case 'overview': return <OverviewTab data={rawData} />;
            case 'platform': return <PlatformComparisonTab data={rawData} />;
            case 'video': return <VideoAnalysisTab data={rawData} />;
            case 'forecast': return <Projection2026Tab data={rawData} />;
            default: return <OverviewTab data={rawData} />;
        }
    };

    // Initialisation Historique
    useEffect(() => {
        const saved = localStorage.getItem('bilanHistory');
        if (saved) {
            try { setHistoryList(JSON.parse(saved)); } catch (e) { console.error(e); }
        } else {
            // Historique Factice pour la démo si vide
            setHistoryList([
                { id: 'bilan-q1', title: 'Bilan Q1 2025', url: '#', date: '15/04/2025', type: 'Trimestriel' },
                { id: 'perf-mars', title: 'Performance Mars', url: '#', date: '02/04/2025', type: 'Mensuel' }
            ]);
        }
    }, []);

    // --- PUBLICATION ---
    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "Bilan Annuel 2025", // Titre extrait ou par défaut
                    code: currentCode, 
                    data: {} // Pas de data externe pour ce template autonome
                })
            });

            const result = await response.json();

            if (result.success) {
                const url = `${window.location.origin}/dashboards/${result.slug}`;
                setLastPublishedUrl(url);
                
                const newReport: PublishedReport = {
                    id: result.slug,
                    title: "Bilan Annuel 2025",
                    url: url,
                    date: new Date().toLocaleDateString(),
                    type: 'Annuel'
                };
                
                const updatedHistory = [newReport, ...historyList];
                setHistoryList(updatedHistory);
                localStorage.setItem('bilanHistory', JSON.stringify(updatedHistory));
                setPublishModalOpen(true);
                setActiveTab('published'); // Basculer vers l'onglet publié pour voir le résultat
            } else {
                alert("Erreur : " + result.message);
            }
        } catch (e) { console.error(e); alert("Erreur réseau."); } 
        finally { setIsPublishing(false); }
    };

    return (
        <StudioLayout
            leftContent={null}
            rightContent={
                <div className="flex flex-col h-full bg-[#020617]">
                    {/* HEADER */}
                    <div className="h-16 border-b border-slate-800 bg-[#020617] flex items-center justify-between px-6 flex-shrink-0 z-40">
                        <div className="flex items-center gap-3">
                            <div className="h-10 flex items-center">
                                {mainLogoUrl ? (
                                <img
                                    src={mainLogoUrl || ''}
                                    alt="Sandbox"
                                    className="h-10 w-auto object-contain"
                                />
                                ) : (
                                <div className="h-10 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20 text-white font-bold text-sm ring-1 ring-white/10">
                                    SANDBOX
                                </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Media Automation Studio</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-6 border-r border-slate-800 pr-6">
                                <Link href="/" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors">
                                    <Home size={14} />
                                    Accueil
                                </Link>
                                <Link href="/studio/nouveau-plan" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors">
                                    <Plus size={14} />
                                    Nouveau
                                </Link>
                                <Link href="/studio/plan-media" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors">
                                    <Layout size={14} />
                                    Plans
                                </Link>
                                <Link href="/studio/portefeuille" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-violet-400 transition-colors">
                                    <TrendingUp size={14} />
                                    Portefeuille
                                </Link>
                                <Link href="/studio/bilan" className="flex items-center gap-2 text-xs font-medium text-white">
                                    <BarChart3 size={14} />
                                    Bilans
                                </Link>
                            </div>
                            <button onClick={handlePublish} disabled={isPublishing} className={`h-9 px-5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${isPublishing ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transform hover:-translate-y-0.5'}`}>
                                {isPublishing ? <div className="animate-spin"><Clock size={12}/></div> : <Share2 size={12} />} {isPublishing ? 'Publication...' : 'Publier le Bilan'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-yellow-500/30">
                            {/* Top Bar */}
                            <header className="h-16 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-black font-bold shadow-lg shadow-orange-900/20">
                                        <BarChart3 size={16} />
                                    </div>
                                    <div>
                                        <h1 className="text-white font-bold tracking-tight">EMSI Analytics</h1>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Bilan Média & Projections</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-2">
                                        <Calendar size={14} /> Année 2025
                                    </span>
                                </div>
                            </header>

                            <div className="max-w-[1600px] mx-auto pt-6 px-4">
                                {/* Main Content */}
                                <main className="min-w-0 pb-12">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {activeDashboardTab === 'overview' && "Tableau de Bord Exécutif"}
                                            {activeDashboardTab === 'platform' && "Analyse Comparative : Meta vs Google"}
                                            {activeDashboardTab === 'video' && "Performance du Contenu Vidéo"}
                                            {activeDashboardTab === 'forecast' && "Projections Budgétaires 2026"}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                             Analyse des performances marketing EMSI basée sur les données réelles et projetées.
                                        </p>
                                    </div>

                                    {renderContent()}
                                </main>
                            </div>
                        </div>
                    </div>

                    {/* MODAL SUCCESS */}
                    {publishModalOpen && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30"><Check size={24} strokeWidth={3} /></div>
                                        <div><h3 className="text-xl font-bold text-white">Bilan Publié !</h3><p className="text-sm text-slate-400">Le rapport est sécurisé et accessible.</p></div>
                                    </div>
                                    <button onClick={() => setPublishModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                                </div>
                                <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 flex items-center gap-3 mb-8 group">
                                    <Globe size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
                                    <div className="flex-1 font-mono text-xs text-slate-400 truncate select-all">{lastPublishedUrl}</div>
                                    <button onClick={() => navigator.clipboard.writeText(lastPublishedUrl || '')} className="text-yellow-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Copier"><Copy size={16} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setPublishModalOpen(false)} className="py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-all">Fermer</button>
                                    <a href={lastPublishedUrl || '#'} target="_blank" className="py-3 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/50">Voir le Rapport <ExternalLink size={16} /></a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
            bottomContent={
                <div className="h-9 bg-[#020617] border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-500 flex-shrink-0 z-50 select-none">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-400 tracking-wider">BILAN STUDIO v1.0</span>
                        <span className="w-px h-3 bg-slate-800"></span>
                        <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse"></div> SYSTÈME OPÉRATIONNEL</span>
                    </div>
                    <SystemClock />
                </div>
            } 
        >
            <textarea className="hidden" value={currentCode} onChange={e => setCurrentCode(e.target.value)} />
        </StudioLayout>
    );
}
