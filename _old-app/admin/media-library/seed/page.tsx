"use client";

import React, { useState } from "react";
import { Check, AlertTriangle, Play, Loader, Layers, MonitorPlay, Component, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase"; 
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import type { 
  ChannelCategoryEntity, 
  BuyingModelEntity,
  PublisherEntity,
  MediaChannelEntity, 
  MediaFormatEntity 
} from "../../../types/agence";

// --- DONNÉES DE RÉFÉRENCE (LIBRARY) ---

// A. CATÉGORIES DE CANAUX
const CATEGORIES: Omit<ChannelCategoryEntity, 'createdAt' | 'updatedAt'>[] = [
  { id: "cat_social", name: "Social Ads", description: "Réseaux sociaux (Meta, TikTok, LinkedIn, Snap)" },
  { id: "cat_search", name: "Search (SEA)", description: "Moteurs de recherche (Google, Bing)" },
  { id: "cat_display", name: "Display & Programmatic", description: "Bannières sur sites éditeurs et réseaux display" },
  { id: "cat_video", name: "Online Video (OLV)", description: "YouTube, VOD, Catch-up TV" },
  { id: "cat_audio", name: "Digital Audio", description: "Spotify, Deezer, Podcasts" },
  { id: "cat_dooh", name: "DOOH", description: "Digital Out Of Home (Affichage numérique)" },
];

// B. MODÈLES D'ACHAT (BUYING MODELS)
const BUYING_MODELS: Omit<BuyingModelEntity, 'createdAt' | 'updatedAt'>[] = [
  { id: "bm_cpm", name: "Coût pour Mille (CPM)", code: "CPM", description: "Achat à l'impression (Enchères ou Garanti)" },
  { id: "bm_cpc", name: "Coût par Clic (CPC)", code: "CPC", description: "Achat à la performance trafic" },
  { id: "bm_cpv", name: "Coût par Vue (CPV)", code: "CPV", description: "Achat à la vue vidéo (souvent à 15s ou 30s)" },
  { id: "bm_cpa", name: "Coût par Acquisition (CPA)", code: "CPA", description: "Achat à la conversion / lead" },
  { id: "bm_flat", name: "Forfait / Flat Fee", code: "FLAT", description: "Coût fixe pour une période ou un dispositif global" },
  { id: "bm_otc", name: "Gré à gré (OTC)", code: "OTC", description: "Négociation directe avec l'éditeur (Devis)" },
  { id: "bm_fixed_cpm", name: "CPM Fixe (Ratecard)", code: "FIXED_CPM", description: "Tarif carte imposé par format/dimension (Non-enchère)" },
];

// C. ÉDITEURS / FOURNISSEURS (PUBLISHERS)
const PUBLISHERS: Omit<PublisherEntity, 'createdAt' | 'updatedAt'>[] = [
  {
    id: "pub_meta",
    name: "Meta Platforms Inc.",
    legal_name: "Meta Platforms, Inc.",
    country: "USA",
    vat_number: "IE9692928F",
    billing_email: "billing@meta.com",
    payment_terms: "Net 30",
    currency: "USD",
    website: "https://www.meta.com",
    notes: "Facturation centralisée pour Facebook, Instagram, Messenger, Audience Network"
  },
  {
    id: "pub_google",
    name: "Google LLC",
    legal_name: "Google LLC (Alphabet Inc.)",
    country: "USA",
    vat_number: "IE6388047V",
    billing_email: "billing@google.com",
    payment_terms: "Prepaid (Carte/Virement)",
    currency: "USD",
    website: "https://ads.google.com",
    notes: "Facturation pour Google Ads, YouTube, DV360"
  },
  {
    id: "pub_bytedance",
    name: "ByteDance Ltd.",
    legal_name: "ByteDance Ltd.",
    country: "China",
    billing_email: "business@tiktok.com",
    payment_terms: "Prepaid",
    currency: "USD",
    website: "https://www.tiktok.com/business",
    notes: "TikTok For Business"
  },
  {
    id: "pub_microsoft",
    name: "Microsoft Corporation",
    legal_name: "Microsoft Corporation",
    country: "USA",
    vat_number: "IE9825613N",
    billing_email: "linkedin-ads@microsoft.com",
    payment_terms: "Net 30",
    currency: "USD",
    website: "https://business.linkedin.com",
    notes: "LinkedIn Ads"
  },
  {
    id: "pub_snap",
    name: "Snap Inc.",
    legal_name: "Snap Inc.",
    country: "USA",
    billing_email: "ads@snap.com",
    payment_terms: "Prepaid",
    currency: "USD",
    website: "https://forbusiness.snapchat.com",
    notes: "Snapchat Ads"
  },
  {
    id: "pub_teads",
    name: "Teads",
    legal_name: "Teads SA",
    country: "France",
    vat_number: "FR12345678901",
    billing_email: "billing@teads.com",
    payment_terms: "Net 30",
    currency: "EUR",
    website: "https://www.teads.com",
    notes: "Outstream Video Premium"
  },
  {
    id: "pub_local_press_generic",
    name: "Presse Locale Maroc (Générique)",
    legal_name: "Divers Éditeurs Locaux",
    country: "Maroc",
    billing_email: "contact@example.ma",
    payment_terms: "Gré à gré (OTC)",
    currency: "MAD",
    notes: "Éditeur générique pour regrouper les sites de presse locale. Chaque site sera ajouté individuellement et rattaché à cet éditeur."
  }
];

// D. CANAUX (CHANNELS) - Avec Hiérarchie Régie et Publisher
const CHANNELS: Omit<MediaChannelEntity, 'createdAt' | 'updatedAt'>[] = [
  // --- RÉGIES PARENTES (Containers) ---
  { 
    id: "ch_meta_ads", name: "Meta Ads (Régie)", category_id: "cat_social", publisher_id: "pub_meta",
    is_regie: true, description: "Plateforme publicitaire unifiée pour Facebook, Instagram, Messenger, Audience Network."
  },
  { 
    id: "ch_google_ads", name: "Google Ads (Régie)", category_id: "cat_search", publisher_id: "pub_google",
    is_regie: true, description: "Plateforme unifiée pour Search, YouTube, Display, Discovery."
  },

  // --- SOCIAL CHANNELS (Enfants) ---
  { 
    id: "ch_facebook", name: "Facebook", category_id: "cat_social", publisher_id: "pub_meta", parent_id: "ch_meta_ads", is_regie: false,
    description: "Audience large, formats variés (Feed, Story, Reel).",
    allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpv", "bm_cpa"]
  },
  { 
    id: "ch_instagram", name: "Instagram", category_id: "cat_social", publisher_id: "pub_meta", parent_id: "ch_meta_ads", is_regie: false,
    description: "Visuel, engagement, lifestyle (Feed, Story, Reel).",
    allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpv"]
  },
  { 
    id: "ch_tiktok", name: "TikTok", category_id: "cat_social", publisher_id: "pub_bytedance", is_regie: false,
    description: "Vidéo courte, audience Gen Z/Alpha.",
    allowed_buying_models: ["bm_cpm", "bm_cpv", "bm_cpc"]
  },
  { 
    id: "ch_linkedin", name: "LinkedIn", category_id: "cat_social", publisher_id: "pub_microsoft", is_regie: false,
    description: "B2B, ciblage professionnel précis.",
    allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"]
  },
  { 
    id: "ch_snapchat", name: "Snapchat", category_id: "cat_social", publisher_id: "pub_snap", is_regie: false,
    description: "Jeune audience, réalité augmentée.",
    allowed_buying_models: ["bm_cpm", "bm_cpv"]
  },

  // --- SEARCH & VIDEO (Enfants Google) ---
  { 
    id: "ch_google_search", name: "Google Search", category_id: "cat_search", publisher_id: "pub_google", parent_id: "ch_google_ads", is_regie: false,
    description: "Intentionnistes, mots-clés.",
    allowed_buying_models: ["bm_cpc", "bm_cpa"]
  },
  { 
    id: "ch_youtube", name: "YouTube", category_id: "cat_video", publisher_id: "pub_google", parent_id: "ch_google_ads", is_regie: false,
    description: "Plus grande plateforme vidéo au monde.",
    allowed_buying_models: ["bm_cpv", "bm_cpm", "bm_fixed_cpm"]
  },

  // --- DISPLAY & DIRECT (Régies Locales / Programmatique) ---
  { 
    id: "ch_dv360", name: "Display & Video 360", category_id: "cat_display", publisher_id: "pub_google", is_regie: false,
    description: "DSP Programmatique Google (Open Auction & Deals).",
    allowed_buying_models: ["bm_cpm", "bm_cpc", "bm_fixed_cpm"]
  },
  { 
    id: "ch_teads", name: "Teads", category_id: "cat_video", publisher_id: "pub_teads", is_regie: false,
    description: "Outstream Video Premium.",
    allowed_buying_models: ["bm_cpm", "bm_cpv"]
  },
  { 
    id: "ch_local_press", name: "Presse Locale (Direct)", category_id: "cat_display", publisher_id: "pub_local_press_generic", is_regie: false,
    description: "Hespress, Le Matin, etc. (Achats directs en gré à gré).",
    allowed_buying_models: ["bm_flat", "bm_otc", "bm_fixed_cpm"]
  },
];

// E. FORMATS TECHNIQUES (Specs Complètes pour Media Buying Pro)
const FORMATS: Omit<MediaFormatEntity, 'createdAt' | 'updatedAt'>[] = [
  
  // ========== META ADS (Facebook & Instagram) ==========
  
  // --- FEED FORMATS ---
  { 
    id: "fmt_meta_feed_square", name: "Meta Feed - Carré (1:1)", type: "image", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"]
  },
  { 
    id: "fmt_meta_feed_portrait", name: "Meta Feed - Portrait (4:5)", type: "image", 
    specs: { ratio: "4:5", width: 1080, height: 1350, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"]
  },
  { 
    id: "fmt_meta_feed_landscape", name: "Meta Feed - Paysage (1.91:1)", type: "image", 
    specs: { ratio: "1.91:1", width: 1200, height: 628, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },
  
  // --- STORIES & REELS ---
  { 
    id: "fmt_meta_story", name: "Meta Stories (9:16)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 15, max_weight_mb: 4 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpv"]
  },
  { 
    id: "fmt_meta_reel", name: "Instagram Reels (9:16)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 90, max_weight_mb: 4 },
    compatible_channels: ["ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpv", "bm_cpa"]
  },
  
  // --- CAROUSEL ---
  { 
    id: "fmt_meta_carousel", name: "Meta Carousel (2-10 cartes)", type: "carousel", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"]
  },
  
  // --- COLLECTION & LEAD ADS ---
  { 
    id: "fmt_meta_collection", name: "Meta Collection Ad", type: "carousel", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpa"]
  },
  { 
    id: "fmt_meta_lead_gen", name: "Meta Lead Ads (Formulaire Instantané)", type: "image", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 30 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpa"]
  },
  
  // --- VIDEO FEED ---
  { 
    id: "fmt_meta_video_feed", name: "Meta Video Feed (16:9 ou 1:1)", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 241, max_weight_mb: 4000 },
    compatible_channels: ["ch_facebook", "ch_instagram"],
    compatible_buying_models: ["bm_cpm", "bm_cpv", "bm_cpa"]
  },

  // ========== GOOGLE ADS ==========
  
  // --- SEARCH ---
  { 
    id: "fmt_google_rsa", name: "Google Responsive Search Ad", type: "text", 
    specs: {},
    compatible_channels: ["ch_google_search"],
    compatible_buying_models: ["bm_cpc", "bm_cpa"]
  },
  
  // --- YOUTUBE VIDEO ---
  { 
    id: "fmt_youtube_skippable", name: "YouTube Skippable In-Stream (TrueView)", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 30, max_weight_mb: 1024 },
    compatible_channels: ["ch_youtube"],
    compatible_buying_models: ["bm_cpv", "bm_cpm"]
  },
  { 
    id: "fmt_youtube_non_skippable", name: "YouTube Non-Skippable (15s)", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 15, max_weight_mb: 1024 },
    compatible_channels: ["ch_youtube"],
    compatible_buying_models: ["bm_cpm", "bm_fixed_cpm"]
  },
  { 
    id: "fmt_youtube_bumper", name: "YouTube Bumper Ads (6s)", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 6, max_weight_mb: 1024 },
    compatible_channels: ["ch_youtube"],
    compatible_buying_models: ["bm_cpm"]
  },
  { 
    id: "fmt_youtube_shorts", name: "YouTube Shorts (9:16)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 60, max_weight_mb: 1024 },
    compatible_channels: ["ch_youtube"],
    compatible_buying_models: ["bm_cpv", "bm_cpm"]
  },
  
  // --- GOOGLE DISPLAY (Responsive) ---
  { 
    id: "fmt_google_responsive_display", name: "Google Responsive Display Ad", type: "html5", 
    specs: { width: 1200, height: 628, max_weight_mb: 5 },
    compatible_channels: ["ch_dv360"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },
  { 
    id: "fmt_google_discovery", name: "Google Discovery Ads", type: "image", 
    specs: { ratio: "1.91:1", width: 1200, height: 628, max_weight_mb: 5 },
    compatible_channels: ["ch_dv360"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },

  // ========== TIKTOK ADS ==========
  
  { 
    id: "fmt_tiktok_infeed", name: "TikTok In-Feed Video (9:16)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 60, max_weight_mb: 500 },
    compatible_channels: ["ch_tiktok"],
    compatible_buying_models: ["bm_cpm", "bm_cpv", "bm_cpc"]
  },
  { 
    id: "fmt_tiktok_topview", name: "TikTok TopView (Premium)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 60, max_weight_mb: 500 },
    compatible_channels: ["ch_tiktok"],
    compatible_buying_models: ["bm_fixed_cpm"]
  },
  { 
    id: "fmt_tiktok_spark", name: "TikTok Spark Ads (Organic Boost)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 60, max_weight_mb: 500 },
    compatible_channels: ["ch_tiktok"],
    compatible_buying_models: ["bm_cpm", "bm_cpv"]
  },
  { 
    id: "fmt_tiktok_collection", name: "TikTok Collection Ads", type: "carousel", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 10 },
    compatible_channels: ["ch_tiktok"],
    compatible_buying_models: ["bm_cpm", "bm_cpa"]
  },

  // ========== LINKEDIN ADS ==========
  
  { 
    id: "fmt_linkedin_single_image", name: "LinkedIn Single Image (1.91:1)", type: "image", 
    specs: { ratio: "1.91:1", width: 1200, height: 627, max_weight_mb: 5 },
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpm", "bm_cpc", "bm_cpa"]
  },
  { 
    id: "fmt_linkedin_carousel", name: "LinkedIn Carousel (2-10 cartes)", type: "carousel", 
    specs: { ratio: "1:1", width: 1080, height: 1080, max_weight_mb: 10 },
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },
  { 
    id: "fmt_linkedin_video", name: "LinkedIn Video Ad", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 30, max_weight_mb: 200 },
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpm", "bm_cpv"]
  },
  { 
    id: "fmt_linkedin_lead_gen", name: "LinkedIn Lead Gen Forms", type: "image", 
    specs: { ratio: "1.91:1", width: 1200, height: 627, max_weight_mb: 5 },
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpa"]
  },
  { 
    id: "fmt_linkedin_message", name: "LinkedIn Message Ads (Sponsored InMail)", type: "text", 
    specs: {},
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpa"]
  },
  { 
    id: "fmt_linkedin_document", name: "LinkedIn Document Ads", type: "image", 
    specs: { ratio: "1.91:1", width: 1200, height: 627, max_weight_mb: 100 },
    compatible_channels: ["ch_linkedin"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },

  // ========== SNAPCHAT ADS ==========
  
  { 
    id: "fmt_snap_single_image", name: "Snapchat Single Image/Video (9:16)", type: "video", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_duration_sec: 10, max_weight_mb: 32 },
    compatible_channels: ["ch_snapchat"],
    compatible_buying_models: ["bm_cpm", "bm_cpv"]
  },
  { 
    id: "fmt_snap_collection", name: "Snapchat Collection Ads", type: "carousel", 
    specs: { ratio: "9:16", width: 1080, height: 1920, max_weight_mb: 32 },
    compatible_channels: ["ch_snapchat"],
    compatible_buying_models: ["bm_cpm"]
  },

  // ========== DISPLAY IAB STANDARD (Programmatic) ==========
  
  { 
    id: "fmt_iab_mpu", name: "IAB Medium Rectangle (MPU) 300x250", type: "html5", 
    specs: { width: 300, height: 250, max_weight_mb: 0.15 },
    compatible_channels: ["ch_dv360", "ch_local_press"],
    compatible_buying_models: ["bm_cpm", "bm_cpc", "bm_flat", "bm_otc"]
  },
  { 
    id: "fmt_iab_leaderboard", name: "IAB Leaderboard 728x90", type: "html5", 
    specs: { width: 728, height: 90, max_weight_mb: 0.15 },
    compatible_channels: ["ch_dv360", "ch_local_press"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },
  { 
    id: "fmt_iab_billboard", name: "IAB Billboard 970x250", type: "html5", 
    specs: { width: 970, height: 250, max_weight_mb: 0.2 },
    compatible_channels: ["ch_dv360", "ch_local_press"],
    compatible_buying_models: ["bm_cpm", "bm_flat", "bm_otc"]
  },
  { 
    id: "fmt_iab_skyscraper", name: "IAB Wide Skyscraper 160x600", type: "html5", 
    specs: { width: 160, height: 600, max_weight_mb: 0.15 },
    compatible_channels: ["ch_dv360", "ch_local_press"],
    compatible_buying_models: ["bm_cpm"]
  },
  { 
    id: "fmt_iab_mobile_banner", name: "IAB Mobile Banner 320x50", type: "image", 
    specs: { width: 320, height: 50, max_weight_mb: 0.05 },
    compatible_channels: ["ch_dv360", "ch_local_press"],
    compatible_buying_models: ["bm_cpm", "bm_cpc"]
  },
  { 
    id: "fmt_iab_mobile_interstitial", name: "IAB Mobile Interstitial 320x480", type: "html5", 
    specs: { width: 320, height: 480, max_weight_mb: 0.5 },
    compatible_channels: ["ch_dv360"],
    compatible_buying_models: ["bm_cpm"]
  },

  // ========== VIDEO PREMIUM ==========
  
  { 
    id: "fmt_teads_outstream", name: "Teads Outstream Video (16:9)", type: "video", 
    specs: { ratio: "16:9", width: 1920, height: 1080, max_duration_sec: 30, max_weight_mb: 100 },
    compatible_channels: ["ch_teads"],
    compatible_buying_models: ["bm_cpm", "bm_cpv"]
  },

  // ========== PRESSE LOCALE ==========
  
  { 
    id: "fmt_local_habillage", name: "Habillage de Site (Skin)", type: "image", 
    specs: { width: 1920, height: 1080, max_weight_mb: 1.0 },
    compatible_channels: ["ch_local_press"],
    compatible_buying_models: ["bm_flat", "bm_otc", "bm_fixed_cpm"]
  },
  { 
    id: "fmt_local_masthead", name: "Masthead / Bandeau Premium", type: "image", 
    specs: { width: 970, height: 90, max_weight_mb: 0.2 },
    compatible_channels: ["ch_local_press"],
    compatible_buying_models: ["bm_flat", "bm_otc", "bm_fixed_cpm"]
  }
];

