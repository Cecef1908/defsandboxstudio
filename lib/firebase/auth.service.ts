// ============================================================================
// AUTH SERVICE - Gestion de l'authentification
// ============================================================================
// Normes 2025 : OAuth, Reset Password, Rate Limiting, Sécurité renforcée
// ============================================================================

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut as firebaseSignOut,
  User,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { USERS_COLLECTION } from './collections';
import { UserEntity } from '@/types';
import { checkAndAcceptInvitation } from '../services/invitations.service';

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Force la sélection du compte
});

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));

    if (!userDoc.exists()) {
      // Vérifier si l'utilisateur a une invitation en attente
      const invitedRole = await checkAndAcceptInvitation(user.email!);
      
      // Créer un nouveau profil utilisateur
      const userData: UserEntity = {
        id: user.uid,
        email: user.email!,
        display_name: user.displayName || user.email!.split('@')[0],
        avatar_url: user.photoURL || undefined,
        role: invitedRole || 'analyst', // Rôle de l'invitation ou par défaut
        client_access: 'assigned',
        status: 'active',
        last_login: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
    } else {
      // Mettre à jour la dernière connexion
      await setDoc(
        doc(db, USERS_COLLECTION, user.uid),
        {
          last_login: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return { success: true, user };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return { success: false, error: getAuthErrorMessage(error as AuthError) };
  }
}

// ============================================================================
// EMAIL/PASSWORD SIGN-IN
// ============================================================================

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour la dernière connexion
    await setDoc(
      doc(db, USERS_COLLECTION, result.user.uid),
      {
        last_login: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, user: result.user };
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    return { success: false, error: getAuthErrorMessage(error as AuthError) };
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`, // URL de retour après reset
      handleCodeInApp: false,
    });
    return { success: true };
  } catch (error) {
    console.error('Password Reset Error:', error);
    return { success: false, error: getAuthErrorMessage(error as AuthError) };
  }
}

export async function resetPassword(oobCode: string, newPassword: string) {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Confirm Password Reset Error:', error);
    return { success: false, error: getAuthErrorMessage(error as AuthError) };
  }
}

// ============================================================================
// SIGN OUT
// ============================================================================

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return { success: false, error: 'Erreur lors de la déconnexion' };
  }
}

// ============================================================================
// ERROR MESSAGES (Français)
// ============================================================================

function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte associé à cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
    'auth/popup-closed-by-user': 'Connexion annulée',
    'auth/cancelled-popup-request': 'Connexion annulée',
    'auth/expired-action-code': 'Le lien a expiré. Demandez un nouveau lien',
    'auth/invalid-action-code': 'Le lien est invalide',
  };

  return errorMessages[error.code] || 'Une erreur est survenue. Réessayez';
}

// ============================================================================
// RATE LIMITING (Client-side)
// ============================================================================

const loginAttempts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    loginAttempts.set(email, { count: 1, timestamp: now });
    return true;
  }

  // Reset après 1 minute
  if (now - attempt.timestamp > 60000) {
    loginAttempts.set(email, { count: 1, timestamp: now });
    return true;
  }

  // Max 5 tentatives par minute
  if (attempt.count >= 5) {
    return false;
  }

  attempt.count++;
  return true;
}
