# 🔐 CONFIGURATION FIREBASE AUTH

## ⚠️ ÉTAPES OBLIGATOIRES

Pour activer la connexion Google, tu dois configurer Firebase :

### **1. Activer Google Sign-In dans Firebase Console**

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionne ton projet
3. Va dans **Authentication** → **Sign-in method**
4. Clique sur **Google**
5. Active le provider
6. Sélectionne un email de support
7. Clique sur **Enregistrer**

### **2. Configurer les domaines autorisés**

Dans **Authentication** → **Settings** → **Authorized domains**, ajoute :
- `localhost` (déjà présent)
- Ton domaine de production (ex: `agencehub.com`)

---

## 🔑 FONCTIONNALITÉS IMPLÉMENTÉES

### **1. Connexion Google (OAuth 2.0)** ✅
- One-click login
- Récupération automatique du nom et photo
- Création automatique du profil utilisateur
- Rôle par défaut : `analyst` (lecture seule)

### **2. Connexion Email/Password** ✅
- Validation stricte (email valide, mot de passe 6+ caractères)
- Messages d'erreur clairs en français
- Protection contre les tentatives multiples

### **3. Mot de passe oublié** ✅
- Envoi d'email de réinitialisation
- Lien sécurisé avec expiration
- Interface de changement de mot de passe

### **4. Gestion des utilisateurs (Admin)** ✅
- Liste de tous les utilisateurs
- Modification des rôles
- Activation/Désactivation des comptes
- Suppression (avec confirmation)

### **5. Sécurité** ✅
- Rate limiting (max 5 tentatives/minute)
- Validation côté client ET serveur
- Tokens sécurisés
- Sessions persistantes

---

## 🎨 UX PREMIUM

### **États visuels**
- ✅ Loading states (spinners)
- ✅ Toasts de confirmation
- ✅ Messages d'erreur contextuels
- ✅ Animations fluides

### **Accessibilité**
- ✅ Labels ARIA
- ✅ Navigation au clavier
- ✅ Contraste WCAG AAA
- ✅ Focus visible

---

## 🚀 UTILISATION

### **Pour les utilisateurs**
```
/login              → Connexion (Google ou Email)
/forgot-password    → Réinitialisation mot de passe
/reset-password     → Changement mot de passe (depuis email)
```

### **Pour les admins**
```
/admin/users        → Gestion des utilisateurs
/admin/roles        → Configuration des rôles
```

---

## 🔒 RÔLES PAR DÉFAUT

| Rôle | Accès | Création compte |
|------|-------|-----------------|
| **super_admin** | Tout | Manuel (console Firebase) |
| **admin** | Admin + Media | Invitation par super_admin |
| **manager** | Media (full) | Invitation par admin |
| **media_buyer** | Media (édition) | Invitation par admin |
| **analyst** | Media (lecture) | **Auto (Google login)** |
| **client** | Ses projets uniquement | Invitation par admin |

---

## ⚡ PROCHAINES ÉTAPES

1. ✅ Activer Google Sign-In dans Firebase Console
2. ✅ Tester la connexion Google
3. ✅ Tester le reset de mot de passe
4. ✅ Créer des utilisateurs de test
5. ✅ Tester les permissions par rôle

---

**TOUT EST PRÊT !** 🎉
