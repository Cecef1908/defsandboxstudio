# 🚀 Agence Hub v2.0

Hub multi-modules pour planification média et administration d'agence.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-orange)](https://firebase.google.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com/Cecef1908/defsandboxstudio)

---

## ⚡ Déploiement Rapide

### 🎯 Nouveau Projet? Commencez ici!

**Repository GitHub**: https://github.com/Cecef1908/defsandboxstudio

#### Option 1: Scripts Automatiques (Windows) - **RECOMMANDÉ**
```bash
# 1. Configuration Git + Commit
Double-cliquer sur: setup-git.bat

# 2. Push vers GitHub
Double-cliquer sur: push-github.bat

# 3. Suivre le guide
Ouvrir: GUIDE_RAPIDE_SETUP.md
```

#### Option 2: Commandes Manuelles
```bash
# Configuration Git
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main

# Puis suivre: GUIDE_RAPIDE_SETUP.md
```

### 📚 Guides de Déploiement

| Guide | Description | Temps |
|-------|-------------|-------|
| **[GUIDE_RAPIDE_SETUP.md](GUIDE_RAPIDE_SETUP.md)** | 🚀 Guide simplifié en 3 étapes | 7 min |
| **[CHECKLIST_DEPLOIEMENT.md](CHECKLIST_DEPLOIEMENT.md)** | ✅ Checklist détaillée | - |
| **[SETUP_GITHUB_VERCEL.md](SETUP_GITHUB_VERCEL.md)** | 📖 Guide complet avec troubleshooting | 15 min |
| **[QUICK_START.md](QUICK_START.md)** | ⚡ Déploiement Vercel en 5 min | 5 min |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | 📚 Guide exhaustif (toutes plateformes) | 30 min |

---

## 📋 Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: TailwindCSS 3.4
- **Backend**: Firebase (Firestore + Storage + Auth)
- **Icons**: Lucide React
- **Runtime**: Node.js 18+
- **Deployment**: Vercel (recommandé)

---

## 🛠️ Installation Locale

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Puis éditer .env avec vos credentials Firebase

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
.
├── app/                # Pages et routes (App Router)
├── components/         # Composants React réutilisables
├── lib/                # Utilitaires, hooks, services
├── types/              # Définitions TypeScript
├── public/             # Assets statiques
└── _old-app/           # Ancienne application (référence)
```

## 🔥 Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez Firestore, Storage et Authentication
3. Téléchargez les credentials et remplissez `.env`
4. Configurez les règles de sécurité Firestore

## 📦 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm start` - Serveur de production
- `npm run lint` - Linter ESLint
- `npm run type-check` - Vérification TypeScript

## 🏗️ Statut de Migration

### ✅ Phase 1 : Socle (Complété)
- Configuration Next.js, TypeScript, TailwindCSS
- Structure de base créée
- Firebase configuré

### 🔄 Phase 2 : Utilitaires et Cœur (En attente)
- Migration des hooks et contexts
- Services Firebase
- Système de permissions

### ⏳ Phase 3 : Composants UI (En attente)
- Layouts et shells
- Composants de base

### ⏳ Phase 4 : Pages et Routing (En attente)
- Module Studio Media
- Module Administration

---

**Version**: 2.0.0  
**Dernière mise à jour**: Décembre 2024
