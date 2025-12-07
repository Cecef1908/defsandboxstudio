"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { 
  ArrowLeft, 
  Building2, 
  Tag, 
  Users, 
  MapPin, 
  FileText, 
  Mail, 
  Phone,
  Briefcase,
  ChevronRight
} from "lucide-react";
import type { AdvertiserEntity, ClientEntity, BrandEntity, ContactEntity } from "@/app/types/agence";

export default function AdvertiserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const advertiserId = params.id as string;

  const [advertiser, setAdvertiser] = useState<AdvertiserEntity | null>(null);
  const [client, setClient] = useState<ClientEntity | null>(null);
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [contacts, setContacts] = useState<ContactEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertiserData();
  }, [advertiserId]);

  async function fetchAdvertiserData() {
    try {
      setLoading(true);

      // 1. Récupérer l'Annonceur
      const advDoc = await getDoc(doc(db, "advertisers", advertiserId));
      if (!advDoc.exists()) {
        console.error("Annonceur introuvable");
        return;
      }

      const advData = { id: advDoc.id, ...advDoc.data() } as AdvertiserEntity;
      setAdvertiser(advData);

      // 2. Récupérer le Client Parent
      if (advData.client_id) {
        const clientDoc = await getDoc(doc(db, "clients", advData.client_id));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as ClientEntity);
        }
      }

      // 3. Récupérer les Marques associées
      const brandsQuery = query(
        collection(db, "brands"),
        where("advertiser_id", "==", advertiserId)
      );
      const brandsSnapshot = await getDocs(brandsQuery);
      const brandsData = brandsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BrandEntity[];
      setBrands(brandsData);

      // 4. Récupérer les Contacts associés
      const contactsQuery = query(
        collection(db, "contacts"),
        where("linked_advertiser", "==", advertiserId)
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

  // Générer les initiales pour les avatars
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

  if (!advertiser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Annonceur introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/admin/advertisers")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux annonceurs</span>
        </button>

        {/* En-tête avec Fil d'Ariane */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span>Annonceurs</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">{advertiser.name}</span>
          </div>

          {/* Titre et Badge */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                {advertiser.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {advertiser.advertiser_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 - Entité Légale (Client Parent) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Entité Légale (Facturation)
            </h2>
          </div>

          {client ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Nom du Client</div>
                <div className="text-lg font-medium text-slate-200">{client.name}</div>
              </div>

              {client.billing_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Adresse de Facturation</div>
                    <div className="text-slate-300">{client.billing_address}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {client.vat_number && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500 mb-1">ICE / TVA</div>
                      <div className="text-slate-300 font-mono text-sm">{client.vat_number}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Type</div>
                    <div className="text-slate-300 capitalize">{client.type}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 italic">Aucun client associé</div>
          )}
        </div>

        {/* Section 2 - Portefeuille de Marques */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Tag className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Portefeuille de Marques
            </h2>
            <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-sm">
              {brands.length}
            </span>
          </div>

          {brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/brands/${brand.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 truncate">
                        {brand.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {brand.brand_id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune marque liée à cet annonceur</p>
            </div>
          )}
        </div>

        {/* Section 3 - Interlocuteurs (CRM) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
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
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar avec Initiales */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(contact.name)}
                      </span>
                    </div>

                    {/* Infos Contact */}
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
                              className="hover:text-blue-400 transition-colors truncate"
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
                              className="hover:text-blue-400 transition-colors"
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
              <p className="text-sm">Aucun contact lié à cet annonceur</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
