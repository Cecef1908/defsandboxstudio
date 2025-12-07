"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Search, Plus, Edit2, Trash2, X, Save, 
  Building2, Briefcase, LayoutGrid, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { ClientEntity } from "../../types/agence";
import { AdminHeader } from "../components/AdminHeader";

// --- CONSTANTS ---
const CLIENT_TYPES = [
  { id: "direct", label: "Annonceur Direct", icon: <Building2 size={14}/> },
  { id: "agency", label: "Agence Média", icon: <Briefcase size={14}/> },
  { id: "holding", label: "Holding / Groupe", icon: <LayoutGrid size={14}/> }
];

export default function ClientsAdminPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ClientEntity>>({
    client_id: "",
    name: "",
    type: "direct",
    contact_email: "",
    vat_number: ""
  });

  // --- FETCH DATA ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      // Use query with orderBy if possible, otherwise just collection
      const q = query(collection(db, "clients")); // Add orderBy("createdAt", "desc") if index exists
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientEntity));
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!formData.name || !formData.client_id) {
      return alert("Nom et ID Client requis !");
    }

    setSaving(true);
    try {
      if (editingClient) {
        // UPDATE
        const docRef = doc(db, "clients", editingClient.id);
        await updateDoc(docRef, { ...formData, updatedAt: serverTimestamp() });
      } else {
        // CREATE
        await addDoc(collection(db, "clients"), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      closeModal();
      fetchClients();
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ?")) return;
    try {
      await deleteDoc(doc(db, "clients", id));
      fetchClients();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- MODAL HELPERS ---
  const openModal = (client?: ClientEntity) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        client_id: client.client_id,
        name: client.name,
        type: client.type,
        contact_email: client.contact_email || "",
        vat_number: client.vat_number || ""
      });
    } else {
      setEditingClient(null);
      setFormData({
        client_id: "",
        name: "",
        type: "direct",
        contact_email: "",
        vat_number: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      client_id: "",
      name: "",
      type: "direct",
      contact_email: "",
      vat_number: ""
    });
  };

  // --- FILTERING ---
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Users className="text-emerald-500" size={28} />
                  Clients
                </h1>
                <p className="text-sm text-slate-400 mt-1">Entités payeuses (Annonceurs, Agences, Holdings)</p>
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
              placeholder="Rechercher un client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Nouveau Client
          </button>
          <div className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800">
            {filteredClients.length}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Chargement...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun client trouvé.</td></tr>
              ) : filteredClients.map(client => (
                <tr 
                  key={client.id} 
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-3.5 font-mono text-emerald-400 font-medium">{client.client_id}</td>
                  <td className="px-6 py-3.5 font-medium text-white">{client.name}</td>
                  <td className="px-6 py-3.5">
                    {CLIENT_TYPES.find(t => t.id === client.type)?.label || client.type}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{client.contact_email || "-"}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(client); }} 
                        className="p-1.5 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} 
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
                  <Users className="text-emerald-500" />
                  {editingClient ? "Modifier Client" : "Nouveau Client"}
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID Client (Code) <span className="text-emerald-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.client_id}
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                  placeholder="Ex: CL_LOREAL"
                  disabled={!!editingClient}
                  className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none font-mono ${editingClient ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {editingClient ? (
                  <p className="text-[10px] text-amber-500">⚠️ L'ID ne peut pas être modifié (utilisé comme clé étrangère dans les relations).</p>
                ) : (
                  <p className="text-[10px] text-slate-600">Utilisé comme clé de liaison (clé étrangère).</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom du Client <span className="text-emerald-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: L'Oréal Paris"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type de Client</label>
                <div className="grid grid-cols-1 gap-2">
                  {CLIENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({...formData, type: type.id as any})}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-sm
                        ${formData.type === type.id 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600"}
                      `}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Contact</label>
                <input 
                  type="email" 
                  value={formData.contact_email}
                  onChange={e => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="compta@client.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Numéro TVA / ICE</label>
                <input 
                  type="text" 
                  value={formData.vat_number}
                  onChange={e => setFormData({...formData, vat_number: e.target.value})}
                  placeholder="FR123456789"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
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
                disabled={saving || !formData.name || !formData.client_id}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingClient ? "Mettre à jour" : "Créer"}
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
