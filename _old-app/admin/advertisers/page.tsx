"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Search, Plus, Edit2, Trash2, X, Save, 
  ArrowLeft, Link as LinkIcon, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, setDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { AdvertiserEntity, ClientEntity } from "../../types/agence";
import { AdminHeader } from "../components/AdminHeader";

export default function AdvertisersAdminPage() {
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState<AdvertiserEntity[]>([]);
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState<AdvertiserEntity | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<AdvertiserEntity>>({
    advertiser_id: "",
    name: "",
    client_id: "",
    contact_email: ""
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Advertisers
      const advSnap = await getDocs(query(collection(db, "advertisers")));
      const advData = advSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdvertiserEntity));
      setAdvertisers(advData);

      // 2. Fetch Clients (for relation)
      const clientSnap = await getDocs(query(collection(db, "clients")));
      const clientData = clientSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClientEntity));
      setClients(clientData);
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
    if (!formData.name || !formData.advertiser_id || !formData.client_id) {
      return alert("Nom, ID et Client Parent requis !");
    }

    setSaving(true);
    try {
      // Use advertiser_id as Document ID (Custom ID)
      const docId = formData.advertiser_id;
      const docRef = doc(db, "advertisers", docId);

      // Préparer les données sans le champ id de formData
      const { id: _, ...dataWithoutId } = formData as any;
      
      const dataToSave: any = {
        ...dataWithoutId,
        id: docId, // Forcer l'ID à la valeur du document
        updatedAt: serverTimestamp()
      };

      // Only add createdAt when creating a new document
      if (!editingAdvertiser) {
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
    if (!confirm("Supprimer cet annonceur ?")) return;
    try {
      await deleteDoc(doc(db, "advertisers", id));
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- MODAL HELPERS ---
  const openModal = (adv?: AdvertiserEntity) => {
    if (adv) {
      setEditingAdvertiser(adv);
      setFormData({
        advertiser_id: adv.advertiser_id,
        name: adv.name,
        client_id: adv.client_id,
        contact_email: adv.contact_email || ""
      });
    } else {
      setEditingAdvertiser(null);
      setFormData({
        advertiser_id: "",
        name: "",
        client_id: "",
        contact_email: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdvertiser(null);
    setFormData({
      advertiser_id: "",
      name: "",
      client_id: "",
      contact_email: ""
    });
  };

  // --- FILTERING ---
  const filteredAdvertisers = advertisers.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.advertiser_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get Client Name
  const getClientName = (id: string) => {
    const c = clients.find(c => c.id === id || c.client_id === id); // Try matching Doc ID or Client Code
    return c ? c.name : "Inconnu";
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
                  <Building2 className="text-blue-500" size={28} />
                  Annonceurs
                </h1>
                <p className="text-sm text-slate-400 mt-1">Départements marketing rattachés à un Client Payeur</p>
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
              placeholder="Rechercher un annonceur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Nouvel Annonceur
          </button>
          <div className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800">
            {filteredAdvertisers.length}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Département</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Client</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Chargement...</td></tr>
              ) : filteredAdvertisers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun annonceur trouvé.</td></tr>
              ) : filteredAdvertisers.map(adv => (
                <tr 
                  key={adv.id} 
                  onClick={() => router.push(`/admin/advertisers/${adv.id}`)}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-blue-400 font-medium">{adv.advertiser_id}</td>
                  <td className="px-6 py-4 font-medium text-white">{adv.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">
                      <LinkIcon size={10} /> {getClientName(adv.client_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{adv.contact_email || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(adv); }} 
                        className="p-1.5 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(adv.id); }} 
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
                  <Building2 className="text-blue-500" />
                  {editingAdvertiser ? "Modifier Annonceur" : "Nouvel Annonceur"}
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID Annonceur (Code) <span className="text-blue-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.advertiser_id}
                  onChange={e => setFormData({...formData, advertiser_id: e.target.value})}
                  placeholder="Ex: ADV_LOREAL_LUXE"
                  disabled={!!editingAdvertiser} // Cannot change ID after creation easily in Custom ID mode
                  className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono ${editingAdvertiser ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {editingAdvertiser ? (
                  <p className="text-[10px] text-amber-500">⚠️ L'ID ne peut pas être modifié après création (utilisé comme identifiant unique).</p>
                ) : (
                  <p className="text-[10px] text-slate-600">Sera utilisé comme identifiant unique du document.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom du Département <span className="text-blue-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Division Luxe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Parent <span className="text-blue-500">*</span></label>
                <div className="relative">
                  <select 
                    value={formData.client_id}
                    onChange={e => setFormData({...formData, client_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    <option value="">-- Sélectionner un Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}> {/* Use Doc ID as reference usually, or client_id? Schema says 'path: clients', implies Doc ID reference. */}
                        {c.name} ({c.client_id})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ArrowLeft className="-rotate-90" size={14} />
                  </div>
                </div>
                {clients.length === 0 && (
                   <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                     <AlertTriangle size={12}/> Aucun client trouvé. Créez d'abord un client.
                   </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Contact</label>
                <input 
                  type="email" 
                  value={formData.contact_email}
                  onChange={e => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="contact@division.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                />
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
                disabled={saving || !formData.name || !formData.advertiser_id || !formData.client_id}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingAdvertiser ? "Mettre à jour" : "Créer"}
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
