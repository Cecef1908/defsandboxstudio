'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart 
} from 'recharts';
import { 
  Upload, Database, TrendingUp, DollarSign, Users, Activity, 
  Filter, Calculator, ArrowRight, MousePointer, Target, Eye 
} from 'lucide-react';

/**
 * --- PARTIE 1 : INTELLIGENCE DE LA DONNÉE (TYPES & NORMALISATION) ---
 * C'est ici que nous définissons le "Dictionnaire" de données unifié.
 */

// Structure unifiée pour une ligne de donnée (indépendante de la source)
interface UnifiedMetric {
  id: string;
  source: 'META' | 'GOOGLE';
  date_week: number; // Numéro de semaine
  campaign_name: string;
  
  // Métriques de volume
  impressions: number;
  clicks: number;
  spend: number;
  
  // Métriques de conversion
  leads_total: number; // Meta (On-FB + Web) + Google (Conv)
  
  // Métriques Vidéo
  video_view_3s: number;
  video_p25: number;
  video_p50: number;
  video_p100: number;
  
  // Métriques Calculées
  ctr: number;
  cpc: number;
  cpm: number;
  cpl: number;
  hook_rate: number; // 3s / Impressions
  retention_rate: number; // 100% / 25%
}

// --- UTILITAIRES DE NETTOYAGE ---

// Convertit "1 271,89" ou "1.271,89" en 1271.89
const cleanMoney = (val: string | number | undefined): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  // Enlève les espaces insécables, remplace virgule par point
  const cleaned = val.toString().replace(/\s/g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Convertit les entiers avec séparateurs
const cleanInt = (val: string | number | undefined): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().replace(/\s/g, '').replace(/,/g, '');
  return parseInt(cleaned, 10) || 0;
};

/**
 * --- PARTIE 2 : MOTEUR D'INGESTION (LOGIQUE MÉTIER) ---
 */

const DataIngestion = ({ onDataLoaded }: { onDataLoaded: (data: UnifiedMetric[]) => void }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'META_WEEK' | 'GOOGLE_WEEK') => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rawData = results.data as any[];
        const processedData: UnifiedMetric[] = [];
        
        setLogs(prev => [...prev, `Fichier chargé: ${file.name} (${rawData.length} lignes)`]);

        rawData.forEach((row, index) => {
          // Ignorer les lignes vides ou de totaux si nécessaire
          if (!row['Week'] && !row['Week (Mon-Sun)']) return;

          try {
            const isMeta = type === 'META_WEEK';
            const week = cleanInt(row['Week'] || row['Week (Mon-Sun)']);
            
            // Mapping spécifique basé sur VOS entêtes CSV
            const impressions = cleanInt(row['Impressions']);
            const spend = isMeta ? cleanMoney(row['Budget en MAD'] || row['Cost']) : cleanMoney(row['Cost']);
            
            // Google: "Clicks", Meta: "Link clicks"
            const clicks = cleanInt(isMeta ? row['Link clicks'] : row['Clicks']);
            
            // Unification des Leads
            let leads = 0;
            if (isMeta) {
              leads = cleanInt(row['On-Facebook leads']) + cleanInt(row['Website leads']);
            } else {
              leads = cleanInt(row['Conversions']);
            }

            // Vidéo
            const v3s = isMeta ? cleanInt(row['Video play actions']) : cleanInt(row['Video views']);
            const v25 = isMeta ? cleanInt(row['Video watches at 25%']) : cleanInt(row['Watch 25% views']);
            const v50 = isMeta ? cleanInt(row['Video watches at 50%']) : cleanInt(row['Watch 50% views']);
            const v100 = isMeta ? cleanInt(row['Video watches at 100%']) : cleanInt(row['Watch 100% views']);

            // Calculs de sécurité (éviter division par 0)
            const safeDiv = (n: number, d: number) => d > 0 ? n / d : 0;

            const metric: UnifiedMetric = {
              id: `${isMeta ? 'META' : 'GOOG'}-${week}-${index}`,
              source: isMeta ? 'META' : 'GOOGLE',
              date_week: week,
              campaign_name: 'Aggregated Weekly', // Pour le fichier "Par semaine"
              impressions,
              clicks,
              spend,
              leads_total: leads,
              video_view_3s: v3s,
              video_p25: v25,
              video_p50: v50,
              video_p100: v100,
              // KPIs calculés
              ctr: safeDiv(clicks, impressions) * 100,
              cpm: safeDiv(spend, impressions) * 1000,
              cpc: safeDiv(spend, clicks),
              cpl: safeDiv(spend, leads),
              hook_rate: safeDiv(v3s, impressions) * 100,
              retention_rate: safeDiv(v100, v25) * 100
            };

            processedData.push(metric);
          } catch (err) {
            console.error("Erreur parsing ligne", index, err);
          }
        });

        setLogs(prev => [...prev, `Traitement terminé: ${processedData.length} métriques unifiées générées.`]);
        onDataLoaded(processedData);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-indigo-600" />
        Ingestion des Données Supermetrics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-600">Charger CSV Meta (Par Semaine)</span>
          <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'META_WEEK')} />
        </div>
        
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-600">Charger CSV Google (Par Semaine)</span>
          <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'GOOGLE_WEEK')} />
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-slate-900 text-green-400 text-xs font-mono rounded overflow-y-auto max-h-32">
          {logs.map((log, i) => <div key={i}>{'>'} {log}</div>)}
        </div>
      )}
    </div>
  );
};

