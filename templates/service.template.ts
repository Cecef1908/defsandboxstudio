// ============================================================================
// [MODULE_NAME] SERVICE - Gestion des [entities]
// ============================================================================
// Template: Remplacer [MODULE_NAME], [ENTITY], [COLLECTION_NAME]
// ============================================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { [COLLECTION_NAME] } from '@/lib/firebase/collections';
import type { [ENTITY]Entity } from '@/types';

// ============================================================================
// CREATE
// ============================================================================

export async function create[ENTITY](
  data: Omit<[ENTITY]Entity, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, [COLLECTION_NAME]), docData);
    
    return {
      id: docRef.id,
      ...docData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as [ENTITY]Entity;
  } catch (error) {
    console.error('Error creating [entity]:', error);
    throw error;
  }
}

// ============================================================================
// READ
// ============================================================================

export async function getAll[ENTITY]s(): Promise<[ENTITY]Entity[]> {
  try {
    const q = query(
      collection(db, [COLLECTION_NAME]),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as [ENTITY]Entity[];
  } catch (error) {
    console.error('Error fetching [entities]:', error);
    throw error;
  }
}

export async function get[ENTITY]ById(id: string): Promise<[ENTITY]Entity | null> {
  try {
    const docRef = doc(db, [COLLECTION_NAME], id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as [ENTITY]Entity;
  } catch (error) {
    console.error('Error fetching [entity]:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function update[ENTITY](
  id: string,
  data: Partial<[ENTITY]Entity>
) {
  try {
    const docRef = doc(db, [COLLECTION_NAME], id);
    
    // Ne pas permettre la modification de l'ID ou des timestamps
    const { id: _, createdAt: __, ...updateData } = data as any;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    
    return await get[ENTITY]ById(id);
  } catch (error) {
    console.error('Error updating [entity]:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function delete[ENTITY](id: string) {
  try {
    // TODO: Vérifier les contraintes d'intégrité référentielle
    const docRef = doc(db, [COLLECTION_NAME], id);
    await deleteDoc(docRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting [entity]:', error);
    throw error;
  }
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export async function search[ENTITY]s(searchTerm: string): Promise<[ENTITY]Entity[]> {
  try {
    const all[ENTITY]s = await getAll[ENTITY]s();
    
    const term = searchTerm.toLowerCase();
    return all[ENTITY]s.filter([entity] =>
      [entity].name.toLowerCase().includes(term)
      // Ajouter d'autres champs de recherche ici
    );
  } catch (error) {
    console.error('Error searching [entities]:', error);
    throw error;
  }
}

// ============================================================================
// PAGINATION
// ============================================================================

export async function get[ENTITY]sPaginated(
  pageSize: number = 20,
  lastDoc?: any
) {
  try {
    let q = query(
      collection(db, [COLLECTION_NAME]),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    return {
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as [ENTITY]Entity[],
      lastDoc: lastVisible,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error('Error fetching paginated [entities]:', error);
    throw error;
  }
}

// ============================================================================
// CUSTOM QUERIES (À adapter selon les besoins)
// ============================================================================

export async function get[ENTITY]sByStatus(
  status: string
): Promise<[ENTITY]Entity[]> {
  try {
    const q = query(
      collection(db, [COLLECTION_NAME]),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as [ENTITY]Entity[];
  } catch (error) {
    console.error('Error fetching [entities] by status:', error);
    throw error;
  }
}
