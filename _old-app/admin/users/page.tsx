'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, MoreVertical, Mail, Shield, 
  Building2, Calendar, Check, X, Edit2, Trash2, UserPlus,
  ChevronDown, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { USERS_COLLECTION, CLIENTS_COLLECTION, TEAMS_COLLECTION } from '../../lib/collections';
import { UserEntity, UserRole, DEFAULT_ROLES, getRoleDefinition } from '../../types/users';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    role: 'analyst' as UserRole,
    client_access: 'assigned' as 'all' | 'assigned',
    assigned_client_ids: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'pending',
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersSnap, clientsSnap] = await Promise.all([
        getDocs(collection(db, USERS_COLLECTION)),
        getDocs(collection(db, CLIENTS_COLLECTION)),
      ]);
      
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserEntity)));
      setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleOpenModal = (user?: UserEntity) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        client_access: user.client_access,
        assigned_client_ids: user.assigned_client_ids || [],
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        display_name: '',
        role: 'analyst',
        client_access: 'assigned',
        assigned_client_ids: [],
        status: 'pending',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await updateDoc(doc(db, USERS_COLLECTION, editingUser.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new user (invitation)
        await addDoc(collection(db, USERS_COLLECTION), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleToggleStatus = async (user: UserEntity) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, USERS_COLLECTION, user.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Role badge colors
  const getRoleBadgeClass = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      super_admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      admin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      media_buyer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      social_manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      web_analyst: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      project_lead: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      analyst: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      client: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return colors[role] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactive': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-pink-500" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} • {users.filter(u => u.status === 'active').length} actif{users.filter(u => u.status === 'active').length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} />
          Inviter un utilisateur
        </button>
      </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="all">Tous les rôles</option>
            {DEFAULT_ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="pending">En attente</option>
          </select>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Chargement...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {searchQuery || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'Aucun utilisateur trouvé avec ces filtres'
                : 'Aucun utilisateur. Invitez votre premier utilisateur !'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Accès Clients</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map(user => {
                  const roleDef = getRoleDefinition(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold">
                            {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.display_name}</div>
                            <div className="text-slate-500 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                          {roleDef?.name || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.client_access === 'all' ? (
                          <span className="text-emerald-400 text-sm">Tous les clients</span>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            {user.assigned_client_ids?.length || 0} client{(user.assigned_client_ids?.length || 0) > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                          {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                            title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            {user.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 text-slate-500 hover:text-pink-400 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingUser ? 'Modifier l\'utilisateur' : 'Inviter un utilisateur'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {DEFAULT_ROLES.map(role => (
                      <option key={role.id} value={role.id}>{role.name} - {role.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Accès Clients</label>
                  <select
                    value={formData.client_access}
                    onChange={e => setFormData({ ...formData, client_access: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">Tous les clients</option>
                    <option value="assigned">Clients assignés uniquement</option>
                  </select>
                </div>
                {formData.client_access === 'assigned' && (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Clients Assignés</label>
                    <div className="max-h-32 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg p-2 space-y-1">
                      {clients.map(client => (
                        <label key={client.id} className="flex items-center gap-2 text-sm text-white cursor-pointer hover:bg-slate-700 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.assigned_client_ids.includes(client.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData({ ...formData, assigned_client_ids: [...formData.assigned_client_ids, client.id] });
                              } else {
                                setFormData({ ...formData, assigned_client_ids: formData.assigned_client_ids.filter(id => id !== client.id) });
                              }
                            }}
                            className="rounded"
                          />
                          {client.name}
                        </label>
                      ))}
                      {clients.length === 0 && <p className="text-slate-500 text-sm">Aucun client</p>}
                    </div>
                  </div>
                )}
                {editingUser && (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1.5">Statut</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingUser ? 'Enregistrer' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
