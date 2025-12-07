# 🚀 Guide Rapide - Setup GitHub + Vercel

## ⚡ 3 Étapes Simples

---

## 📝 ÉTAPE 1: Configuration Git (2 minutes)

### Option A: Avec les scripts automatiques (RECOMMANDÉ)

1. **Double-cliquer sur `setup-git.bat`**
   - Configure automatiquement Git
   - Ajoute tous les fichiers
   - Crée le commit initial

2. **Double-cliquer sur `push-github.bat`**
   - Push le code vers GitHub
   - Si demande d'authentification, voir ci-dessous

### Option B: Manuellement dans le terminal

```bash
# 1. Supprimer l'ancien remote
git remote remove origin

# 2. Ajouter le nouveau remote
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git

# 3. Vérifier
git remote -v

# 4. Ajouter les fichiers
git add .

# 5. Commit
git commit -m "Initial commit - Agence Hub v2.0"

# 6. Configurer la branche
git branch -M main

# 7. Push
git push -u origin main
```

### 🔑 Authentification GitHub

Si demandé:
- **Username**: `Cecef1908`
- **Password**: Votre **Personal Access Token** (PAT)

**Créer un PAT:**
1. Aller sur: https://github.com/settings/tokens
2. Cliquer sur "Generate new token" > "Generate new token (classic)"
3. Cocher: `repo` (Full control of private repositories)
4. Générer et copier le token
5. Utiliser ce token comme mot de passe

---

## 🚀 ÉTAPE 2: Configuration Vercel (3 minutes)

### 2.1 Créer le projet

1. **Aller sur Vercel**: https://vercel.com/new
2. **Se connecter avec GitHub** (si pas déjà fait)
3. **Import Git Repository**
4. Chercher: `Cecef1908/defsandboxstudio`
5. Cliquer sur **"Import"**

### 2.2 Configuration

**Framework Preset**: Next.js (détecté automatiquement)

**Root Directory**: `./` (laisser par défaut)

### 2.3 Variables d'Environnement ⚠️ IMPORTANT

Cliquer sur **"Environment Variables"** et ajouter:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**💡 Où trouver ces valeurs?**

#### Firebase Client (Public)
1. **Firebase Console**: https://console.firebase.google.com
2. Sélectionner votre projet
3. ⚙️ **Project Settings** > **General**
4. Descendre à "Your apps" > "SDK setup and configuration"
5. Copier les valeurs

#### Firebase Admin (Server)
1. **Firebase Console** > ⚙️ **Project Settings** > **Service Accounts**
2. Cliquer sur **"Generate new private key"**
3. Télécharger le fichier JSON
4. Ouvrir le fichier et copier:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

**⚠️ Format PRIVATE_KEY:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```
- Tout sur une ligne
- Garder les `\n`
- Entourer de guillemets doubles

### 2.4 Déployer

Cliquer sur **"Deploy"**

⏱️ **Temps de build: 2-3 minutes**

---

## ✅ ÉTAPE 3: Configuration Post-Déploiement (2 minutes)

### 3.1 Autoriser le domaine dans Firebase

1. **Firebase Console** > **Authentication** > **Settings**
2. **Authorized domains** > **Add domain**
3. Ajouter votre domaine Vercel (ex: `defsandboxstudio.vercel.app`)
4. Sauvegarder

### 3.2 Mettre à jour l'URL dans Vercel

1. **Vercel Dashboard** > Votre projet
2. **Settings** > **Environment Variables**
3. Modifier `NEXT_PUBLIC_APP_URL` avec l'URL finale
4. **Deployments** > ⋯ (menu) > **Redeploy**

### 3.3 Déployer les règles Firebase

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter
firebase login

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### 3.4 Tester l'application

1. Ouvrir votre URL Vercel
2. Tester la connexion Google
3. Aller sur `/setup-admin` pour devenir super admin

---

## 🎉 C'est Terminé!

### ✅ Checklist Finale

- [ ] Code sur GitHub
- [ ] Application déployée sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Domaine autorisé dans Firebase
- [ ] Règles Firebase déployées
- [ ] Application testée et fonctionnelle

### 🚀 Déploiements Automatiques

Maintenant, **chaque push sur `main` déclenchera un déploiement automatique!**

```bash
# Faire des modifications
git add .
git commit -m "Update feature"
git push

# ✨ Déploiement automatique sur Vercel!
```

---

## 🆘 Problèmes Courants

### ❌ "Permission denied" lors du push
**Solution**: Utiliser un Personal Access Token (voir Étape 1)

### ❌ "Firebase not initialized" sur Vercel
**Solution**: 
1. Vérifier les variables d'environnement dans Vercel
2. Vérifier qu'il n'y a pas d'espaces
3. Redéployer

### ❌ Build failed sur Vercel
**Solution**: Tester localement
```bash
npm run build
```
Si ça marche localement, le problème vient des variables d'environnement.

### ❌ "Authentication failed" Google OAuth
**Solution**: Ajouter le domaine Vercel dans Firebase Authorized domains

---

## 📞 Support

**Documentation complète**: `SETUP_GITHUB_VERCEL.md`

**Logs Vercel**: Dashboard > Deployments > Cliquer sur le déploiement > Function Logs

**Logs Firebase**: Firebase Console > Firestore > Usage

---

## 🎯 URLs Importantes

- **GitHub Repo**: https://github.com/Cecef1908/defsandboxstudio
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Votre App**: https://defsandboxstudio.vercel.app (ou votre domaine)

---

**Temps total: ~7 minutes** ⚡

Bonne chance! 🚀
