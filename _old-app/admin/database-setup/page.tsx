"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, Check, Play, Lock, AlertTriangle, 
  Terminal, ArrowLeft, ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase"; 
import { doc, getDoc, setDoc, writeBatch, serverTimestamp, getDocs, collection } from "firebase/firestore";

// --- DÉFINITION DES DONNÉES (Payloads) ---

// 1. DATA POUR BATCH V2.1 (Médiathèque Complète)
const V2_1_DATA = {
  categories: [
    { id: "cat_social", name: "Social Ads", description: "Réseaux sociaux (Meta, TikTok, LinkedIn, Snap)" },
    { id: "cat_search", name: "Search (SEA)", description: "Moteurs de recherche (Google, Bing)" },
    { id: "cat_display", name: "Display & Programmatic", description: "Bannières sur sites éditeurs et réseaux display" },
    { id: "cat_video", name: "Online Video (OLV)", description: "YouTube, VOD, Catch-up TV" },
    { id: "cat_audio", name: "Digital Audio", description: "Spotify, Deezer, Podcasts" },
  ],
  objectives: [
    { id: "obj_awareness", name: "Notoriété (Awareness)", code: "AWARENESS" },
    { id: "obj_traffic", name: "Trafic (Traffic)", code: "TRAFFIC" },
    { id: "obj_engagement", name: "Engagement", code: "ENGAGEMENT" },
    { id: "obj_leads", name: "Génération de Leads", code: "LEAD" },
    { id: "obj_conversion", name: "Ventes / Conversions", code: "CONVERSION" },
  ],
  buying_models: [
    { id: "bm_cpm", name: "Coût pour Mille (CPM)", code: "CPM", description: "Achat à l'impression" },
    { id: "bm_cpc", name: "Coût par Clic (CPC)", code: "CPC", description: "Achat à la performance trafic" },
    { id: "bm_cpv", name: "Coût par Vue (CPV)", code: "CPV", description: "Achat à la vue vidéo" },
    { id: "bm_cpa", name: "Coût par Acquisition (CPA)", code: "CPA", description: "Achat à la conversion" },
    { id: "bm_flat", name: "Forfait / Flat Fee", code: "FLAT", description: "Coût fixe période" },
    { id: "bm_otc", name: "Gré à gré (OTC)", code: "OTC", description: "Devis direct éditeur" },
    { id: "bm_fixed_cpm", name: "CPM Fixe (Ratecard)", code: "FIXED_CPM", description: "Tarif carte garanti" },
  ],
  buying_units: [
    { id: "unit_imp", name: "Impressions", code: "IMP", description: "Volume d'affichages" },
    { id: "unit_click", name: "Clics", code: "CLICK", description: "Volume de clics sortants" },
    { id: "unit_view", name: "Vues", code: "VIEW", description: "Vues vidéo complétées (ou à X%)" },
    { id: "unit_lead", name: "Leads", code: "LEAD", description: "Formulaires remplis" },
    { id: "unit_action", name: "Actions", code: "ACTION", description: "Achats ou événements custom" },
    { id: "unit_day", name: "Jours", code: "DAY", description: "Jours de présence (Habillage)" },
  ],
  publishers: [
    { id: "pub_meta", name: "Meta Platforms Ireland", country: "Irlande", currency: "USD" },
    { id: "pub_google", name: "Google Ireland Ltd", country: "Irlande", currency: "USD" },
    { id: "pub_bytedance", name: "ByteDance (TikTok)", country: "UK", currency: "USD" },
    { id: "pub_microsoft", name: "Microsoft Ireland (LinkedIn)", country: "Irlande", currency: "USD" },
    { id: "pub_local", name: "Régies Locales Maroc", country: "Maroc", currency: "MAD" },
  ],
  channels: [
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
  ],
  formats: [
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
  ],
  placements: [
    { id: "pl_fb_feed", name: "Facebook Feed", channel_id: "ch_facebook", format_ids: ["fmt_social_post", "fmt_social_portrait", "fmt_video_instream"], description: "Flux d'actualité principal mobile et desktop" },
    { id: "pl_fb_story", name: "Facebook Stories", channel_id: "ch_facebook", format_ids: ["fmt_social_story"], description: "Format plein écran éphémère" },
    { id: "pl_fb_right", name: "Facebook Right Column", channel_id: "ch_facebook", format_ids: ["fmt_social_post"], description: "Colonne de droite desktop uniquement" },
    { id: "pl_ig_feed", name: "Instagram Feed", channel_id: "ch_instagram", format_ids: ["fmt_social_post", "fmt_social_portrait"], description: "Flux principal images et vidéos" },
    { id: "pl_ig_story", name: "Instagram Stories", channel_id: "ch_instagram", format_ids: ["fmt_social_story"], description: "Placement le plus populaire, plein écran" },
    { id: "pl_ig_reels", name: "Instagram Reels", channel_id: "ch_instagram", format_ids: ["fmt_social_story"], description: "Flux vidéo vertical immersif" },
    { id: "pl_li_feed", name: "LinkedIn Newsfeed", channel_id: "ch_linkedin", format_ids: ["fmt_social_post", "fmt_video_instream"], description: "Flux professionnel" },
    { id: "pl_yt_instream", name: "YouTube In-Stream (Pre-roll)", channel_id: "ch_youtube", format_ids: ["fmt_video_instream"], description: "Vidéo avant le contenu, skippable ou non" },
    { id: "pl_yt_shorts", name: "YouTube Shorts", channel_id: "ch_youtube", format_ids: ["fmt_social_story"], description: "Flux vidéo vertical YouTube" },
    { id: "pl_google_search", name: "Search Results (SERP)", channel_id: "ch_google_search", format_ids: ["fmt_text_ad"], description: "Liens sponsorisés en haut de page" },
  ]
};

