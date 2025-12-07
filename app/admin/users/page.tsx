'use client';

// ============================================================================
// USERS MANAGEMENT PAGE - Gestion des utilisateurs
// Simple et évolutive avec modification des rôles
// ============================================================================

import { useState, useEffect } from 'react';
import { Users, Shield, Mail, Calendar, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser } from '@/lib/services/users.service';
import { UserEntity, UserRole, DEFAULT_ROLES } from '@/types';
import { useToast, Modal, ConfirmDialog, SkeletonTable } from '@/components/ui';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(u =>
          u.display_name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.role.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setIsSubmitting(true);
    try {
      await updateUserRole(userId, newRole);
      toast.success('Rôle modifié', 'Le rôle a été mis à jour avec succès');
      await loadUsers();
      setShowEditModal(false);
    } catch (error) {
      toast.error('Erreur', 'Impossible de modifier le rôle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(userId, newStatus as any);
      toast.success('Statut modifié', `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
      await loadUsers();
    } catch (error) {
      toast.error('Erreur', 'Impossible de modifier le statut');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success('Supprimé', 'L\'utilisateur a été supprimé');
      await loadUsers();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Erreur', 'Impossible de supprimer l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      super_admin: 'bg-red-500/10 text-red-400 border-red-500/20',
      admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      media_buyer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      social_manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      web_analyst: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      project_lead: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      analyst: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      client: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return colors[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Gestion des utilisateurs</h1>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des utilisateurs</h1>
          <p className="text-slate-400">{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom, email ou rôle..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">
                  Dernière connexion
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.display_name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                      <Shield size={12} />
                      {DEFAULT_ROLES.find(r => r.id === user.role)?.name || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        user.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {user.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={14} />
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Modifier le rôle"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le rôle"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-400 mb-1">Utilisateur</p>
              <p className="font-medium text-white">{selectedUser.display_name}</p>
              <p className="text-sm text-slate-400">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Nouveau rôle</label>
              <div className="space-y-2">
                {DEFAULT_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleUpdateRole(selectedUser.id, role.id as UserRole)}
                    disabled={isSubmitting}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedUser.role === role.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    } disabled:opacity-50`}
                  >
                    <Shield size={20} className={`text-${role.color}-400`} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{role.name}</p>
                      <p className="text-xs text-slate-400">{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur ?"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.display_name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
