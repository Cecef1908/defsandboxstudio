'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Settings, Users, Building2, UserCircle, Database, 
  Shield, ChevronLeft, LogOut
} from 'lucide-react';
import { useAgenceDesign } from '../lib/useAgenceDesign';
import { useAuth } from '../lib/AuthContext';
import { RequireAuth } from '../lib/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin/clients', label: 'Clients', icon: Building2 },
  { href: '/admin/contacts', label: 'Contacts', icon: UserCircle },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/roles', label: 'Rôles & Permissions', icon: Shield },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  { href: '/admin/database-setup', label: 'Database Setup', icon: Database },
];

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const design = useAgenceDesign();
  const { user, signOut } = useAuth();
  const logoUrl = design?.settings?.logoLightUrl || design?.settings?.logoDarkUrl;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#0F172A]">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Settings size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-[#0F172A]">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.display_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{user.display_name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          )}
          
          <Link
            href="/studio/portefeuille"
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <ChevronLeft size={16} />
            Retour au Studio
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors w-full border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#020617]">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RequireAuth>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </RequireAuth>
  );
}
