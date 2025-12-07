// ============================================================================
// FIREBASE CONFIGURATION
// Architecture: Configuration centralisée avec fallbacks
// ============================================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";

/**
 * Configuration Firebase
 * @description Charge la config depuis les variables d'environnement
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validation de la configuration
 * @description S'assure que toutes les variables sont définies
 */
function validateConfig(): boolean {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`[Firebase] Missing configuration: ${key}`);
      return false;
    }
  }

  return true;
}

/**
 * Initialisation de l'application Firebase
 * @description Singleton pattern pour éviter les réinitialisations
 */
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

try {
  if (!validateConfig()) {
    throw new Error('Firebase configuration is incomplete. Check your .env file.');
  }

  // Initialiser ou récupérer l'app existante
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialiser les services
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);

  console.log('[Firebase] ✓ Initialized successfully');
} catch (error) {
  console.error('[Firebase] ✗ Initialization failed:', error);
  throw error;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { app, db, storage, auth };

/**
 * Helper: Vérifier si Firebase est initialisé
 */
export function isFirebaseInitialized(): boolean {
  return !!app && !!db && !!storage && !!auth;
}

/**
 * Helper: Obtenir les informations du projet
 */
export function getFirebaseProjectInfo() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isInitialized: isFirebaseInitialized(),
  };
}
