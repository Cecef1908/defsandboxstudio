# 🔧 CORRECTION RÈGLES FIREBASE STORAGE

## ✅ PROGRÈS

L'erreur a changé de :
```
❌ 404 CORS error (Storage pas activé)
```

À :
```
⚠️ Object does not exist (Storage activé mais règles incorrectes)
```

**C'est bon signe !** Storage est maintenant activé.

---

## 🔥 RÈGLES STORAGE À APPLIQUER

### **Va sur Firebase Console**

1. **Storage** → **Rules** (onglet en haut)
2. **Remplace TOUT** par ce code :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règle pour les avatars
    match /avatars/{fileName} {
      // Lecture publique
      allow read: if true;
      
      // Écriture si connecté
      allow write: if request.auth != null
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Règle par défaut pour autres fichiers
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. **Clique "Publish"**

---

## 🧪 TESTER MAINTENANT

1. **Recharge** la page `/account`
2. **Ouvre la console** (F12)
3. **Clique** sur l'avatar
4. **Sélectionne** une image

**Tu devrais voir dans la console :**
```
Uploading to: avatars/user_123456789.png
Upload successful: {...}
Download URL: https://...
```

---

## 📊 VÉRIFIER DANS FIREBASE

Après l'upload :

1. **Firebase Console** → **Storage** → **Files**
2. **Dossier `avatars/`**
3. **Ton image** devrait apparaître

---

## 🔍 SI ERREUR PERSISTE

**Copie-colle les logs de la console ici :**
- "Uploading to: ..."
- "Upload successful: ..."
- Ou le message d'erreur exact

---

**APPLIQUE CES RÈGLES ET TESTE !** 🚀