// 3. GÉNÉRATEUR DE DONNÉES RÉALISTES (50 Plans + 200 Insertions)
// Inclut la nouvelle structure de frais d'agence
const generateRealisticData = () => {
  // Clients réalistes avec frais d'agence par défaut
  const clients = [
    { id: "CL_SANLAM", name: "Sanlam Maroc", type: "direct", default_agency_fees: { commission_rate: 15, management_fee_type: "percent", management_fee_value: 5, additional_fees: [] } },
    { id: "CL_ELEVEN", name: "Eleven Media Group", type: "agency", default_agency_fees: { commission_rate: 12, management_fee_type: "percent", management_fee_value: 3, additional_fees: [] } },
    { id: "CL_TGCC", name: "TGCC Immobilier", type: "direct", default_agency_fees: { commission_rate: 15, management_fee_type: "percent", management_fee_value: 5, additional_fees: [] } },
    { id: "CL_HONORIS", name: "Honoris United Universities", type: "holding", default_agency_fees: { commission_rate: 18, management_fee_type: "percent", management_fee_value: 5, additional_fees: [{ id: "fee_prequalif", name: "Préqualification Leads", type: "flat", value: 5000 }] } },
    { id: "CL_YAMED", name: "Yamed Capital", type: "direct", default_agency_fees: { commission_rate: 15, management_fee_type: "percent", management_fee_value: 5, additional_fees: [] } },
    { id: "CL_SOFITEL", name: "Sofitel Maroc", type: "direct", default_agency_fees: { commission_rate: 15, management_fee_type: "flat", management_fee_value: 3000, additional_fees: [] } },
    { id: "CL_INWI", name: "Inwi Telecom", type: "direct", default_agency_fees: { commission_rate: 10, management_fee_type: "percent", management_fee_value: 3, additional_fees: [{ id: "fee_decli", name: "Déclinaisons Bannières", type: "percent", value: 5 }] } },
    { id: "CL_MARJANE", name: "Marjane Holding", type: "holding", default_agency_fees: { commission_rate: 15, management_fee_type: "percent", management_fee_value: 5, additional_fees: [] } },
    { id: "CL_BMCE", name: "Bank of Africa", type: "direct", default_agency_fees: { commission_rate: 12, management_fee_type: "percent", management_fee_value: 4, additional_fees: [] } },
    { id: "CL_OCP", name: "OCP Group", type: "holding", default_agency_fees: { commission_rate: 15, management_fee_type: "percent", management_fee_value: 5, additional_fees: [] } },
  ];

  // Canaux avec modèles d'achat
  const channels = [
    { id: "ch_facebook", name: "Facebook", model: "CPM", avgCost: 25 },
    { id: "ch_instagram", name: "Instagram", model: "CPM", avgCost: 30 },
    { id: "ch_youtube", name: "YouTube", model: "CPV", avgCost: 0.05 },
    { id: "ch_google_search", name: "Google Search", model: "CPC", avgCost: 4.5 },
    { id: "ch_tiktok", name: "TikTok", model: "CPV", avgCost: 0.03 },
    { id: "ch_linkedin", name: "LinkedIn", model: "CPC", avgCost: 8 },
    { id: "ch_dv360", name: "DV360", model: "CPM", avgCost: 15 },
    { id: "ch_local_press", name: "Presse Digitale", model: "Forfait", avgCost: 15000 },
  ];

  // Formats
  const formats = [
    { id: "fmt_social_post", name: "Post Carré 1:1", type: "image" },
    { id: "fmt_social_story", name: "Story 9:16", type: "video" },
    { id: "fmt_video_instream", name: "Video In-Stream", type: "video" },
    { id: "fmt_iab_pave", name: "Pavé 300x250", type: "html5" },
    { id: "fmt_text_ad", name: "Annonce Texte", type: "text" },
    { id: "fmt_social_portrait", name: "Portrait 4:5", type: "image" },
  ];

  const objectives = ["AWARENESS", "TRAFFIC", "CONVERSION", "LEAD", "ENGAGEMENT"];
  const statuses = ["DRAFT", "VALIDATED", "ONGOING", "COMPLETED"];
  const insertionStatuses = ["PLANNED", "BOOKED", "LIVE", "PAUSED", "ENDED"];

  const campaignNames = [
    "Lancement Produit", "Brand Awareness", "Acquisition Leads", "Promo Été",
    "Black Friday", "Ramadan", "Rentrée", "Fin d'Année", "Notoriété",
    "Performance Q1", "Performance Q2", "Branding", "Retargeting", "Prospection"
  ];

  const plans: any[] = [];
  const insertions: any[] = [];

  // Générer 50 plans média
  for (let i = 1; i <= 50; i++) {
    const client = clients[i % clients.length];
    const month = ((i - 1) % 12) + 1;
    const year = 2024 + Math.floor((i - 1) / 24);
    const budget = 50000 + Math.floor(Math.random() * 450000); // 50k - 500k MAD
    const status = statuses[i % statuses.length];
    const objective = objectives[i % objectives.length];
    const campaignName = campaignNames[i % campaignNames.length];

    const planId = `mp_${year}_${String(month).padStart(2, '0')}_${String(i).padStart(3, '0')}`;
    
    plans.push({
      id: planId,
      plan_id: planId.toUpperCase(),
      planName: `${campaignName} - ${client.name}`,
      nomPlan: `${campaignName} - ${client.name}`,
      name: `${campaignName} - ${client.name}`,
      description: `Campagne ${campaignName.toLowerCase()} pour ${client.name}. Objectif principal: ${objective}.`,
      client_id: client.id,
      annonceurRef: client.id,
      dateDebut: { seconds: Math.floor(new Date(year, month - 1, 1).getTime() / 1000), nanoseconds: 0 },
      dateFin: { seconds: Math.floor(new Date(year, month + 1, 28).getTime() / 1000), nanoseconds: 0 },
      start_date: `${year}-${String(month).padStart(2, '0')}-01`,
      end_date: `${year}-${String(month + 2).padStart(2, '0')}-28`,
      budgetTotal: budget,
      total_budget_ht: budget,
      currency: "MAD",
      status: status,
      objectifPrincipal: [objective],
      objectives: [objective],
      // Nouvelle structure de frais d'agence (héritée du client avec possibilité d'override)
      agency_fees: client.default_agency_fees,
      show_fees: true,
      show_commission: true,
      show_additional_fees: true,
    });

    // Générer 4 insertions par plan (= 200 insertions pour 50 plans)
    const insertionsPerPlan = 4;
    const budgetPerInsertion = Math.floor(budget / insertionsPerPlan);

    for (let j = 1; j <= insertionsPerPlan; j++) {
      const channel = channels[(i + j) % channels.length];
      const format = formats[(i + j) % formats.length];
      
      // Calcul réaliste du coût
      let unitCost = channel.avgCost * (0.8 + Math.random() * 0.4); // ±20% variation
      let quantity: number;
      
      if (channel.model === "CPM") {
        quantity = Math.floor(budgetPerInsertion / unitCost * 1000);
        unitCost = Math.round(unitCost * 100) / 100;
      } else if (channel.model === "CPC") {
        quantity = Math.floor(budgetPerInsertion / unitCost);
        unitCost = Math.round(unitCost * 100) / 100;
      } else if (channel.model === "CPV") {
        quantity = Math.floor(budgetPerInsertion / unitCost);
        unitCost = Math.round(unitCost * 1000) / 1000;
      } else {
        quantity = 1;
        unitCost = budgetPerInsertion;
      }

      const insertionId = `ins_${planId}_${j}`;

      insertions.push({
        id: insertionId,
        idInsertion: insertionId.toUpperCase(),
        planRef: planId,
        plan_id: planId,
        name: `${channel.name} - ${format.name}`,
        support: channel.name,
        canal: channel.name,
        canalId: channel.id,
        channel_id: channel.id,
        format: format.name,
        formatId: format.id,
        format_id: format.id,
        modeleAchat: channel.model,
        buyingModelId: `bm_${channel.model.toLowerCase()}`,
        buying_model_id: `bm_${channel.model.toLowerCase()}`,
        coutUnitaire: unitCost,
        unit_cost: unitCost,
        quantiteAchetee: quantity,
        quantity: quantity,
        coutEstime: Math.round(budgetPerInsertion),
        total_cost_ht: Math.round(budgetPerInsertion),
        status: insertionStatuses[(i + j) % insertionStatuses.length],
      });
    }
  }

  return { plans, insertions };
};

