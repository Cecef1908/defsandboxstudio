"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Tag, 
  Mail, 
  Phone,
  Briefcase,
  ChevronRight,
  Link as LinkIcon
} from "lucide-react";
import type { BrandEntity, ClientEntity, AdvertiserEntity, ContactEntity } from "@/app/types/agence";

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [client, setClient] = useState<ClientEntity | null>(null);
  const [advertiser, setAdvertiser] = useState<AdvertiserEntity | null>(null);
  const [contacts, setContacts] = useState<ContactEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandData();
  }, [brandId]);

  async function fetchBrandData() {
    try {
      setLoading(true);

      // 1. Récupérer la Marque
      const brandDoc = await getDoc(doc(db, "brands", brandId));
      if (!brandDoc.exists()) {
        console.error("Marque introuvable");
        return;
      }

      const brandData = { id: brandDoc.id, ...brandDoc.data() } as BrandEntity;
      setBrand(brandData);

      // 2. Récupérer le Client Parent
      if (brandData.client_id) {
        const clientDoc = await getDoc(doc(db, "clients", brandData.client_id));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as ClientEntity);
        }
      }

      // 3. Récupérer l'Annonceur (si existe)
      if (brandData.advertiser_id) {
        const advertiserDoc = await getDoc(doc(db, "advertisers", brandData.advertiser_id));
        if (advertiserDoc.exists()) {
          setAdvertiser({ id: advertiserDoc.id, ...advertiserDoc.data() } as AdvertiserEntity);
        }
      }

      // 4. Récupérer les Contacts associés
      const contactsQuery = query(
        collection(db, "contacts"),
        where("linked_brand", "==", brandId)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contactsData = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactEntity[];
      setContacts(contactsData);

    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Marque introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/admin/brands")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux marques</span>
        </button>

        {/* En-tête avec Fil d'Ariane */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span>Marques</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">{brand.name}</span>
          </div>

          {/* Titre et Badge */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                {brand.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  {brand.brand_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 - Hiérarchie / Relations */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700 rounded-lg">
              <LinkIcon className="w-5 h-5 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Hiérarchie & Relations
            </h2>
          </div>

          <div className="space-y-4">
            {/* Client Parent */}
            {client && (
              <div 
                onClick={() => router.push(`/admin/clients/${client.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Client Payeur</div>
                  <div className="font-medium text-slate-200">{client.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{client.client_id}</div>
                </div>
              </div>
            )}

            {/* Annonceur */}
            {advertiser && (
              <div 
                onClick={() => router.push(`/admin/advertisers/${advertiser.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Annonceur / Département</div>
                  <div className="font-medium text-slate-200">{advertiser.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{advertiser.advertiser_id}</div>
                </div>
              </div>
            )}

            {!advertiser && (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-500 italic">
                  Aucun annonceur spécifique rattaché (marque directe du client)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2 - Interlocuteurs (CRM) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Interlocuteurs (CRM)
            </h2>
            <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-sm">
              {contacts.length}
            </span>
          </div>

          {contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(contact.name)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 mb-1">
                        {contact.name}
                      </div>
                      
                      {contact.job_title && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span className="truncate">{contact.job_title}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <a 
                              href={`mailto:${contact.email}`}
                              className="hover:text-purple-400 transition-colors truncate"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}

                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <a 
                              href={`tel:${contact.phone}`}
                              className="hover:text-purple-400 transition-colors"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun contact lié à cette marque</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
