// ============================================================================
// HOOK: usePermissions
// Accès facile aux permissions dans les composants React
// ============================================================================

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserEntity, AppModule, PermissionAction, getRoleDefinition } from '../../types/users';
import {
  hasPermission,
  canAccessModule,
  canAccessClient,
  getAccessibleModules,
  getModulePermissions,
  getUIPermissions,
  canManageUser,
  filterClientsByAccess,
  filterPlansByClientAccess,
} from '../permissions';

// Collection Firestore pour les utilisateurs
const USERS_COLLECTION = 'users';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export interface UsePermissionsReturn {
  // État
  user: UserEntity | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  
  // Vérifications de permissions
  can: (module: AppModule, action: PermissionAction) => boolean;
  canAccess: (module: AppModule) => boolean;
  canAccessClient: (clientId: string) => boolean;
  
  // Helpers
  accessibleModules: AppModule[];
  modulePermissions: (module: AppModule) => PermissionAction[];
  uiPermissions: (module: AppModule) => ReturnType<typeof getUIPermissions>;
  
  // Gestion utilisateurs
  canManage: (targetUser: UserEntity) => boolean;
  
  // Filtrage données
  filterClients: <T extends { id: string }>(clients: T[]) => T[];
  filterPlans: <T extends { client_id: string }>(plans: T[]) => T[];
  
  // Infos rôle
  roleName: string;
  roleColor: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écouter l'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Récupérer les données utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, fbUser.uid));
        
        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() } as UserEntity);
        } else {
          // Utilisateur Firebase existe mais pas dans Firestore
          // Créer un profil par défaut (ou rediriger vers onboarding)
          console.warn('User exists in Firebase Auth but not in Firestore');
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            role: 'analyst', // Rôle par défaut le plus restrictif
            client_access: 'assigned',
            status: 'pending',
          });
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Écouter les changements en temps réel du profil utilisateur
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = onSnapshot(
      doc(db, USERS_COLLECTION, firebaseUser.uid),
      (doc) => {
        if (doc.exists()) {
          setUser({ id: firebaseUser.uid, ...doc.data() } as UserEntity);
        }
      },
      (err) => {
        console.error('Error listening to user changes:', err);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  // Mémoiser les fonctions de vérification
  const can = useCallback(
    (module: AppModule, action: PermissionAction) => hasPermission(user, module, action),
    [user]
  );

  const canAccess = useCallback(
    (module: AppModule) => canAccessModule(user, module),
    [user]
  );

  const canAccessClientFn = useCallback(
    (clientId: string) => canAccessClient(user, clientId),
    [user]
  );

  const accessibleModules = useMemo(
    () => getAccessibleModules(user),
    [user]
  );

  const modulePermissions = useCallback(
    (module: AppModule) => getModulePermissions(user, module),
    [user]
  );

  const uiPermissions = useCallback(
    (module: AppModule) => getUIPermissions(user, module),
    [user]
  );

  const canManage = useCallback(
    (targetUser: UserEntity) => canManageUser(user, targetUser),
    [user]
  );

  const filterClients = useCallback(
    <T extends { id: string }>(clients: T[]) => filterClientsByAccess(user, clients),
    [user]
  );

  const filterPlans = useCallback(
    <T extends { client_id: string }>(plans: T[]) => filterPlansByClientAccess(user, plans),
    [user]
  );

  // Infos sur le rôle
  const roleDefinition = user ? getRoleDefinition(user.role) : null;
  const roleName = roleDefinition?.name || 'Inconnu';
  const roleColor = roleDefinition?.color || 'slate';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return {
    user,
    firebaseUser,
    loading,
    error,
    can,
    canAccess,
    canAccessClient: canAccessClientFn,
    accessibleModules,
    modulePermissions,
    uiPermissions,
    canManage,
    filterClients,
    filterPlans,
    roleName,
    roleColor,
    isAdmin,
    isSuperAdmin,
  };
};

// ============================================================================
// HOOK SIMPLIFIÉ POUR UN MODULE SPÉCIFIQUE
// ============================================================================

export const useModulePermissions = (module: AppModule) => {
  const { user, loading, can, uiPermissions } = usePermissions();
  
  const permissions = useMemo(() => uiPermissions(module), [uiPermissions, module]);
  
  return {
    loading,
    ...permissions,
    can: (action: PermissionAction) => can(module, action),
  };
};

// ============================================================================
// HELPER: Vérifier permission (pour usage hors composant)
// ============================================================================

export const checkPermission = async (
  userId: string,
  module: AppModule,
  action: PermissionAction
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return false;
    
    const user = { id: userId, ...userDoc.data() } as UserEntity;
    return hasPermission(user, module, action);
  } catch {
    return false;
  }
};

export default usePermissions;
