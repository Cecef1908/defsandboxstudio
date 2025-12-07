// ============================================================================
// FIREBASE ADMIN SDK - Configuration côté serveur
// Architecture: Singleton pattern pour les API Routes et Server Components
// ============================================================================

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

/**
 * Configuration Admin SDK
 * @description Utilise les variables d'environnement serveur uniquement
 */
const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

/**
 * Validation de la configuration Admin
 */
function validateAdminConfig(): boolean {
  if (!adminConfig.projectId) {
    console.error('[Firebase Admin] Missing FIREBASE_ADMIN_PROJECT_ID');
    return false;
  }
  if (!adminConfig.clientEmail) {
    console.error('[Firebase Admin] Missing FIREBASE_ADMIN_CLIENT_EMAIL');
    return false;
  }
  if (!adminConfig.privateKey) {
    console.error('[Firebase Admin] Missing FIREBASE_ADMIN_PRIVATE_KEY');
    return false;
  }
  return true;
}

/**
 * Initialisation de l'Admin SDK
 * @description Singleton - Une seule instance pour toute l'application
 */
let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;
let adminStorage: Storage;

try {
  if (!validateAdminConfig()) {
    throw new Error('Firebase Admin configuration is incomplete. Check your .env file.');
  }

  // Initialiser ou récupérer l'app existante
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId: adminConfig.projectId,
        clientEmail: adminConfig.clientEmail,
        privateKey: adminConfig.privateKey,
      }),
      storageBucket: `${adminConfig.projectId}.appspot.com`,
    });
    console.log('[Firebase Admin] ✓ Initialized successfully');
  } else {
    adminApp = getApps()[0];
    console.log('[Firebase Admin] ✓ Using existing instance');
  }

  // Initialiser les services
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  adminStorage = getStorage(adminApp);

} catch (error) {
  console.error('[Firebase Admin] ✗ Initialization failed:', error);
  // Ne pas throw en production pour éviter de crasher l'app
  // Les fonctions qui utilisent adminDb/adminAuth devront gérer le cas undefined
}

// ============================================================================
// EXPORTS
// ============================================================================

export { adminApp, adminDb, adminAuth, adminStorage };

/**
 * Helper: Vérifier si Admin SDK est initialisé
 */
export function isAdminInitialized(): boolean {
  return !!adminApp && !!adminDb && !!adminAuth && !!adminStorage;
}

/**
 * Helper: Obtenir les informations du projet Admin
 */
export function getAdminProjectInfo() {
  return {
    projectId: adminConfig.projectId,
    clientEmail: adminConfig.clientEmail,
    isInitialized: isAdminInitialized(),
  };
}

/**
 * Helper: Vérifier un token Firebase côté serveur
 * @description Utilisé dans les API Routes pour authentifier les requêtes
 */
export async function verifyIdToken(token: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin Auth not initialized');
    }
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('[Firebase Admin] Token verification failed:', error);
    throw error;
  }
}

/**
 * Helper: Créer un custom token
 * @description Utile pour l'authentification personnalisée
 */
export async function createCustomToken(uid: string, claims?: object) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin Auth not initialized');
    }
    return await adminAuth.createCustomToken(uid, claims);
  } catch (error) {
    console.error('[Firebase Admin] Custom token creation failed:', error);
    throw error;
  }
}
