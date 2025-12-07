'use client';

import React, { useState, useEffect } from 'react';
// Remplacement de 'next/link' par un simple 'a' avec un comportement Link simulé 
// pour éviter les erreurs de dépendance 'next' dans l'environnement de compilation.
// Utilisation d'un composant local <LinkComponent> pour maintenir la sémantique de navigation.
// NOTE: Dans un environnement Next.js classique, 'next/link' est préférable.
import { 
  Sparkles, PenTool, ArrowRight, Database, Calendar, DollarSign, 
  User, Briefcase, CheckCircle2, Loader2, FileText, ChevronLeft,
  Wand2, Save, X, Plus, ChevronDown, Layers, Target, AlertCircle, Home
} from 'lucide-react';

// Import résolu en utilisant le chemin relatif correct dans l'environnement de sandbox
import StudioLayout from "../components/StudioLayout"; 

// Firebase (Chemin relatif corrigé)
import { 
    db, 
    ANNONCEURS_COLLECTION, 
    MARQUES_COLLECTION, 
    MEDIA_PLANS_COLLECTION, 
    authenticateUser // Import de la fonction d'authentification
} from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

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

// --- TYPES ---
type CreationMode = 'selection' | 'manual' | 'ai';

interface Annonceur {
    id: string;
    nomAnnonceur: string;
    // autres champs potentiels
}

interface Marque {
    id: string;
    nomMarque: string;
    annonceurRef: string; // ID de l'annonceur parent
}

