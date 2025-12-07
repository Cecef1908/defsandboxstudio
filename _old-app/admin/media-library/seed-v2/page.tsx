"use client";

import React, { useState } from "react";
import { Database, Check, AlertTriangle, Play, Loader, Layers, MonitorPlay, Component, Target, MousePointer, LayoutTemplate, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase"; 
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

// --- 1. DÉFINITION DES TYPES & INTERFACES MÉTIER (LOCAUX POUR CE SCRIPT DE SEED) ---

interface ChannelCategory {
  id: string;
  name: string;
  description: string;
}

interface BuyingModel {
  id: string;
  name: string;
  code: "CPM" | "CPC" | "CPV" | "CPA" | "FLAT" | "OTC" | "FIXED_CPM";
  description: string;
}

interface BuyingUnit {
  id: string;
  name: string;
  code: "IMP" | "CLICK" | "VIEW" | "LEAD" | "ACTION" | "DAY";
  description: string;
}

interface CampaignObjective {
  id: string;
  name: string;
  code: "AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT";
}

interface MediaChannel {
  id: string;
  name: string;
  category_id: string;
  publisher_id: string; // CORRECTION: Lien vers l'entité financière
  parent_id?: string;
  is_regie: boolean;
  description: string;
  allowed_buying_models?: string[];
}

interface PublisherEntity {
  id: string;
  name: string;
  country: string;
  currency: string;
}

interface MediaFormat {
  id: string;
  name: string;
  type: "image" | "video" | "carousel" | "text" | "html5";
  specs: {
    ratio?: string;
    width?: number;
    height?: number;
    max_duration_sec?: number;
    max_weight_mb?: number;
  };
  compatible_channels: string[];
  compatible_buying_models: string[];
}

interface MediaPlacement {
  id: string;
  name: string;
  channel_id: string; // Lien parent (Ex: Facebook)
  format_ids: string[]; // Formats techniques acceptés (Ex: Post Carré, Video 4:5)
  description: string;
}

// --- 2. DONNÉES DE RÉFÉRENCE (LIBRARY) ---

const CATEGORIES: ChannelCategory[] = [
  { id: "cat_social", name: "Social Ads", description: "Réseaux sociaux (Meta, TikTok, LinkedIn, Snap)" },
  { id: "cat_search", name: "Search (SEA)", description: "Moteurs de recherche (Google, Bing)" },
  { id: "cat_display", name: "Display & Programmatic", description: "Bannières sur sites éditeurs et réseaux display" },
  { id: "cat_video", name: "Online Video (OLV)", description: "YouTube, VOD, Catch-up TV" },
  { id: "cat_audio", name: "Digital Audio", description: "Spotify, Deezer, Podcasts" },
];

const OBJECTIVES: CampaignObjective[] = [
  { id: "obj_awareness", name: "Notoriété (Awareness)", code: "AWARENESS" },
  { id: "obj_traffic", name: "Trafic (Traffic)", code: "TRAFFIC" },
  { id: "obj_engagement", name: "Engagement", code: "ENGAGEMENT" },
  { id: "obj_leads", name: "Génération de Leads", code: "LEAD" },
  { id: "obj_conversion", name: "Ventes / Conversions", code: "CONVERSION" },
];

const BUYING_MODELS: BuyingModel[] = [
  { id: "bm_cpm", name: "Coût pour Mille (CPM)", code: "CPM", description: "Achat à l'impression" },
  { id: "bm_cpc", name: "Coût par Clic (CPC)", code: "CPC", description: "Achat à la performance trafic" },
  { id: "bm_cpv", name: "Coût par Vue (CPV)", code: "CPV", description: "Achat à la vue vidéo" },
  { id: "bm_cpa", name: "Coût par Acquisition (CPA)", code: "CPA", description: "Achat à la conversion" },
  { id: "bm_flat", name: "Forfait / Flat Fee", code: "FLAT", description: "Coût fixe période" },
  { id: "bm_otc", name: "Gré à gré (OTC)", code: "OTC", description: "Devis direct éditeur" },
  { id: "bm_fixed_cpm", name: "CPM Fixe (Ratecard)", code: "FIXED_CPM", description: "Tarif carte garanti" },
];

const BUYING_UNITS: BuyingUnit[] = [
  { id: "unit_imp", name: "Impressions", code: "IMP", description: "Volume d'affichages" },
  { id: "unit_click", name: "Clics", code: "CLICK", description: "Volume de clics sortants" },
  { id: "unit_view", name: "Vues", code: "VIEW", description: "Vues vidéo complétées (ou à X%)" },
  { id: "unit_lead", name: "Leads", code: "LEAD", description: "Formulaires remplis" },
  { id: "unit_action", name: "Actions", code: "ACTION", description: "Achats ou événements custom" },
  { id: "unit_day", name: "Jours", code: "DAY", description: "Jours de présence (Habillage)" },
];

const PUBLISHERS: PublisherEntity[] = [
  { id: "pub_meta", name: "Meta Platforms Ireland", country: "Irlande", currency: "USD" },
  { id: "pub_google", name: "Google Ireland Ltd", country: "Irlande", currency: "USD" },
  { id: "pub_bytedance", name: "ByteDance (TikTok)", country: "UK", currency: "USD" },
  { id: "pub_microsoft", name: "Microsoft Ireland (LinkedIn)", country: "Irlande", currency: "USD" },
  { id: "pub_local", name: "Régies Locales Maroc", country: "Maroc", currency: "MAD" },
];

const CHANNELS: MediaChannel[] = [
  // RÉGIES
  { id: "ch_meta_ads", name: "Meta Ads (Régie)", category_id: "cat_social", publisher_id: "pub_meta", is_regie: true, description: "Regroupement FB/IG" },
  { id: "ch_google_ads", name: "Google Ads (Régie)", category_id: "cat_search", publisher_id: "pub_google", is_regie: true, description: "Regroupement Search/YT/Display" },

  // CANAUX SOCIAUX
  { id: "ch_facebook", name: "Facebook", category_id: "cat_social", publisher_id: "pub_meta", parent_id: "ch_meta_ads", is_regie: false, description: "Audience Mass Market", allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"] },
  { id: "ch_instagram", name: "Instagram", category_id: "cat_social", publisher_id: "pub_meta", parent_id: "ch_meta_ads", is_regie: false, description: "Visuel & Lifestyle", allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpv"] },
  { id: "ch_linkedin", name: "LinkedIn", category_id: "cat_social", publisher_id: "pub_microsoft", is_regie: false, description: "Professionnel B2B", allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"] },
  { id: "ch_tiktok", name: "TikTok", category_id: "cat_social", publisher_id: "pub_bytedance", is_regie: false, description: "Gen Z Video", allowed_buying_models: ["bm_cpm", "bm_cpv", "bm_fixed_cpm"] },

  // CANAUX GOOGLE
  { id: "ch_google_search", name: "Google Search", category_id: "cat_search", publisher_id: "pub_google", parent_id: "ch_google_ads", is_regie: false, description: "Intentionniste", allowed_buying_models: ["bm_cpc", "bm_cpa"] },
  { id: "ch_youtube", name: "YouTube", category_id: "cat_video", publisher_id: "pub_google", parent_id: "ch_google_ads", is_regie: false, description: "Video Streaming", allowed_buying_models: ["bm_cpv", "bm_cpm", "bm_fixed_cpm"] },
  { id: "ch_dv360", name: "Display & Video 360", category_id: "cat_display", publisher_id: "pub_google", is_regie: false, description: "DSP Programmatique", allowed_buying_models: ["bm_cpm", "bm_cpc"] },

  // LOCAL
  { id: "ch_local_press", name: "Presse Locale", category_id: "cat_display", publisher_id: "pub_local", is_regie: false, description: "Sites d'actu Maroc", allowed_buying_models: ["bm_flat", "bm_otc", "bm_fixed_cpm"] },
];

const FORMATS: MediaFormat[] = [
  // SOCIAL
  { id: "fmt_social_post", name: "Post Carré (1:1)", type: "image", specs: { ratio: "1:1", width: 1080, height: 1080 }, compatible_channels: ["ch_facebook", "ch_instagram", "ch_linkedin"], compatible_buying_models: ["bm_cpm", "bm_cpc"] },
  { id: "fmt_social_story", name: "Story / Reel (9:16)", type: "video", specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 60 }, compatible_channels: ["ch_instagram", "ch_facebook", "ch_tiktok"], compatible_buying_models: ["bm_cpm", "bm_cpv"] },
  { id: "fmt_social_portrait", name: "Portrait (4:5)", type: "image", specs: { ratio: "4:5", width: 1080, height: 1350 }, compatible_channels: ["ch_facebook", "ch_instagram"], compatible_buying_models: ["bm_cpm"] },
  
  // DISPLAY & VIDEO
  { id: "fmt_iab_pave", name: "Pavé (300x250)", type: "html5", specs: { width: 300, height: 250 }, compatible_channels: ["ch_dv360", "ch_local_press"], compatible_buying_models: ["bm_cpm", "bm_cpc"] },
  { id: "fmt_iab_billboard", name: "Billboard (970x250)", type: "html5", specs: { width: 970, height: 250 }, compatible_channels: ["ch_dv360", "ch_local_press"], compatible_buying_models: ["bm_cpm", "bm_flat"] },
  { id: "fmt_video_instream", name: "In-Stream 16:9", type: "video", specs: { ratio: "16:9", width: 1920, height: 1080 }, compatible_channels: ["ch_youtube", "ch_dv360"], compatible_buying_models: ["bm_cpv", "bm_cpm"] },
  
  // SEARCH
  { id: "fmt_text_ad", name: "Annonce Textuelle", type: "text", specs: {}, compatible_channels: ["ch_google_search"], compatible_buying_models: ["bm_cpc"] },
];

// NOUVEAU : PLACEMENTS (L'inventaire précis)
const PLACEMENTS: MediaPlacement[] = [
  // Facebook
  { id: "pl_fb_feed", name: "Facebook Feed", channel_id: "ch_facebook", format_ids: ["fmt_social_post", "fmt_social_portrait", "fmt_video_instream"], description: "Flux d'actualité principal mobile et desktop" },
  { id: "pl_fb_story", name: "Facebook Stories", channel_id: "ch_facebook", format_ids: ["fmt_social_story"], description: "Format plein écran éphémère" },
  { id: "pl_fb_right", name: "Facebook Right Column", channel_id: "ch_facebook", format_ids: ["fmt_social_post"], description: "Colonne de droite desktop uniquement" },
  
  // Instagram
  { id: "pl_ig_feed", name: "Instagram Feed", channel_id: "ch_instagram", format_ids: ["fmt_social_post", "fmt_social_portrait"], description: "Flux principal images et vidéos" },
  { id: "pl_ig_story", name: "Instagram Stories", channel_id: "ch_instagram", format_ids: ["fmt_social_story"], description: "Placement le plus populaire, plein écran" },
  { id: "pl_ig_reels", name: "Instagram Reels", channel_id: "ch_instagram", format_ids: ["fmt_social_story"], description: "Flux vidéo vertical immersif" },

  // LinkedIn
  { id: "pl_li_feed", name: "LinkedIn Newsfeed", channel_id: "ch_linkedin", format_ids: ["fmt_social_post", "fmt_video_instream"], description: "Flux professionnel" },

  // YouTube
  { id: "pl_yt_instream", name: "YouTube In-Stream (Pre-roll)", channel_id: "ch_youtube", format_ids: ["fmt_video_instream"], description: "Vidéo avant le contenu, skippable ou non" },
  { id: "pl_yt_shorts", name: "YouTube Shorts", channel_id: "ch_youtube", format_ids: ["fmt_social_story"], description: "Flux vidéo vertical YouTube" },

  // Google Search
  { id: "pl_google_search", name: "Search Results (SERP)", channel_id: "ch_google_search", format_ids: ["fmt_text_ad"], description: "Liens sponsorisés en haut de page" },
];

export default function MediaSeedPageV2() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleImport = async () => {
    if (!confirm("Attention : Vous allez réinitialiser la Bibliothèque Technique Média.")) return;
    
    setStatus("loading");
    setLogs([]);
    addLog("Démarrage de l'injection Média V2...");

    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      let opCount = 0;

      // 1. Catégories
      CATEGORIES.forEach(item => { 
        batch.set(doc(db, "ref_channel_categories", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${CATEGORIES.length} Catégories`);

      // 2. Objectifs (Nouveau)
      OBJECTIVES.forEach(item => { 
        batch.set(doc(db, "ref_objectives", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${OBJECTIVES.length} Objectifs Marketing`);

      // 3. Modèles d'achat
      BUYING_MODELS.forEach(item => { 
        batch.set(doc(db, "ref_buying_models", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${BUYING_MODELS.length} Modèles d'Achat (CPM, CPC...)`);

      // 4. Unités d'achat (Nouveau)
      BUYING_UNITS.forEach(item => { 
        batch.set(doc(db, "ref_buying_units", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${BUYING_UNITS.length} Unités (Impressions, Clics...)`);

      // 5. Editeurs (Nouveau V2.1)
      PUBLISHERS.forEach(item => { 
        batch.set(doc(db, "ref_publishers", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${PUBLISHERS.length} Éditeurs (Finance)`);

      // 6. Canaux (liés aux éditeurs)
      CHANNELS.forEach(item => { 
        batch.set(doc(db, "ref_channels", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${CHANNELS.length} Canaux Média`);

      // 6. Formats
      FORMATS.forEach(item => { 
        batch.set(doc(db, "ref_formats", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${FORMATS.length} Formats Techniques`);

      // 7. Placements (Nouveau)
      PLACEMENTS.forEach(item => { 
        batch.set(doc(db, "ref_placements", item.id), { ...item, createdAt: timestamp, updatedAt: timestamp }); 
        opCount++; 
      });
      addLog(`✅ ${PLACEMENTS.length} Placements d'Inventaire`);

      addLog(`Envoi de ${opCount} opérations à Firestore...`);
      await batch.commit();

      setStatus("success");
      addLog("🚀 BIBLIOTHÈQUE MÉDIA V2 EN LIGNE !");

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`❌ ERREUR : ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour Admin</span>
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bibliothèque Technique Média</h1>
            <p className="text-slate-400">Référentiel complet : Placements, Formats, Objectifs et Unités.</p>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-8 shadow-xl">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<MonitorPlay className="text-blue-400"/>} count={CHANNELS.length} label="Canaux" />
            <StatCard icon={<LayoutTemplate className="text-pink-400"/>} count={PLACEMENTS.length} label="Placements" />
            <StatCard icon={<Target className="text-emerald-400"/>} count={OBJECTIVES.length} label="Objectifs" />
            <StatCard icon={<MousePointer className="text-amber-400"/>} count={BUYING_UNITS.length} label="Unités" />
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleImport}
              disabled={status === "loading" || status === "success"}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all w-full md:w-auto justify-center
                ${status === "idle" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-900/20" : ""}
                ${status === "loading" ? "bg-slate-700 text-slate-400 cursor-wait" : ""}
                ${status === "success" ? "bg-emerald-600 text-white cursor-default" : ""}
                ${status === "error" ? "bg-red-600 text-white" : ""}
              `}
            >
              {status === "idle" && <><Play size={20} /> Initialiser le Référentiel</>}
              {status === "loading" && <><Loader size={20} className="animate-spin" /> Traitement...</>}
              {status === "success" && <><Check size={20} /> Base à jour</>}
              {status === "error" && <><AlertTriangle size={20} /> Erreur</>}
            </button>
          </div>

          <div className="bg-black/50 rounded-lg border border-slate-800 p-4 font-mono text-xs h-64 overflow-y-auto">
             {logs.length === 0 ? (
              <span className="text-slate-600 italic">Prêt à injecter les données...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`mb-1 border-b border-slate-800/30 pb-1 ${log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-emerald-400" : "text-slate-400"}`}>
                  {log}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, count, label }: { icon: any, count: number, label: string }) {
  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
      <div className="mb-2">{icon}</div>
      <div className="font-bold text-white text-xl">{count}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
