'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAgenceDesign } from '../lib/useAgenceDesign';

interface StudioSidebarContentProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function StudioSidebarContent({ children, title, subtitle }: StudioSidebarContentProps) {
    const design = useAgenceDesign();
    // Utilisation de l'icône sombre ou claire selon le contexte
    const iconeUrl = design?.settings?.iconeLightUrl || design?.settings?.iconeDarkUrl;

    return (
        <div className="flex flex-col h-full bg-[#020617] border-r border-slate-800 w-full text-slate-300">
            {/* HEADER UNIFIÉ */}
            <div className="p-6 border-b border-slate-800 flex flex-col gap-4 bg-[#020617]">
                <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20 text-white font-bold text-sm ring-1 ring-white/10 overflow-hidden bg-black/20">
                        {iconeUrl ? <img src={iconeUrl} className="w-full h-full object-contain p-1" alt="Icône" /> : null}
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none tracking-tight">Sandbox</h1>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Studio OS</p>
                    </div>
                </Link>
                
                <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors px-2 py-2 hover:bg-slate-800/50 rounded-lg -ml-2">
                    <ChevronLeft size={14} /> Retour Accueil
                </Link>
            </div>

            {/* TITRE SECTION (Optionnel) */}
            {(title || subtitle) && (
                <div className="px-6 py-3 bg-[#0F172A]/50 border-b border-slate-800/50">
                    {title && <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">{title}</h2>}
                    {subtitle && <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>}
                </div>
            )}

            {/* CONTENU SPÉCIFIQUE PAGE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {children}
            </div>
            
            {/* FOOTER SIDEBAR */}
            <div className="p-4 border-t border-slate-800 text-[9px] text-slate-600 text-center select-none">
                Sandbox OS &copy; 2025
            </div>
        </div>
    );
}
