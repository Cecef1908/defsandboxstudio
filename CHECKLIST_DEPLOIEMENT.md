# ✅ Checklist de Déploiement

## 📋 Progression

```
[1] Configuration Git       [ ]
[2] Push vers GitHub        [ ]
[3] Configuration Vercel    [ ]
[4] Variables ENV           [ ]
[5] Premier Déploiement     [ ]
[6] Config Firebase         [ ]
[7] Règles Firebase         [ ]
[8] Tests Finaux            [ ]
```

---

## [1] Configuration Git

### Actions
- [ ] Double-cliquer sur `setup-git.bat`
- [ ] Vérifier que le script s'exécute sans erreur
- [ ] Voir "Configuration terminee!" à la fin

### Vérification
```bash
git remote -v
```
**Résultat attendu:**
```
origin  https://github.com/Cecef1908/defsandboxstudio.git (fetch)
origin  https://github.com/Cecef1908/defsandboxstudio.git (push)
```

---

## [2] Push vers GitHub

### Actions
- [ ] Double-cliquer sur `push-github.bat`
- [ ] Si demande d'authentification:
  - Username: `Cecef1908`
  - Password: Personal Access Token
- [ ] Voir "SUCCESS! Code pousse vers GitHub"

### Vérification
Aller sur: https://github.com/Cecef1908/defsandboxstudio
- [ ] Le code est visible sur GitHub
- [ ] Tous les fichiers sont présents

---

## [3] Configuration Vercel

### Actions
- [ ] Aller sur: https://vercel.com/new
- [ ] Se connecter avec GitHub
- [ ] Cliquer sur "Import Git Repository"
- [ ] Chercher: `Cecef1908/defsandboxstudio`
- [ ] Cliquer sur "Import"

### Vérification
- [ ] Le projet apparaît dans le dashboard Vercel

---

## [4] Variables d'Environnement

### Firebase Client (6 variables)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

**Source**: Firebase Console > Project Settings > General > Your apps

### Firebase Admin (3 variables)
- [ ] `FIREBASE_ADMIN_PROJECT_ID`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`

**Source**: Firebase Console > Project Settings > Service Accounts > Generate new private key

### Application (2 variables)
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://votre-app.vercel.app`

### Vérification
- [ ] Total: 11 variables configurées
- [ ] Pas d'espaces avant/après les valeurs
- [ ] PRIVATE_KEY au bon format (avec `\n`)

---

## [5] Premier Déploiement

### Actions
- [ ] Cliquer sur "Deploy" dans Vercel
- [ ] Attendre la fin du build (2-3 minutes)
- [ ] Voir "Deployment Ready"

### Vérification
- [ ] Cliquer sur "Visit" ou aller sur l'URL
- [ ] La page de login s'affiche
- [ ] Pas d'erreur 500 ou 404

---

## [6] Configuration Firebase

### Authorized Domains
- [ ] Firebase Console > Authentication > Settings
- [ ] Authorized domains > Add domain
- [ ] Ajouter le domaine Vercel (ex: `defsandboxstudio.vercel.app`)
- [ ] Sauvegarder

### Mise à jour URL Vercel
- [ ] Vercel Dashboard > Settings > Environment Variables
- [ ] Modifier `NEXT_PUBLIC_APP_URL` avec l'URL finale
- [ ] Deployments > ⋯ > Redeploy

### Vérification
- [ ] Le domaine apparaît dans Firebase Authorized domains
- [ ] L'URL est à jour dans Vercel

---

## [7] Règles Firebase

### Déploiement
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### Vérification
- [ ] Firebase Console > Firestore > Rules
  - Voir les règles personnalisées (pas les règles par défaut)
- [ ] Firebase Console > Storage > Rules
  - Voir les règles personnalisées

---

## [8] Tests Finaux

### Test Authentification
- [ ] Aller sur l'URL de l'app
- [ ] Cliquer sur "Sign in with Google"
- [ ] La popup Google s'ouvre
- [ ] Connexion réussie

### Test Super Admin
- [ ] Aller sur `/setup-admin`
- [ ] Se connecter avec Google
- [ ] Voir "You are now a Super Admin"

### Test Firestore
- [ ] Firebase Console > Firestore > Data
- [ ] Voir la collection `users`
- [ ] Voir votre utilisateur avec `role: "super_admin"`

### Test Navigation
- [ ] Aller sur `/account`
- [ ] Voir votre profil
- [ ] Aller sur `/admin/users`
- [ ] Voir la liste des utilisateurs

### Test Console
- [ ] Ouvrir DevTools (F12)
- [ ] Console > Pas d'erreurs rouges
- [ ] Network > Pas d'erreurs 500

---

## ✅ Déploiement Réussi!

### Résumé
```
✅ Code sur GitHub
✅ Application sur Vercel
✅ Firebase configuré
✅ Règles de sécurité actives
✅ Authentification fonctionnelle
✅ Super admin créé
✅ Déploiements automatiques activés
```

### 🎉 Félicitations!

Votre application est maintenant en production!

---

## 📊 Métriques de Succès

| Critère | Statut |
|---------|--------|
| Build Vercel | ✅ |
| Temps de chargement | < 2s |
| Authentification | ✅ |
| Firestore | ✅ |
| Storage | ✅ |
| Console sans erreurs | ✅ |

---

## 🚀 Prochaines Étapes

1. **Inviter des utilisateurs**
   - Admin > Users > Invite User

2. **Configurer le branding**
   - Personnaliser les couleurs
   - Ajouter le logo de l'agence

3. **Créer des clients**
   - Commencer à utiliser le CRM

4. **Créer des plans média**
   - Utiliser le module Media Planning

---

## 📞 Support

**Documentation**:
- `GUIDE_RAPIDE_SETUP.md` - Guide simplifié
- `SETUP_GITHUB_VERCEL.md` - Guide détaillé
- `DEPLOYMENT_GUIDE.md` - Guide complet

**Logs**:
- Vercel: Dashboard > Deployments > Function Logs
- Firebase: Console > Firestore > Usage

---

**Date de déploiement**: ___________  
**URL Production**: ___________  
**Déployé par**: ___________