export default function MediaSeedPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleImport = async () => {
    if (!confirm("⚠️ Confirmation : Vous allez injecter les données techniques Média dans Firestore.\n\nCela va créer 5 nouvelles collections de référence (incluant les Éditeurs/Fournisseurs).")) return;
    
    setStatus("loading");
    setLogs([]);
    addLog("🚀 Initialisation de l'import Média...");

    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      let opCount = 0;

      // 1. Catégories
      addLog(`📂 Injection de ${CATEGORIES.length} Catégories de Canaux...`);
      CATEGORIES.forEach(item => {
        batch.set(doc(db, "ref_channel_categories", item.id), {
          ...item,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        opCount++;
      });

      // 2. Buying Models
      addLog(`💰 Injection de ${BUYING_MODELS.length} Modèles d'Achat...`);
      BUYING_MODELS.forEach(item => {
        batch.set(doc(db, "ref_buying_models", item.id), {
          ...item,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        opCount++;
      });

      // 3. Publishers (Éditeurs/Fournisseurs)
      addLog(`🏢 Injection de ${PUBLISHERS.length} Éditeurs/Fournisseurs...`);
      PUBLISHERS.forEach(item => {
        batch.set(doc(db, "ref_publishers", item.id), {
          ...item,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        opCount++;
      });

      // 4. Channels (avec liens vers Publishers)
      addLog(`📺 Injection de ${CHANNELS.length} Canaux Média (liés aux éditeurs)...`);
      CHANNELS.forEach(item => {
        batch.set(doc(db, "ref_channels", item.id), {
          ...item,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        opCount++;
      });

      // 5. Formats
      addLog(`🎨 Injection de ${FORMATS.length} Formats Techniques...`);
      FORMATS.forEach(item => {
        batch.set(doc(db, "ref_formats", item.id), {
          ...item,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        opCount++;
      });

      addLog(`⏳ Exécution du batch Firestore (${opCount} écritures atomiques)...`);
      await batch.commit();

      setStatus("success");
      addLog("✅ BASE MÉDIA INITIALISÉE AVEC SUCCÈS !");
      addLog(`📊 Collections créées : ref_channel_categories, ref_buying_models, ref_publishers, ref_channels, ref_formats`);
      addLog(`🔗 Tous les canaux sont automatiquement liés à leurs éditeurs respectifs`);

    } catch (error: any) {
      console.error("Erreur lors de l'import:", error);
      setStatus("error");
      addLog(`❌ ERREUR : ${error.message || error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour Admin</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Bibliothèque Média</h1>
            <p className="text-slate-400">Structure technique pour le Media Buying (Formats, Canaux, Specs).</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
              <MonitorPlay className="text-blue-400" size={24} />
              <div>
                <div className="font-bold text-slate-100">{CHANNELS.length} Plateformes</div>
                <div className="text-xs text-slate-500">Meta, Google, LinkedIn...</div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
              <Component className="text-pink-400" size={24} />
              <div>
                <div className="font-bold text-slate-100">{FORMATS.length} Formats Standards</div>
                <div className="text-xs text-slate-500">IAB, Social, Video...</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleImport}
              disabled={status === "loading" || status === "success"}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all
                ${status === "idle" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-900/20 hover:scale-105" : ""}
                ${status === "loading" ? "bg-slate-700 text-slate-400 cursor-wait" : ""}
                ${status === "success" ? "bg-emerald-600 text-white cursor-default" : ""}
                ${status === "error" ? "bg-red-600 hover:bg-red-500 text-white" : ""}
              `}
            >
              {status === "idle" && <><Play size={20} /> Initialiser la Base Média</>}
              {status === "loading" && <><Loader size={20} className="animate-spin" /> Écriture en cours...</>}
              {status === "success" && <><Check size={20} /> Terminé</>}
              {status === "error" && <><AlertTriangle size={20} /> Réessayer</>}
            </button>
          </div>

          {/* Logs Console */}
          <div className="bg-black/50 rounded-lg border border-slate-800 p-4 font-mono text-xs h-64 overflow-y-auto">
             {logs.length === 0 ? (
              <span className="text-slate-600 italic">En attente de l'import...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`mb-1 ${
                  log.includes("❌") ? "text-red-400" : 
                  log.includes("✅") ? "text-emerald-400" : 
                  log.includes("⚠️") ? "text-amber-400" :
                  "text-slate-400"
                }`}>
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
