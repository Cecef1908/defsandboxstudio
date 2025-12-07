'use client';

// ============================================================================
// AUTH CONTEXT - Gestion centralisée de l'authentification
// Architecture: Context API + Custom Hook pour une gestion d'état robuste
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, USERS_COLLECTION } from '@/lib/firebase';
import { UserEntity } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  // État
  firebaseUser: FirebaseUser | null;
  user: UserEntity | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger le profil utilisateur depuis Firestore
   */
  const loadUserProfile = async (fbUser: FirebaseUser): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, fbUser.uid));
      
      if (userDoc.exists()) {
        const userData = { id: fbUser.uid, ...userDoc.data() } as UserEntity;
        setUser(userData);
        
        // Mettre à jour last_login
        await updateDoc(doc(db, USERS_COLLECTION, fbUser.uid), {
          last_login: serverTimestamp(),
        });
      } else {
        // Créer un profil par défaut pour les nouveaux utilisateurs
        const newUser: Omit<UserEntity, 'id'> = {
          email: fbUser.email || '',
          display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Utilisateur',
          role: 'analyst', // Rôle par défaut restrictif
          client_access: 'assigned',
          assigned_client_ids: [],
          status: 'pending', // En attente de validation admin
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          last_login: serverTimestamp(),
        };
        
        await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), newUser);
        setUser({ id: fbUser.uid, ...newUser } as UserEntity);
      }
    } catch (err: any) {
      console.error('[AuthContext] Error loading user profile:', err);
      setError('Erreur lors du chargement du profil');
      throw err;
    }
  };

  /**
   * Écouter les changements d'authentification Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          await loadUserProfile(fbUser);
        } catch (err) {
          // Erreur déjà loggée dans loadUserProfile
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Connexion avec email/password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // L'utilisateur sera chargé automatiquement par onAuthStateChanged
    } catch (err: any) {
      console.error('[AuthContext] Sign in error:', err);
      
      // Messages d'erreur user-friendly
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email ou mot de passe incorrect');
          break;
        case 'auth/invalid-email':
          setError('Email invalide');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives. Réessayez plus tard.');
          break;
        case 'auth/user-disabled':
          setError('Ce compte a été désactivé');
          break;
        default:
          setError('Erreur de connexion. Veuillez réessayer.');
      }
      
      setLoading(false);
      throw err;
    }
  };

  /**
   * Inscription avec email/password
   */
  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur dans Firestore
      const newUser: Omit<UserEntity, 'id'> = {
        email,
        display_name: displayName,
        role: 'analyst', // Rôle par défaut
        client_access: 'assigned',
        assigned_client_ids: [],
        status: 'pending', // Nécessite validation admin
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        last_login: serverTimestamp(),
      };
      
      await setDoc(doc(db, USERS_COLLECTION, result.user.uid), newUser);
      
      // L'utilisateur sera chargé automatiquement par onAuthStateChanged
    } catch (err: any) {
      console.error('[AuthContext] Sign up error:', err);
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Cet email est déjà utilisé');
          break;
        case 'auth/weak-password':
          setError('Le mot de passe doit contenir au moins 6 caractères');
          break;
        case 'auth/invalid-email':
          setError('Email invalide');
          break;
        default:
          setError('Erreur d\'inscription. Veuillez réessayer.');
      }
      
      setLoading(false);
      throw err;
    }
  };

  /**
   * Déconnexion
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('[AuthContext] Sign out error:', err);
      setError('Erreur de déconnexion');
      throw err;
    }
  };

  /**
   * Réinitialisation du mot de passe
   */
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('[AuthContext] Reset password error:', err);
      
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Aucun compte avec cet email');
          break;
        case 'auth/invalid-email':
          setError('Email invalide');
          break;
        default:
          setError('Erreur lors de l\'envoi de l\'email');
      }
      
      throw err;
    }
  };

  /**
   * Rafraîchir le profil utilisateur
   * @description Utile après une mise à jour des permissions
   */
  const refreshUser = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      await loadUserProfile(firebaseUser);
    } catch (err) {
      console.error('[AuthContext] Error refreshing user:', err);
    }
  };

  /**
   * Effacer l'erreur
   */
  const clearError = (): void => {
    setError(null);
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    firebaseUser,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook pour accéder au contexte d'authentification
 * @throws Error si utilisé en dehors du AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Vérifier si l'utilisateur est authentifié
 */
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return user !== null;
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 */
export function useHasRole(role: UserEntity['role']): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'super_admin' || user?.role === 'admin';
}
