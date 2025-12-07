// ============================================================================
// INVITATIONS SERVICE - Gestion des invitations utilisateurs
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { INVITATIONS_COLLECTION, USERS_COLLECTION } from '@/lib/firebase/collections';
import { UserRole, UserEntity } from '@/types';

export interface InvitationEntity {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  invited_by_name: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: any;
}

// ============================================================================
// CREATE INVITATION
// ============================================================================

export async function createInvitation(
  email: string,
  role: UserRole,
  invitedBy: string,
  invitedByName: string
) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier si une invitation existe déjà
    const invitationsQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const invitationsSnapshot = await getDocs(invitationsQuery);
    
    if (!invitationsSnapshot.empty) {
      throw new Error('Une invitation est déjà en attente pour cet email');
    }

    // Créer l'invitation (expire dans 7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationData = {
      email,
      role,
      invited_by: invitedBy,
      invited_by_name: invitedByName,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      created_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), invitationData);

    return {
      id: docRef.id,
      ...invitationData,
      created_at: new Date().toISOString(),
    } as InvitationEntity;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

// ============================================================================
// READ
// ============================================================================

export async function getAllInvitations(): Promise<InvitationEntity[]> {
  try {
    const snapshot = await getDocs(collection(db, INVITATIONS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as InvitationEntity[];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
}

export async function getPendingInvitations(): Promise<InvitationEntity[]> {
  try {
    const q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as InvitationEntity[];
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    throw error;
  }
}

export async function getInvitationByEmail(email: string): Promise<InvitationEntity | null> {
  try {
    const q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as InvitationEntity;
  } catch (error) {
    console.error('Error fetching invitation by email:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function acceptInvitation(invitationId: string) {
  try {
    const docRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    await updateDoc(docRef, {
      status: 'accepted',
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteInvitation(invitationId: string) {
  try {
    const docRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting invitation:', error);
    throw error;
  }
}

// ============================================================================
// AUTO-ACCEPT ON GOOGLE LOGIN
// ============================================================================

/**
 * Vérifie si un email a une invitation en attente
 * Si oui, assigne le rôle de l'invitation au lieu du rôle par défaut
 */
export async function checkAndAcceptInvitation(email: string): Promise<UserRole | null> {
  try {
    const invitation = await getInvitationByEmail(email);
    
    if (!invitation) {
      return null;
    }

    // Vérifier si l'invitation n'a pas expiré
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      await updateDoc(doc(db, INVITATIONS_COLLECTION, invitation.id), {
        status: 'expired',
      });
      return null;
    }

    // Accepter l'invitation
    await acceptInvitation(invitation.id);
    
    return invitation.role;
  } catch (error) {
    console.error('Error checking invitation:', error);
    return null;
  }
}
