// ============================================================================
// USERS SERVICE - Gestion des utilisateurs
// ============================================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { USERS_COLLECTION } from '@/lib/firebase/collections';
import { UserEntity, UserRole } from '@/types';

// ============================================================================
// READ
// ============================================================================

export async function getAllUsers(): Promise<UserEntity[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('display_name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserEntity[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<UserEntity | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as UserEntity;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function getUsersByRole(role: UserRole): Promise<UserEntity[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role),
      orderBy('display_name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserEntity[];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending') {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function updateUser(userId: string, data: Partial<UserEntity>) {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    
    // Ne pas permettre la modification de l'ID ou de l'email
    const { id: _, email: __, ...updateData } = data as any;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteUser(userId: string) {
  try {
    // TODO: Vérifier qu'il reste au moins un super_admin
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export async function searchUsers(searchTerm: string): Promise<UserEntity[]> {
  try {
    const allUsers = await getAllUsers();
    
    const term = searchTerm.toLowerCase();
    return allUsers.filter(user =>
      user.display_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}
