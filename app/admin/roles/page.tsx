'use client';

// ============================================================================
// ROLES MANAGEMENT PAGE - Gestion des rôles et invitations
// ============================================================================

import { useState, useEffect } from 'react';
import { Shield, Mail, UserPlus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DEFAULT_ROLES } from '@/types';
import { createInvitation, getPendingInvitations, deleteInvitation, InvitationEntity } from '@/lib/services/invitations.service';
import { useToast, Modal, ConfirmDialog } from '@/components/ui';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function RolesManagementPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [invitations, setInvitations] = useState<InvitationEntity[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationEntity | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('analyst');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les invitations');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !selectedRole) {
      toast.error('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      await createInvitation(
        email,
        selectedRole as any,
        user!.id,
        user!.display_name
      );
      
      toast.success('Invitation envoyée !', `${email} peut maintenant se connecter avec Google`);
      setEmail('');
      setSelectedRole('analyst');
      setShowInviteModal(false);
      await loadInvitations();
    } catch (error: any) {
      toast.error('Erreur', error.message || 'Impossible d\'envoyer l\'invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvitation) return;
    
    setIsSubmitting(true);
    try {
      await deleteInvitation(selectedInvitation.id);
      toast.success('Supprimée', 'L\'invitation a été supprimée');
      await loadInvitations();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Erreur', 'Impossible de supprimer l\'invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (roleId: string) => {
    const role = DEFAULT_ROLES.find(r => r.id === roleId);
    return role?.color || 'slate';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des rôles</h1>
          <p className="text-slate-400">Rôles disponibles et invitations en attente</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-xl transition-all shadow-lg"
        >
          <UserPlus size={20} />
          <span>Inviter un utilisateur</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Rôles disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_ROLES.map((role) => (
            <div
              key={role.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-${role.color}-500/10`}>
                  <Shield size={24} className={`text-${role.color}-400`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{role.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{role.description}</p>
                  
                  {/* Permissions */}
                  <div className="space-y-1">
                    {Object.entries(role.permissions).map(([module, actions]) => {
                      if ((actions as string[]).length === 0) return null;
                      return (
                        <div key={module} className="text-xs text-slate-500">
                          <span className="font-medium capitalize">{module}:</span>{' '}
                          {(actions as string[]).join(', ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Invitations en attente ({invitations.length})
        </h2>
        
        {invitations.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-12 text-center">
            <Mail size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Aucune invitation en attente</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">Invité par</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-300">Expire le</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-white font-medium">{invitation.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-${getRoleColor(invitation.role)}-500/10 text-${getRoleColor(invitation.role)}-400 border-${getRoleColor(invitation.role)}-500/20`}>
                        <Shield size={12} />
                        {DEFAULT_ROLES.find(r => r.id === invitation.role)?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {invitation.invited_by_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock size={14} />
                        {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Inviter un utilisateur"
        size="md"
      >
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-300">
              <strong>Comment ça marche :</strong><br />
              1. Entrez l'adresse Gmail de la personne<br />
              2. Sélectionnez son rôle<br />
              3. Elle pourra se connecter directement avec "Continuer avec Google"<br />
              4. Son rôle sera automatiquement assigné
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Adresse gmail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="utilisateur@gmail.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Rôle
            </label>
            <div className="space-y-2">
              {DEFAULT_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                  }`}
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'invitation ?"
        message={`Êtes-vous sûr de vouloir supprimer l'invitation pour ${selectedInvitation?.email} ?`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
