'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2, Check, Plus, FileImage } from 'lucide-react';
import { db, storage, AGENCY_ASSETS_COLLECTION } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { AgencyAssetEntity } from '../../types/agence';

export default function AdminSettings() {
  const [assets, setAssets] = useState<AgencyAssetEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AgencyAssetEntity['type']>('other');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Assets
  useEffect(() => {
    const q = query(collection(db, AGENCY_ASSETS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgencyAssetEntity));
      setAssets(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload Storage
      const storageRef = ref(storage, `agency_assets/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Save Firestore
      await addDoc(collection(db, AGENCY_ASSETS_COLLECTION), {
        name: name || file.name,
        type: type,
        url,
        createdAt: serverTimestamp()
      });

      // Reset form
      setName('');
      // Clear file input
      e.target.value = '';
    } catch (error) {
      console.error("Erreur d'upload:", error);
      alert("Erreur lors de l'envoi du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (asset: AgencyAssetEntity) => {
    if (!confirm('Voulez-vous vraiment supprimer cet asset ?')) return;
    try {
      await deleteDoc(doc(db, AGENCY_ASSETS_COLLECTION, asset.id));
      // Note: La suppression du fichier Storage n'est pas gérée ici pour simplifier (nécessite de parser l'URL)
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Assets de l'Agence</h1>
          <p className="text-slate-400">Gestion centralisée des logos et images dynamiques.</p>
        </div>
      </div>

      {/* UPLOAD AREA */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-400" />
          Ajouter un nouvel asset
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nom (Optionnel)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Logo Header"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="other">Autre / Image</option>
              <option value="logo_light">Logo (Fond Clair)</option>
              <option value="logo_dark">Logo (Fond Sombre)</option>
              <option value="icon_light">Icône (Fond Clair)</option>
              <option value="icon_dark">Icône (Fond Sombre)</option>
            </select>
          </div>

          <div>
            <label className={`
              flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg cursor-pointer font-medium transition-colors border border-dashed
              ${uploading 
                ? 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
              }
            `}>
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{uploading ? 'Envoi...' : 'Choisir un fichier'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ASSETS LIST */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
          <FileImage size={48} className="mx-auto mb-3 opacity-20" />
          <p>Aucun asset trouvé. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg">
              
              {/* Preview */}
              <div className={`
                h-40 p-4 flex items-center justify-center relative
                ${asset.type.includes('dark') ? 'bg-slate-900' : 'bg-white/5'}
              `}>
                <img 
                  src={asset.url} 
                  alt={asset.name}
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => copyToClipboard(asset.url, asset.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                    title="Copier l'URL"
                  >
                    {copiedId === asset.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(asset)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="font-medium text-white truncate mb-1" title={asset.name}>{asset.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                    {asset.type === 'logo_light' && 'Logo Clair'}
                    {asset.type === 'logo_dark' && 'Logo Sombre'}
                    {asset.type === 'icon_light' && 'Icône Clair'}
                    {asset.type === 'icon_dark' && 'Icône Sombre'}
                    {asset.type === 'other' && 'Autre'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}