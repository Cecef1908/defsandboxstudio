'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Building2, Tag, Briefcase, 
  Settings, LogOut, ChevronRight, Menu, Bell, Search,
  ChevronLeft, Layout, Plus, BarChart3, BrainCircuit, ShieldCheck, UserCircle,
  Sparkles, Layers
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAgenceDesign } from '../lib/useAgenceDesign';

// ============================================================================
// CONFIGURATION DES MENUS
// ============================================================================

const MENUS = {
  admin: [
    { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, exact: true },
    { type: 'divider', label: 'CRM & Données' },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Annonceurs", href: "/admin/advertisers", icon: Building2 },
    { label: "Marques", href: "/admin/brands", icon: Tag },
    { label: "Contacts", href: "/admin/contacts", icon: UserCircle },
    { type: 'divider', label: 'Médias' },
    { label: "Médiathèque", href: "/admin/media-library", icon: BrainCircuit },
    { type: 'divider', label: 'Système' },
    { label: "Utilisateurs", href: "/admin/users", icon: Users },
    { label: "Rôles & Permissions", href: "/admin/roles", icon: ShieldCheck },
    { label: "Configuration", href: "/admin/settings", icon: Settings },
    { label: "Maintenance BDD", href: "/admin/database-setup", icon: Settings },
  ],
  studio: [
    { label: "Vue d'ensemble", href: "/studio", icon: LayoutDashboard, exact: true },
    { type: 'divider', label: 'Production' },
    { label: "Nouveau Plan", href: "/studio/nouveau-plan", icon: Plus },
    { label: "Plan Média (Live)", href: "/studio/plan-media", icon: Layers },
    { label: "AI Media Planner", href: "/studio/ai-agent", icon: Sparkles },
    { type: 'divider', label: 'Analyse' },
    { label: "Portefeuille", href: "/studio/portefeuille", icon: Briefcase },
    { label: "Bilans", href: "/studio/bilan", icon: BarChart3 },
    { label: "Smart Import", href: "/studio/smart-import", icon: BrainCircuit },
    { type: 'divider', label: 'Outils' },
    { label: "Paramètres", href: "/studio/settings", icon: Settings },
  ]
};

// ============================================================================
// TYPES
// ============================================================================

type AppContext = 'admin' | 'studio';

interface AppShellProps {
  children: React.ReactNode;
  context: AppContext;
}

// ============================================================================
// COMPOSANT PRINCIPAL (SUPER ENGINE)
// ============================================================================

export default function AppShell({ children, context }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const design = useAgenceDesign();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = MENUS[context];
  const accentColor = context === 'admin' ? 'emerald' : 'pink';
  const logoUrl = design?.settings?.logoLightUrl || design?.settings?.logoDarkUrl;

  // --- BREADCRUMBS ENGINE ---
  const generateBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { href, label, isLast };
    });
  };
  
  const breadcrumbs = generateBreadcrumbs();

  // --- HELPERS ---
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* ============================================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================================ */}
      <aside 
        className={`
          relative z-20 flex flex-col border-r border-slate-800 bg-[#0F172A] 
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* LOGO HEADER */}
        <div className="h-16 flex items-center px-4">
          <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className={`
                flex items-center justify-center rounded-lg shadow-lg
                ${context === 'admin' 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                  : 'bg-gradient-to-br from-pink-500 to-violet-600'
                }
                ${collapsed ? 'w-10 h-10' : 'w-8 h-8'}
              `}>
                <span className="text-white font-bold text-sm">
                  {context === 'admin' ? 'A' : 'S'}
                </span>
              </div>
            )}
            
            {!collapsed && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="font-bold text-white tracking-tight leading-none">Agence Hub</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 text-${accentColor}-400`}>
                  {context === 'admin' ? 'Admin' : 'Studio'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {menuItems.map((item, idx) => {
            if (item.type === 'divider') {
              return !collapsed && (
                <div key={idx} className="mt-6 mb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {item.label}
                </div>
              );
            }

            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href || '');

            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.href || '#'}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                  ${isActive 
                    ? `bg-${accentColor}-500/10 text-${accentColor}-400` 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-${accentColor}-500 rounded-r-full`} />
                )}

                {Icon && <Icon size={20} className={isActive ? `text-${accentColor}-400` : "text-slate-500 group-hover:text-white"} />}
                
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-3 border-t border-slate-800 bg-[#0F172A]">
          {/* Switch Context Link */}
          <Link
            href={context === 'admin' ? '/studio/portefeuille' : '/admin'}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
            title={context === 'admin' ? "Aller au Studio" : "Aller à l'Admin"}
          >
            {context === 'admin' ? <Layout size={20} /> : <ShieldCheck size={20} />}
            {!collapsed && (
              <span className="text-sm font-medium">
                {context === 'admin' ? 'Aller au Studio' : 'Admin'}
              </span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
            title="Déconnexion"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>

        {/* COLLAPSE TOGGLE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-30"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ============================================================================ */}
      {/* MAIN AREA */}
      {/* ============================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        
        {/* TOPBAR */}
        <header className="h-16 px-6 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <span className="font-bold text-xs">AH</span>
              </div>
            </Link>
            <span className="text-slate-700">/</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <span className="text-slate-700">/</span>}
                <Link 
                  href={crumb.href}
                  className={`
                    transition-colors hover:text-white
                    ${crumb.isLast ? 'text-white font-medium pointer-events-none' : 'text-slate-500'}
                  `}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none w-64 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
              <Bell size={16} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617]" />
            </button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-white">{user.display_name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user.role}</div>
                </div>
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg
                  ${context === 'admin' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-pink-500 to-violet-600'}
                `}>
                  {user.display_name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
