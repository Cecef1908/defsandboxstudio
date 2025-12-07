"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
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
  User
} from "lucide-react";
import type { ContactEntity, ClientEntity, AdvertiserEntity, BrandEntity } from "@/app/types/agence";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactEntity | null>(null);
  const [client, setClient] = useState<ClientEntity | null>(null);
  const [advertiser, setAdvertiser] = useState<AdvertiserEntity | null>(null);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactData();
  }, [contactId]);

  async function fetchContactData() {
    try {
      setLoading(true);

      // 1. Récupérer le Contact
      const contactDoc = await getDoc(doc(db, "contacts", contactId));
      if (!contactDoc.exists()) {
        console.error("Contact introuvable");
        return;
      }

      const contactData = { id: contactDoc.id, ...contactDoc.data() } as ContactEntity;
      setContact(contactData);

      // 2. Récupérer le Client (si lié)
      if (contactData.linked_client) {
        const clientDoc = await getDoc(doc(db, "clients", contactData.linked_client));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as ClientEntity);
        }
      }

      // 3. Récupérer l'Annonceur (si lié)
      if (contactData.linked_advertiser) {
        const advertiserDoc = await getDoc(doc(db, "advertisers", contactData.linked_advertiser));
        if (advertiserDoc.exists()) {
          setAdvertiser({ id: advertiserDoc.id, ...advertiserDoc.data() } as AdvertiserEntity);
        }
      }

      // 4. Récupérer la Marque (si liée)
      if (contactData.linked_brand) {
        const brandDoc = await getDoc(doc(db, "brands", contactData.linked_brand));
        if (brandDoc.exists()) {
          setBrand({ id: brandDoc.id, ...brandDoc.data() } as BrandEntity);
        }
      }

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

  if (!contact) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Contact introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/admin/contacts")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux contacts</span>
        </button>

        {/* En-tête avec Fil d'Ariane */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span>Contacts</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">{contact.name}</span>
          </div>

          {/* Carte Profil */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {getInitials(contact.name)}
                </span>
              </div>

              {/* Infos */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">
                  {contact.name}
                </h1>
                
                {contact.job_title && (
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-lg">{contact.job_title}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-slate-300 hover:text-orange-400 transition-colors"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-slate-300 hover:text-orange-400 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section - Rattachements */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Users className="w-5 h-5 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Rattachements
            </h2>
          </div>

          <div className="space-y-3">
            {/* Client */}
            {client ? (
              <div 
                onClick={() => router.push(`/admin/clients/${client.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Client</div>
                  <div className="font-medium text-slate-200">{client.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{client.client_id}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-500 italic flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Aucun client rattaché
                </div>
              </div>
            )}

            {/* Annonceur */}
            {advertiser ? (
              <div 
                onClick={() => router.push(`/admin/advertisers/${advertiser.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Annonceur</div>
                  <div className="font-medium text-slate-200">{advertiser.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{advertiser.advertiser_id}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-500 italic flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Aucun annonceur rattaché
                </div>
              </div>
            )}

            {/* Marque */}
            {brand ? (
              <div 
                onClick={() => router.push(`/admin/brands/${brand.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Marque</div>
                  <div className="font-medium text-slate-200">{brand.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{brand.brand_id}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-500 italic flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Aucune marque rattachée
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
