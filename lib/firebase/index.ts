// ============================================================================
// FIREBASE - Barrel Export
// Architecture: Point d'entrée unique pour tous les services Firebase
// ============================================================================

/**
 * Usage:
 * import { db, auth, USERS_COLLECTION, isFirebaseInitialized } from '@/lib/firebase';
 */

// Configuration et services
export { app, db, storage, auth, isFirebaseInitialized, getFirebaseProjectInfo } from './config';

// Collections
export * from './collections';
