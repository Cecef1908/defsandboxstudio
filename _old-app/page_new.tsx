'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Layout, ShieldCheck, ArrowRight, Command, Clock, LogOut, MonitorPlay
} from 'lucide-react';
import { useAgenceDesign } from './lib/useAgenceDesign';
import { useAuth } from './lib/AuthContext';

// --- SYSTEM CLOCK ---
function SystemClock() {
    const [time, setTime] = useState<Date | null>(null);
    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return <div className="w-16 h-4 bg-slate-800/50 rounded animate-pulse"></div>;

    return (
        <div className="font-mono text-[10px] text-indigo-400 flex items-center gap-2 bg-[#0F172A] px-2 py-1 rounded border border-slate-800/50 shadow-sm">
            <Clock size={10} />
            {time.toLocaleTimeString('fr-FR')}
        </div>
    );
}

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const design = useAgenceDesign();
  
  // Protection de la route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const settings = design?.settings || null;
  const mainLogoUrl = settings?.logoLightUrl || settings?.logoDarkUrl || null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="px-8 py-6 border-b border-slate-800/50 flex justify-between items-center bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* LOGO HORIZONTAL SANDBOX */}
          <div className="h-10 flex items-center">
            {mainLogoUrl ? (
              <img
                src={mainLogoUrl || ''}
                alt="Sandbox"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="text-white font-bold text-sm">Ah</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Agence Hub</span>
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-4 mr-4 border-r border-slate-800/50 pr-4">
              <SystemClock />
           </div>

           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800/50 text-xs font-medium text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              {user.email}
           </div>
           
           <button
             onClick={() => signOut()}
             className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all"
             title="Se déconnecter"
           >
              <LogOut size={14} />
           </button>

           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-default">
              {user.display_name?.charAt(0).toUpperCase()}
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl w-full z-10 relative">
          
          <div className="text-center mb-16 space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-2">
                <Command size={10} /> v2.0 Beta
             </div>

             <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
               Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Agence Hub</span>
             </h2>
             <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
               Sélectionnez un module pour commencer.
             </p>
          </div>

          {/* APP GRID - TWO MAIN MODULES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* CARD 1 : STUDIO MEDIA */}
            <Link href="/studio" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-900/20">
                 <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-all duration-300 shadow-inner">
                       <MonitorPlay size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">Studio Media</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Planification média, création de campagnes, suivi de portefeuille et génération de rapports.
                    </p>
                 </div>
                 <div className="mt-8 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">
                    Accéder au Studio <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>

            {/* CARD 2 : ADMINISTRATION */}
            <Link href="/admin" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-rose-900/20">
                 <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-rose-500 group-hover:text-white text-rose-400 transition-all duration-300 shadow-inner">
                       <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-rose-300 transition-colors">Administration</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Gestion des utilisateurs, configuration de l'agence, bases de données et sécurité.
                    </p>
                 </div>
                 <div className="mt-8 flex items-center justify-center text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-colors uppercase tracking-wider">
                    Accéder à l'Administration <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>

          </div>

          {/* FOOTER LINKS */}
          <div className="mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
             <div className="flex gap-6">
                <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
                <span className="hover:text-white cursor-pointer transition-colors">Support</span>
                <span className="hover:text-white cursor-pointer transition-colors">Status</span>
             </div>
             <div>
                © 2025 Agence Hub. Tous droits réservés.
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
