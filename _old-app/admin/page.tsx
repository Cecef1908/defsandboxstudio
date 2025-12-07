'use client';

import React from "react";
import Link from "next/link";
import { 
  Users, ArrowRight, ShieldCheck, Database, Building2, Layers, 
  Shield, UserCircle, BrainCircuit, Settings 
} from "lucide-react";

export default function AdminDashboard() {
  
  const modules = [
    {
      title: "Gestion Utilisateurs",
      icon: Users,
      color: "blue",
      items: [
        { label: "Utilisateurs", href: "/admin/users", desc: "Gérer les comptes et accès" },
        { label: "Rôles & Permissions", href: "/admin/roles", desc: "Configurer la matrice de droits" },
      ]
    },
    {
      title: "CRM & Données",
      icon: Building2,
      color: "emerald",
      items: [
        { label: "Clients", href: "/admin/clients", desc: "Base de données clients" },
        { label: "Contacts", href: "/admin/contacts", desc: "Carnet d'adresses CRM" },
      ]
    },
    {
      title: "Système",
      icon: Settings,
      color: "indigo",
      items: [
        { label: "Paramètres Agence", href: "/admin/settings", desc: "Configuration globale" },
        { label: "Maintenance BDD", href: "/admin/database-setup", desc: "Scripts et nettoyage" },
      ]
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-slate-400">Vue d'ensemble du système et configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.title} className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <module.icon size={16} />
              {module.title}
            </div>
            
            <div className="grid gap-4">
              {module.items.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.label}
                    </h3>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-slate-500">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Status */}
      <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-500" />
          État du Système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">Base de données connectée</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Auth Google active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Système de permissions actif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
