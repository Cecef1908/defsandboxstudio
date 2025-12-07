import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";

// --- GLOBAL VARIABLES ---
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string | undefined; 

// Configuration
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
);

// Fallback config (Votre projet)
if (Object.keys(firebaseConfig).length === 0) {
  firebaseConfig.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB09I-SC6rUAuiD5iJH-fC7iLxTr-EVFp0";
  firebaseConfig.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sandboxwebapp-480415.firebaseapp.com";
  firebaseConfig.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sandboxwebapp-480415";
  firebaseConfig.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sandboxwebapp-480415.firebasestorage.app";
  firebaseConfig.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "275838046922";
  firebaseConfig.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:275838046922:web:1d286269e4bd38fd2a9a33";
}

// Init App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export async function authenticateUser() {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log("[Firebase] Authentifié avec token");
        } else {
            // Tenter l'auth anonyme (peut échouer si désactivée dans Firebase Console)
            await signInAnonymously(auth);
            console.log("[Firebase] Authentifié anonymement");
        }
    } catch (error: any) {
        // Si l'auth anonyme est désactivée, on continue sans auth
        // Les règles Firestore doivent permettre l'accès public pour que ça fonctionne
        if (error.code === 'auth/admin-restricted-operation') {
            console.warn("[Firebase] Auth anonyme désactivée - continuez sans authentification");
            console.warn("[Firebase] Pour activer: Firebase Console > Authentication > Sign-in method > Anonymous");
        } else {
            console.error("[Firebase] Auth Error:", error.message);
        }
    }
}

// ============================================================================
// COLLECTIONS - Importer depuis ./collections.ts pour la référence complète
// ============================================================================

// Re-export depuis le référentiel unique
export {
  // Core
  CLIENTS_COLLECTION,
  ADVERTISERS_COLLECTION,
  BRANDS_COLLECTION,
  CONTACTS_COLLECTION,
  // Media Library
  CHANNELS_COLLECTION,
  FORMATS_COLLECTION,
  PLACEMENTS_COLLECTION,
  BUYING_MODELS_COLLECTION,
  PUBLISHERS_COLLECTION,
  CHANNEL_CATEGORIES_COLLECTION,
  OBJECTIVES_COLLECTION,
  BUYING_UNITS_COLLECTION,
  // Operational
  MEDIA_PLANS_COLLECTION,
  INSERTIONS_COLLECTION,
  CONTENTS_COLLECTION,
  REDIRECT_LINKS_COLLECTION,
  TARGETINGS_COLLECTION,
  // System
  AGENCE_SETTINGS_COLLECTION,
  THEMES_COLLECTION,
  LOGOS_COLLECTION,
  AGENCY_ASSETS_COLLECTION,
} from "./collections";

// ============================================================================
// LEGACY EXPORTS (pour compatibilité temporaire)
// @deprecated - Migrer vers les nouveaux noms
// ============================================================================

/** @deprecated Utiliser MEDIA_PLANS_COLLECTION depuis ./collections */
export const LEGACY_MEDIA_PLANS_COLLECTION = "Media-plans";

/** @deprecated Utiliser INSERTIONS_COLLECTION depuis ./collections */
export const LEGACY_INSERTIONS_COLLECTION = "Insertions";

/** @deprecated Ne plus utiliser */
export const ANNONCEURS_COLLECTION = "annonceurs";

/** @deprecated Ne plus utiliser */
export const MARQUES_COLLECTION = "marques";

/** @deprecated Ne plus utiliser */
export const CLIENTS_GROUPES_COLLECTION = "clientGroupes";

/** @deprecated Utiliser CHANNELS_COLLECTION depuis ./collections */
export const CANAUX_COLLECTION = "Canaux";

console.log(`[Firebase] Collections standardisées. Plans: media-plans, Insertions: insertions`);