// --- DÉFINITION DU SYSTÈME DE BATCH ---

interface DatabaseBatch {
  id: string; // Identifiant UNIQUE du batch (ex: '2025_01_media_v2_1')
  title: string;
  description: string;
  isDestructive: boolean; // Si true, demande une double confirmation
  isRerunnable?: boolean; // Si true, peut être réexécuté (pas de verrouillage)
  data: any; // Les données à injecter
  execute: (batchId: string, log: (msg: string) => void) => Promise<void>;
}

// LISTE DES BATCHS DISPONIBLES - SIMPLIFIÉ
const BATCHES: DatabaseBatch[] = [
  // ============================================================================
  // BATCH 1: 🧹 NETTOYER - Supprimer toutes les données de test
  // ============================================================================
  {
    id: "batch_clean_test_data",
    title: "🧹 NETTOYER: Supprimer Données Test",
    description: "Supprime tous les plans média, insertions, contenus, liens et ciblages. Garde les référentiels et le CRM intacts.",
    isDestructive: true,
    isRerunnable: true,
    data: null,
    execute: async (batchId, addLog) => {
      addLog(`🧹 NETTOYAGE EN COURS...`);
      
      const collectionsToWipe = [
        "media-plans",
        "insertions", 
        "contents",
        "redirect-links",
        "targetings",
      ];

      let totalDeleted = 0;

      for (const colName of collectionsToWipe) {
        try {
          const snapshot = await getDocs(collection(db, colName));
          
          if (snapshot.empty) {
            addLog(`� ${colName}: Déjà vide`);
            continue;
          }

          const docs = snapshot.docs;
          const chunks = [];
          for (let i = 0; i < docs.length; i += 400) {
            chunks.push(docs.slice(i, i + 400));
          }

          for (const chunk of chunks) {
            const batchOp = writeBatch(db);
            chunk.forEach(docSnap => batchOp.delete(doc(db, colName, docSnap.id)));
            await batchOp.commit();
          }

          addLog(`🗑️ ${colName}: ${docs.length} supprimés`);
          totalDeleted += docs.length;
        } catch (err) {
          addLog(`⚠️ ${colName}: Erreur`);
        }
      }

      addLog(`\n✅ NETTOYAGE TERMINÉ: ${totalDeleted} documents supprimés`);
    }
  },
  // ============================================================================
  // BATCH 2: 🚀 MÉGA BATCH - Tout initialiser d'un coup
  // ============================================================================
  {
    id: "batch_mega_init",
    title: "🚀 MÉGA BATCH: Initialisation Complète",
    description: "Supprime les données test, puis génère: Référentiels + 50 Plans Média + 200 Insertions + Contenus + Liens + Ciblages. Tout en un !",
    isDestructive: true,
    isRerunnable: true,
    data: null,
    execute: async (batchId, addLog) => {
      const timestamp = serverTimestamp();
      
      // ═══════════════════════════════════════════════════════════════════════
      // ÉTAPE 1: NETTOYAGE
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`🧹 ÉTAPE 1/5: NETTOYAGE DES DONNÉES EXISTANTES`);
      addLog(`${"═".repeat(60)}`);
      
      const collectionsToWipe = ["media-plans", "insertions", "contents", "redirect-links", "targetings"];
      let totalDeleted = 0;

      for (const colName of collectionsToWipe) {
        try {
          const snapshot = await getDocs(collection(db, colName));
          if (!snapshot.empty) {
            const docs = snapshot.docs;
            for (let i = 0; i < docs.length; i += 400) {
              const chunk = docs.slice(i, i + 400);
              const batchDel = writeBatch(db);
              chunk.forEach(docSnap => batchDel.delete(doc(db, colName, docSnap.id)));
              await batchDel.commit();
            }
            addLog(`   🗑️ ${colName}: ${docs.length} supprimés`);
            totalDeleted += docs.length;
          }
        } catch (err) {
          addLog(`   ⚠️ ${colName}: Erreur`);
        }
      }
      addLog(`✅ ${totalDeleted} documents supprimés`);

      // ═══════════════════════════════════════════════════════════════════════
      // ÉTAPE 2: RÉFÉRENTIELS
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`� ÉTAPE 2/5: INSTALLATION DES RÉFÉRENTIELS`);
      addLog(`${"═".repeat(60)}`);

      const refBatch = writeBatch(db);
      let refCount = 0;

      const addRefs = (collectionName: string, items: any[]) => {
        items.forEach(item => {
          refBatch.set(doc(db, collectionName, item.id), { ...item, createdAt: timestamp, updatedAt: timestamp });
          refCount++;
        });
        addLog(`   📦 ${collectionName}: ${items.length} éléments`);
      };

      addRefs("ref_channel_categories", V2_1_DATA.categories);
      addRefs("ref_objectives", V2_1_DATA.objectives);
      addRefs("ref_buying_models", V2_1_DATA.buying_models);
      addRefs("ref_buying_units", V2_1_DATA.buying_units);
      addRefs("ref_publishers", V2_1_DATA.publishers);
      addRefs("ref_channels", V2_1_DATA.channels);
      addRefs("ref_formats", V2_1_DATA.formats);
      addRefs("ref_placements", V2_1_DATA.placements);

      await refBatch.commit();
      addLog(`✅ ${refCount} référentiels installés`);

      // ═══════════════════════════════════════════════════════════════════════
      // ÉTAPE 3: PLANS MÉDIA + INSERTIONS
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`� ÉTAPE 3/5: GÉNÉRATION DES PLANS MÉDIA`);
      addLog(`${"═".repeat(60)}`);

      const { plans, insertions } = generateRealisticData();
      addLog(`   📋 ${plans.length} plans média générés`);
      addLog(`   📝 ${insertions.length} insertions générées`);

      // Écriture des plans
      for (let i = 0; i < plans.length; i += 400) {
        const chunk = plans.slice(i, i + 400);
        const batchPlans = writeBatch(db);
        chunk.forEach((plan: any) => {
          batchPlans.set(doc(db, "media-plans", plan.id), { ...plan, createdAt: timestamp, updatedAt: timestamp });
        });
        await batchPlans.commit();
      }
      addLog(`✅ ${plans.length} plans écrits`);

      // Écriture des insertions
      for (let i = 0; i < insertions.length; i += 400) {
        const chunk = insertions.slice(i, i + 400);
        const batchIns = writeBatch(db);
        chunk.forEach((ins: any) => {
          batchIns.set(doc(db, "insertions", ins.id), { ...ins, createdAt: timestamp, updatedAt: timestamp });
        });
        await batchIns.commit();
      }
      addLog(`✅ ${insertions.length} insertions écrites`);

      // ═══════════════════════════════════════════════════════════════════════
      // ÉTAPE 4: CONTENUS CRÉATIFS
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`📸 ÉTAPE 4/5: GÉNÉRATION DES CONTENUS`);
      addLog(`${"═".repeat(60)}`);

      const contents: any[] = [];
      const ctaTexts = ["Découvrir", "En savoir plus", "Acheter", "S'inscrire", "Réserver"];
      const headlines = ["Offre Exclusive", "Nouveau!", "Découvrez", "Ne manquez pas", "Profitez"];

      insertions.forEach((ins: any, idx: number) => {
        const isVideo = ins.format?.toLowerCase().includes("video") || ins.format?.toLowerCase().includes("story");
        contents.push({
          id: `cont_${ins.id}`,
          content_id: `CONT_${ins.id}`.toUpperCase(),
          name: `Créatif - ${ins.name || ins.support}`,
          insertion_id: ins.id,
          plan_id: ins.planRef || ins.plan_id,
          type: isVideo ? "video" : "image",
          headline: `${headlines[idx % headlines.length]} - ${ins.support || "Campagne"}`,
          body: `Découvrez notre offre. ${ins.name || "Campagne"} - Ne manquez pas !`,
          cta_text: ctaTexts[idx % ctaTexts.length],
          creative_url: `https://drive.google.com/creative/${ins.plan_id}/${idx}`,
          status: ["DRAFT", "PENDING", "APPROVED"][idx % 3],
          specs: isVideo ? { duration_sec: 15, ratio: "9:16" } : { width: 1080, height: 1080 },
        });
      });

      for (let i = 0; i < contents.length; i += 400) {
        const chunk = contents.slice(i, i + 400);
        const batchC = writeBatch(db);
        chunk.forEach((c: any) => batchC.set(doc(db, "contents", c.id), { ...c, createdAt: timestamp, updatedAt: timestamp }));
        await batchC.commit();
      }
      addLog(`✅ ${contents.length} contenus créés`);

      // ═══════════════════════════════════════════════════════════════════════
      // ÉTAPE 5: LIENS + CIBLAGES
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`🔗 ÉTAPE 5/5: LIENS DE REDIRECTION & CIBLAGES`);
      addLog(`${"═".repeat(60)}`);

      const redirectLinks: any[] = [];
      const targetings: any[] = [];
      const geoConfigs = [
        { countries: ["Maroc"], cities: ["Casablanca", "Rabat", "Marrakech"] },
        { countries: ["Maroc"], cities: ["Grand Casablanca"] },
        { countries: ["Maroc"], cities: [] },
      ];

      plans.forEach((plan: any, idx: number) => {
        const clientName = plan.client_id?.replace("CL_", "").toLowerCase() || "client";
        
        // Lien de redirection
        redirectLinks.push({
          id: `link_${plan.id}`,
          link_id: `LINK_${plan.id}`.toUpperCase(),
          name: `Landing - ${plan.name || plan.planName}`,
          plan_id: plan.id,
          destination_url: `https://${clientName}.ma/landing/${plan.id}`,
          tracking_url: `https://track.agence.ma/${plan.id}`,
          utm_source: "paid_media",
          utm_medium: "display",
          utm_campaign: plan.id,
          is_active: true,
          click_count: Math.floor(Math.random() * 5000),
        });

        // Ciblage
        const geo = geoConfigs[idx % geoConfigs.length];
        targetings.push({
          id: `tgt_${plan.id}`,
          targeting_id: `TGT_${plan.id}`.toUpperCase(),
          name: `Ciblage - ${plan.name || plan.planName}`,
          plan_id: plan.id,
          config: {
            geo_countries: geo.countries,
            geo_cities: geo.cities,
            age_min: 18 + (idx % 3) * 7,
            age_max: 45 + (idx % 3) * 10,
            genders: ["male", "female"],
            devices: ["mobile", "desktop"],
            languages: ["fr", "ar"],
          },
          is_active: true,
        });
      });

      const linkBatch = writeBatch(db);
      redirectLinks.forEach((l: any) => linkBatch.set(doc(db, "redirect-links", l.id), { ...l, createdAt: timestamp, updatedAt: timestamp }));
      await linkBatch.commit();
      addLog(`✅ ${redirectLinks.length} liens créés`);

      const tgtBatch = writeBatch(db);
      targetings.forEach((t: any) => tgtBatch.set(doc(db, "targetings", t.id), { ...t, createdAt: timestamp, updatedAt: timestamp }));
      await tgtBatch.commit();
      addLog(`✅ ${targetings.length} ciblages créés`);

      // ═══════════════════════════════════════════════════════════════════════
      // RÉSUMÉ FINAL
      // ═══════════════════════════════════════════════════════════════════════
      addLog(`\n${"═".repeat(60)}`);
      addLog(`🎉 MÉGA BATCH TERMINÉ AVEC SUCCÈS !`);
      addLog(`${"═".repeat(60)}`);
      addLog(`� RÉSUMÉ:`);
      addLog(`   • ${refCount} référentiels`);
      addLog(`   • ${plans.length} plans média`);
      addLog(`   • ${insertions.length} insertions`);
      addLog(`   • ${contents.length} contenus créatifs`);
      addLog(`   • ${redirectLinks.length} liens de redirection`);
      addLog(`   • ${targetings.length} configurations de ciblage`);
      addLog(`   💰 Budget total: ${plans.reduce((sum: number, p: any) => sum + (p.budgetTotal || 0), 0).toLocaleString()} MAD`);
    }
  },
  // ============================================================================
  // BATCH 3: 👑 Activer l'utilisateur courant comme Super Admin
  // ============================================================================
  {
    id: "batch_activate_super_admin",
    title: "👑 ACTIVER: Mon compte Super Admin",
    description: "Active l'utilisateur actuellement connecté comme Super Administrateur avec tous les accès. Utilisez ce batch pour le premier setup.",
    isDestructive: false,
    isRerunnable: true,
    data: null,
    execute: async (batchId, addLog) => {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        addLog(`❌ Aucun utilisateur connecté !`);
        addLog(`💡 Connectez-vous d'abord sur /login puis revenez ici.`);
        return;
      }

      addLog(`👤 Utilisateur détecté: ${currentUser.email}`);
      addLog(`🔧 Activation en cours...`);

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Mettre à jour l'utilisateur existant
        await setDoc(userRef, {
          ...userDoc.data(),
          role: 'super_admin',
          status: 'active',
          client_access: 'all',
          updatedAt: serverTimestamp(),
        }, { merge: true });
        addLog(`✅ Compte mis à jour !`);
      } else {
        // Créer le profil utilisateur
        await setDoc(userRef, {
          email: currentUser.email,
          display_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
          role: 'super_admin',
          status: 'active',
          client_access: 'all',
          assigned_client_ids: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addLog(`✅ Profil créé !`);
      }

      addLog(`\n🎉 TERMINÉ !`);
      addLog(`👑 Vous êtes maintenant Super Administrateur`);
      addLog(`🔄 Rafraîchissez la page pour appliquer les changements`);
    }
  },
  // ============================================================================
  // BATCH 4: 🧹 Nettoyer les comptes utilisateurs orphelins
  // ============================================================================
  {
    id: "batch_clean_orphan_users",
    title: "🧹 NETTOYER: Comptes Utilisateurs Orphelins",
    description: "Supprime les comptes sans email ou avec des données incomplètes. Garde uniquement les comptes valides.",
    isDestructive: true,
    isRerunnable: true,
    data: null,
    execute: async (batchId, addLog) => {
      addLog(`🔍 Analyse des comptes utilisateurs...`);
      
      const usersSnapshot = await getDocs(collection(db, "users"));
      const batch = writeBatch(db);
      let deleteCount = 0;
      let keepCount = 0;

      usersSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const hasEmail = data.email && data.email.trim() !== '';
        const hasName = data.display_name && data.display_name.trim() !== '' && data.display_name !== 'Utilisateur';
        
        // Supprimer si pas d'email OU nom générique "Utilisateur" sans email valide
        if (!hasEmail || (!hasName && data.display_name === 'Utilisateur')) {
          batch.delete(docSnap.ref);
          deleteCount++;
          addLog(`   🗑️ Suppression: ${data.display_name || 'Sans nom'} (${data.email || 'pas d\'email'})`);
        } else {
          keepCount++;
        }
      });

      if (deleteCount > 0) {
        await batch.commit();
        addLog(`\n✅ ${deleteCount} compte(s) orphelin(s) supprimé(s)`);
      } else {
        addLog(`\n✅ Aucun compte orphelin trouvé`);
      }
      
      addLog(`📊 ${keepCount} compte(s) valide(s) conservé(s)`);
    }
  },
];

