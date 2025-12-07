'use client';

import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as Lucide from 'lucide-react';
// Import explicite des graphiques
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const errorTheme = {
  plain: { color: "#F87171", backgroundColor: "rgba(127, 29, 29, 0.9)" },
  styles: []
};

interface DashboardRendererProps {
    code: string;
    rawPlanData?: any;
}

export default function DashboardRenderer({ code, rawPlanData }: DashboardRendererProps) {
  
  // --- SCOPE MÉMOISÉ & SÉCURISÉ ---
  const scope = React.useMemo(() => ({
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    
    // Graphiques Recharts
    AreaChart, Area,
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
    
    // Icônes & Alias
    Lucide,                        
    IconPieChart: Lucide.PieChart, 
    IconBarChart: Lucide.BarChart,
    IconActivity: Lucide.Activity,
    
    // Icônes spécifiques
    ChevronDown: Lucide.ChevronDown, 
    Tag: Lucide.Tag,
    Layout: Lucide.Layout,
    Check: Lucide.Check,
    RotateCcw: Lucide.RotateCcw,
    Briefcase: Lucide.Briefcase,
    DollarSign: Lucide.DollarSign,
    Calendar: Lucide.Calendar,
    Zap: Lucide.Zap,
    TrendingUp: Lucide.TrendingUp,
    BarChart3: Lucide.BarChart3,

    // Données (Injection sécurisée)
    rawPlanData: rawPlanData || {}, 
    
    // Utilitaires
    Loader2: Lucide.Loader2, 
  }), [rawPlanData]); 

  // --- TRANSFORMATION DE CODE (Sécurité Anti-Ecran Blanc) ---
  const transformCode = (userCode: string) => {
      // CRITIQUE : Ajout de '\n' avant et après le code utilisateur.
      // Si le code utilisateur finit par un commentaire "//", cela commentait le catch block !
      return `
        try {
          ${userCode}
          \n
        } catch (err) {
          console.error("Live Preview Error:", err);
          render(
            <div className="flex flex-col items-center justify-center h-full text-red-400 p-8 text-center bg-[#0F172A]">
              <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                 <Lucide.AlertCircle size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Erreur d'Exécution</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md">
                Le code du dashboard a rencontré une erreur inattendue.
              </p>
              <pre className="text-[10px] bg-black/50 p-4 rounded-lg border border-red-500/30 max-w-full w-full overflow-auto text-left font-mono text-red-300 shadow-inner">
                {err.message}
              </pre>
            </div>
          );
        }
      `;
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0F172A]">
      <LiveProvider 
        code={code} 
        noInline={true} 
        scope={scope} 
        theme={errorTheme}
        transformCode={transformCode}
      >
        
        {/* Zone de rendu : Force le plein écran */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
           <LivePreview className="h-full w-full overflow-auto" />
        </div>

        {/* Console d'erreurs de Syntaxe (Compilation) */}
        {/* J'ai augmenté la visibilité au cas où l'erreur est là mais invisible */}
        <div className="absolute bottom-4 right-4 z-[100] max-w-2xl w-full px-4 pointer-events-none">
           <div className="pointer-events-auto shadow-2xl">
               <LiveError className="rounded-xl border border-red-500 bg-[#1a0505] text-red-200 p-4 text-xs font-mono backdrop-blur-md" />
           </div>
        </div>
      </LiveProvider>
    </div>
  );
}