/**
 * --- PARTIE 3 : COMPOSANTS D'INTERFACE ---
 */

const KPICard = ({ title, value, unit, trend, color = "indigo", subtitle }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        {color === 'indigo' && <Activity size={20} />}
        {color === 'green' && <DollarSign size={20} />}
        {color === 'blue' && <Users size={20} />}
        {color === 'purple' && <TrendingUp size={20} />}
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-xs font-medium">
        <span className={trend > 0 ? "text-green-600" : "text-red-500"}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
        <span className="text-slate-400 ml-1">vs sem. précédente</span>
      </div>
    )}
  </div>
);

const Simulator = ({ avgCPL, avgCPC }: { avgCPL: number, avgCPC: number }) => {
  const [budget, setBudget] = useState(5000);
  const [targetLeads, setTargetLeads] = useState(100);
  const [mode, setMode] = useState<'budget' | 'leads'>('budget');

  const estimatedLeads = avgCPL > 0 ? Math.floor(budget / avgCPL) : 0;
  const estimatedCost = targetLeads * avgCPL;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold">Simulateur de Performance (Inverse Calc)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mode 1: J'ai du budget, combien de leads ? */}
        <div className={`p-4 rounded-lg border ${mode === 'budget' ? 'border-indigo-500 bg-white/5' : 'border-slate-700 bg-transparent'} transition-all cursor-pointer`} onClick={() => setMode('budget')}>
          <div className="flex items-center gap-2 mb-3 text-indigo-300">
            <DollarSign size={18} />
            <h3 className="font-semibold">Budget vers Leads</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Mon Budget (MAD)</label>
              <input 
                type="range" min="1000" max="50000" step="500" 
                value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between mt-1">
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white w-24"
                />
                <span className="text-xs text-slate-500">MAD</span>
              </div>
            </div>
            
            <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-200">Leads Estimés</p>
                <p className="text-3xl font-bold text-white">{estimatedLeads}</p>
              </div>
              <ArrowRight className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Mode 2: Je veux des leads, combien ça coûte ? */}
        <div className={`p-4 rounded-lg border ${mode === 'leads' ? 'border-emerald-500 bg-white/5' : 'border-slate-700 bg-transparent'} transition-all cursor-pointer`} onClick={() => setMode('leads')}>
          <div className="flex items-center gap-2 mb-3 text-emerald-300">
            <Target size={18} />
            <h3 className="font-semibold">Objectif Leads vers Budget</h3>
          </div>
           <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Objectif Leads</label>
              <input 
                type="range" min="10" max="1000" step="10" 
                value={targetLeads} onChange={(e) => setTargetLeads(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
               <div className="flex justify-between mt-1">
                <input 
                  type="number" 
                  value={targetLeads} 
                  onChange={(e) => setTargetLeads(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white w-24"
                />
                <span className="text-xs text-slate-500">Leads</span>
              </div>
            </div>
            
            <div className="bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-200">Budget Requis</p>
                <p className="text-3xl font-bold text-white">{estimatedCost.toLocaleString('fr-MA', { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-emerald-300">MAD</span></p>
              </div>
              <ArrowRight className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 text-center">
        *Calculs basés sur votre CPL moyen historique de {avgCPL.toFixed(2)} MAD.
      </div>
    </div>
  );
};

/**
 * --- MAIN COMPONENT: DASHBOARD GLOBAL ---
 */

const Dashboard = () => {
  // State pour les données
  const [data, setData] = useState<UnifiedMetric[]>([]);
  
  // Fake data pour la démo initiale (si pas de CSV chargé)
  useEffect(() => {
    // On simule des données initiales pour que l'interface ne soit pas vide
    const dummyData: UnifiedMetric[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `mock-${i}`,
      source: i % 2 === 0 ? 'META' : 'GOOGLE',
      date_week: i + 1,
      campaign_name: 'Mock Campaign',
      impressions: 15000 + Math.random() * 10000,
      clicks: 300 + Math.random() * 100,
      spend: 1200 + Math.random() * 500,
      leads_total: 15 + Math.random() * 20,
      video_view_3s: 5000,
      video_p25: 2000,
      video_p50: 1000,
      video_p100: 500,
      ctr: 2.5,
      cpc: 4.5,
      cpm: 25,
      cpl: 65,
      hook_rate: 30,
      retention_rate: 25
    }));
    setData(dummyData);
  }, []);

  // Agrégation des données (Fusion Meta + Google par semaine)
  const weeklyStats = useMemo(() => {
    const weeks: Record<number, any> = {};
    
    data.forEach(d => {
      if (!weeks[d.date_week]) {
        weeks[d.date_week] = {
          name: `Sem ${d.date_week}`,
          week: d.date_week,
          spend: 0,
          leads: 0,
          impressions: 0,
          clicks: 0,
          meta_spend: 0,
          google_spend: 0,
          video_p25: 0,
          video_p100: 0
        };
      }
      weeks[d.date_week].spend += d.spend;
      weeks[d.date_week].leads += d.leads_total;
      weeks[d.date_week].impressions += d.impressions;
      weeks[d.date_week].clicks += d.clicks;
      weeks[d.date_week].video_p25 += d.video_p25;
      weeks[d.date_week].video_p100 += d.video_p100;
      
      if (d.source === 'META') weeks[d.date_week].meta_spend += d.spend;
      if (d.source === 'GOOGLE') weeks[d.date_week].google_spend += d.spend;
    });

    return Object.values(weeks)
      .sort((a, b) => a.week - b.week)
      .map((w: any) => ({
        ...w,
        cpl: w.leads > 0 ? w.spend / w.leads : 0,
        ctr: w.impressions > 0 ? (w.clicks / w.impressions) * 100 : 0,
        retention: w.video_p25 > 0 ? (w.video_p100 / w.video_p25) * 100 : 0
      }));
  }, [data]);

  // Moyennes Globales
  const totals = useMemo(() => {
    const totalSpend = data.reduce((acc, curr) => acc + curr.spend, 0);
    const totalLeads = data.reduce((acc, curr) => acc + curr.leads_total, 0);
    const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
    return {
      spend: totalSpend,
      leads: totalLeads,
      cpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">EMSI</div>
          <h1 className="text-xl font-bold text-slate-800">Growth Intelligence Dashboard</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
          <span>Source: Supermetrics CSV</span>
          <div className="h-4 w-px bg-slate-300"></div>
          <span>Année: 2025</span>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl p-6">
        
        {/* Module d'Ingestion */}
        <DataIngestion onDataLoaded={(newData) => setData(prev => [...prev, ...newData])} />

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Investissement Total" 
            value={totals.spend.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })} 
            unit="" 
            color="green" 
            subtitle="Meta + Google"
          />
          <KPICard 
            title="Leads Générés" 
            value={totals.leads.toLocaleString()} 
            unit="Prospects" 
            color="indigo" 
            subtitle="Web + FB Leads + Conv"
          />
          <KPICard 
            title="Coût par Lead (CPL)" 
            value={totals.cpl.toFixed(2)} 
            unit="MAD" 
            color="purple" 
            subtitle="Moyenne pondérée"
          />
          <KPICard 
            title="Trafic Qualifié" 
            value={totals.spend > 0 ? (totals.spend / totals.cpc).toFixed(0) : "0"} 
            unit="Clics" 
            color="blue" 
            subtitle={`CPC Moy: ${totals.cpc.toFixed(2)} MAD`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart: Evolution CPL vs Spend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Dynamique d'Acquisition (CPL vs Dépenses)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fontSize: 12}} axisLine={false} tickLine={false} unit=" MAD" />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="spend" name="Budget (MAD)" fill="#6366f1" fillOpacity={0.1} stroke="#6366f1" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="cpl" name="CPL (MAD)" stroke="#f43f5e" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart: Mix Media */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition du Budget</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="meta_spend" name="Meta Ads" stackId="a" fill="#1877F2" radius={[0, 0, 0, 0]} barSize={20} />
                  <Bar dataKey="google_spend" name="Google Ads" stackId="a" fill="#EA4335" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SIMULATOR */}
          <div className="lg:col-span-1">
            <Simulator avgCPL={totals.cpl} avgCPC={totals.cpc} />
          </div>

          {/* Retention Vidéo */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Qualité Créative: Rétention Vidéo</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                <Eye size={14} />
                <span>Focus Meta</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyStats}>
                  <defs>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="retention" name="Rétention (25% à 100%)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRetention)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              *La Rétention mesure le % de gens qui regardent la vidéo en entier APRES avoir passé les 3 premières secondes. Un taux élevé indique un contenu pertinent.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;