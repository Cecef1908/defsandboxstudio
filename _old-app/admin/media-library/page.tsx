"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Layers, MonitorPlay, Component, 
  Settings2, Building2, LayoutTemplate,
  Search, Plus, Loader, Save, AlertCircle, CreditCard, X
} from "lucide-react";
import { db } from "../../lib/firebase"; 
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import type { 
  MediaChannelEntity, 
  MediaPlacementEntity, 
  MediaFormatEntity, 
  PublisherEntity, 
  BuyingModelEntity,
  ChannelCategoryEntity
} from "../../types/agence";

type ViewMode = "CHANNELS" | "FORMATS" | "BUYING_MODELS";
type SelectionType = "channel" | "placement" | "format" | "buying_model";

interface FieldGroupProps {
  label: string;
  children: React.ReactNode;
  isEditing: boolean;
}

function FieldGroup({ label, children, isEditing }: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <label className={`text-xs uppercase font-bold tracking-wider ${isEditing ? "text-amber-500" : "text-slate-500"}`}>
        {label}
      </label>
      <div className={isEditing ? "" : "text-slate-300"}>
        {children}
      </div>
    </div>
  );
}

export default function MediaLibraryPage() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<MediaChannelEntity[]>([]);
  const [placements, setPlacements] = useState<MediaPlacementEntity[]>([]);
  const [formats, setFormats] = useState<MediaFormatEntity[]>([]);
  const [publishers, setPublishers] = useState<PublisherEntity[]>([]);
  const [buyingModels, setBuyingModels] = useState<BuyingModelEntity[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>("CHANNELS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectionType, setSelectionType] = useState<SelectionType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [collapsedRegies, setCollapsedRegies] = useState<Set<string>>(new Set());
  
  // Creation modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"channel" | "format" | "buying_model" | null>(null);
  const [createFormData, setCreateFormData] = useState<any>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chSnap, plSnap, fmtSnap, pubSnap, bmSnap] = await Promise.all([
        getDocs(query(collection(db, "ref_channels"), orderBy("name"))),
        getDocs(query(collection(db, "ref_placements"), orderBy("name"))),
        getDocs(query(collection(db, "ref_formats"), orderBy("name"))),
        getDocs(query(collection(db, "ref_publishers"), orderBy("name"))),
        getDocs(query(collection(db, "ref_buying_models"), orderBy("name")))
      ]);

      setChannels(chSnap.docs.map(d => ({ id: d.id, ...d.data() } as MediaChannelEntity)));
      setPlacements(plSnap.docs.map(d => ({ id: d.id, ...d.data() } as MediaPlacementEntity)));
      setFormats(fmtSnap.docs.map(d => ({ id: d.id, ...d.data() } as MediaFormatEntity)));
      setPublishers(pubSnap.docs.map(d => ({ id: d.id, ...d.data() } as PublisherEntity)));
      setBuyingModels(bmSnap.docs.map(d => ({ id: d.id, ...d.data() } as BuyingModelEntity)));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any, type: SelectionType) => {
    if (isEditing && !confirm("Quitter sans sauvegarder ?")) return;
    setSelectedItem(item);
    setSelectionType(type);
    setIsEditing(false);
    setFormData({});
  };

  const toggleRegie = (regieId: string) => {
    setCollapsedRegies(prev => {
      const next = new Set(prev);
      if (next.has(regieId)) {
        next.delete(regieId);
      } else {
        next.add(regieId);
      }
      return next;
    });
  };

  const openCreateModal = (type: "channel" | "format" | "buying_model") => {
    setCreateType(type);
    setCreateFormData({
      name: "",
      description: "",
      ...(type === "channel" && { 
        publisher_id: "", 
        is_regie: false, 
        parent_id: "",
        allowed_buying_models: [] 
      }),
      ...(type === "format" && { 
        type: "image", 
        specs: { ratio: "", width: 0, height: 0, max_weight_mb: 0 },
        compatible_channels: [],
        compatible_buying_models: []
      }),
      ...(type === "buying_model" && { 
        code: "CPM" 
      })
    });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createType || !createFormData.name) {
      alert("Le nom est obligatoire");
      return;
    }

    setCreating(true);
    try {
      let collectionName = "";
      const timestamp = serverTimestamp();
      
      if (createType === "channel") {
        collectionName = "ref_channels";
        if (!createFormData.publisher_id) {
          alert("L'éditeur est obligatoire pour un canal");
          setCreating(false);
          return;
        }
      }
      if (createType === "format") collectionName = "ref_formats";
      if (createType === "buying_model") collectionName = "ref_buying_models";

      const docRef = await addDoc(collection(db, collectionName), {
        ...createFormData,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Refresh data
      await fetchData();
      
      setShowCreateModal(false);
      setCreateFormData({});
      setCreateType(null);
      
      alert(`${createType === "channel" ? "Canal" : createType === "format" ? "Format" : "Modèle d'achat"} créé avec succès !`);
    } catch (error) {
      console.error("Create error:", error);
      alert("Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = () => {
    setFormData(JSON.parse(JSON.stringify(selectedItem)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!selectedItem || !selectionType) return;
    setSaving(true);
    try {
      let collectionName = "";
      if (selectionType === "channel") collectionName = "ref_channels";
      if (selectionType === "placement") collectionName = "ref_placements";
      if (selectionType === "format") collectionName = "ref_formats";

      if (collectionName) {
        const docRef = doc(db, collectionName, selectedItem.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });

        if (selectionType === "channel") setChannels(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...formData } : i));
        if (selectionType === "placement") setPlacements(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...formData } : i));
        if (selectionType === "format") setFormats(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...formData } : i));
      }

      setSelectedItem({ ...selectedItem, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const regies = channels.filter(c => c.is_regie && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const standaloneChannels = channels.filter(c => !c.is_regie && !c.parent_id && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getChildrenChannels = (parentId: string) => channels.filter(c => c.parent_id === parentId);
  const getChannelPlacements = (channelId: string) => placements.filter(p => p.channel_id === channelId);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col">
      
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-[#0F172A] sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin")} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layers className="text-pink-500" />
                Médiathèque & Offre
              </h1>
              <p className="text-sm text-slate-400">Centre de contrôle Multi-Vues : Canaux, Placements, Formats, Modèles.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-pink-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            
            {/* LEFT PANEL - NAVIGATION */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
              
              {/* HEADER WITH CREATE BUTTON */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</h3>
                <button
                  onClick={() => openCreateModal(
                    viewMode === "CHANNELS" ? "channel" : 
                    viewMode === "FORMATS" ? "format" : "buying_model"
                  )}
                  className="flex items-center gap-1 px-2 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-medium transition-colors"
                >
                  <Plus size={12} /> Créer
                </button>
              </div>

              {/* VIEW SELECTOR */}
              <div className="grid grid-cols-3 text-xs font-bold border-b border-slate-800 bg-slate-900/50">
                <button 
                  onClick={() => { setViewMode("CHANNELS"); setSearchTerm(""); }}
                  className={`py-3 flex flex-col items-center gap-1 hover:bg-slate-800/50 transition-all ${viewMode === "CHANNELS" ? "text-pink-500 border-b-2 border-pink-500 bg-slate-800/30" : "text-slate-500"}`}
                >
                  <MonitorPlay size={16} />
                  <span>Canaux</span>
                  <span className="text-[10px] opacity-60">{channels.length}</span>
                </button>
                <button 
                  onClick={() => { setViewMode("FORMATS"); setSearchTerm(""); }}
                  className={`py-3 flex flex-col items-center gap-1 hover:bg-slate-800/50 transition-all ${viewMode === "FORMATS" ? "text-pink-500 border-b-2 border-pink-500 bg-slate-800/30" : "text-slate-500"}`}
                >
                  <Component size={16} />
                  <span>Formats</span>
                  <span className="text-[10px] opacity-60">{formats.length}</span>
                </button>
                <button 
                  onClick={() => { setViewMode("BUYING_MODELS"); setSearchTerm(""); }}
                  className={`py-3 flex flex-col items-center gap-1 hover:bg-slate-800/50 transition-all ${viewMode === "BUYING_MODELS" ? "text-pink-500 border-b-2 border-pink-500 bg-slate-800/30" : "text-slate-500"}`}
                >
                  <CreditCard size={16} />
                  <span>Achat</span>
                  <span className="text-[10px] opacity-60">{buyingModels.length}</span>
                </button>
              </div>

              {/* SEARCH */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder={`Rechercher ${viewMode === "CHANNELS" ? "un canal" : viewMode === "FORMATS" ? "un format" : "un modèle"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-300 focus:outline-none focus:border-pink-500/50 transition-colors" 
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <AlertCircle size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                
                {/* CHANNELS VIEW */}
                {viewMode === "CHANNELS" && (
                  <>
                    {regies.length === 0 && standaloneChannels.length === 0 ? (
                      <div className="text-center py-12 text-slate-600">
                        <MonitorPlay size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun canal trouvé</p>
                      </div>
                    ) : (
                      <>
                        {regies.map(regie => {
                          const children = getChildrenChannels(regie.id);
                          const isCollapsed = collapsedRegies.has(regie.id);
                          return (
                            <div key={regie.id} className="mb-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleRegie(regie.id)}
                                  className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-slate-300"
                                >
                                  <svg className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                                <div 
                                  onClick={() => handleSelect(regie, "channel")}
                                  className={`flex-1 p-3 rounded-lg text-sm font-medium cursor-pointer flex justify-between items-center transition-all ${selectedItem?.id === regie.id ? "bg-pink-500/10 border border-pink-500/50 text-white" : "bg-slate-800/50 text-pink-400 hover:bg-slate-800"}`}
                                >
                                  <span>{regie.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">{children.length} canaux</span>
                                    <span className="text-[10px] bg-pink-500/10 px-1.5 py-0.5 rounded text-pink-500">RÉGIE</span>
                                  </div>
                                </div>
                              </div>
                              {!isCollapsed && (
                                <div className="pl-3 mt-1 space-y-1 border-l-2 border-slate-800 ml-3 animate-in slide-in-from-top-2 duration-200">
                                  {children.map(child => {
                                    const childPlacements = getChannelPlacements(child.id);
                                    return (
                                      <div key={child.id}>
                                        <div 
                                          onClick={() => handleSelect(child, "channel")}
                                          className={`p-2 rounded text-sm cursor-pointer transition-all flex justify-between items-center group ${selectedItem?.id === child.id ? "bg-slate-700 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
                                        >
                                          <span>{child.name}</span>
                                          {childPlacements.length > 0 && (
                                            <span className="text-[10px] opacity-50 group-hover:opacity-100">{childPlacements.length} pl.</span>
                                          )}
                                        </div>
                                        {childPlacements.length > 0 && (
                                          <div className="pl-3 mt-1 space-y-1">
                                            {childPlacements.map(place => (
                                              <div 
                                                key={place.id}
                                                onClick={(e) => { e.stopPropagation(); handleSelect(place, "placement"); }}
                                                className={`text-xs px-2 py-1 rounded cursor-pointer flex items-center gap-2 transition-all ${selectedItem?.id === place.id ? "text-pink-300 bg-pink-500/10 font-medium" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"}`}
                                              >
                                                <LayoutTemplate size={10} /> {place.name}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {standaloneChannels.map(channel => (
                          <div key={channel.id} onClick={() => handleSelect(channel, "channel")} className={`p-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${selectedItem?.id === channel.id ? "bg-pink-500/10 border border-pink-500/50 text-white" : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"}`}>
                            {channel.name}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* FORMATS VIEW */}
                {viewMode === "FORMATS" && (
                  <div className="space-y-1">
                    {formats.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <div className="text-center py-12 text-slate-600">
                        <Component size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun format trouvé</p>
                      </div>
                    ) : (
                      formats.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(fmt => (
                        <div 
                          key={fmt.id}
                          onClick={() => handleSelect(fmt, "format")}
                          className={`p-3 rounded-lg text-sm cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01] ${selectedItem?.id === fmt.id ? "bg-pink-500/10 border border-pink-500/50 text-white" : "bg-slate-800/30 text-slate-400 hover:bg-slate-800"}`}
                        >
                          <Component size={16} className={selectedItem?.id === fmt.id ? "text-pink-500" : "text-slate-600"} />
                          <div className="flex-1">
                            <div className="font-medium">{fmt.name}</div>
                            <div className="text-xs opacity-50">
                              <span className="capitalize">{fmt.type}</span>
                              {fmt.specs?.ratio && <span> • {fmt.specs.ratio}</span>}
                              {fmt.specs?.width && fmt.specs?.height && <span> • {fmt.specs.width}×{fmt.specs.height}</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* BUYING MODELS VIEW */}
                {viewMode === "BUYING_MODELS" && (
                  <div className="space-y-1">
                    {buyingModels.filter(bm => bm.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <div className="text-center py-12 text-slate-600">
                        <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun modèle trouvé</p>
                      </div>
                    ) : (
                      buyingModels.filter(bm => bm.name.toLowerCase().includes(searchTerm.toLowerCase())).map(bm => {
                        const compatibleChannels = channels.filter(c => c.allowed_buying_models?.includes(bm.id));
                        return (
                          <div 
                            key={bm.id}
                            onClick={() => handleSelect(bm, "buying_model")}
                            className={`p-3 rounded-lg text-sm cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01] ${selectedItem?.id === bm.id ? "bg-pink-500/10 border border-pink-500/50 text-white" : "bg-slate-800/30 text-slate-400 hover:bg-slate-800"}`}
                          >
                            <CreditCard size={16} className={selectedItem?.id === bm.id ? "text-pink-500" : "text-slate-600"} />
                            <div className="flex-1">
                              <div className="font-medium">{bm.name}</div>
                              <div className="text-xs opacity-50 font-mono">{bm.code}</div>
                            </div>
                            {compatibleChannels.length > 0 && (
                              <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">{compatibleChannels.length} canaux</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT PANEL - DETAILS */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl lg:col-span-2 h-full overflow-hidden flex flex-col">
              {selectedItem ? (
                <div className="flex-1 overflow-y-auto p-8">
                  
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-800">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl ${isEditing ? "bg-amber-500/10 text-amber-500" : "bg-pink-500/10 text-pink-500"}`}>
                        {selectionType === "channel" && <MonitorPlay size={32} />}
                        {selectionType === "placement" && <LayoutTemplate size={32} />}
                        {selectionType === "format" && <Component size={32} />}
                        {selectionType === "buying_model" && <CreditCard size={32} />}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.name || ""} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-xl font-bold text-white w-full focus:border-amber-500 outline-none"
                          />
                        ) : (
                          <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                        )}
                        <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-2">
                          ID: {selectedItem.id}
                          {isEditing && <span className="text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Mode Édition</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectionType !== "buying_model" && (
                        isEditing ? (
                          <>
                            <button onClick={handleCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                              Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                              {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                              Sauvegarder
                            </button>
                          </>
                        ) : (
                          <button onClick={startEdit} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700">
                            <Settings2 size={16} /> Modifier
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="space-y-8">
                    
                    {/* CHANNEL */}
                    {selectionType === "channel" && (
                      <div className="space-y-6">
                        <FieldGroup label="Description" isEditing={isEditing}>
                          {isEditing ? (
                            <textarea 
                              value={formData.description || ""} 
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" 
                              rows={3}
                            />
                          ) : (
                            <p className="text-slate-400 text-sm">{selectedItem.description}</p>
                          )}
                        </FieldGroup>

                        <FieldGroup label="Éditeur (Finance)" isEditing={isEditing}>
                          {isEditing ? (
                            <select 
                              value={formData.publisher_id || ""} 
                              onChange={e => setFormData({...formData, publisher_id: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                            >
                              <option value="">Sélectionner...</option>
                              {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          ) : (
                            <div className="text-white font-medium flex items-center gap-2">
                              <Building2 size={14} className="text-slate-500"/> 
                              {publishers.find(p => p.id === selectedItem.publisher_id)?.name || selectedItem.publisher_id}
                            </div>
                          )}
                        </FieldGroup>

                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <LayoutTemplate size={16} /> Placements
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {getChannelPlacements(selectedItem.id).map(place => (
                              <div 
                                key={place.id} 
                                onClick={() => handleSelect(place, "placement")} 
                                className="p-3 bg-slate-800/30 border border-slate-800 hover:border-pink-500/50 rounded-lg cursor-pointer transition-all"
                              >
                                <div className="font-medium text-slate-200">{place.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{place.format_ids?.length || 0} formats</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PLACEMENT */}
                    {selectionType === "placement" && (
                      <div className="space-y-6">
                        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg">
                          <div className="text-xs text-blue-400 font-bold uppercase mb-1">Canal Parent</div>
                          <div className="text-white font-medium">
                            {channels.find(c => c.id === selectedItem.channel_id)?.name}
                          </div>
                        </div>

                        <FieldGroup label="Description" isEditing={isEditing}>
                          {isEditing ? (
                            <textarea 
                              value={formData.description || ""} 
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" 
                              rows={3}
                            />
                          ) : (
                            <p className="text-slate-400">{selectedItem.description}</p>
                          )}
                        </FieldGroup>
                      </div>
                    )}

                    {/* FORMAT */}
                    {selectionType === "format" && (
                      <div className="space-y-6">
                        <FieldGroup label="Type Média" isEditing={isEditing}>
                          {isEditing ? (
                            <select 
                              value={formData.type || "image"} 
                              onChange={e => setFormData({...formData, type: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                            >
                              <option value="image">Image</option>
                              <option value="video">Vidéo</option>
                              <option value="carousel">Carousel</option>
                              <option value="html5">HTML5</option>
                              <option value="text">Texte</option>
                            </select>
                          ) : (
                            <div className="text-white capitalize bg-slate-800 px-3 py-1 rounded inline-block">{selectedItem.type}</div>
                          )}
                        </FieldGroup>

                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-800">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Spécifications {(isEditing ? formData.type : selectedItem.type) === "video" && "Vidéo"}
                            {(isEditing ? formData.type : selectedItem.type) === "image" && "Image"}
                            {(isEditing ? formData.type : selectedItem.type) === "html5" && "HTML5"}
                            {(isEditing ? formData.type : selectedItem.type) === "carousel" && "Carousel"}
                            {(isEditing ? formData.type : selectedItem.type) === "text" && "Texte"}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Ratio - Pour image, video, carousel */}
                            {["image", "video", "carousel"].includes(isEditing ? formData.type : selectedItem.type) && (
                              <FieldGroup label="Ratio" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={formData.specs?.ratio || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, ratio: e.target.value}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                                    placeholder="Ex: 1:1, 16:9, 9:16"
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.ratio || "-"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Largeur - Pour image, video, html5, carousel */}
                            {["image", "video", "html5", "carousel"].includes(isEditing ? formData.type : selectedItem.type) && (
                              <FieldGroup label="Largeur (px)" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={formData.specs?.width || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, width: parseInt(e.target.value)}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" 
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.width ? selectedItem.specs.width + "px" : "Flex"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Hauteur - Pour image, video, html5, carousel */}
                            {["image", "video", "html5", "carousel"].includes(isEditing ? formData.type : selectedItem.type) && (
                              <FieldGroup label="Hauteur (px)" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={formData.specs?.height || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, height: parseInt(e.target.value)}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" 
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.height ? selectedItem.specs.height + "px" : "Flex"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Durée Max - UNIQUEMENT pour video */}
                            {(isEditing ? formData.type : selectedItem.type) === "video" && (
                              <FieldGroup label="Durée Max (sec)" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={formData.specs?.max_duration_sec || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, max_duration_sec: parseInt(e.target.value)}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                                    placeholder="Ex: 30, 60, 120"
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.max_duration_sec ? selectedItem.specs.max_duration_sec + "s" : "-"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Poids Max - Pour tous sauf text */}
                            {["image", "video", "html5", "carousel"].includes(isEditing ? formData.type : selectedItem.type) && (
                              <FieldGroup label="Poids Max (MB)" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    step="0.1"
                                    value={formData.specs?.max_weight_mb || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, max_weight_mb: parseFloat(e.target.value)}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" 
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.max_weight_mb ? selectedItem.specs.max_weight_mb + "MB" : "-"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Nombre de slides - UNIQUEMENT pour carousel */}
                            {(isEditing ? formData.type : selectedItem.type) === "carousel" && (
                              <FieldGroup label="Slides Max" isEditing={isEditing}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={formData.specs?.max_slides || ""} 
                                    onChange={e => setFormData({...formData, specs: {...formData.specs, max_slides: parseInt(e.target.value)}})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                                    placeholder="Ex: 10"
                                  />
                                ) : (
                                  <div className="text-white">{selectedItem.specs?.max_slides || "-"}</div>
                                )}
                              </FieldGroup>
                            )}

                            {/* Caractères Max - UNIQUEMENT pour text */}
                            {(isEditing ? formData.type : selectedItem.type) === "text" && (
                              <>
                                <FieldGroup label="Titre Max (car.)" isEditing={isEditing}>
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      value={formData.specs?.max_title_chars || ""} 
                                      onChange={e => setFormData({...formData, specs: {...formData.specs, max_title_chars: parseInt(e.target.value)}})} 
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                                      placeholder="Ex: 30"
                                    />
                                  ) : (
                                    <div className="text-white">{selectedItem.specs?.max_title_chars || "-"}</div>
                                  )}
                                </FieldGroup>
                                <FieldGroup label="Description Max (car.)" isEditing={isEditing}>
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      value={formData.specs?.max_desc_chars || ""} 
                                      onChange={e => setFormData({...formData, specs: {...formData.specs, max_desc_chars: parseInt(e.target.value)}})} 
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                                      placeholder="Ex: 90"
                                    />
                                  ) : (
                                    <div className="text-white">{selectedItem.specs?.max_desc_chars || "-"}</div>
                                  )}
                                </FieldGroup>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BUYING MODEL */}
                    {selectionType === "buying_model" && (
                      <div className="space-y-6">
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                          <div className="text-2xl font-bold text-white mb-2">{selectedItem.name}</div>
                          <div className="text-emerald-400 font-mono text-sm">{selectedItem.description}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Canaux Autorisés</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {channels.filter(c => c.allowed_buying_models?.includes(selectedItem.id)).map(ch => (
                              <div 
                                key={ch.id} 
                                onClick={() => handleSelect(ch, "channel")} 
                                className="p-3 bg-slate-800/50 border border-slate-800 rounded-lg flex items-center gap-3 cursor-pointer hover:border-pink-500/50 transition-all"
                              >
                                <MonitorPlay size={16} className="text-slate-500" />
                                <div className="text-slate-300">{ch.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="p-6 bg-slate-800/30 rounded-full mb-6">
                      {viewMode === "CHANNELS" && <MonitorPlay size={48} className="text-slate-600" />}
                      {viewMode === "FORMATS" && <Component size={48} className="text-slate-600" />}
                      {viewMode === "BUYING_MODELS" && <CreditCard size={48} className="text-slate-600" />}
                    </div>
                    <h3 className="text-lg font-medium text-slate-500">Sélectionnez un élément</h3>
                    <p className="text-slate-600 max-w-sm mt-2">
                      Naviguez via le menu de gauche pour explorer votre médiathèque.
                    </p>
                  </div>
                )}
            </div>

          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0F172A] border-b border-slate-800 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {createType === "channel" && <><MonitorPlay className="text-pink-500" /> Nouveau Canal</>}
                  {createType === "format" && <><Component className="text-pink-500" /> Nouveau Format</>}
                  {createType === "buying_model" && <><CreditCard className="text-pink-500" /> Nouveau Modèle d'Achat</>}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Remplissez les informations nécessaires</p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setCreateFormData({}); }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Common Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Nom <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createFormData.name || ""}
                    onChange={e => setCreateFormData({...createFormData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                    placeholder={createType === "channel" ? "Ex: Facebook Ads" : createType === "format" ? "Ex: Post Carré" : "Ex: Coût par Mille"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={createFormData.description || ""}
                    onChange={e => setCreateFormData({...createFormData, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                    rows={3}
                    placeholder="Description détaillée..."
                  />
                </div>
              </div>

              {/* Channel Specific Fields */}
              {createType === "channel" && (
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Éditeur (Finance) <span className="text-pink-500">*</span>
                    </label>
                    <select
                      value={createFormData.publisher_id || ""}
                      onChange={e => setCreateFormData({...createFormData, publisher_id: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Sélectionner un éditeur...</option>
                      {publishers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      id="is_regie"
                      checked={createFormData.is_regie || false}
                      onChange={e => setCreateFormData({...createFormData, is_regie: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_regie" className="text-sm text-slate-300 cursor-pointer">
                      Ce canal est une <span className="font-bold text-pink-400">RÉGIE</span> (regroupement de canaux)
                    </label>
                  </div>

                  {!createFormData.is_regie && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Régie Parente (optionnel)
                      </label>
                      <select
                        value={createFormData.parent_id || ""}
                        onChange={e => setCreateFormData({...createFormData, parent_id: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="">Aucune régie parente</option>
                        {channels.filter(c => c.is_regie).map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Modèles d'Achat Autorisés
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {buyingModels.map(bm => (
                        <label key={bm.id} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-pink-500/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={createFormData.allowed_buying_models?.includes(bm.id) || false}
                            onChange={e => {
                              const current = createFormData.allowed_buying_models || [];
                              setCreateFormData({
                                ...createFormData,
                                allowed_buying_models: e.target.checked
                                  ? [...current, bm.id]
                                  : current.filter((id: string) => id !== bm.id)
                              });
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-white font-medium">{bm.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{bm.code}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Format Specific Fields */}
              {createType === "format" && (
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Type de Média
                    </label>
                    <select
                      value={createFormData.type || "image"}
                      onChange={e => setCreateFormData({...createFormData, type: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="image">Image</option>
                      <option value="video">Vidéo</option>
                      <option value="carousel">Carousel</option>
                      <option value="html5">HTML5</option>
                      <option value="text">Texte</option>
                    </select>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Spécifications Techniques 
                      {createFormData.type === "video" && <span className="text-pink-400 ml-2">📹 Vidéo</span>}
                      {createFormData.type === "image" && <span className="text-blue-400 ml-2">🖼️ Image</span>}
                      {createFormData.type === "carousel" && <span className="text-purple-400 ml-2">🎠 Carousel</span>}
                      {createFormData.type === "html5" && <span className="text-orange-400 ml-2">🌐 HTML5</span>}
                      {createFormData.type === "text" && <span className="text-emerald-400 ml-2">📝 Texte</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Ratio - Pour image, video, carousel */}
                      {["image", "video", "carousel"].includes(createFormData.type) && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Ratio (ex: 1:1, 16:9)</label>
                          <input
                            type="text"
                            value={createFormData.specs?.ratio || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, ratio: e.target.value}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="1:1"
                          />
                        </div>
                      )}

                      {/* Largeur - Pour image, video, html5, carousel */}
                      {["image", "video", "html5", "carousel"].includes(createFormData.type) && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Largeur (px)</label>
                          <input
                            type="number"
                            value={createFormData.specs?.width || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, width: parseInt(e.target.value) || 0}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="1080"
                          />
                        </div>
                      )}

                      {/* Hauteur - Pour image, video, html5, carousel */}
                      {["image", "video", "html5", "carousel"].includes(createFormData.type) && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Hauteur (px)</label>
                          <input
                            type="number"
                            value={createFormData.specs?.height || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, height: parseInt(e.target.value) || 0}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="1080"
                          />
                        </div>
                      )}

                      {/* Durée Max - UNIQUEMENT pour video */}
                      {createFormData.type === "video" && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Durée Max (secondes)</label>
                          <input
                            type="number"
                            value={createFormData.specs?.max_duration_sec || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, max_duration_sec: parseInt(e.target.value) || 0}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="60"
                          />
                        </div>
                      )}

                      {/* Poids Max - Pour tous sauf text */}
                      {["image", "video", "html5", "carousel"].includes(createFormData.type) && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Poids Max (MB)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={createFormData.specs?.max_weight_mb || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, max_weight_mb: parseFloat(e.target.value) || 0}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="5"
                          />
                        </div>
                      )}

                      {/* Slides Max - UNIQUEMENT pour carousel */}
                      {createFormData.type === "carousel" && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Nombre de Slides Max</label>
                          <input
                            type="number"
                            value={createFormData.specs?.max_slides || ""}
                            onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, max_slides: parseInt(e.target.value) || 0}})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder="10"
                          />
                        </div>
                      )}

                      {/* Caractères - UNIQUEMENT pour text */}
                      {createFormData.type === "text" && (
                        <>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Titre Max (caractères)</label>
                            <input
                              type="number"
                              value={createFormData.specs?.max_title_chars || ""}
                              onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, max_title_chars: parseInt(e.target.value) || 0}})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Description Max (caractères)</label>
                            <input
                              type="number"
                              value={createFormData.specs?.max_desc_chars || ""}
                              onChange={e => setCreateFormData({...createFormData, specs: {...createFormData.specs, max_desc_chars: parseInt(e.target.value) || 0}})}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                              placeholder="90"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Canaux Compatibles
                    </label>
                    
                    {/* Recommandations selon le type */}
                    <div className="mb-3 p-3 rounded-lg border text-xs">
                      {createFormData.type === "video" && (
                        <div className="text-pink-400 border-pink-500/30 bg-pink-500/10">
                          📹 <strong>Vidéo:</strong> YouTube, TikTok, Instagram (Reels/Stories), Facebook (Feed/Stories)
                        </div>
                      )}
                      {createFormData.type === "image" && (
                        <div className="text-blue-400 border-blue-500/30 bg-blue-500/10">
                          🖼️ <strong>Image:</strong> Facebook, Instagram, LinkedIn, Display (DV360, Presse)
                        </div>
                      )}
                      {createFormData.type === "carousel" && (
                        <div className="text-purple-400 border-purple-500/30 bg-purple-500/10">
                          🎠 <strong>Carousel:</strong> Facebook, Instagram, LinkedIn
                        </div>
                      )}
                      {createFormData.type === "html5" && (
                        <div className="text-orange-400 border-orange-500/30 bg-orange-500/10">
                          🌐 <strong>HTML5:</strong> Display (DV360), Presse Locale, Programmatique
                        </div>
                      )}
                      {createFormData.type === "text" && (
                        <div className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                          📝 <strong>Texte:</strong> Google Search uniquement
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 bg-slate-900/30 rounded-lg border border-slate-800">
                      {/* Social Channels */}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900/90 py-1">📱 Social</div>
                        <div className="grid grid-cols-2 gap-2">
                          {channels.filter(c => !c.is_regie && ["ch_facebook", "ch_instagram", "ch_linkedin", "ch_tiktok"].includes(c.id)).map(ch => {
                            // Recommandation selon le type
                            const isRecommended = 
                              (createFormData.type === "video" && ["ch_instagram", "ch_tiktok", "ch_facebook"].includes(ch.id)) ||
                              (createFormData.type === "image" && ["ch_facebook", "ch_instagram", "ch_linkedin"].includes(ch.id)) ||
                              (createFormData.type === "carousel" && ["ch_facebook", "ch_instagram", "ch_linkedin"].includes(ch.id));
                            
                            return (
                              <label key={ch.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors text-sm ${
                                isRecommended 
                                  ? "bg-pink-500/10 border-pink-500/30 hover:border-pink-500" 
                                  : "bg-slate-900 border-slate-800 hover:border-pink-500/50"
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={createFormData.compatible_channels?.includes(ch.id) || false}
                                  onChange={e => {
                                    const current = createFormData.compatible_channels || [];
                                    setCreateFormData({
                                      ...createFormData,
                                      compatible_channels: e.target.checked
                                        ? [...current, ch.id]
                                        : current.filter((id: string) => id !== ch.id)
                                    });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-slate-300">{ch.name}</span>
                                {isRecommended && <span className="text-[10px] text-pink-400 ml-auto">★</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Video Channels */}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900/90 py-1">📺 Vidéo</div>
                        <div className="grid grid-cols-2 gap-2">
                          {channels.filter(c => !c.is_regie && ["ch_youtube"].includes(c.id)).map(ch => {
                            const isRecommended = createFormData.type === "video";
                            return (
                              <label key={ch.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors text-sm ${
                                isRecommended 
                                  ? "bg-pink-500/10 border-pink-500/30 hover:border-pink-500" 
                                  : "bg-slate-900 border-slate-800 hover:border-pink-500/50"
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={createFormData.compatible_channels?.includes(ch.id) || false}
                                  onChange={e => {
                                    const current = createFormData.compatible_channels || [];
                                    setCreateFormData({
                                      ...createFormData,
                                      compatible_channels: e.target.checked
                                        ? [...current, ch.id]
                                        : current.filter((id: string) => id !== ch.id)
                                    });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-slate-300">{ch.name}</span>
                                {isRecommended && <span className="text-[10px] text-pink-400 ml-auto">★</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Search Channels */}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900/90 py-1">🔍 Search</div>
                        <div className="grid grid-cols-2 gap-2">
                          {channels.filter(c => !c.is_regie && ["ch_google_search"].includes(c.id)).map(ch => {
                            const isRecommended = createFormData.type === "text";
                            const isDisabled = createFormData.type !== "text";
                            return (
                              <label key={ch.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors text-sm ${
                                isDisabled 
                                  ? "bg-slate-900/50 border-slate-800/50 opacity-50 cursor-not-allowed" 
                                  : isRecommended 
                                    ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500" 
                                    : "bg-slate-900 border-slate-800 hover:border-pink-500/50"
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={createFormData.compatible_channels?.includes(ch.id) || false}
                                  disabled={isDisabled}
                                  onChange={e => {
                                    const current = createFormData.compatible_channels || [];
                                    setCreateFormData({
                                      ...createFormData,
                                      compatible_channels: e.target.checked
                                        ? [...current, ch.id]
                                        : current.filter((id: string) => id !== ch.id)
                                    });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-slate-300">{ch.name}</span>
                                {isRecommended && <span className="text-[10px] text-emerald-400 ml-auto">★</span>}
                                {isDisabled && <span className="text-[10px] text-slate-500 ml-auto">Texte only</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display Channels */}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900/90 py-1">🖥️ Display</div>
                        <div className="grid grid-cols-2 gap-2">
                          {channels.filter(c => !c.is_regie && ["ch_dv360", "ch_local_press"].includes(c.id)).map(ch => {
                            const isRecommended = ["image", "html5", "video"].includes(createFormData.type);
                            return (
                              <label key={ch.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors text-sm ${
                                isRecommended 
                                  ? "bg-orange-500/10 border-orange-500/30 hover:border-orange-500" 
                                  : "bg-slate-900 border-slate-800 hover:border-pink-500/50"
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={createFormData.compatible_channels?.includes(ch.id) || false}
                                  onChange={e => {
                                    const current = createFormData.compatible_channels || [];
                                    setCreateFormData({
                                      ...createFormData,
                                      compatible_channels: e.target.checked
                                        ? [...current, ch.id]
                                        : current.filter((id: string) => id !== ch.id)
                                    });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-slate-300">{ch.name}</span>
                                {isRecommended && <span className="text-[10px] text-orange-400 ml-auto">★</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">★ = Recommandé pour ce type de format</p>
                  </div>
                </div>
              )}

              {/* Buying Model Specific Fields */}
              {createType === "buying_model" && (
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Code du Modèle <span className="text-pink-500">*</span>
                    </label>
                    <select
                      value={createFormData.code || "CPM"}
                      onChange={e => setCreateFormData({...createFormData, code: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500 font-mono"
                    >
                      <option value="CPM">CPM - Coût par Mille</option>
                      <option value="CPC">CPC - Coût par Clic</option>
                      <option value="CPV">CPV - Coût par Vue</option>
                      <option value="CPA">CPA - Coût par Action</option>
                      <option value="FLAT">FLAT - Forfait</option>
                      <option value="OTC">OTC - One Time Cost</option>
                      <option value="FIXED_CPM">FIXED_CPM - CPM Fixe</option>
                    </select>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#0F172A] border-t border-slate-800 p-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setCreateFormData({}); }}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createFormData.name}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Créer {createType === "channel" ? "le Canal" : createType === "format" ? "le Format" : "le Modèle"}
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
