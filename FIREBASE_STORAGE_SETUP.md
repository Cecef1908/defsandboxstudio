# 🔥 CONFIGURATION FIREBASE STORAGE - URGENT

## ❌ ERREUR ACTUELLE

```
404 (Not Found)
CORS policy: Response to preflight request doesn't pass access control check
```

**Cause :** Firebase Storage n'est **PAS ACTIVÉ** dans ton projet.

---

## ✅ SOLUTION EN 3 ÉTAPES

### **ÉTAPE 1 : Activer Firebase Storage** ⚠️ OBLIGATOIRE

1. **Va sur** [Firebase Console](https://console.firebase.google.com)
2. **Sélectionne** ton projet `sandboxwebapp-480415`
3. **Clique** sur **Storage** dans le menu gauche
4. **Clique** sur **Get Started**
5. **Sélectionne** "Start in production mode" (on changera les règles après)
6. **Choisis** la région (ex: `europe-west1`)
7. **Clique** sur **Done**

⏱️ **Temps : 30 secondes**

---

### **ÉTAPE 2 : Configurer les règles de sécurité**

Une fois Storage activé :

1. **Storage** → **Rules** (onglet)
2. **Remplace** le contenu par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règle pour les avatars
    match /avatars/{allPaths=**} {
      // Lecture publique (pour afficher les avatars)
      allow read: if true;
      
      // Écriture seulement si connecté
      allow write: if request.auth != null
                   && request.resource.size < 2 * 1024 * 1024  // Max 2MB
                   && request.resource.contentType.matches('image/.*');  // Seulement images
    }
    
    // Autres fichiers (pour plus tard)
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. **Clique** sur **Publier**

⏱️ **Temps : 1 minute**

---

### **ÉTAPE 3 : Vérifier la configuration**

1. **Storage** → **Files**
2. Tu devrais voir un dossier vide
3. **C'est bon !** Storage est activé

---

## 🧪 TESTER APRÈS ACTIVATION

1. **Recharge** la page `/account`
2. **Clique** sur l'avatar
3. **Sélectionne** une image
4. ✅ **Devrait fonctionner !**

---

## 🔍 SI L'ERREUR PERSISTE

### **Vérifier le bucket dans .env.local**

Ouvre `.env.local` et vérifie :

```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sandboxwebapp-480415.appspot.com
```

⚠️ **IMPORTANT :** Doit finir par `.appspot.com` et **PAS** `.firebasestorage.app`

### **Si le bucket est incorrect**

1. Va sur Firebase Console → Project Settings
2. Copie le **Storage bucket** exact
3. Colle-le dans `.env.local`
4. **Redémarre** le serveur Next.js

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

---

## 📊 VÉRIFICATION RAPIDE

### **Dans Firebase Console**

```
✅ Storage activé
✅ Règles configurées
✅ Bucket visible
```

### **Dans .env.local**

```bash
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sandboxwebapp-480415.appspot.com
```

### **Dans le code**

```typescript
// lib/firebase/config.ts
✅ storage = getStorage(app);
```

---

## ⚡ CHECKLIST RAPIDE

- [ ] Aller sur Firebase Console
- [ ] Storage → Get Started
- [ ] Activer Storage (production mode)
- [ ] Configurer les règles (copier-coller ci-dessus)
- [ ] Publier les règles
- [ ] Vérifier `.env.local` (bucket = `.appspot.com`)
- [ ] Redémarrer le serveur
- [ ] Tester l'upload

---

## 🎯 RÉSULTAT ATTENDU

**Avant :**
```
❌ 404 Not Found
❌ CORS error
❌ Storage non activé
```

**Après :**
```
✅ Upload fonctionne
✅ Image dans Storage
✅ URL sauvegardée dans Firestore
✅ Avatar affiché
```

---

**FAIS CES 3 ÉTAPES MAINTENANT ET DIS-MOI SI ÇA MARCHE !** 🚀

1. Activer Storage dans Firebase Console
2. Configurer les règles
3. Tester l'upload
