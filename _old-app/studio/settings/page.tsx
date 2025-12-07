'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Loader2, Home, Check, RotateCcw, Image, Palette, Eye, Briefcase, ChevronLeft, DollarSign, Clock, Layout, Users, TrendingUp, Cpu
} from 'lucide-react'; // Ajout d'icônes pour la nouvelle sidebar
import StudioLayout from "../../components/StudioLayout"; 
import StudioSidebarContent from "../../components/StudioSidebarContent"; 

import { 
    db, 
    authenticateUser, 
    AGENCE_SETTINGS_COLLECTION,
    THEMES_COLLECTION
} from '../../lib/firebase'; 

import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { AgenceSettings, Theme } from "../../types/agence";

// ID du document unique pour les settings de l'agence
const SETTINGS_DOC_ID = 'main'; 

// --- HOOK DE CHARGEMENT ET SAUVEGARDE ---
function useCentralSettings() {
    const [settings, setSettings] = useState<AgenceSettings | null>(null);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fonction pour charger TOUTES les données
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                await authenticateUser();
                    
                // 1. Chargement des Settings (logos, thème actif)
                const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);
                const settingsSnap = await getDoc(settingsRef);
                
                let currentSettings: AgenceSettings;
                if (settingsSnap.exists()) {
                    // Si le document existe, nous chargeons les données, en fournissant des fallbacks pour la sécurité
                    const data = settingsSnap.data();
                    currentSettings = { 
                        iconeDarkUrl: data.iconeDarkUrl || '',
                        logoDarkUrl: data.logoDarkUrl || '',
                        iconeLightUrl: data.iconeLightUrl || '',
                        logoLightUrl: data.logoLightUrl || '',
                        commissionRate: data.commissionRate ?? 15, 
                        feesRate: data.feesRate ?? 5,               
                        activeThemeId: data.activeThemeId || 'dark-vibrant'
                    } as AgenceSettings; 
                } else {
                    // Valeurs par défaut si le document n'existe pas
                    currentSettings = { 
                        iconeDarkUrl: '', 
                        logoDarkUrl: '',
                        iconeLightUrl: '',
                        logoLightUrl: '',
                        commissionRate: 15, 
                        feesRate: 5,        
                        activeThemeId: 'dark-vibrant' 
                    } as AgenceSettings; 
                }
                setSettings(currentSettings); 

                // 2. Chargement des Thèmes disponibles
                const themesSnap = await getDoc(doc(db, THEMES_COLLECTION, 'list'));
                let themesList: Theme[] = [];

                if (themesSnap.exists() && themesSnap.data().availableThemes) {
                    themesList = themesSnap.data().availableThemes as Theme[];
                } else {
                    // Thèmes par défaut (Nouveaux Thèmes Vifs et Modernes)
                    themesList = [
                        { 
                            id: 'dark-vibrant', 
                            name: 'Nuit Vive (Vibrant Dark)', 
                            previewBg: '#111827', 
                            description: "Contraste élevé, accent bleu moderne, idéal pour la consommation sur écran. **Fond Sombre.**",
                            themeColors: {
                                primaryAccent: '#3B82F6', // Bleu Vif
                                secondaryAccent: '#8B5CF6', // Violet
                                warningAccent: '#F97316', // Orange
                                background: '#111827', // Fond très sombre
                                text: '#F8FAFC',
                            }
                        },
                        { 
                            id: 'light-corporate', 
                            name: 'Clair Pro (Corporate Light)', 
                            previewBg: '#F0F4F8', 
                            description: "Look professionnel et aéré, excellent pour la version client imprimée. **Fond Clair.**",
                            themeColors: {
                                primaryAccent: '#0668E1', // Bleu Profond
                                secondaryAccent: '#000000', // Noir
                                warningAccent: '#DC2626', // Rouge
                                background: '#FFFFFF',
                                text: '#0F172A',
                            }
                        },
                        { 
                            id: 'agile-ops', // Renommé
                            name: 'Agilité / Opérations', 
                            previewBg: '#F0F4F8', // Gris clair pour le fond
                            description: "Thème dynamique utilisant vos couleurs vives pour un look moderne et contrasté.",
                            themeColors: {
                                primaryAccent: '#96c9f0', // Bleu Agilité
                                secondaryAccent: '#26a96c', // Vert Agilité
                                warningAccent: '#fb660b', // Orange Agilité
                                background: '#FFFFFF',
                                text: '#020617',
                            }
                        }, 
                    ];
                }
                setThemes(themesList);
                
            } catch (err: any) { 
                setError("Erreur de BDD: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (data: Partial<AgenceSettings>) => { 
        if (!settings) return;
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        // Validation et conversion en nombre pour Firestore
        const commissionRateNum = parseFloat(data.commissionRate as any);
        const feesRateNum = parseFloat(data.feesRate as any);

        // NOTE: Même si nous retirons l'UI, les valeurs sont toujours nécessaires pour la cohérence de l'objet AgenceSettings
        if (isNaN(commissionRateNum) || isNaN(feesRateNum)) {
             setError("Un problème est survenu avec les taux de logistique.");
             setIsSaving(false);
             return;
        }

        try {
            await authenticateUser();
            const settingsRef = doc(db, AGENCE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);
            
            // On s'assure que les taux sont bien des nombres avant l'enregistrement
            const payload: AgenceSettings = {
                ...settings,
                ...data,
                commissionRate: commissionRateNum, // Converti en number
                feesRate: feesRateNum,             // Converti en number
            };

            await setDoc(settingsRef, payload, { merge: true });

            setSettings(payload); // Mettre à jour l'état local avec les valeurs sauvegardées
            setSuccessMessage("Configuration enregistrée avec succès !");

            // Masquer le message de succès après 3 secondes
            setTimeout(() => setSuccessMessage(null), 3000); 

        } catch (e: any) {
            setError("Erreur de sauvegarde: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    return { settings, themes, loading, isSaving, error, successMessage, handleSave };
}

// Composant local simulant Link pour éviter l'erreur "Could not resolve next/link"
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


export default function StudioSettingsPage() {
    const { settings, themes, loading, isSaving, error, successMessage, handleSave } = useCentralSettings();
    
    // Nous définissons ici le type du brouillon pour accepter les strings pour les inputs number.
    const [draftSettings, setDraftSettings] = useState<Partial<{
        iconeDarkUrl: string;
        logoDarkUrl: string;
        iconeLightUrl: string;
        logoLightUrl: string;
        commissionRate: string; 
        feesRate: string;       
        activeThemeId: string;
    }>>({});


    // Sync des brouillons
    useEffect(() => {
        if (settings) {
            // S'assurer que les taux sont des chaînes de caractères pour les inputs type="number"
            setDraftSettings({ 
                ...settings,
                iconeDarkUrl: settings.iconeDarkUrl || '',
                logoDarkUrl: settings.logoDarkUrl || '',
                iconeLightUrl: settings.iconeLightUrl || '',
                logoLightUrl: settings.logoLightUrl || '',
                commissionRate: settings.commissionRate.toString(), 
                feesRate: settings.feesRate.toString(),           
            });
        }
    }, [settings]);

    // Déterminer le thème actif (même s'il est en brouillon)
    const currentTheme = themes.find(t => t.id === draftSettings.activeThemeId) || themes[0];
    
    // La comparaison doit être faite sur les valeurs brutes du brouillon
    const hasChanges = settings ? 
        (draftSettings.iconeDarkUrl !== settings.iconeDarkUrl ||
         draftSettings.logoDarkUrl !== settings.logoDarkUrl ||
         draftSettings.iconeLightUrl !== settings.iconeLightUrl ||
         draftSettings.logoLightUrl !== settings.logoLightUrl ||
         draftSettings.commissionRate !== settings.commissionRate.toString() || 
         draftSettings.feesRate !== settings.feesRate.toString() ||             
         draftSettings.activeThemeId !== settings.activeThemeId
        ) : false;

    const handleSaveChanges = () => {
        handleSave(draftSettings as Partial<AgenceSettings>); 
    };

    const handleDiscardChanges = () => {
        setDraftSettings(settings ? { 
            ...settings,
            iconeDarkUrl: settings.iconeDarkUrl || '',
            logoDarkUrl: settings.logoDarkUrl || '',
            iconeLightUrl: settings.iconeLightUrl || '',
            logoLightUrl: settings.logoLightUrl || '',
            commissionRate: settings.commissionRate.toString(),
            feesRate: settings.feesRate.toString(),
        } : {});
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0F172A] text-indigo-400">
                <Loader2 size={48} className="animate-spin" />
            </div>
        );
    }
    
    // Rendu d'un lien de navigation factice pour la sidebar
    const NavLink = ({ href, icon: Icon, label, isActive }: { href: string, icon: React.ElementType, label: string, isActive?: boolean }) => (
        <LinkComponent href={href} className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${isActive ? 'bg-violet-500/10 text-violet-400 font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm'}`}>
            <Icon size={16} /> {label}
        </LinkComponent>
    );

    return (
        <StudioLayout
            leftContent={
                <StudioSidebarContent title="Administration" subtitle="Configuration">
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            <NavLink href="/studio/settings" icon={Settings} label="Design & Thèmes" isActive={true} />
                            <NavLink href="/studio/operations" icon={Cpu} label="Opérations & Coûts (Futur)" />
                            <NavLink href="/studio/users" icon={Users} label="Gestion Utilisateurs (Futur)" />
                        </div>

                        <div className="h-px bg-slate-800 my-4 mx-2"></div>
                        <NavLink href="/studio/portefeuille" icon={TrendingUp} label="Portefeuille Média" />
                    </div>
                </StudioSidebarContent>
            }
            rightContent={
                <div className="flex flex-col h-full bg-[#0F172A]">
                    {/* HEADER */}
                    <div className="h-16 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-6 flex-shrink-0 z-40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20 text-white font-bold text-sm">SET</div>
                            <div><div className="text-white font-bold leading-none tracking-tight">Design & Settings</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Contrôle de l'Agence</div></div>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasChanges && (
                                <button onClick={handleDiscardChanges} disabled={isSaving} className="h-9 px-4 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 transition-colors flex items-center gap-2">
                                    <RotateCcw size={14} /> Annuler
                                </button>
                            )}
                            {/* Message de succès qui s'affiche au-dessus du bouton Enregistrer */}
                            {successMessage && (
                                <div className="absolute right-40 p-2 bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-300">
                                    <Check size={14} /> {successMessage}
                                </div>
                            )}
                            <button onClick={handleSaveChanges} disabled={!hasChanges || isSaving} className={`h-9 px-5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                                !hasChanges || isSaving
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                            }`}>
                                {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Check size={14} />} 
                                {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8">
                        {error && (
                            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                                Erreur: {error}
                            </div>
                        )}
                        <div className="max-w-6xl mx-auto space-y-12">
                            
                            {/* SECTION 1: LOGOS DE L'AGENCE (MISE À JOUR LIGHT/DARK) */}
                            <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-3">
                                    <Image size={24} className="text-indigo-400"/> Logos & Identité Visuelle
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* LOGOS THÈME CLAIR (Fond Blanc / Logo Noir) */}
                                    <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                                         <h3 className="text-sm font-bold text-slate-200 border-b border-slate-700/50 pb-2">Pour Thèmes Clairs (Fond Blanc / Logo Normal)</h3>
                                        {/* ICÔNE DARK */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Icône (Fichier normal - Dark)</label>
                                            <input 
                                                type="text" 
                                                value={draftSettings.iconeDarkUrl || ''}
                                                onChange={(e) => setDraftSettings(prev => ({ ...prev, iconeDarkUrl: e.target.value }))}
                                                placeholder="URL Logo (noir/couleur) - Utilisé sur fond blanc" 
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 outline-none transition-all placeholder:text-slate-600"
                                            />
                                            <div className="h-10 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-white">
                                                {/* CORRIGÉ: Suppression de text-black en conflit avec text-slate-600 */}
                                                {draftSettings.iconeDarkUrl ? (
                                                    <img src={draftSettings.iconeDarkUrl} alt="Icône Dark Preview" className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <span className="text-slate-600 text-xs">Aperçu Icône (Fond Blanc)</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* LOGO DARK */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Logo Principal (Fichier normal - Dark)</label>
                                            <input 
                                                type="text" 
                                                value={draftSettings.logoDarkUrl || ''}
                                                onChange={(e) => setDraftSettings(prev => ({ ...prev, logoDarkUrl: e.target.value }))}
                                                placeholder="URL Logo (noir/couleur) - Utilisé sur fond blanc" 
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 outline-none transition-all placeholder:text-slate-600"
                                            />
                                            <div className="h-10 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-white">
                                                {/* CORRIGÉ: Suppression de text-black en conflit avec text-slate-600 */}
                                                {draftSettings.logoDarkUrl ? (
                                                    <img src={draftSettings.logoDarkUrl} alt="Logo Dark Preview" className="h-8 max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <span className="text-slate-600 text-xs">Aperçu Logo Principal (Fond Blanc)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    {/* LOGOS THÈME SOMBRE (Fond Noir / Logo Blanc) */}
                                    <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                                         <h3 className="text-sm font-bold text-slate-200 border-b border-slate-700/50 pb-2">Pour Thèmes Sombres (Fond Noir / Logo Inversé)</h3>
                                        {/* ICÔNE LIGHT */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Icône Inversée (Fichier blanc/transparent - Light)</label>
                                            <input 
                                                type="text" 
                                                value={draftSettings.iconeLightUrl || ''}
                                                onChange={(e) => setDraftSettings(prev => ({ ...prev, iconeLightUrl: e.target.value }))}
                                                placeholder="URL Logo (blanc/inversé) - Utilisé sur fond sombre" 
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 outline-none transition-all placeholder:text-slate-600"
                                            />
                                            <div className="h-10 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-slate-950">
                                                {draftSettings.iconeLightUrl ? (
                                                    <img src={draftSettings.iconeLightUrl} alt="Icône Light Preview" className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <span className="text-slate-600 text-xs">Aperçu Icône (Fond Noir)</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* LOGO LIGHT */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Logo Principal Inversé (Fichier blanc/transparent - Light)</label>
                                            <input 
                                                type="text" 
                                                value={draftSettings.logoLightUrl || ''}
                                                onChange={(e) => setDraftSettings(prev => ({ ...prev, logoLightUrl: e.target.value }))}
                                                placeholder="URL Logo (blanc/inversé) - Utilisé sur fond sombre" 
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 outline-none transition-all placeholder:text-slate-600"
                                            />
                                            <div className="h-10 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-slate-950">
                                                {draftSettings.logoLightUrl ? (
                                                    <img src={draftSettings.logoLightUrl} alt="Logo Light Preview" className="h-8 max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <span className="text-slate-600 text-xs">Aperçu Logo Principal (Fond Noir)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* SECTION 2: MOTEUR DE THÈMES AVANCÉ */}
                            <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-3">
                                    <Palette size={24} className="text-emerald-400"/> Moteur de Design (Thèmes de Rapport)
                                </h2>
                                
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Sélectionner le Thème Actif pour la Publication (Actuel : <span className="text-white">{currentTheme?.name}</span>)</label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {themes.map(theme => (
                                        <button 
                                            key={theme.id}
                                            onClick={() => setDraftSettings(prev => ({ ...prev, activeThemeId: theme.id }))}
                                            className={`p-5 rounded-xl border transition-all duration-300 relative group text-left ${draftSettings.activeThemeId === theme.id ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-700 hover:border-slate-500'}`}
                                        >
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-200 text-sm">{theme.name}</h3>
                                                    <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center" style={{backgroundColor: theme.previewBg}}>
                                                        {draftSettings.activeThemeId === theme.id && <Check size={14} className="text-emerald-400" />}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-2">{theme.description}</p>
                                            </div>
                                            
                                            {/* Prévisualisation des Couleurs Thème */}
                                            <div className="pt-3 border-t border-slate-700/50">
                                                <div className="text-[10px] font-bold text-slate-600 uppercase mb-2">Couleurs Clés</div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 h-3 rounded-full" style={{backgroundColor: theme.themeColors.primaryAccent, border: '1px solid ' + theme.themeColors.primaryAccent}}></div>
                                                    <div className="flex-1 h-3 rounded-full" style={{backgroundColor: theme.themeColors.secondaryAccent, border: '1px solid ' + theme.themeColors.secondaryAccent}}></div>
                                                    <div className="flex-1 h-3 rounded-full" style={{backgroundColor: theme.themeColors.background, border: '1px solid #334155'}}></div>
                                                    <div className="flex-1 h-3 rounded-full" style={{backgroundColor: theme.themeColors.text, border: '1px solid #334155'}}></div>
                                                </div>
                                            </div>

                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* EXPLICATION LOGIQUE */}
                            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg text-sm text-violet-300">
                                <h3 className="font-bold mb-2 flex items-center gap-2"><Layout size={16} /> Logique du Moteur de Design</h3>
                                <p className="text-xs">
                                    **Portée du Thème :** Le thème contrôle le style des **documents visualisés** (Plans Média et Bilans publiés), et non l'interface de travail Studio (qui reste sombre pour la concentration). La couleur sélectionnée (ex: **Bleu Vif** dans le thème *Nuit Vive*) sera la couleur d'accentuation des graphiques et des titres des rapports clients.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            }
            bottomContent={
                <div className="h-9 bg-[#020617] border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-500 flex-shrink-0 z-50 select-none">
                    <span className="font-bold text-slate-400 tracking-wider">AGENCE SETTINGS v1.3 (SÉPARATION PROPRE)</span>
                    <span className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${hasChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div> {hasChanges ? 'MODIFICATIONS EN COURS' : 'SYNCHRONISÉ'}</span>
                </div>
            }
        />
    );
}