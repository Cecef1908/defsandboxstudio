# 🔧 CONFIGURATION ENVIRONNEMENT

## ⚠️ ERREUR ACTUELLE : API KEY MANQUANTE

L'application ne se charge pas car le fichier `.env.local` n'existe pas.

## ✅ SOLUTION IMMÉDIATE

### **Étape 1 : Créer le fichier `.env.local`**

À la racine du projet, créer un fichier nommé `.env.local` avec ce contenu :

```bash
# ============================================================================
# FIREBASE CONFIGURATION
# ============================================================================
# Remplace ces valeurs par tes vraies credentials Firebase

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB09I-SC6rUAuiD5iJH-fC7iLxTr-EVFp0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sandboxwebapp-480415.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sandboxwebapp-480415
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sandboxwebapp-480415.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=275838046922
NEXT_PUBLIC_FIREBASE_APP_ID=1:275838046922:web:1d286269e4bd38fd2a9a33

# ============================================================================
# APPLICATION
# ============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Étape 2 : Redémarrer le serveur**

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## 📝 NOTES

- Le fichier `.env.local` est ignoré par Git (sécurité)
- Les valeurs ci-dessus sont celles de l'ancienne app (trouvées dans `_old-app/lib/firebase.ts`)
- Si tu veux utiliser un autre projet Firebase, remplace les valeurs

## 🔍 Où trouver tes credentials Firebase ?

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet
3. Clique sur l'icône ⚙️ (Settings) > Project Settings
4. Scroll jusqu'à "Your apps" > SDK setup and configuration
5. Copie les valeurs de `firebaseConfig`
