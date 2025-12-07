"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, 
  Loader, Database, FileText, Download
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import type { BrandEntity, AdvertiserEntity, ClientEntity, ContactEntity } from "../../types/agence";

interface IntegrityIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  entity: string;
  entityId: string;
  collection: string;
  message: string;
  fix?: () => Promise<void>;
}

interface AuditStats {
  totalCollections: number;
  totalDocuments: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

export default function DataIntegrityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [auditComplete, setAuditComplete] = useState(false);

  const runAudit = async () => {
    setAuditing(true);
    setIssues([]);
    setAuditComplete(false);

    try {
      // Fetch all collections
      // Note: Media Library uses ref_* prefix (seeded data), Core entities use standard names
      const [
        brandsSnap, 
        advertisersSnap, 
        clientsSnap, 
        contactsSnap,
        channelsSnap,
        formatsSnap,
        buyingModelsSnap,
        mediaPlanSnap,
        insertionsSnap,
        contentsSnap,
        redirectLinksSnap,
        targetingsSnap
      ] = await Promise.all([
        // Core entities
        getDocs(collection(db, "brands")),
        getDocs(collection(db, "advertisers")),
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "contacts")),
        // Media Library (ref_* collections from seeding)
        getDocs(collection(db, "ref_channels")),
        getDocs(collection(db, "ref_formats")),
        getDocs(collection(db, "ref_buying_models")),
        // Operational data
        getDocs(collection(db, "media-plans")),
        getDocs(collection(db, "insertions")),
        getDocs(collection(db, "contents")),
        getDocs(collection(db, "redirect-links")),
        getDocs(collection(db, "targetings"))
      ]);

      const brands = brandsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const advertisers = advertisersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const contacts = contactsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const channels = channelsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const formats = formatsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const buyingModels = buyingModelsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const mediaPlans = mediaPlanSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const insertions = insertionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const contents = contentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const redirectLinks = redirectLinksSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const targetings = targetingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

      const foundIssues: IntegrityIssue[] = [];

      // Create lookup maps - filter out undefined keys
      // For clients: map by client_id (the custom field, not the doc ID)
      // Use LOWERCASE for case-insensitive comparison
      const clientIdMap = new Map(
        clients.filter(c => c.client_id).map(c => [c.client_id.toLowerCase(), c])
      );
      
      // For advertisers: map by both doc ID and advertiser_id
      const advertiserMap = new Map(advertisers.map(a => [a.id, a]));
      const advertiserIdMap = new Map(
        advertisers.filter(a => a.advertiser_id).map(a => [a.advertiser_id, a])
      );
      
      // For brands: map by both doc ID and brand_id
      const brandMap = new Map(brands.map(b => [b.id, b]));
      const brandIdMap = new Map(
        brands.filter(b => b.brand_id).map(b => [b.brand_id, b])
      );
      
      const channelMap = new Map(channels.map(ch => [ch.id, ch]));
      const formatMap = new Map(formats.map(f => [f.id, f]));
      const buyingModelMap = new Map(buyingModels.map(bm => [bm.id, bm]));
      const mediaPlanMap = new Map(mediaPlans.map(mp => [mp.id, mp]));
      const insertionMap = new Map(insertions.map(ins => [ins.id, ins]));

      // Note: client_id comparison is case-insensitive to handle database inconsistencies

