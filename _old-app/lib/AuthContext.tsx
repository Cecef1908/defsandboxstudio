'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { USERS_COLLECTION } from './collections';
import { UserEntity, UserRole } from '../types/users';

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

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Récupérer ou créer le profil utilisateur
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, fbUser.uid));
          
          if (userDoc.exists()) {
            setUser({ id: fbUser.uid, ...userDoc.data() } as UserEntity);
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
            };
            
            await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), newUser);
            setUser({ id: fbUser.uid, ...newUser } as UserEntity);
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          setError('Erreur lors du chargement du profil');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign In
  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou mot de passe incorrect');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalide');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Réessayez plus tard.');
      } else {
        setError('Erreur de connexion: ' + err.message);
      }
      setLoading(false);
      throw err;
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur
      const newUser: Omit<UserEntity, 'id'> = {
        email,
        display_name: displayName,
        role: 'analyst',
        client_access: 'assigned',
        assigned_client_ids: [],
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, USERS_COLLECTION, result.user.uid), newUser);
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalide');
      } else {
        setError('Erreur d\'inscription: ' + err.message);
      }
      setLoading(false);
      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Erreur de déconnexion');
    }
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte avec cet email');
      } else {
        setError('Erreur: ' + err.message);
      }
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      resetPassword,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// COMPOSANT DE PROTECTION
// ============================================================================

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: UserRole[];
  fallback?: ReactNode;
  allowPending?: boolean; // Permet l'accès même avec status pending
}

export function RequireAuth({ children, requiredRole, fallback, allowPending = false }: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Rediriger vers login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return fallback || null;
  }

  // Vérifier le statut (sauf si allowPending)
  if (user.status !== 'active' && !allowPending) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Compte en attente</h2>
          <p className="text-slate-400 text-sm mb-4">
            Votre compte est en attente de validation par un administrateur.
          </p>
          <a 
            href="/admin/database-setup" 
            className="text-pink-400 hover:text-pink-300 text-sm underline mb-4 block"
          >
            Premier setup ? Cliquez ici →
          </a>

          {/* BOUTON DE DÉBLOCAGE D'URGENCE */}
          <button
            onClick={async () => {
              try {
                const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
                const { db } = await import("./firebase");
                await setDoc(doc(db, "users", user.id), {
                  ...user,
                  role: 'super_admin',
                  status: 'active',
                  client_access: 'all',
                  updatedAt: serverTimestamp(),
                }, { merge: true });
                window.location.reload();
              } catch (e) {
                alert("Erreur: " + e);
              }
            }}
            className="mt-4 px-4 py-2 bg-red-900/50 text-red-200 rounded text-xs border border-red-800 hover:bg-red-900 hover:text-white transition-colors"
          >
            🆘 DÉBLOCAGE D'URGENCE (DEV ONLY)
          </button>
        </div>
      </div>
    );
  }

  // Vérifier le rôle si requis
  if (requiredRole && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
          <p className="text-slate-400 text-sm">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthContext;
