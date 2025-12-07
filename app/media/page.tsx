'use client';

import { Layers, Plus, Briefcase, BarChart3, TrendingUp, DollarSign, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MediaDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Studio Média</h1>
        <p className="text-slate-400">Planification et gestion de vos campagnes média</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <Layers size={24} className="text-indigo-400" />
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Plans média actifs</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-violet-500/10">
              <DollarSign size={24} className="text-violet-400" />
            </div>
            <Target size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0 MAD</h3>
          <p className="text-sm text-slate-400">Budget total</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-pink-500/10">
              <Target size={24} className="text-pink-400" />
            </div>
            <BarChart3 size={16} className="text-pink-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Insertions</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Briefcase size={24} className="text-emerald-400" />
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Campagnes en cours</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/media/nouveau-plan"
            className="group bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
          >
            <Plus size={24} className="text-indigo-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              Nouveau plan média
            </h3>
            <p className="text-sm text-slate-400">Créer un nouveau plan de campagne</p>
          </Link>

          <Link
            href="/media/plan-media"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-all"
          >
            <Layers size={24} className="text-violet-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
              Voir les plans
            </h3>
            <p className="text-sm text-slate-400">Consulter tous les plans média</p>
          </Link>

          <Link
            href="/media/portefeuille"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-pink-500/50 transition-all"
          >
            <Briefcase size={24} className="text-pink-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">
              Portefeuille
            </h3>
            <p className="text-sm text-slate-400">Vue globale de tous les projets</p>
          </Link>

          <Link
            href="/media/bilan"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
          >
            <BarChart3 size={24} className="text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Bilans & rapports
            </h3>
            <p className="text-sm text-slate-400">Analyses et performances</p>
          </Link>

          <Link
            href="/media/ai-agent"
            className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all"
          >
            <Sparkles size={24} className="text-purple-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
              AI media planner
            </h3>
            <p className="text-sm text-slate-400">Assistant IA pour la planification</p>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Layers size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Module Studio Média</h3>
            <p className="text-sm text-slate-300">
              Créez, gérez et analysez vos plans média. Suivez vos budgets, insertions et performances
              en temps réel. Exportez vos documents et dashboards personnalisés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
