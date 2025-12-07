'use client';

import { Users, Building2, Tag, UserCircle, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-slate-400">Vue d'ensemble et gestion de la plateforme</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <Users size={24} className="text-indigo-400" />
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Clients actifs</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-violet-500/10">
              <Building2 size={24} className="text-violet-400" />
            </div>
            <Activity size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Annonceurs</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-pink-500/10">
              <Tag size={24} className="text-pink-400" />
            </div>
            <BarChart3 size={16} className="text-pink-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Marques</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <UserCircle size={24} className="text-emerald-400" />
            </div>
            <Users size={16} className="text-slate-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">0</h3>
          <p className="text-sm text-slate-400">Utilisateurs</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/clients"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
          >
            <Users size={24} className="text-indigo-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              Gérer les clients
            </h3>
            <p className="text-sm text-slate-400">Ajouter, modifier ou supprimer des clients</p>
          </Link>

          <Link
            href="/admin/advertisers"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-all"
          >
            <Building2 size={24} className="text-violet-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
              Gérer les annonceurs
            </h3>
            <p className="text-sm text-slate-400">Configurer les annonceurs et projets</p>
          </Link>

          <Link
            href="/admin/brands"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-pink-500/50 transition-all"
          >
            <Tag size={24} className="text-pink-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">
              Gérer les marques
            </h3>
            <p className="text-sm text-slate-400">Ajouter et organiser les marques</p>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
          >
            <UserCircle size={24} className="text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Gérer les utilisateurs
            </h3>
            <p className="text-sm text-slate-400">Inviter et gérer les permissions</p>
          </Link>

          <Link
            href="/admin/settings"
            className="group bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-rose-500/50 transition-all"
          >
            <Activity size={24} className="text-rose-400 mb-3" />
            <h3 className="font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">
              Configuration
            </h3>
            <p className="text-sm text-slate-400">Paramètres de l'agence</p>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Activity size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Module Administration</h3>
            <p className="text-sm text-slate-300">
              Gérez vos clients, annonceurs, marques et utilisateurs depuis cet espace centralisé.
              Les données sont synchronisées en temps réel avec la base de données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
