// ============================================================================
// CLIENTS SERVICE - Opérations CRUD
// ============================================================================
// ⚠️ RESPECT STRICT de la structure Firebase existante
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CLIENTS_COLLECTION } from '@/lib/firebase/collections';
import { ClientEntity, generateBusinessId } from '@/types';

// ============================================================================
// CREATE
// ============================================================================

export async function createClient(data: Omit<ClientEntity, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Générer le client_id si non fourni
    const client_id = data.client_id || generateBusinessId('CL', data.name);
    
    // Vérifier que le client_id n'existe pas déjà
    const existing = await getClientByCustomId(client_id);
    if (existing) {
      throw new Error(`Un client avec l'ID ${client_id} existe déjà`);
    }
    
    const clientData = {
      ...data,
      client_id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientData);
    
    return {
      id: docRef.id,
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as ClientEntity;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

// ============================================================================
// READ
// ============================================================================

export async function getAllClients(): Promise<ClientEntity[]> {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ClientEntity[];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

export async function getClientById(id: string): Promise<ClientEntity | null> {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ClientEntity;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
}

export async function getClientByCustomId(client_id: string): Promise<ClientEntity | null> {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where('client_id', '==', client_id)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as ClientEntity;
  } catch (error) {
    console.error('Error fetching client by custom ID:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateClient(id: string, data: Partial<ClientEntity>) {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, id);
    
    // Ne pas permettre la modification de l'ID Firestore ou du client_id
    const { id: _, client_id: __, createdAt: ___, ...updateData } = data as any;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    
    return await getClientById(id);
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteClient(id: string) {
  try {
    // TODO: Vérifier qu'il n'y a pas d'annonceurs/marques/plans liés
    // avant de supprimer (contrainte d'intégrité référentielle)
    
    const docRef = doc(db, CLIENTS_COLLECTION, id);
    await deleteDoc(docRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export async function searchClients(searchTerm: string): Promise<ClientEntity[]> {
  try {
    const allClients = await getAllClients();
    
    const term = searchTerm.toLowerCase();
    return allClients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.client_id.toLowerCase().includes(term) ||
      client.contact_email?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
}

export async function getClientsByType(type: 'direct' | 'agency' | 'holding'): Promise<ClientEntity[]> {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where('type', '==', type),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ClientEntity[];
  } catch (error) {
    console.error('Error fetching clients by type:', error);
    throw error;
  }
}
