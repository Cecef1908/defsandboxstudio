'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, Loader2, Image as IconImage, Settings, Home, X
} from 'lucide-react';
import StudioLayout from "../../components/StudioLayout"; 

import { 
    db, 
    authenticateUser, 
    AGENCE_SETTINGS_COLLECTION // Import de la nouvelle collection
} from '../../lib/firebase'; 

import { doc, getDoc } from 'firebase/firestore'; 

// --- HOOK DE CHARGEMENT DES PARAMÈTRES DE L'AGENCE ---
function useAgenceSettings() {
    const [settings, setSettings] = useState<{ logoAgenceUrl: string | null; iconeAgenceUrl: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                // 1. Authentification
                await authenticateUser();
                
                // 2. Récupération du document unique 'main' dans la collection 'agenceSettings'
                const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, 'main');
                const settingsSnap = await getDoc(settingsRef);

                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    setSettings({
                        logoAgenceUrl: data.logoAgenceUrl || null,
                        iconeAgenceUrl: data.iconeAgenceUrl || null,
                    });
                } else {
                    setError("Document 'main' de l'agence non trouvé. Assurez-vous qu'il existe.");
                }
            } catch (err: any) { 
                console.error("Erreur lors du chargement des paramètres:", err);
                setError(err.message || "Erreur inconnue lors de l'accès à Firestore.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
}

// Composant pour simuler un lien de navigation
const LinkComponent = ({ href, children, className }: { href: string, children: React.ReactNode, className: string }) => {
    return (
        <a href={href} className={className} onClick={(e) => {
             e.preventDefault();
             window.location.href = href;
        }}>
            {children}
        </a>
    );
};

export default function StudioLogoTestPage() {
    const { settings, loading, error } = useAgenceSettings();

    const renderHeader = (
        <div className="h-16 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-6 flex-shrink-0 z-40">
            <LinkComponent href="/" className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50">
                <Home size={20} />
            </LinkComponent>
            <div className="flex items-center gap-3">
                <Settings size={20} className="text-slate-500" />
                <div className="text-white font-bold leading-none tracking-tight">Test Logo Agence</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Firestore Settings</div>
            </div>
            {settings?.iconeAgenceUrl ? (
                // L'ICÔNE (Petit logo) PLACÉ ICI DANS LE HEADER
                <img 
                    src={settings.iconeAgenceUrl} 
                    alt="Icône Agence" 
                    className="w-8 h-8 object-contain rounded-lg border border-slate-700 p-0.5" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; console.error("Erreur icône agence"); }}
                />
            ) : (
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">I</div>
            )}
        </div>
    );

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-4">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-sm">Chargement des paramètres de l'agence...</p>
            </div>
        );

        if (error) return (
            <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4 p-8">
                <X size={48} />
                <p className="text-lg font-bold">Erreur Firestore</p>
                <p className="text-sm text-center max-w-lg">{error}</p>
                <p className="text-xs text-slate-500 mt-4">Conseil : Vérifiez la collection **agenceSettings** et le document **main**.</p>
            </div>
        );

        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">Résultats de l'Intégration du Logo Agence</h1>

                {/* LOGO PRINCIPAL (Grand format) */}
                <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2"><IconImage size={14} /> Logo Principal (Grand Format)</h2>
                    {settings?.logoAgenceUrl ? (
                        <div className="p-4 border border-slate-700 rounded-lg bg-[#0F172A] flex items-center justify-center h-48">
                            <img 
                                src={settings.logoAgenceUrl} 
                                alt="Logo Agence Principal" 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => { 
                                    e.currentTarget.style.display = 'none'; 
                                    const parent = e.currentTarget.parentNode as HTMLElement;
                                    if (parent) {
                                        parent.innerHTML = '<div class="text-red-400">Erreur de chargement du Logo Principal. URL invalide.</div>'; 
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-slate-500 italic text-center p-8 border border-dashed border-slate-700 rounded-lg">URL `logoAgenceUrl` non trouvée dans le document `main`.</div>
                    )}
                    <div className="mt-4 text-xs font-mono text-slate-600 truncate">{settings?.logoAgenceUrl || 'N/A'}</div>
                </div>

                {/* ICÔNE (Petit format) */}
                <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2"><IconImage size={14} /> Icône / Favicon (Petit Format)</h2>
                    <div className="flex items-center gap-6">
                        <div className="p-4 border border-slate-700 rounded-full bg-[#0F172A] w-20 h-20 flex items-center justify-center flex-shrink-0">
                            {settings?.iconeAgenceUrl ? (
                                <img 
                                    src={settings.iconeAgenceUrl} 
                                    alt="Icône Agence" 
                                    className="w-12 h-12 object-contain rounded-full"
                                    onError={(e) => { 
                                        e.currentTarget.style.display = 'none'; 
                                        const parent = e.currentTarget.parentNode as HTMLElement;
                                        if (parent) {
                                            parent.innerHTML = '<div class="text-red-400 text-xs">Erreur!</div>'; 
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-slate-500 text-xs">?</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-slate-300">Cette icône est parfaite pour les en-têtes (headers) et les listes (sidebars).</div>
                            <div className="mt-2 text-xs font-mono text-slate-600 truncate">{settings?.iconeAgenceUrl || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
                    <h3 className="font-bold mb-1">Étape Suivante :</h3>
                    Copiez le hook `useAgenceSettings` et la variable `settings` dans votre page `studio/plan-media/page.tsx` et remplacez le logo **5B** (dans le header) par l'icône de l'agence (`settings.iconeAgenceUrl`).
                </div>
            </div>
        );
    };

    return (
        <StudioLayout
            leftContent={<div className="p-4 text-slate-400">Menu de navigation minimal</div>}
            rightContent={<div className="flex flex-col h-full">{renderHeader}{renderContent()}</div>}
            bottomContent={<div className="h-9 bg-[#020617] border-t border-slate-800 flex items-center justify-center text-[10px] text-slate-500">Page de Test : Vérification des URL de Logos Agence</div>}
        />
    );
}