# 🔄 Configuration GitHub + Vercel - Nouveau Projet

## 🎯 Objectif
Connecter proprement le projet au nouveau repository GitHub et Vercel.

**Nouveau Repository**: https://github.com/Cecef1908/defsandboxstudio

---

## 📝 Étape 1: Configuration Git Locale

### 1.1 Vérifier l'état actuel
```bash
cd c:\Users\Pc\Documents\sandbox-studio2025
git status
git remote -v
```

### 1.2 Supprimer l'ancien remote (si existant)
```bash
git remote remove origin
```

### 1.3 Ajouter le nouveau remote
```bash
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git
```

### 1.4 Vérifier la connexion
```bash
git remote -v
```

**Résultat attendu:**
```
origin  https://github.com/Cecef1908/defsandboxstudio.git (fetch)
origin  https://github.com/Cecef1908/defsandboxstudio.git (push)
```

---

## 📤 Étape 2: Premier Push vers GitHub

### 2.1 Vérifier les fichiers à commiter
```bash
git status
```

### 2.2 Ajouter tous les fichiers
```bash
git add .
```

### 2.3 Créer le commit initial
```bash
git commit -m "Initial commit - Agence Hub v2.0

✨ Features:
- Next.js 15 avec App Router
- Firebase (Auth + Firestore + Storage)
- Système d'authentification complet (Google OAuth + Email/Password)
- Gestion des permissions et rôles
- Services CRUD pour Users, Clients, Invitations
- Templates réutilisables pour nouveaux modules
- Documentation complète (Scaling, Deployment, Audit)
- Règles de sécurité Firestore et Storage
- Configuration Vercel prête

📚 Documentation:
- QUICK_START.md - Déploiement en 5 minutes
- DEPLOYMENT_GUIDE.md - Guide complet
- SCALING_BEST_PRACTICES.md - Bonnes pratiques
- AUDIT_FINAL.md - État du projet

🔒 Sécurité:
- Authentification Firebase
- Système de permissions par rôle
- Règles Firestore et Storage configurées

⚡ Production Ready
"
```

### 2.4 Configurer la branche principale
```bash
git branch -M main
```

### 2.5 Push vers GitHub
```bash
git push -u origin main
```

**💡 Si demande d'authentification:**
- Utiliser un Personal Access Token (PAT) au lieu du mot de passe
- Créer un PAT: GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token
- Sélectionner scope: `repo` (Full control of private repositories)

---

## 🚀 Étape 3: Configuration Vercel

### 3.1 Aller sur Vercel
👉 https://vercel.com/dashboard

### 3.2 Créer un nouveau projet
1. Cliquer sur **"Add New..."** > **"Project"**
2. Sélectionner **"Import Git Repository"**
3. Chercher: `Cecef1908/defsandboxstudio`
4. Cliquer sur **"Import"**

### 3.3 Configuration du projet

#### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `./` (laisser par défaut)
- **Build Command**: `npm run build` (automatique)
- **Output Directory**: `.next` (automatique)

#### Variables d'Environnement

**⚠️ IMPORTANT**: Copier-coller ces variables dans Vercel

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key_ici
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Firebase Admin (Server-side - SENSIBLE)
FIREBASE_ADMIN_PROJECT_ID=votre_projet_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre_projet.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre_Clé_Privée_Complète\n-----END PRIVATE KEY-----\n"

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**💡 Où trouver ces valeurs?**

1. **Firebase Console** > ⚙️ **Project Settings** > **General**
   - Copier les valeurs de "Your apps" > "SDK setup and configuration"

2. **Firebase Console** > ⚙️ **Project Settings** > **Service Accounts**
   - Cliquer sur "Generate new private key"
   - Télécharger le fichier JSON
   - Extraire les valeurs:
     - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
     - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

**⚠️ ATTENTION pour PRIVATE_KEY:**
- Garder les `\n` dans la clé
- Entourer de guillemets doubles
- Format: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

### 3.4 Déployer
Cliquer sur **"Deploy"**

**⏱️ Temps de build: ~2-3 minutes**

---

## ✅ Étape 4: Vérifications Post-Déploiement

### 4.1 Vérifier le déploiement
1. Attendre la fin du build
2. Cliquer sur "Visit" pour ouvrir l'app
3. URL: `https://defsandboxstudio.vercel.app` (ou similaire)