      // ========== AUDIT CLIENTS ==========
      clients.forEach(client => {
        if (!client.client_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: client.name || "Sans nom",
            entityId: client.id,
            collection: "clients",
            message: `Client "${client.name}" n'a pas de client_id (champ obligatoire)`
          });
        }
        if (!client.name) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: "Client",
            entityId: client.id,
            collection: "clients",
            message: `Client ${client.id} n'a pas de nom (champ obligatoire)`
          });
        }
      });

      // ========== AUDIT ADVERTISERS ==========
      advertisers.forEach(advertiser => {
        if (!advertiser.client_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: advertiser.name || "Sans nom",
            entityId: advertiser.id,
            collection: "advertisers",
            message: `Advertiser "${advertiser.name}" n'a pas de client_id`
          });
        } else if (!clientIdMap.has(advertiser.client_id.toLowerCase())) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "critical",
            entity: advertiser.name,
            entityId: advertiser.id,
            collection: "advertisers",
            message: `Advertiser "${advertiser.name}" référence un client inexistant: ${advertiser.client_id}`
          });
        }
        if (!advertiser.name) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: "Advertiser",
            entityId: advertiser.id,
            collection: "advertisers",
            message: `Advertiser ${advertiser.id} n'a pas de nom`
          });
        }
      });

      // ========== AUDIT BRANDS ==========
      brands.forEach(brand => {
        if (!brand.client_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: brand.name || "Sans nom",
            entityId: brand.id,
            collection: "brands",
            message: `Brand "${brand.name}" n'a pas de client_id`
          });
        } else if (!clientIdMap.has(brand.client_id.toLowerCase())) {
          // brand.client_id should match a client's client_id field
          foundIssues.push({
            type: "orphan_reference",
            severity: "critical",
            entity: brand.name,
            entityId: brand.id,
            collection: "brands",
            message: `Brand "${brand.name}" référence un client inexistant (client_id: ${brand.client_id})`
          });
        }

        if (brand.advertiser_id) {
          // brand.advertiser_id is the DOCUMENT ID of the advertiser
          const advertiser = advertiserMap.get(brand.advertiser_id);
          if (!advertiser) {
            foundIssues.push({
              type: "orphan_reference",
              severity: "warning",
              entity: brand.name,
              entityId: brand.id,
              collection: "brands",
              message: `Brand "${brand.name}" référence un annonceur inexistant (doc ID: ${brand.advertiser_id})`
            });
          } else if (advertiser.client_id !== brand.client_id) {
            // Both should have the same client_id FIELD value
            foundIssues.push({
              type: "data_mismatch",
              severity: "critical",
              entity: brand.name,
              entityId: brand.id,
              collection: "brands",
              message: `INCOHÉRENCE: Brand "${brand.name}" (client_id: ${brand.client_id}) et Advertiser "${advertiser.name}" (client_id: ${advertiser.client_id}) ont des clients différents`
            });
          }
        }
      });

      // ========== AUDIT CONTACTS ==========
      contacts.forEach(contact => {
        if (!contact.name || !contact.email) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: contact.name || "Sans nom",
            entityId: contact.id,
            collection: "contacts",
            message: `Contact ${contact.id} manque de champs obligatoires (name/email)`
          });
        }

        if (contact.linked_client) {
          // Contacts link to clients by document ID
          const clientExists = clients.some(c => c.id === contact.linked_client);
          if (!clientExists) {
            foundIssues.push({
              type: "orphan_reference",
              severity: "warning",
              entity: contact.name,
              entityId: contact.id,
              collection: "contacts",
              message: `Contact "${contact.name}" référence un client inexistant: ${contact.linked_client}`
            });
          }
        }

        if (contact.linked_advertiser && !advertiserMap.has(contact.linked_advertiser)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: contact.name,
            entityId: contact.id,
            collection: "contacts",
            message: `Contact "${contact.name}" référence un annonceur inexistant`
          });
        }

        if (contact.linked_brand && !brandMap.has(contact.linked_brand)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: contact.name,
            entityId: contact.id,
            collection: "contacts",
            message: `Contact "${contact.name}" référence une marque inexistante`
          });
        }
      });

      // ========== AUDIT CHANNELS ==========
      channels.forEach(channel => {
        if (!channel.name) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: "Channel",
            entityId: channel.id,
            collection: "channels",
            message: `Channel ${channel.id} n'a pas de nom`
          });
        }
      });

      // ========== AUDIT FORMATS ==========
      formats.forEach(format => {
        if (!format.name) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: "Format",
            entityId: format.id,
            collection: "formats",
            message: `Format ${format.id} n'a pas de nom`
          });
        }
        if (format.channelId && !channelMap.has(format.channelId)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: format.name || "Sans nom",
            entityId: format.id,
            collection: "formats",
            message: `Format "${format.name}" référence un canal inexistant`
          });
        }
      });

      // ========== AUDIT BUYING MODELS ==========
      buyingModels.forEach(model => {
        if (!model.name) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: "BuyingModel",
            entityId: model.id,
            collection: "buyingModels",
            message: `BuyingModel ${model.id} n'a pas de nom`
          });
        }

        // Check authorized channels
        if (model.authorizedChannels && Array.isArray(model.authorizedChannels)) {
          model.authorizedChannels.forEach((channelId: string) => {
            if (!channelMap.has(channelId)) {
              foundIssues.push({
                type: "orphan_reference",
                severity: "warning",
                entity: model.name || "Sans nom",
                entityId: model.id,
                collection: "buyingModels",
                message: `BuyingModel "${model.name}" référence un canal inexistant dans authorizedChannels: ${channelId}`
              });
            }
          });
        }
      });

      // ========== AUDIT MEDIA PLANS ==========
      mediaPlans.forEach(plan => {
        if (!plan.client_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: plan.planName || "Sans nom",
            entityId: plan.id,
            collection: "media-plans",
            message: `Plan média "${plan.planName}" n'a pas de client_id`
          });
        } else if (!clientIdMap.has(plan.client_id.toLowerCase())) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "critical",
            entity: plan.planName,
            entityId: plan.id,
            collection: "media-plans",
            message: `Plan média "${plan.planName}" référence un client inexistant: ${plan.client_id}`
          });
        }

        if (plan.brand_id && !brandMap.has(plan.brand_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: plan.planName,
            entityId: plan.id,
            collection: "media-plans",
            message: `Plan média "${plan.planName}" référence une marque inexistante`
          });
        }

        // ========== AUDIT INSERTIONS ==========
        if (plan.insertions && Array.isArray(plan.insertions)) {
          plan.insertions.forEach((insertion: any, index: number) => {
            const insertionLabel = `Insertion #${index + 1} du plan "${plan.planName}"`;

            // Check channel reference
            if (insertion.canalId) {
              if (!channelMap.has(insertion.canalId)) {
                foundIssues.push({
                  type: "orphan_reference",
                  severity: "critical",
                  entity: insertionLabel,
                  entityId: plan.id,
                  collection: "media-plans",
                  message: `${insertionLabel} référence un canal inexistant: ${insertion.canalId}`
                });
              }
            } else {
              foundIssues.push({
                type: "missing_required_field",
                severity: "critical",
                entity: insertionLabel,
                entityId: plan.id,
                collection: "media-plans",
                message: `${insertionLabel} n'a pas de canalId`
              });
            }

            // Check format reference
            if (insertion.formatId) {
              const format = formats.find(f => f.id === insertion.formatId);
              if (!format) {
                foundIssues.push({
                  type: "orphan_reference",
                  severity: "critical",
                  entity: insertionLabel,
                  entityId: plan.id,
                  collection: "media-plans",
                  message: `${insertionLabel} référence un format inexistant: ${insertion.formatId}`
                });
              } else {
                // Check if format belongs to the same channel
                if (format.channelId && format.channelId !== insertion.canalId) {
                  foundIssues.push({
                    type: "data_mismatch",
                    severity: "critical",
                    entity: insertionLabel,
                    entityId: plan.id,
                    collection: "media-plans",
                    message: `${insertionLabel} : Le format "${format.name}" appartient au canal "${format.channelId}" mais l'insertion utilise le canal "${insertion.canalId}"`
                  });
                }
              }
            }

            // Check buying model reference
            if (insertion.buyingModelId) {
              const buyingModel = buyingModels.find(bm => bm.id === insertion.buyingModelId);
              if (!buyingModel) {
                foundIssues.push({
                  type: "orphan_reference",
                  severity: "warning",
                  entity: insertionLabel,
                  entityId: plan.id,
                  collection: "media-plans",
                  message: `${insertionLabel} référence un modèle d'achat inexistant: ${insertion.buyingModelId}`
                });
              } else {
                // Check if buying model authorizes this channel
                if (buyingModel.authorizedChannels && Array.isArray(buyingModel.authorizedChannels)) {
                  if (!buyingModel.authorizedChannels.includes(insertion.canalId)) {
                    foundIssues.push({
                      type: "data_mismatch",
                      severity: "warning",
                      entity: insertionLabel,
                      entityId: plan.id,
                      collection: "media-plans",
                      message: `${insertionLabel} : Le modèle d'achat "${buyingModel.name}" n'autorise pas le canal utilisé (${insertion.canalId})`
                    });
                  }
                }
              }
            }

            // Check required fields
            if (!insertion.support || !insertion.support.trim()) {
              foundIssues.push({
                type: "missing_required_field",
                severity: "warning",
                entity: insertionLabel,
                entityId: plan.id,
                collection: "media-plans",
                message: `${insertionLabel} n'a pas de support défini`
              });
            }

            // Check numeric values
            if (insertion.quantiteAchetee && insertion.quantiteAchetee < 0) {
              foundIssues.push({
                type: "invalid_value",
                severity: "warning",
                entity: insertionLabel,
                entityId: plan.id,
                collection: "media-plans",
                message: `${insertionLabel} a une quantité négative: ${insertion.quantiteAchetee}`
              });
            }

            if (insertion.coutEstime && insertion.coutEstime < 0) {
              foundIssues.push({
                type: "invalid_value",
                severity: "warning",
                entity: insertionLabel,
                entityId: plan.id,
                collection: "media-plans",
                message: `${insertionLabel} a un coût négatif: ${insertion.coutEstime}`
              });
            }
          });
        }
      });

      // ========== AUDIT INSERTIONS (Collection séparée) ==========
      insertions.forEach(insertion => {
        const insertionLabel = insertion.name || insertion.idInsertion || `Insertion ${insertion.id}`;

        // Vérifier le lien vers le plan
        if (!insertion.planRef && !insertion.plan_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" n'a pas de référence vers un plan média`
          });
        } else {
          const planId = insertion.planRef || insertion.plan_id;
          if (!mediaPlanMap.has(planId)) {
            foundIssues.push({
              type: "orphan_reference",
              severity: "critical",
              entity: insertionLabel,
              entityId: insertion.id,
              collection: "insertions",
              message: `Insertion "${insertionLabel}" référence un plan média inexistant: ${planId}`
            });
          }
        }

        // Vérifier le canal
        const canalId = insertion.canalId || insertion.canal || insertion.channel_id;
        if (canalId && !channelMap.has(canalId)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" référence un canal inexistant: ${canalId}`
          });
        }

        // Vérifier le format
        const formatId = insertion.formatId || insertion.format_id;
        if (formatId && !formatMap.has(formatId)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" référence un format inexistant: ${formatId}`
          });
        }

        // Vérifier le modèle d'achat
        const bmId = insertion.buyingModelId || insertion.buying_model_id;
        if (bmId && !buyingModelMap.has(bmId)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" référence un modèle d'achat inexistant: ${bmId}`
          });
        }

        // Vérifier les valeurs numériques
        const cost = insertion.coutEstime || insertion.total_cost_ht || 0;
        const qty = insertion.quantiteAchetee || insertion.quantity || 0;
        if (cost < 0) {
          foundIssues.push({
            type: "invalid_value",
            severity: "warning",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" a un coût négatif: ${cost}`
          });
        }
        if (qty < 0) {
          foundIssues.push({
            type: "invalid_value",
            severity: "warning",
            entity: insertionLabel,
            entityId: insertion.id,
            collection: "insertions",
            message: `Insertion "${insertionLabel}" a une quantité négative: ${qty}`
          });
        }
      });

      // ========== AUDIT CONTENTS ==========
      contents.forEach(content => {
        const contentLabel = content.name || `Content ${content.id}`;

        // Vérifier le lien parent (plan ou insertion)
        if (!content.plan_id && !content.insertion_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "warning",
            entity: contentLabel,
            entityId: content.id,
            collection: "contents",
            message: `Content "${contentLabel}" n'est lié ni à un plan ni à une insertion`
          });
        }

        if (content.plan_id && !mediaPlanMap.has(content.plan_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: contentLabel,
            entityId: content.id,
            collection: "contents",
            message: `Content "${contentLabel}" référence un plan inexistant: ${content.plan_id}`
          });
        }

        if (content.insertion_id && !insertionMap.has(content.insertion_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: contentLabel,
            entityId: content.id,
            collection: "contents",
            message: `Content "${contentLabel}" référence une insertion inexistante: ${content.insertion_id}`
          });
        }

        // Vérifier le type
        if (!content.type) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "warning",
            entity: contentLabel,
            entityId: content.id,
            collection: "contents",
            message: `Content "${contentLabel}" n'a pas de type défini`
          });
        }
      });

      // ========== AUDIT REDIRECT LINKS ==========
      redirectLinks.forEach(link => {
        const linkLabel = link.name || `Link ${link.id}`;

        // Vérifier l'URL de destination
        if (!link.destination_url) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "critical",
            entity: linkLabel,
            entityId: link.id,
            collection: "redirect-links",
            message: `Redirect Link "${linkLabel}" n'a pas d'URL de destination`
          });
        }

        // Vérifier le lien parent
        if (!link.plan_id && !link.insertion_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "warning",
            entity: linkLabel,
            entityId: link.id,
            collection: "redirect-links",
            message: `Redirect Link "${linkLabel}" n'est lié ni à un plan ni à une insertion`
          });
        }

        if (link.plan_id && !mediaPlanMap.has(link.plan_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: linkLabel,
            entityId: link.id,
            collection: "redirect-links",
            message: `Redirect Link "${linkLabel}" référence un plan inexistant`
          });
        }

        if (link.insertion_id && !insertionMap.has(link.insertion_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: linkLabel,
            entityId: link.id,
            collection: "redirect-links",
            message: `Redirect Link "${linkLabel}" référence une insertion inexistante`
          });
        }
      });

      // ========== AUDIT TARGETINGS ==========
      targetings.forEach(targeting => {
        const targetingLabel = targeting.name || `Targeting ${targeting.id}`;

        // Vérifier le lien parent
        if (!targeting.plan_id && !targeting.insertion_id) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "warning",
            entity: targetingLabel,
            entityId: targeting.id,
            collection: "targetings",
            message: `Targeting "${targetingLabel}" n'est lié ni à un plan ni à une insertion`
          });
        }

        if (targeting.plan_id && !mediaPlanMap.has(targeting.plan_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: targetingLabel,
            entityId: targeting.id,
            collection: "targetings",
            message: `Targeting "${targetingLabel}" référence un plan inexistant`
          });
        }

        if (targeting.insertion_id && !insertionMap.has(targeting.insertion_id)) {
          foundIssues.push({
            type: "orphan_reference",
            severity: "warning",
            entity: targetingLabel,
            entityId: targeting.id,
            collection: "targetings",
            message: `Targeting "${targetingLabel}" référence une insertion inexistante`
          });
        }

        // Vérifier la config
        if (!targeting.config) {
          foundIssues.push({
            type: "missing_required_field",
            severity: "warning",
            entity: targetingLabel,
            entityId: targeting.id,
            collection: "targetings",
            message: `Targeting "${targetingLabel}" n'a pas de configuration définie`
          });
        }
      });

      setIssues(foundIssues);
      setAuditComplete(true);
    } catch (error) {
      console.error("Audit error:", error);
      alert("Erreur lors de l'audit");
    } finally {
      setAuditing(false);
    }
  };

  const generateFixBatch = () => {
    const fixes: string[] = [];
    
    fixes.push("// BATCH DE CORRECTION - Data Integrity");
    fixes.push("// Généré le: " + new Date().toISOString());
    fixes.push("// Issues trouvées: " + issues.length);
    fixes.push("");
    fixes.push("import { db } from './lib/firebase';");
    fixes.push("import { collection, writeBatch, doc, deleteDoc } from 'firebase/firestore';");
    fixes.push("");
    fixes.push("export async function fixDataIntegrity() {");
    fixes.push("  const batch = writeBatch(db);");
    fixes.push("");

    issues.forEach((issue, index) => {
      fixes.push(`  // Issue ${index + 1}: ${issue.type}`);
      fixes.push(`  // ${issue.message}`);
      
      if (issue.type === "brand_advertiser_mismatch") {
        fixes.push(`  // SOLUTION: Retirer advertiser_id de la marque (incompatible avec client_id)`);
        fixes.push(`  batch.update(doc(db, "brands", "${issue.entityId}"), { advertiser_id: null });`);
      } else if (issue.type === "orphan_brand" || issue.type === "orphan_advertiser") {
        fixes.push(`  // SOLUTION: Nettoyer la référence orpheline`);
        if (issue.entity === "Brand") {
          fixes.push(`  batch.update(doc(db, "brands", "${issue.entityId}"), { advertiser_id: null });`);
        }
      } else if (issue.type === "missing_client") {
        fixes.push(`  // SOLUTION MANUELLE REQUISE: Créer le client manquant ou corriger la référence`);
        fixes.push(`  // await deleteDoc(doc(db, "brands", "${issue.entityId}")); // OU corriger client_id`);
      }
      
      fixes.push("");
    });

    fixes.push("  await batch.commit();");
    fixes.push("  console.log('Data integrity fixes applied!');");
    fixes.push("}");

    return fixes.join("\n");
  };

  const downloadBatch = () => {
    const batchCode = generateFixBatch();
    const blob = new Blob([batchCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fix-data-integrity-${Date.now()}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const autoFix = async () => {
    if (!confirm(`Corriger automatiquement ${issues.filter(i => i.type !== "missing_client").length} problèmes ?`)) return;
    
    setFixing(true);
    try {
      const batch = writeBatch(db);
      let fixCount = 0;

      issues.forEach(issue => {
        if (issue.type === "brand_advertiser_mismatch" || issue.type === "orphan_brand") {
          // Remove incompatible advertiser_id
          batch.update(doc(db, "brands", issue.entityId), { advertiser_id: null });
          fixCount++;
        }
      });

      if (fixCount > 0) {
        await batch.commit();
        alert(`${fixCount} problèmes corrigés avec succès !`);
        runAudit(); // Re-run audit
      } else {
        alert("Aucune correction automatique disponible. Corrections manuelles requises.");
      }
    } catch (error) {
      console.error("Fix error:", error);
      alert("Erreur lors de la correction");
    } finally {
      setFixing(false);
    }
  };

  const criticalCount = issues.filter(i => i.severity === "critical").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* HEADER */}
        <div className="mb-6 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/admin")} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Shield className="text-cyan-500" size={28} />
                  Intégrité des Données
                </h1>
                <p className="text-sm text-slate-400 mt-1">Audit et correction des incohérences relationnelles</p>
              </div>
            </div>
          </div>
        </div>

        {/* AUDIT PANEL */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database size={20} className="text-cyan-500" />
                Audit Complet de la Base de Données
              </h2>
              <p className="text-sm text-slate-400 mt-1">Audit complet : 12 collections (Clients, Advertisers, Brands, Contacts, Channels, Formats, Buying Models, Media Plans, Insertions, Contents, Redirect Links, Targetings)</p>
            </div>
            <button
              onClick={runAudit}
              disabled={auditing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {auditing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Lancer l'Audit
                </>
              )}
            </button>
          </div>

          {/* RULES */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Règles de Validation</h3>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 mb-1">Entités Core</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Clients, Advertisers, Brands</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Contacts & références</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 mb-1">Media Library</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Channels, Formats</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Buying Models</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 mb-1">Media Plans</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Plans & Insertions</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Valeurs numériques</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 mb-1">Contenus & Ciblage</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Contents, Redirect Links</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Targetings configs</span>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          {auditComplete && (
            <div className="space-y-4">
              {/* SUMMARY */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Issues</div>
                  <div className="text-2xl font-bold text-white">{issues.length}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Critiques</div>
                  <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Avertissements</div>
                  <div className="text-2xl font-bold text-amber-400">{warningCount}</div>
                </div>
              </div>

              {/* COLLECTION BREAKDOWN */}
              {issues.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Répartition par Collection</h3>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {Array.from(new Set(issues.map(i => i.collection))).map(coll => {
                      const count = issues.filter(i => i.collection === coll).length;
                      const critical = issues.filter(i => i.collection === coll && i.severity === "critical").length;
                      return (
                        <div key={coll} className="bg-slate-800/50 rounded p-2">
                          <div className="font-mono text-slate-400">{coll}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white font-bold">{count}</span>
                            {critical > 0 && <span className="text-red-400">({critical} ⚠)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ISSUES LIST */}
              {issues.length > 0 ? (
                <>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={downloadBatch}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={16} />
                      Télécharger Batch
                    </button>
                    <button
                      onClick={autoFix}
                      disabled={fixing}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {fixing ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Correction...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Auto-Corriger
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {issues.map((issue, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          issue.severity === "critical" 
                            ? "bg-red-500/5 border-red-500/30" 
                            : "bg-amber-500/5 border-amber-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {issue.severity === "critical" ? (
                            <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs font-bold uppercase ${
                                issue.severity === "critical" ? "text-red-400" : "text-amber-400"
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 font-mono">{issue.collection}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">{issue.type}</span>
                            </div>
                            <p className="text-sm text-slate-300">{issue.message}</p>
                            <div className="text-xs text-slate-500 mt-1">Entity: {issue.entity} ({issue.entityId})</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-8 text-center">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-400 mb-1">Aucun Problème Détecté</h3>
                  <p className="text-sm text-slate-400">Toutes les relations sont cohérentes !</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
