"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Search, Plus, Edit2, Trash2, X, Save, 
  ArrowLeft, Building2, Users, Tag, Phone, Mail, Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  serverTimestamp
} from "firebase/firestore";
import { ContactEntity, ClientEntity, AdvertiserEntity, BrandEntity } from "../../types/agence";

export default function ContactsAdminPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactEntity[]>([]);
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserEntity[]>([]);
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactEntity | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ContactEntity>>({
    name: "",
    email: "",
    phone: "",
    job_title: "",
    linked_client: "",
    linked_advertiser: "",
    linked_brand: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactSnap, clientSnap, advSnap, brandSnap] = await Promise.all([
        getDocs(collection(db, "contacts")),
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "advertisers")),
        getDocs(collection(db, "brands"))
      ]);

      setContacts(contactSnap.docs.map(d => ({ id: d.id, ...d.data() } as ContactEntity)));
      setClients(clientSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClientEntity)));
      setAdvertisers(advSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdvertiserEntity)));
      setBrands(brandSnap.docs.map(d => ({ id: d.id, ...d.data() } as BrandEntity)));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return alert("Nom et Email requis !");
    }

    setSaving(true);
    try {
      if (editingContact) {
        await updateDoc(doc(db, "contacts", editingContact.id), { 
          ...formData, 
          updatedAt: serverTimestamp() 
        });
      } else {
        await addDoc(collection(db, "contacts"), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const openModal = (contact?: ContactEntity) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || "",
        job_title: contact.job_title || "",
        linked_client: contact.linked_client || "",
        linked_advertiser: contact.linked_advertiser || "",
        linked_brand: contact.linked_brand || ""
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        job_title: "",
        linked_client: "",
        linked_advertiser: "",
        linked_brand: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      linked_client: "",
      linked_advertiser: "",
      linked_brand: ""
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRefName = (collection: (ClientEntity | AdvertiserEntity | BrandEntity)[], id?: string) => {
    if (!id) return null;
    const item = collection.find(x => x.id === id || (x as any).client_id === id || (x as any).advertiser_id === id || (x as any).brand_id === id);
    return item ? item.name : id;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        
        <div className="mb-6 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/admin")} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <User className="text-orange-500" size={28} />
                  Contacts CRM
                </h1>
                <p className="text-sm text-slate-400 mt-1">Carnet d'adresses centralisé des interlocuteurs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors text-white"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Nouveau Contact
          </button>
          <div className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800">
            {filteredContacts.length}
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Identité</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Coordonnées</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Rattachement</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 animate-pulse">Chargement...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Aucun contact trouvé.</td></tr>
              ) : filteredContacts.map(contact => (
                <tr 
                  key={contact.id} 
                  onClick={() => router.push(`/admin/contacts/${contact.id}`)}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{contact.name}</div>
                    {contact.job_title && <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Briefcase size={10}/> {contact.job_title}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300 flex items-center gap-1 mb-1">
                       <Mail size={12} className="text-orange-400"/> {contact.email}
                    </div>
                    {contact.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone size={12}/> {contact.phone}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                       {contact.linked_client && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/20" title="Client">
                            <Users size={10} /> {getRefName(clients, contact.linked_client)}
                          </span>
                       )}
                       {contact.linked_advertiser && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-xs text-blue-400 border border-blue-500/20" title="Annonceur">
                            <Building2 size={10} /> {getRefName(advertisers, contact.linked_advertiser)}
                          </span>
                       )}
                       {contact.linked_brand && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 text-xs text-purple-400 border border-purple-500/20" title="Marque">
                            <Tag size={10} /> {getRefName(brands, contact.linked_brand)}
                          </span>
                       )}
                       {!contact.linked_client && !contact.linked_advertiser && !contact.linked_brand && (
                           <span className="text-slate-600 text-xs italic">Non rattaché</span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(contact); }} 
                        className="p-1.5 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }} 
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="sticky top-0 bg-[#0F172A] border-b border-slate-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <User className="text-orange-500" />
                  {editingContact ? "Modifier Contact" : "Nouveau Contact"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Remplissez les informations nécessaires</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom Complet <span className="text-orange-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email <span className="text-orange-500">*</span></label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="jean.dupont@exemple.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</label>
                        <input 
                          type="text" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="06..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Poste</label>
                        <input 
                          type="text" 
                          value={formData.job_title}
                          onChange={e => setFormData({...formData, job_title: e.target.value})}
                          placeholder="Directeur..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none text-sm"
                        />
                      </div>
                  </div>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Rattachement (Optionnel)</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Client</label>
                    <select 
                        value={formData.linked_client}
                        onChange={e => {
                          const newClientId = e.target.value;
                          // Reset advertiser and brand if they don't belong to the new client
                          const newFormData: any = { ...formData, linked_client: newClientId };
                          
                          if (formData.linked_advertiser) {
                            const adv = advertisers.find(a => a.id === formData.linked_advertiser);
                            if (adv && adv.client_id !== newClientId) {
                              newFormData.linked_advertiser = "";
                            }
                          }
                          
                          if (formData.linked_brand) {
                            const brand = brands.find(b => b.id === formData.linked_brand);
                            if (brand && brand.client_id !== newClientId) {
                              newFormData.linked_brand = "";
                            }
                          }
                          
                          setFormData(newFormData);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none"
                    >
                        <option value="">-- Aucun --</option>
                        {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                        <Building2 size={12}/> Annonceur
                    </label>
                    <select 
                        value={formData.linked_advertiser}
                        onChange={e => setFormData({...formData, linked_advertiser: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none"
                        disabled={!formData.linked_client}
                    >
                        <option value="">-- Aucun --</option>
                        {advertisers
                          .filter(a => !formData.linked_client || a.client_id === formData.linked_client)
                          .map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))
                        }
                    </select>
                    {!formData.linked_client && (
                      <p className="text-[10px] text-amber-500">⚠️ Sélectionnez d'abord un client</p>
                    )}
                    {formData.linked_client && advertisers.filter(a => a.client_id === formData.linked_client).length === 0 && (
                      <p className="text-[10px] text-slate-500">Aucun annonceur pour ce client</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-500 uppercase flex items-center gap-1">
                        <Tag size={12}/> Marque
                    </label>
                    <select 
                        value={formData.linked_brand}
                        onChange={e => setFormData({...formData, linked_brand: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-purple-500 focus:outline-none appearance-none"
                        disabled={!formData.linked_client}
                    >
                        <option value="">-- Aucune --</option>
                        {brands
                          .filter(b => !formData.linked_client || b.client_id === formData.linked_client)
                          .map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))
                        }
                    </select>
                    {!formData.linked_client && (
                      <p className="text-[10px] text-amber-500">⚠️ Sélectionnez d'abord un client</p>
                    )}
                    {formData.linked_client && brands.filter(b => b.client_id === formData.linked_client).length === 0 && (
                      <p className="text-[10px] text-slate-500">Aucune marque pour ce client</p>
                    )}
                  </div>
              </div>

            </div>

            <div className="sticky bottom-0 bg-[#0F172A] border-t border-slate-800 p-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.email}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingContact ? "Mettre à jour" : "Créer"}
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
