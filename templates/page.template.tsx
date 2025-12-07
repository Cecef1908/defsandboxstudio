// ============================================================================
// [MODULE_NAME] Page - Liste des [entities]
// ============================================================================
// Template: Remplacer [MODULE_NAME], [ENTITY], [entity]
// ============================================================================

'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { use[ENTITY]s, use[ENTITY]Actions } from '@/lib/hooks/use[ENTITY]';
import { [ENTITY]Card } from './components/[ENTITY]Card';
import { [ENTITY]Modal } from './components/[ENTITY]Modal';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

export default function [MODULE_NAME]Page() {
  const { [entities], loading, error, refresh } = use[ENTITY]s();
  const { create, update, remove } = use[ENTITY]Actions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected[ENTITY], setSelected[ENTITY]] = useState(null);

  // Filtrage local
  const filtered[ENTITY]s = [entities].filter([entity] =>
    [entity].name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreate = async (data: any) => {
    try {
      await create(data);
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      console.error('Error creating [entity]:', err);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await update(id, data);
      setSelected[ENTITY](null);
      refresh();
    } catch (err) {
      console.error('Error updating [entity]:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }
    
    try {
      await remove(id);
      refresh();
    } catch (err) {
      console.error('Error deleting [entity]:', err);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Erreur</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">[MODULE_NAME]</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos [entities] ({[entities].length})
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" />
          Filtres
        </button>
      </div>

      {/* Content */}
      {filtered[ENTITY]s.length === 0 ? (
        <EmptyState
          title="Aucun [entity] trouvé"
          description={
            searchTerm
              ? "Aucun résultat ne correspond à votre recherche"
              : "Commencez par créer votre premier [entity]"
          }
          action={
            !searchTerm && {
              label: "Créer un [entity]",
              onClick: () => setIsModalOpen(true),
            }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered[ENTITY]s.map([entity] => (
            <[ENTITY]Card
              key={[entity].id}
              [entity]={[entity]}
              onEdit={() => setSelected[ENTITY]([entity])}
              onDelete={() => handleDelete([entity].id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <[ENTITY]Modal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {selected[ENTITY] && (
        <[ENTITY]Modal
          [entity]={selected[ENTITY]}
          onClose={() => setSelected[ENTITY](null)}
          onSubmit={(data) => handleUpdate(selected[ENTITY].id, data)}
        />
      )}
    </div>
  );
}
