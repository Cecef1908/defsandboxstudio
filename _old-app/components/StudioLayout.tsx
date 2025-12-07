'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Layout, Plus, Briefcase, BarChart3, Settings, 
  ChevronLeft, LogOut, BrainCircuit, ShieldCheck
} from 'lucide-react';
import { useAgenceDesign } from '../lib/useAgenceDesign';
import { useAuth } from '../lib/AuthContext';
import { RequireAuth } from '../lib/AuthContext';

interface StudioLayoutProps {
  leftContent?: React.ReactNode;
  rightContent: React.ReactNode;
  bottomContent?: React.ReactNode;
  children?: React.ReactNode;
}

// Navigation par défaut du Studio
const STUDIO_NAV_ITEMS = [
  { href: '/studio/nouveau-plan', label: 'Nouveau Plan', icon: Plus },
  { href: '/studio/portefeuille', label: 'Portefeuille', icon: Briefcase },
  { href: '/studio/plan-media', label: 'Plans Média', icon: Layout },
  { href: '/studio/bilan', label: 'Bilans', icon: BarChart3 },
  { href: '/studio/smart-import', label: 'Smart Import', icon: BrainCircuit },
  { href: '/studio/settings', label: 'Paramètres', icon: Settings },
];

function StudioLayoutContent({ leftContent, rightContent, bottomContent, children }: StudioLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const design = useAgenceDesign();
  const { user, signOut } = useAuth();
  const logoUrl = design?.settings?.logoLightUrl || design?.settings?.logoDarkUrl;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Si leftContent est fourni, on l'utilise (pour les sous-menus contextuels).
  // Sinon, on affiche la navigation par défaut du Studio.
  const sidebarContent = leftContent || (
    <>
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {STUDIO_NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-lg shadow-pink-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#020617] text-slate-200 font-sans selection:bg-pink-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#0F172A] z-20 relative">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          ) : (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Studio</span>
            </Link>
          )}
        </div>

        {/* Navigation Area */}
        {sidebarContent}

        {/* User & Logout Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-[#0F172A]">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.display_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{user.display_name}</div>
                <div className="text-xs text-slate-500 truncate">{user.role === 'super_admin' ? 'Super Admin' : 'Membre'}</div>
              </div>
            </div>
          )}
          
          {/* Admin Link (if applicable) */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-sm transition-colors border border-transparent hover:border-emerald-500/20"
            >
              <ShieldCheck size={16} />
              Administration
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors w-full border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 flex-col h-full min-w-0 bg-[#020617] relative z-10 overflow-hidden">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {rightContent}
        </div>

        {/* Bottom Bar (Optional) */}
        {bottomContent && (
          <div className="flex-shrink-0 w-full z-30 border-t border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
            {bottomContent}
          </div>
        )}
      </main>

      {/* Hidden Elements (Modals) */}
      {children}
    </div>
  );
}

export default function StudioLayout(props: StudioLayoutProps) {
  return (
    <RequireAuth>
      <StudioLayoutContent {...props} />
    </RequireAuth>
  );
}