'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MonitorPlay, ShieldCheck, Users, Globe, FolderKanban, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Permissions } from '@/lib/permissions';

const MODULES = [
  {
    id: 'media',
    name: 'Studio Média',
    description: 'Planification et gestion des campagnes média',
    icon: MonitorPlay,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    href: '/media',
    active: true,
    permission: { module: 'studio' as const, action: 'view' as const }
  },
  {
    id: 'admin',
    name: 'Administration',
    description: 'Gestion clients, utilisateurs et configuration',
    icon: ShieldCheck,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    href: '/admin',
    active: true,
    permission: { module: 'admin' as const, action: 'view' as const }
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Calendrier éditorial et analytics social',
    icon: Users,
    color: 'purple',
    gradient: 'from-purple-500 to-fuchsia-600',
    href: '/social',
    active: false,
    comingSoon: true
  },
  {
    id: 'web',
    name: 'Web Analytics',
    description: 'Suivi performance web et SEO',
    icon: Globe,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    href: '/web',
    active: false,
    comingSoon: true
  },
  {
    id: 'projects',
    name: 'Gestion Projets',
    description: 'Planning, tâches et collaboration',
    icon: FolderKanban,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    href: '/projects',
    active: false,
    comingSoon: true
  }
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Rediriger vers login si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Filtrer les modules selon les permissions
  const accessibleModules = MODULES.filter(module => {
    if (!module.active) return true; // Afficher "Coming Soon"
    if (!module.permission) return true;
    return Permissions.can(user, module.permission.module, module.permission.action);
  });

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Ah</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Agence Hub</h1>
                <p className="text-sm text-slate-400">Plateforme collaborative multi-modules</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.display_name}</p>
                <p className="text-xs text-slate-400">{user.role.replace('_', ' ')}</p>
              </div>
              <Link
                href="/account"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold overflow-hidden hover:ring-2 hover:ring-indigo-400 transition-all"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.display_name?.charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Sélectionnez un module</h2>
          <p className="text-slate-400">Accédez aux différents espaces de travail de la plateforme</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            
            if (module.comingSoon) {
              return (
                <div
                  key={module.id}
                  className="relative group bg-slate-900/30 border border-slate-800 rounded-2xl p-6 opacity-60"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full">
                      Bientôt
                    </span>
                  </div>
                  
                  <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center mb-4 opacity-50`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">{module.name}</h3>
                  <p className="text-slate-400 text-sm">{module.description}</p>
                </div>
              );
            }

            return (
              <Link
                key={module.id}
                href={module.href}
                className="relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`absolute -inset-px bg-gradient-to-br ${module.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl`} />
                
                <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${module.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className="text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all uppercase tracking-wide">
                  {module.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{module.description}</p>
                
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                  <span>Accéder</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={20} className="text-indigo-400" />
              <h4 className="font-medium text-white">Modules Actifs</h4>
            </div>
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-sm text-slate-400 mt-1">Media & Admin opérationnels</p>
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-emerald-400" />
              <h4 className="font-medium text-white">Votre Rôle</h4>
            </div>
            <p className="text-3xl font-bold text-white capitalize">{user.role.replace('_', ' ')}</p>
            <p className="text-sm text-slate-400 mt-1">Accès selon permissions</p>
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban size={20} className="text-purple-400" />
              <h4 className="font-medium text-white">À Venir</h4>
            </div>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-sm text-slate-400 mt-1">Modules en développement</p>
          </div>
        </div>
      </main>
    </div>
  );
}
