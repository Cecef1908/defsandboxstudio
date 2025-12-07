'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Layout, BarChart3, ArrowRight, TrendingUp, Plus
} from 'lucide-react';

export default function StudioHome() {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center md:text-left">
         <h1 className="text-3xl font-bold text-white mb-2">
            Studio <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Media</span>
         </h1>
         <p className="text-slate-400">
           Gérez vos campagnes, analysez vos performances et créez de nouveaux plans média.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1 : CRÉATION */}
        <Link href="/studio/nouveau-plan" className="group relative">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-emerald-900/20">
             <div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white text-emerald-400 transition-all duration-300 shadow-inner">
                   <Plus size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Nouveau Plan</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  Initiez une nouvelle campagne média avec notre assistant de planification intelligent.
                </p>
             </div>
             <div className="mt-6 flex items-center text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
                Commencer <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </Link>

        {/* CARD 2 : PLAN MEDIA (GESTION) */}
        <Link href="/studio/plan-media" className="group relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-900/20">
             <div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-all duration-300 shadow-inner">
                   <Layout size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Mes Plans</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  Gérez vos campagnes actives, ajustez les budgets et suivez l'avancement.
                </p>
             </div>
             <div className="mt-6 flex items-center text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">
                Consulter <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </Link>

        {/* CARD 3 : PORTEFEUILLE MEDIA */}
        <Link href="/studio/portefeuille" className="group relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-violet-900/20">
             <div>
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-500 group-hover:text-white text-violet-400 transition-all duration-300 shadow-inner">
                   <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Portefeuille</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  Vue macro de tous vos investissements média et performances agrégées.
                </p>
             </div>
             <div className="mt-6 flex items-center text-[10px] font-bold text-violet-400 group-hover:text-violet-300 transition-colors uppercase tracking-wider">
                Analyser <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </Link>

        {/* CARD 4 : BILAN / REPORTING */}
        <Link href="/studio/bilan" className="group relative">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-amber-900/20">
             <div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white text-amber-500 transition-all duration-300 shadow-inner">
                   <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">Bilans</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  Générez des rapports PDF professionnels et analysez les KPI clés.
                </p>
             </div>
             <div className="mt-6 flex items-center text-[10px] font-bold text-amber-500 group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                Rapports <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
