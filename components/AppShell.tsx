'use client';

// ============================================================================
// APP SHELL - Structure UI harmonieuse et responsive
// Architecture: Composant de layout réutilisable avec sidebar + header
// ============================================================================

import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Permissions } from '@/lib/permissions';
import { getMenuConfig, filterMenuByPermissions, MenuItem as MenuItemType } from '@/lib/config/menus';
import { getThemeConfig, getGradientClasses, getLogoFallback } from '@/lib/config/theme';
import { useAgenceLogo } from '@/lib/hooks/useAgenceDesign';

// ============================================================================
// TYPES
// ============================================================================

type AppContext = 'admin' | 'media';

interface AppShellProps {
  children: ReactNode;
  context: AppContext;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function AppShell({ children, context }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Charger la configuration
  const theme = getThemeConfig(context);
  const logoUrl = useAgenceLogo('dark');
  const rawMenu = getMenuConfig(context);
  
  // Filtrer le menu selon les permissions
  const menuItems = user 
    ? filterMenuByPermissions(rawMenu, (module, action) => Permissions.can(user, module, action))
    : rawMenu;
  
  const accentColor = theme.primary;

  // ============================================================================
  // BREADCRUMBS
  // ============================================================================

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* ========================================================================== */}
      {/* SIDEBAR - Desktop */}
      {/* ========================================================================== */}
      <aside 
        className={`
          hidden md:flex relative z-20 flex-col border-r border-slate-800 bg-[#0F172A] 
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* LOGO HEADER */}
        <Link href="/" className="h-16 flex items-center px-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
          <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className={`object-contain ${collapsed ? 'h-10 w-10' : 'h-10 w-auto'}`}
              />
            ) : (
              <div className={`
                flex items-center justify-center rounded-xl shadow-lg
                ${getGradientClasses(theme)}
                ${collapsed ? 'w-10 h-10' : 'w-10 h-10'}
              `}>
                <span className="text-white font-bold text-sm">
                  {getLogoFallback(theme)}
                </span>
              </div>
            )}
            
            {!collapsed && !logoUrl && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="font-bold text-white tracking-tight leading-none">Agence Hub</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 text-${accentColor}-400`}>
                  {theme.label}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {menuItems.map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              return !collapsed && (
                <div key={idx} className="mt-6 mb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {item.label}
                </div>
              );
            }

            const menuItem = item as MenuItemType;
            const isActive = menuItem.exact 
              ? pathname === menuItem.href 
              : pathname.startsWith(menuItem.href);
            
            // Récupérer l'icône dynamiquement depuis lucide-react
            const IconComponent = (Icons as any)[menuItem.icon] as Icons.LucideIcon;
            if (!IconComponent) {
              console.warn(`Icon "${menuItem.icon}" not found in lucide-react`);
              return null;
            }

            return (
              <Link
                key={idx}
                href={menuItem.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `bg-${accentColor}-500/10 text-${accentColor}-400 border border-${accentColor}-500/20` 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <IconComponent size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{menuItem.label}</span>
                )}
                {!collapsed && isActive && (
                  <Icons.ChevronRight size={14} className="ml-auto shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER SECTION */}
        <div className="p-3 border-t border-slate-800/50">
          {!collapsed && user && (
            <div className="mb-3 p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                  {user.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.display_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="uppercase tracking-wider font-medium">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <Icons.LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>

        {/* COLLAPSE TOGGLE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          {collapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ========================================================================== */}
      {/* MAIN CONTENT */}
      {/* ========================================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800/50 bg-[#0F172A]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <Icons.ChevronRight size={14} className="text-slate-600" />}
                <Link
                  href={crumb.href}
                  className={`
                    ${crumb.isLast 
                      ? 'text-white font-medium' 
                      : 'text-slate-400 hover:text-white'
                    }
                    transition-colors
                  `}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-all">
              <Icons.Search size={16} className="text-slate-400" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-all relative">
              <Icons.Bell size={16} className="text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            
            {/* Avatar / Menu utilisateur */}
            <div className="relative group">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm text-white font-medium hidden md:block">
                  {user?.display_name}
                </span>
              </Link>
            </div>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-all"
            >
              <Icons.Menu size={16} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#020617]">
          {children}
        </main>
      </div>
    </div>
  );
}
