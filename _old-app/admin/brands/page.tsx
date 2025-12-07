"use client";

import React, { useState, useEffect } from "react";
import { 
  Tag, Search, Plus, Edit2, Trash2, X, Save, 
  ArrowLeft, Link as LinkIcon, Building2, Users, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, setDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { BrandEntity, ClientEntity, AdvertiserEntity } from "../../types/agence";
import { AdminHeader } from "../components/AdminHeader";

export default function BrandsAdminPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserEntity[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandEntity | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<BrandEntity>>({
    brand_id: "",
    name: "",
    client_id: "",
    advertiser_id: ""
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Brands
      const brandSnap = await getDocs(query(collection(db, "brands")));
      setBrands(brandSnap.docs.map(d => ({ id: d.id, ...d.data() } as BrandEntity)));

      // 2. Fetch Clients
      const clientSnap = await getDocs(query(collection(db, "clients")));
      setClients(clientSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClientEntity)));

      // 3. Fetch Advertisers
      const advSnap = await getDocs(query(collection(db, "advertisers")));
      setAdvertisers(advSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdvertiserEntity)));

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!formData.name || !formData.brand_id || !formData.client_id) {
      return alert("Nom, ID et Client Parent requis !");
    }

    setSaving(true);
    try {
      const docId = formData.brand_id;
      const docRef = doc(db, "brands", docId);

      // Préparer les données sans le champ id de formData
      const { id: _, ...dataWithoutId } = formData as any;
      
      const dataToSave: any = {
        ...dataWithoutId,
        id: docId, // Forcer l'ID à la valeur du document
        updatedAt: serverTimestamp()
      };

      // Only add createdAt when creating a new document
      if (!editingBrand) {
        dataToSave.createdAt = serverTimestamp();
      }

      await setDoc(docRef, dataToSave, { merge: true });

      closeModal();
      fetchData();
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(`Erreur lors de la sauvegarde: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    try {
      await deleteDoc(doc(db, "brands", id));
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- MODAL HELPERS ---
  const openModal = (brand?: BrandEntity) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        brand_id: brand.brand_id,
        name: brand.name,
        client_id: brand.client_id,
        advertiser_id: brand.advertiser_id || ""
      });
    } else {
      setEditingBrand(null);
      setFormData({
        brand_id: "",
        name: "",
        client_id: "",
        advertiser_id: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({
      brand_id: "",
      name: "",
      client_id: "",
      advertiser_id: ""
    });
  };

  // --- FILTERING ---
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.brand_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helpers
  const getClientName = (id: string) => {
    const c = clients.find(x => x.id === id || x.client_id === id);
    return c ? c.name : "Inconnu";
  };
  const getAdvName = (id?: string) => {
    if (!id) return null;
    const a = advertisers.find(x => x.id === id || x.advertiser_id === id);
    return a ? a.name : id;
  };

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
                  <Tag className="text-purple-500" size={28} />
                  Marques
                </h1>
                <p className="text-sm text-slate-400 mt-1">Objets des campagnes (rattachés à Client + Annonceur)</p>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center gap-4 mb-6 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une marque..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors text-white"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Nouvelle Marque
          </button>
          <div className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800">
            {filteredBrands.length}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Client</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Annonceur</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Chargement...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucune marque trouvée.</td></tr>
              ) : filteredBrands.map(brand => (
                <tr 
                  key={brand.id} 
                  onClick={() => router.push(`/admin/brands/${brand.id}`)}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-purple-400 font-medium">{brand.brand_id}</td>
                  <td className="px-6 py-4 font-medium text-white">{brand.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/20">
                      <Users size={10} /> {getClientName(brand.client_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {brand.advertiser_id ? (
                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-xs text-blue-400 border border-blue-500/20">
                         <Building2 size={10} /> {getAdvName(brand.advertiser_id)}
                       </span>
                    ) : (
                       <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(brand); }} 
                        className="p-1.5 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(brand.id); }} 
                        className="p-1.5 hover:bg-slate-700 rounded text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0F172A] border-b border-slate-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Tag className="text-purple-500" />
                  {editingBrand ? "Modifier Marque" : "Nouvelle Marque"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Remplissez les informations nécessaires</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID Marque (Code) <span className="text-purple-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.brand_id}
                  onChange={e => setFormData({...formData, brand_id: e.target.value})}
                  placeholder="Ex: BRAND_LANCOME"
                  disabled={!!editingBrand}
                  className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none font-mono ${editingBrand ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {editingBrand ? (
                  <p className="text-[10px] text-amber-500">⚠️ L'ID ne peut pas être modifié après création (utilisé comme identifiant unique).</p>
                ) : (
                  <p className="text-[10px] text-slate-600">Sera utilisé comme identifiant unique du document.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom de la Marque <span className="text-purple-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Lancôme"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Rattachement</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                        <Users size={12}/> Client Payeur (Obligatoire)
                    </label>
                    <select 
                        value={formData.client_id}
                        onChange={e => setFormData({...formData, client_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none appearance-none"
                    >
                        <option value="">-- Sélectionner --</option>
                        {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                        <Building2 size={12}/> Annonceur (Optionnel)
                    </label>
                    <select 
                        value={formData.advertiser_id}
                        onChange={e => setFormData({...formData, advertiser_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                        disabled={!formData.client_id}
                    >
                        <option value="">-- Aucun / Direct --</option>
                        {advertisers
                          .filter(a => a.client_id === formData.client_id)
                          .map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))
                        }
                    </select>
                    {!formData.client_id && (
                      <p className="text-[10px] text-amber-500">⚠️ Sélectionnez d'abord un client</p>
                    )}
                    {formData.client_id && advertisers.filter(a => a.client_id === formData.client_id).length === 0 && (
                      <p className="text-[10px] text-slate-500">Aucun annonceur disponible pour ce client</p>
                    )}
                  </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#0F172A] border-t border-slate-800 p-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.brand_id || !formData.client_id}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingBrand ? "Mettre à jour" : "Créer"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
