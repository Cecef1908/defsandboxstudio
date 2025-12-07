// ============================================================================
// STORAGE SERVICE - Gestion des uploads (avatars, fichiers)
// ============================================================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

// ============================================================================
// UPLOAD AVATAR
// ============================================================================

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    // Valider le fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('L\'image ne doit pas dépasser 2 MB');
    }

    // Créer une référence unique
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${extension}`;
    const storageRef = ref(storage, `avatars/${fileName}`);

    console.log('Uploading to:', `avatars/${fileName}`);

    // Upload avec metadata
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    console.log('Upload successful:', uploadResult);

    // Attendre un peu avant de récupérer l'URL
    await new Promise(resolve => setTimeout(resolve, 500));

    // Obtenir l'URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    throw new Error(error.message || 'Erreur lors de l\'upload');
  }
}

// ============================================================================
// DELETE AVATAR
// ============================================================================

export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // Extraire le path depuis l'URL
    const urlParts = avatarUrl.split('/o/');
    if (urlParts.length < 2) return;

    const pathPart = urlParts[1].split('?')[0];
    const path = decodeURIComponent(pathPart);

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting avatar:', error);
    // Ne pas throw - l'ancien avatar peut ne plus exister
  }
}

// ============================================================================
// UPLOAD FILE (Générique)
// ============================================================================

export async function uploadFile(
  path: string,
  file: File,
  maxSizeMB: number = 5
): Promise<string> {
  try {
    // Valider la taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Le fichier ne doit pas dépasser ${maxSizeMB} MB`);
    }

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