// --- COMPOSANT PAGE ---

export default function DatabaseSetupPage() {
  const router = useRouter();
  
  // State
  const [history, setHistory] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [runningBatchId, setRunningBatchId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Fetch History on Load
  useEffect(() => {
    checkHistory();
  }, []);

  const checkHistory = async () => {
    setLoading(true);
    try {
      // On va chercher l'historique dans une collection système 'sys_seed_history'
      const historySnapshot = await getDoc(doc(db, "sys_seed_history", "main_log"));
      if (historySnapshot.exists()) {
        setHistory(historySnapshot.data());
      }
    } catch (err) {
      console.error("Erreur lecture historique", err);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunBatch = async (batch: DatabaseBatch) => {
    if (batch.isDestructive && !confirm(`⚠️ ATTENTION : "${batch.title}"\n\nCe script va modifier/écraser des données. Êtes-vous sûr de vouloir continuer ?`)) {
      return;
    }

    setRunningBatchId(batch.id);
    setLogs([]);
    addLog(`Démarrage du batch : ${batch.id}`);

    try {
      // 1. Exécuter le script du batch
      await batch.execute(batch.id, addLog);
      
      // 2. Enregistrer le succès dans l'historique
      const newHistory = {
        ...history,
        [batch.id]: {
          executedAt: new Date().toISOString(),
          status: "success",
          user: "admin" // Pourrait être l'ID user réel
        }
      };

      await setDoc(doc(db, "sys_seed_history", "main_log"), newHistory, { merge: true });
      
      setHistory(newHistory);
      addLog("✅ Batch terminé avec succès !");
      if (!batch.isRerunnable) {
        addLog("🔒 Ce script est maintenant verrouillé.");
      } else {
        addLog("🔄 Ce script peut être réexécuté.");
      }

    } catch (error: any) {
      console.error(error);
      addLog(`❌ ERREUR CRITIQUE : ${error.message}`);
    } finally {
      setRunningBatchId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Retour Admin
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Database size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Maintenance Base de Données</h1>
            <p className="text-slate-400">
              Gestionnaire de versions et scripts d'initialisation.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {BATCHES.map((batch) => {
            const isDone = !!history[batch.id];
            const isRunning = runningBatchId === batch.id;
            const canRun = !isDone || batch.isRerunnable;

            return (
              <div 
                key={batch.id}
                className={`
                  relative overflow-hidden rounded-xl border transition-all
                  ${isDone && !batch.isRerunnable
                    ? "bg-[#0F172A]/50 border-slate-800 opacity-70" 
                    : batch.isDestructive
                    ? "bg-[#0F172A] border-red-500/30 shadow-lg shadow-red-900/10"
                    : "bg-[#0F172A] border-indigo-500/30 shadow-lg shadow-indigo-900/10"
                  }
                `}
              >
                <div className="p-6 flex items-start gap-6">
                  {/* Status Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isDone && !batch.isRerunnable 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : batch.isDestructive 
                      ? "bg-red-500/10 text-red-400"
                      : "bg-indigo-500/10 text-indigo-400"}
                  `}>
                    {isDone && !batch.isRerunnable ? <Check size={24} /> : <Terminal size={24} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-xl font-bold ${isDone && !batch.isRerunnable ? "text-slate-400" : "text-white"}`}>
                        {batch.title}
                      </h3>
                      {isDone && (
                        <span className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border ${
                          batch.isRerunnable 
                            ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                            : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        }`}>
                          <ShieldCheck size={12} />
                          {batch.isRerunnable ? "DERNIER RUN:" : "EXÉCUTÉ LE"} {new Date(history[batch.id].executedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                      {batch.description}
                    </p>

                    {/* Actions */}
                    {canRun ? (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleRunBatch(batch)}
                          disabled={isRunning || loading}
                          className={`
                            px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
                            ${isRunning 
                              ? "bg-slate-700 text-slate-400 cursor-wait" 
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
                            }
                          `}
                        >
                          {isRunning ? (
                            <>Traitement en cours...</>
                          ) : (
                            <>
                              <Play size={18} fill="currentColor" /> Exécuter le Batch
                            </>
                          )}
                        </button>
                        {batch.isDestructive && (
                          <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1.5 rounded-full">
                            <AlertTriangle size={14} />
                            Action Destructive
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-900/50 px-4 py-2 rounded-lg w-fit">
                        <Lock size={16} />
                        Script verrouillé par sécurité
                      </div>
                    )}

                    {/* Logs specific to this run */}
                    {isRunning && (
                      <div className="mt-6 bg-black/50 rounded-lg p-4 font-mono text-xs border border-indigo-500/30 max-h-48 overflow-y-auto">
                        {logs.map((log, i) => (
                          <div key={i} className="mb-1 text-indigo-300/80 border-b border-indigo-500/10 pb-1 last:border-0">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