### 4.2 Configurer Firebase
1. **Firebase Console** > **Authentication** > **Settings**
2. **Authorized domains** > **Add domain**
3. Ajouter: `defsandboxstudio.vercel.app` (votre domaine Vercel)

### 4.3 Mettre à jour l'URL dans Vercel
1. **Vercel Dashboard** > Votre projet > **Settings** > **Environment Variables**
2. Modifier `NEXT_PUBLIC_APP_URL` avec l'URL finale
3. **Redeploy** (Deployments > ⋯ > Redeploy)

### 4.4 Déployer les règles Firebase
```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser (si pas déjà fait)
firebase init

# Sélectionner:
# - Firestore
# - Storage
# - Utiliser les fichiers existants (firestore.rules, storage.rules)

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### 4.5 Tester l'application
1. Aller sur votre URL Vercel
2. Tester la connexion Google OAuth
3. Aller sur `/setup-admin` pour devenir super admin
4. Vérifier que tout fonctionne

---

## 🔧 Résolution des Problèmes Courants

### ❌ Erreur: "Permission denied" lors du push
**Solution**: Utiliser un Personal Access Token

```bash
# Configurer le token
git remote set-url origin https://VOTRE_TOKEN@github.com/Cecef1908/defsandboxstudio.git

# Ou utiliser GitHub CLI
gh auth login
```

### ❌ Erreur: "Firebase not initialized" sur Vercel
**Solution**: Vérifier les variables d'environnement

1. Vercel Dashboard > Settings > Environment Variables
2. Vérifier que toutes les variables sont présentes
3. Vérifier qu'il n'y a pas d'espaces ou de caractères invisibles
4. Redéployer

### ❌ Erreur: Build failed sur Vercel
**Solution**: Tester localement d'abord

```bash
# Nettoyer
rm -rf .next node_modules

# Réinstaller
npm install

# Tester le build
npm run build

# Si ça marche localement, push et redeploy
git add .
git commit -m "Fix build"
git push
```

### ❌ Erreur: "Invalid PRIVATE_KEY" sur Vercel
**Solution**: Format de la clé privée

La clé doit être sur une seule ligne avec `\n`:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

**Astuce**: Utiliser un éditeur de texte pour remplacer les retours à la ligne réels par `\n`

### ❌ Erreur: "Authentication failed" Google OAuth
**Solution**: Domaine non autorisé

1. Firebase Console > Authentication > Settings > Authorized domains
2. Ajouter le domaine Vercel
3. Attendre 1-2 minutes pour la propagation

---

## 📋 Checklist Complète

### Configuration Git
- [ ] Ancien remote supprimé
- [ ] Nouveau remote ajouté
- [ ] Code commité
- [ ] Push réussi vers GitHub

### Configuration Vercel
- [ ] Projet créé sur Vercel
- [ ] Repository GitHub connecté
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi

### Configuration Firebase
- [ ] Domaine Vercel ajouté dans Authorized domains
- [ ] Règles Firestore déployées
- [ ] Règles Storage déployées

### Tests
- [ ] Application accessible
- [ ] Connexion Google fonctionne
- [ ] Super admin créé via `/setup-admin`
- [ ] Pas d'erreurs dans la console

---

## 🎯 Commandes Récapitulatives

```bash
# 1. Configuration Git
git remote remove origin
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git
git add .
git commit -m "Initial commit - Agence Hub v2.0"
git branch -M main
git push -u origin main

# 2. Déploiement Firebase Rules
firebase login
firebase deploy --only firestore:rules,storage:rules

# 3. Test local (optionnel)
npm run build
npm start
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier les logs Vercel**: Dashboard > Deployments > Cliquer sur le déploiement > Function Logs
2. **Vérifier les logs Firebase**: Firebase Console > Firestore > Usage
3. **Tester localement**: `npm run build && npm start`

---

## 🎉 Succès!

Une fois toutes les étapes complétées:

✅ Code sur GitHub  
✅ Application déployée sur Vercel  
✅ Firebase configuré  
✅ Règles de sécurité actives  
✅ Déploiements automatiques configurés  

**Chaque push sur `main` déclenchera un déploiement automatique!**

---

**Prochaine étape**: Tester l'application et créer votre premier super admin! 🚀