export default function NewPlanPage() {
    
    const [mode, setMode] = useState<CreationMode>('selection');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Data Sources
    const [annonceurs, setAnnonceurs] = useState<Annonceur[]>([]);
    const [marques, setMarques] = useState<Marque[]>([]);
    
    // States pour la simulation AI
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiProposal, setAiProposal] = useState<any>(null);

    // States pour le formulaire manuel amélioré
    const [formData, setFormData] = useState({
        nomPlan: '',
        annonceurId: '',
        marqueId: '', // Simplifié à une seule marque pour la création
        budget: '',
        dateDebut: '',
        dateFin: '',
        objectif: 'Notoriété'
    });

    // --- DATA FETCHING (Au montage ou au switch mode) ---
    useEffect(() => {
        const loadDatabase = async () => {
            setIsLoadingData(true);
            try {
                // ÉTAPE CLÉ 1: AUTHENTIFICATION (Assure l'accès aux collections)
                await authenticateUser();

                // 2. Récupérer les Annonceurs
                const annSnap = await getDocs(collection(db, ANNONCEURS_COLLECTION));
                const annList = annSnap.docs.map(d => ({ id: d.id, ...d.data() } as Annonceur))
                    .filter(a => a.nomAnnonceur); 
                
                // 3. Récupérer les Marques
                const marqSnap = await getDocs(collection(db, MARQUES_COLLECTION));
                const marqList = marqSnap.docs.map(d => ({ id: d.id, ...d.data() } as Marque))
                    .filter(m => m.nomMarque); 

                setAnnonceurs(annList);
                setMarques(marqList);
            } catch (error) {
                console.error("Erreur de chargement BDD:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (mode === 'manual') {
            loadDatabase();
        }
        // Nettoyer les listes si on quitte le mode manuel
        return () => {
             if (mode !== 'manual') {
                setAnnonceurs([]);
                setMarques([]);
             }
        };
    }, [mode]);

    // --- LOGIQUE METIER ---

    // Filtrer les marques selon l'annonceur sélectionné
    const filteredMarques = formData.annonceurId 
        ? marques.filter(m => m.annonceurRef === formData.annonceurId)
        : marques;

    // Suggestion de nom automatique
    useEffect(() => {
        if (formData.annonceurId && formData.dateDebut) {
            const ann = annonceurs.find(a => a.id === formData.annonceurId)?.nomAnnonceur || 'Client';
            try {
                const date = new Date(formData.dateDebut);
                // Vérifie que la date est valide avant de la formater
                if (!isNaN(date.getTime())) {
                    const mois = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
                    // Mettre à jour seulement si le champ est vide
                    if (!formData.nomPlan) {
                        setFormData(prev => ({ ...prev, nomPlan: `Campagne ${ann} - ${mois}` }));
                    }
                }
            } catch (e) {
                // Ignore l'erreur si la date n'est pas encore valide
            }
        }
    }, [formData.annonceurId, formData.dateDebut, annonceurs, formData.nomPlan]);

    const handleCreatePlan = async () => {
        if (!formData.nomPlan || !formData.annonceurId || !formData.budget) {
            alert("ERREUR : Veuillez remplir les champs obligatoires (Nom, Annonceur, Budget).");
            return;
        }

        setIsSubmitting(true);
        try {
            // On s'assure de l'authentification juste avant l'écriture
            await authenticateUser();
            
            const budgetValue = parseFloat(formData.budget);
            if (isNaN(budgetValue) || budgetValue <= 0) {
                 throw new Error("Le budget doit être un nombre positif.");
            }

            const payload = {
                // Champs du formulaire (en camelCase pour Firestore)
                nomPlan: formData.nomPlan,
                annonceurRef: formData.annonceurId, 
                marqueIds: formData.marqueId ? [formData.marqueId] : [],
                budgetTotal: budgetValue,
                
                // Les dates sont stockées au format YYYY-MM-DD string, car l'input[type=date] renvoie ce format.
                dateDebut: formData.dateDebut || null, 
                dateFin: formData.dateFin || null,     
                objectifPrincipal: formData.objectif,
                
                // Champs de métadonnées obligatoires
                status: 'Brouillon',
                commissionRate: 15, 
                feesRate: 5,        
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, MEDIA_PLANS_COLLECTION), payload);
            
            // CORRECTION FLUX : Redirection vers la page de gestion avec l'ID du plan pour continuer l'édition
            window.location.href = '/studio/plan-media?planId=' + docRef.id;
        } catch (e: any) {
            console.error("Erreur lors de la création du plan:", e);
            alert("Erreur lors de la création du plan: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSimulateGeneration = () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setAiProposal({
                nom: "Campagne Lancement Été 2026",
                client: "Coca-Cola Maroc",
                budget: 1500000,
                dates: "01/06/2026 - 31/08/2026",
                canaux: ["Meta Ads", "YouTube", "DOOH"],
                status: "Prêt à créer"
            });
        }, 2000);
    };

    // --- RENDERERS ---

    const renderSelectionScreen = () => (
        <div className="flex flex-col items-center justify-center h-full gap-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4 ring-1 ring-indigo-500/30">
                    <Sparkles className="text-indigo-400" size={24} />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Nouveau Plan Média</h1>
                <p className="text-slate-400 text-lg">Choisissez votre méthode de travail.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                <button 
                    onClick={() => setMode('manual')}
                    className="group relative p-8 bg-[#1E293B] border border-slate-800 rounded-3xl hover:border-slate-600 transition-all text-left flex flex-col gap-4 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-1 duration-300"
                >
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300 shadow-inner">
                        <PenTool className="text-slate-400 group-hover:text-white" size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Mode Expert</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Configuration manuelle complète. Connecté à votre base de données annonceurs et marques.
                        </p>
                    </div>
                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        Configurer <ArrowRight size={16} className="ml-2" />
                    </div>
                </button>

                <button 
                    onClick={() => setMode('ai')}
                    className="group relative p-8 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-indigo-500/30 rounded-3xl hover:border-indigo-500 transition-all text-left flex flex-col gap-4 hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1 duration-300"
                >
                    <div className="absolute top-0 right-0 p-6">
                        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <Sparkles size={10} /> AI Beta
                        </span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-900/20 flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-300 border border-indigo-500/20">
                        <Wand2 className="text-indigo-400 group-hover:text-white" size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Assistant IA</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Entrez un brief en langage naturel. L'IA structure le plan, estime les budgets et propose les canaux.
                        </p>
                    </div>
                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        Lancer l'assistant <ArrowRight size={16} className="ml-2" />
                    </div>
                </button>
            </div>
        </div>
    );

    const renderManualForm = () => (
        <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            {/* Header du Formulaire (Fixé pour un accès rapide aux actions) */}
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]/80 backdrop-blur sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <LinkComponent href="/" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors border border-slate-700/50">
                       <Home size={18} />
                    </LinkComponent>
                    <button onClick={() => setMode('selection')} className="flex items-center text-slate-500 hover:text-white text-sm transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Retour au Choix
                    </button>
                </div>
                
                {/* BOUTON CRÉER (toujours accessible) */}
                <button 
                    onClick={handleCreatePlan}
                    disabled={isSubmitting || !formData.annonceurId || !formData.nomPlan || !formData.budget} // Ajout de la dépendance budget
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${
                        isSubmitting || !formData.annonceurId || !formData.nomPlan || !formData.budget
                        ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25'
                    }`}
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {isSubmitting ? 'Création...' : 'Créer & Continuer'}
                </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLONNE GAUCHE : FORMULAIRE */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Carte Identité */}
                        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <User size={14} className="text-indigo-500" /> Identité Client
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Annonceur Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Annonceur</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within/input:text-indigo-500 transition-colors">
                                            <Briefcase size={18} />
                                        </div>
                                        <select 
                                            value={formData.annonceurId}
                                            onChange={(e) => setFormData({...formData, annonceurId: e.target.value, marqueId: ''})}
                                            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none transition-all cursor-pointer hover:border-slate-600"
                                            disabled={isLoadingData}
                                        >
                                            <option value="">Sélectionner un annonceur...</option>
                                            {annonceurs.map(a => (
                                                <option key={a.id} value={a.id}>{a.nomAnnonceur}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3.5 text-slate-500 pointer-events-none">
                                            {isLoadingData ? <Loader2 size={16} className="animate-spin"/> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Marque Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Marque (Optionnel)</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within/input:text-indigo-500 transition-colors">
                                            <Target size={18} />
                                        </div>
                                        <select 
                                            value={formData.marqueId}
                                            onChange={(e) => setFormData({...formData, marqueId: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!formData.annonceurId || isLoadingData}
                                        >
                                            <option value="">Toutes les marques</option>
                                            {filteredMarques.map(m => (
                                                <option key={m.id} value={m.id}>{m.nomMarque}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3.5 text-slate-500 pointer-events-none">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                    {formData.annonceurId && filteredMarques.length === 0 && (
                                        <div className="text-[10px] text-amber-500 flex items-center gap-1 mt-1 pl-1">
                                            <AlertCircle size={10} /> Aucune marque trouvée pour cet annonceur.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Carte Paramètres */}
                        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Layers size={14} className="text-emerald-500" /> Paramètres Campagne
                            </h3>

                            <div className="space-y-6">
                                {/* Nom du Plan */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Nom de la campagne</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within/input:text-white transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={formData.nomPlan}
                                            onChange={(e) => setFormData({...formData, nomPlan: e.target.value})}
                                            placeholder="Ex: Lancement Gamme Été 2026" 
                                            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Budget */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Budget Total (MAD)</label>
                                        <div className="relative group/input">
                                            <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors">
                                                <DollarSign size={18} />
                                            </div>
                                            <input 
                                                type="number" 
                                                value={formData.budget}
                                                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                                placeholder="0.00" 
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Objectif */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Objectif Principal</label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                            <select 
                                                value={formData.objectif}
                                                onChange={(e) => setFormData({...formData, objectif: e.target.value})}
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 focus:border-indigo-500 outline-none appearance-none"
                                            >
                                                <option>Notoriété</option>
                                                <option>Trafic</option>
                                                <option>Leads</option>
                                                <option>Ventes</option>
                                                <option>Engagement</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Début</label>
                                        <div className="relative group/input">
                                            <input 
                                                type="date" 
                                                value={formData.dateDebut}
                                                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Fin</label>
                                        <div className="relative group/input">
                                            <input 
                                                type="date" 
                                                value={formData.dateFin}
                                                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                                                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : PREVIEW TEMPS RÉEL */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Aperçu du Plan</h3>
                            
                            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                                {/* Gradient Decoratif */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                                
                                <div className="mb-6">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Campagne</div>
                                    <div className={`text-lg font-bold leading-tight ${formData.nomPlan ? 'text-white' : 'text-slate-600 italic'}`}>
                                        {formData.nomPlan || "Nom de la campagne..."}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <Briefcase size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">Annonceur</div>
                                            <div className="text-sm font-medium text-indigo-300">
                                                {annonceurs.find(a => a.id === formData.annonceurId)?.nomAnnonceur || "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <Target size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">Marque</div>
                                            <div className="text-sm font-medium text-slate-300">
                                                {marques.find(m => m.id === formData.marqueId)?.nomMarque || "Toutes / Global"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">Période</div>
                                            <div className="text-xs font-mono text-slate-400">
                                                {formData.dateDebut ? new Date(formData.dateDebut).toLocaleDateString('fr-FR') : 'JJ/MM/AAAA'} 
                                                {' '}<ArrowRight size={10} className="inline mx-1"/>{' '}
                                                {formData.dateFin ? new Date(formData.dateFin).toLocaleDateString('fr-FR') : 'JJ/MM/AAAA'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800 mt-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Budget Total</div>
                                        <div className="text-xl font-bold text-emerald-400 font-mono tracking-tight">
                                            {formData.budget ? parseFloat(formData.budget).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'} <span className="text-sm text-emerald-600">MAD</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Bagde */}
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">
                                        Brouillon
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300/70 text-xs leading-relaxed">
                                <Sparkles size={12} className="inline mr-1 text-indigo-400"/>
                                <strong>Conseil Pro :</strong> Une fois le plan créé, vous serez automatiquement redirigé pour ajouter les insertions média.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAIAssistant = () => (
        <div className="max-w-4xl mx-auto py-12 px-4 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
             {/* Header de l'Assistant IA (similaire à la nav du formulaire) */}
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]/80 backdrop-blur sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <LinkComponent href="/" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors border border-slate-700/50">
                       <Home size={18} />
                    </LinkComponent>
                    <button onClick={() => setMode('selection')} className="flex items-center text-slate-500 hover:text-white text-sm transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Retour au Choix
                    </button>
                </div>
                {/* Bouton de l'Assistant IA */}
                <button 
                    onClick={handleSimulateGeneration}
                    disabled={!aiPrompt || isGenerating}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                        !aiPrompt || isGenerating
                        ? 'bg-slate-700 cursor-not-allowed opacity-50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    {isGenerating ? 'Analyse...' : 'Générer le Plan'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 p-8">
                
                {/* COLONNE GAUCHE : INPUT PROMPT */}
                <div className="flex flex-col gap-6">
                    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="text-white" size={16} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Brief Créatif</h2>
                        </div>
                        
                        <textarea 
                            className="flex-1 w-full bg-[#0F172A] border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 outline-none resize-none text-sm leading-relaxed"
                            placeholder="Décrivez votre besoin... Ex: Je veux un plan pour la campagne 'Rentrée 2026' de EMSI. Budget 500k MAD sur Meta et Google. Objectif leads."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />

                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-slate-500">L'IA structurera les données pour la BDD.</span>
                            {/* Le bouton de génération est maintenant dans le header */}
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : RÉSULTAT / PREVIEW (Même que précédemment) */}
                <div className="flex flex-col">
                    {isGenerating ? (
                        <div className="h-full bg-[#1E293B]/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                                <Loader2 size={40} className="animate-spin text-indigo-500 relative z-10" />
                            </div>
                            <p className="text-sm font-mono animate-pulse">Structuration des données...</p>
                        </div>
                    ) : aiProposal ? (
                        <div className="h-full bg-[#1E293B] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 size={20} />
                                    <span className="font-bold text-sm">Proposition Générée</span>
                                </div>
                                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700 font-mono">JSON VALID</span>
                            </div>

                            <div className="space-y-4 flex-1 overflow-auto">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Campagne</div>
                                    <div className="text-white font-medium text-lg">{aiProposal.nom}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">Client</div>
                                        <div className="text-indigo-300 font-medium">{aiProposal.client}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">Dates</div>
                                        <div className="text-slate-300 font-mono text-sm">{aiProposal.dates}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Budget Détecté</div>
                                    <div className="text-2xl font-bold text-white font-mono">{aiProposal.budget.toLocaleString()} MAD</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Canaux identifiés</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {aiProposal.canaux.map((c: string) => (
                                            <span key={c} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-700 flex gap-3">
                                <button 
                                    onClick={() => setAiProposal(null)}
                                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white text-sm font-bold transition-all"
                                >
                                    Rejeter
                                </button>
                                <button className="flex-[2] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all">
                                    <Save size={16} /> Valider & Enregistrer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-[#1E293B]/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-4 p-8 text-center">
                            <Database size={32} className="opacity-20" />
                            <p className="text-sm">La proposition de structure apparaîtra ici avant l'enregistrement en base.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // --- SIDEBAR NAVIGATION (SIMPLE) ---
    // Rendu minimal pour StudioLayout. Nous faisons passer les boutons essentiels dans la colonne de gauche.
    const renderSidebar = (
        <div className="h-full flex flex-col bg-[#020617] border-r border-slate-800 w-full p-4">
            <LinkComponent href="/" className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm transition-colors flex items-center gap-2">
                 <Home size={16} /> Retour à l'Accueil
            </LinkComponent>
            <div className="h-px bg-slate-800 my-4 mx-2"></div>
            <button onClick={() => setMode('selection')} className="w-full text-left px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-sm flex items-center gap-2">
                <Plus size={14} /> Nouveau Plan
            </button>
        </div>
    );

    return (
        <StudioLayout
            // On laisse la sidebar mais avec un contenu minimal (non redondant) pour ne pas modifier StudioLayout.tsx
            leftContent={renderSidebar} 
            rightContent={
                <div className="h-full bg-[#0F172A] relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0F172A] to-[#0F172A] pointer-events-none"></div>
                    
                    <div className="relative z-10 h-full overflow-auto">
                        {mode === 'selection' && renderSelectionScreen()}
                        {mode === 'manual' && renderManualForm()}
                        {mode === 'ai' && renderAIAssistant()}
                    </div>
                </div>
            }
            bottomContent={
                <div className="h-9 bg-[#020617] border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-500 flex-shrink-0 z-50 select-none">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-400 tracking-wider">MODULE CRÉATION v1.5 (IMPORTS FIXÉS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode !== 'selection' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <span>{mode === 'selection' ? 'En attente' : mode === 'manual' ? 'Édition BDD Connectée' : 'Assistant IA Actif'}</span>
                    </div>
                </div>
            }
        />
    );
}