'use client';

import React, { useState } from 'react';
import { 
  Shield, Check, X, Info, Eye, Plus, Edit2, Trash2, 
  Users, Briefcase, TrendingUp, BarChart3, FolderKanban,
  Settings, Building2
} from 'lucide-react';
import { DEFAULT_ROLES, UserRole, AppModule, PermissionAction, RoleDefinition } from '../../types/users';

// ============================================================================
// CONSTANTES
// ============================================================================

const MODULES: { id: AppModule; label: string; icon: any; color: string }[] = [
  { id: 'studio', label: 'Studio (Média)', icon: TrendingUp, color: 'pink' },
  { id: 'social', label: 'Social', icon: Users, color: 'purple' },
  { id: 'web', label: 'Web Analytics', icon: BarChart3, color: 'cyan' },
  { id: 'projet', label: 'Projets', icon: FolderKanban, color: 'emerald' },
  { id: 'admin', label: 'Administration', icon: Settings, color: 'orange' },
  { id: 'global', label: 'Global', icon: Building2, color: 'slate' },
];

const ACTIONS: { id: PermissionAction; label: string; desc: string }[] = [
  { id: 'view', label: 'Voir', desc: 'Consulter les données' },
  { id: 'create', label: 'Créer', desc: 'Ajouter de nouveaux éléments' },
  { id: 'edit', label: 'Modifier', desc: 'Éditer les éléments existants' },
  { id: 'delete', label: 'Supprimer', desc: 'Supprimer des éléments' },
  { id: 'export', label: 'Exporter', desc: 'Exporter les données' },
  { id: 'approve', label: 'Valider', desc: 'Approuver/valider des éléments' },
  { id: 'assign', label: 'Assigner', desc: 'Assigner à d\'autres utilisateurs' },
  { id: 'admin', label: 'Admin', desc: 'Administration du module' },
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showInfo, setShowInfo] = useState(false);

  const currentRole = DEFAULT_ROLES.find(r => r.id === selectedRole);

  // Helper pour obtenir la couleur du rôle
  const getRoleColor = (role: RoleDefinition) => {
    const colors: Record<string, string> = {
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      blue: 'from-blue-500 to-blue-600',
      pink: 'from-pink-500 to-pink-600',
      purple: 'from-purple-500 to-purple-600',
      cyan: 'from-cyan-500 to-cyan-600',
      emerald: 'from-emerald-500 to-emerald-600',
      slate: 'from-slate-500 to-slate-600',
      amber: 'from-amber-500 to-amber-600',
    };
    return colors[role.color] || 'from-slate-500 to-slate-600';
  };

  const getRoleBorderColor = (role: RoleDefinition) => {
    const colors: Record<string, string> = {
      red: 'border-red-500',
      orange: 'border-orange-500',
      blue: 'border-blue-500',
      pink: 'border-pink-500',
      purple: 'border-purple-500',
      cyan: 'border-cyan-500',
      emerald: 'border-emerald-500',
      slate: 'border-slate-500',
      amber: 'border-amber-500',
    };
    return colors[role.color] || 'border-slate-500';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-orange-500" />
            Rôles & Permissions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Matrice des permissions par rôle et module
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info Box */}
      {showInfo && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
          <p className="font-bold mb-2">💡 Comment fonctionnent les permissions ?</p>
          <ul className="space-y-1 text-blue-200/80">
            <li>• Chaque utilisateur a un <strong>rôle</strong> qui définit ses permissions par défaut</li>
            <li>• Les permissions peuvent être <strong>overridées</strong> individuellement par utilisateur</li>
            <li>• Les rôles système (Super Admin, Admin) ne peuvent pas être supprimés</li>
            <li>• Le rôle <strong>Client</strong> est réservé aux accès externes</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Roles List */}
        <div className="col-span-3 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Rôles Disponibles</h3>
          {DEFAULT_ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedRole === role.id
                  ? `bg-gradient-to-r ${getRoleColor(role)} text-white border-transparent`
                  : `bg-slate-800/50 text-slate-300 border-slate-700 hover:border-slate-600`
              }`}
            >
              <div className="font-medium text-sm">{role.name}</div>
              <div className={`text-xs mt-0.5 ${selectedRole === role.id ? 'text-white/70' : 'text-slate-500'}`}>
                {role.description.substring(0, 40)}...
              </div>
            </button>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="col-span-9">
          {currentRole && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Role Header */}
              <div className={`p-4 bg-gradient-to-r ${getRoleColor(currentRole)} border-b border-white/10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentRole.name}</h2>
                    <p className="text-white/70 text-sm mt-1">{currentRole.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentRole.is_internal ? (
                      <span className="px-2 py-1 bg-white/20 rounded text-xs text-white">Interne</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-500/30 rounded text-xs text-amber-200">Externe</span>
                    )}
                    {!currentRole.can_be_deleted && (
                      <span className="px-2 py-1 bg-red-500/30 rounded text-xs text-red-200">Système</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase w-40">Module</th>
                      {ACTIONS.map(action => (
                        <th key={action.id} className="px-2 py-3 text-center">
                          <div className="text-xs font-bold text-slate-400 uppercase">{action.label}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {MODULES.map(module => {
                      const modulePerms = currentRole.permissions[module.id] || [];
                      return (
                        <tr key={module.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <module.icon size={16} className={`text-${module.color}-400`} />
                              <span className="text-sm text-white font-medium">{module.label}</span>
                            </div>
                          </td>
                          {ACTIONS.map(action => {
                            const hasPermission = modulePerms.includes(action.id);
                            return (
                              <td key={action.id} className="px-2 py-3 text-center">
                                {hasPermission ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
                                    <Check size={14} className="text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700/30">
                                    <X size={14} className="text-slate-600" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="p-4 bg-slate-900/30 border-t border-slate-700/50">
                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check size={12} className="text-emerald-400" />
                    </div>
                    <span>Permission accordée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-700/30 flex items-center justify-center">
                      <X size={12} className="text-slate-600" />
                    </div>
                    <span>Permission refusée</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Legend */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-bold text-white mb-3">Légende des Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          {ACTIONS.map(action => (
            <div key={action.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                {action.label.charAt(0)}
              </div>
              <div>
                <div className="text-sm text-white font-medium">{action.label}</div>
                <div className="text-xs text-slate-500">{action.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
