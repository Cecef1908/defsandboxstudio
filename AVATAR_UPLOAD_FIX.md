# 🔧 CORRECTION UPLOAD AVATAR

## ❌ PROBLÈME

L'upload d'avatar ne fonctionne pas. Erreur possible :
- Firebase Storage non configuré
- Permissions Storage manquantes
- URL d'avatar non sauvegardée dans Firestore

---

## ✅ SOLUTIONS APPLIQUÉES

### **1. Avatar affiché sur la home** ✅

**Fichier :** `app/page.tsx`

**Avant :**
```tsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
  {user.display_name?.charAt(0).toUpperCase()}
</div>
```

**Après :**
```tsx
<Link href="/account" className="w-10 h-10 rounded-full ... overflow-hidden">
  {user.avatar_url ? (
    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
  ) : (
    user.display_name?.charAt(0).toUpperCase()
  )}
</Link>
```

✅ **Résultat :**
- Avatar affiché s'il existe
- Cliquable → Redirige vers `/account`
- Initiale si pas d'avatar

---

### **2. Retirer uppercase CSS** ✅

**Avant :**
```tsx
<p className="text-xs text-slate-400 uppercase tracking-wider">
  {user.role.replace('_', ' ')}
</p>
```

**Après :**
```tsx
<p className="text-xs text-slate-400">
  {user.role.replace('_', ' ')}
</p>
```

✅ **Résultat :** Respect de la règle Sentence case

---

## 🔥 CONFIGURATION FIREBASE STORAGE

### **Étape 1 : Activer Storage dans Firebase Console**

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionne ton projet
3. **Storage** (menu gauche)
4. Clique sur **Get Started**
5. Choisis **Start in test mode** (pour le développement)
6. Clique sur **Next** puis **Done**

### **Étape 2 : Configurer les règles de sécurité**

Dans Firebase Console → Storage → Rules :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les avatars
    match /avatars/{userId}_{timestamp}.{extension} {
      // Lecture : Tout le monde peut voir les avatars
      allow read: if true;
      
      // Écriture : Seulement l'utilisateur connecté
      allow write: if request.auth != null;
    }
    
    // Règle générale (plus permissive pour le dev)
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Clique sur "Publier"**

---

## 🧪 TESTER L'UPLOAD

### **1. Vérifier que Storage est activé**

```javascript
// Dans la console navigateur (F12)
import { storage } from '@/lib/firebase/config';
console.log('Storage:', storage);
// Devrait afficher un objet FirebaseStorage
```

### **2. Tester l'upload**

1. Va sur `/account`
2. Clique sur l'avatar
3. Sélectionne une image (< 2MB)
4. Vérifie la console pour les erreurs

### **3. Vérifier dans Firebase Console**

1. Firebase Console → Storage
2. Dossier `avatars/`
3. Ton image devrait apparaître

---

## 🔍 ERREURS POSSIBLES

### **Erreur : "Firebase Storage is not configured"**

**Solution :**
```bash
# Vérifier .env.local
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### **Erreur : "Permission denied"**

**Solution :** Vérifier les règles Storage (voir ci-dessus)

### **Erreur : "Network error"**

**Solution :** Vérifier que Storage est activé dans Firebase Console

### **Erreur : "File too large"**

**Solution :** Le code limite à 2MB. Utilise une image plus petite.

---

## 📊 STRUCTURE ATTENDUE

### **Firebase Storage**
```
storage/
└── avatars/
    ├── user1_1234567890.jpg
    ├── user2_1234567891.png
    └── user3_1234567892.webp
```

### **Firestore users**
```json
{
  "id": "user_uid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://firebasestorage.googleapis.com/.../avatars/user1_1234567890.jpg",
  // ... autres champs
}
```

---

## ✅ CHECKLIST

- [ ] Firebase Storage activé dans Console
- [ ] Règles Storage configurées
- [ ] Variable `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` dans `.env.local`
- [ ] Tester upload sur `/account`
- [ ] Vérifier que l'image apparaît dans Storage
- [ ] Vérifier que `avatar_url` est sauvegardé dans Firestore
- [ ] Vérifier que l'avatar s'affiche sur la home

---

## 🎯 SI ÇA NE MARCHE TOUJOURS PAS

**Envoie-moi :**
1. Le message d'erreur exact dans la console
2. Screenshot de Firebase Console → Storage
3. Contenu de ton document user dans Firestore

---

**CORRECTIONS APPLIQUÉES !**

Maintenant :
1. ✅ Avatar affiché sur la home (si uploadé)
2. ✅ Cliquable vers `/account`
3. ✅ Règle Sentence case respectée (pas de uppercase)
4. ✅ Guide pour configurer Firebase Storage

**Teste l'upload et dis-moi si ça fonctionne !**
