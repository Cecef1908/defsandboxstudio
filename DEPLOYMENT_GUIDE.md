# 🚀 Guide de Déploiement Rapide

## ✅ État de Préparation: **PRÊT À DÉPLOYER**

L'application est prête pour un déploiement rapide sur Vercel, Netlify ou toute plateforme supportant Next.js 15.

---

## 🎯 Options de Déploiement (du plus rapide au plus flexible)

### Option 1: Vercel (⚡ 5 minutes) - **RECOMMANDÉ**

**Pourquoi Vercel?**
- Créé par l'équipe Next.js
- Déploiement en 1 clic
- Support natif Next.js 15
- SSL automatique
- CDN global
- Preview deployments automatiques

#### Étapes:

1. **Créer un compte Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub

2. **Importer le projet**
   ```bash
   # Depuis le dashboard Vercel:
   # New Project > Import Git Repository > Sélectionner le repo
   ```

3. **Configurer les variables d'environnement**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   
   FIREBASE_ADMIN_PROJECT_ID=...
   FIREBASE_ADMIN_CLIENT_EMAIL=...
   FIREBASE_ADMIN_PRIVATE_KEY=...
   
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
   ```

4. **Déployer**
   - Cliquer sur "Deploy"
   - ✅ Déploiement automatique en ~2 minutes

5. **Configuration post-déploiement**
   - Ajouter le domaine Vercel dans Firebase Console > Authentication > Authorized domains
   - Mettre à jour `NEXT_PUBLIC_APP_URL` avec l'URL finale

---

### Option 2: Netlify (⚡ 10 minutes)

#### Étapes:

1. **Créer un compte Netlify**
   - Aller sur [netlify.com](https://netlify.com)

2. **Créer un fichier `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Importer le projet**
   - New site from Git > Sélectionner le repo

4. **Configurer les variables d'environnement**
   - Site settings > Environment variables
   - Ajouter toutes les variables Firebase

5. **Déployer**
   - Deploy site

---

### Option 3: Docker + Cloud Run / AWS / Azure (⚡ 30 minutes)

#### Créer un Dockerfile:

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Modifier `next.config.js`:

```javascript
const nextConfig = {
  // ... config existante
  output: 'standalone', // Ajouter cette ligne
};
```

#### Déployer sur Google Cloud Run:

```bash
# Build l'image
docker build -t agence-hub .

# Tag pour GCR
docker tag agence-hub gcr.io/[PROJECT-ID]/agence-hub

# Push
docker push gcr.io/[PROJECT-ID]/agence-hub

# Deploy
gcloud run deploy agence-hub \
  --image gcr.io/[PROJECT-ID]/agence-hub \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## 📋 Checklist Pré-Déploiement

### ✅ Configuration
- [x] Next.js 15 configuré
- [x] Variables d'environnement documentées (`.env.example`)
- [x] `.gitignore` configuré
- [x] Firebase configuré (client + admin)
- [x] TypeScript sans erreurs critiques

### ✅ Sécurité
- [x] Variables sensibles dans `.env` (non commitées)
- [x] Authentification fonctionnelle
- [x] Système de permissions en place
- [ ] ⚠️ Règles de sécurité Firestore à définir (voir ci-dessous)

### ✅ Performance
- [x] Images optimisées (Next.js Image)
- [x] Server Components utilisés
- [x] Singleton Firebase
- [ ] ⚠️ Ajouter React Query pour cache (optionnel)

### ✅ Monitoring
- [ ] ⚠️ Configurer Sentry (optionnel)
- [ ] ⚠️ Configurer Firebase Analytics (optionnel)

---

## 🔒 Règles de Sécurité Firestore (IMPORTANT)

**À configurer AVANT le déploiement en production:**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isSuperAdmin();
    }
    
    // Clients collection
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Advertisers collection
    match /advertisers/{advertiserId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Brands collection
    match /brands/{brandId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Contacts collection
    match /contacts/{contactId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Media Plans collection
    match /media-plans/{planId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Insertions collection
    match /insertions/{insertionId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Reference collections (read-only for non-admins)
    match /ref_{collection}/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Agency settings (super admin only)
    match /agenceSettings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // Activity logs (read-only)
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
  }
}
```

**Déployer les règles:**
```bash
firebase deploy --only firestore:rules
```

---

## 🔒 Règles de Sécurité Storage

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isValidImage() {
      return request.resource.size < 2 * 1024 * 1024 && // 2MB max
             request.resource.contentType.matches('image/.*');
    }
    
    function isValidFile() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    // Avatars
    match /avatars/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                     request.auth.uid == userId && 
                     isValidImage();
    }
    
    // Contents (media plans)
    match /contents/{planId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidFile();
    }
    
    // Agency assets
    match /agency_assets/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // À restreindre selon les besoins
    }
  }
}
```

**Déployer les règles:**
```bash
firebase deploy --only storage:rules
```

---

## 🌍 Configuration DNS (Domaine Personnalisé)

### Sur Vercel:
1. Settings > Domains
2. Ajouter votre domaine
3. Configurer les DNS chez votre registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Sur Netlify:
1. Domain settings > Add custom domain
2. Configurer les DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

---

## 📊 Monitoring Post-Déploiement

### 1. Firebase Console
- Surveiller l'authentification
- Vérifier les lectures/écritures Firestore
- Monitorer le storage

### 2. Vercel Analytics (si Vercel)
- Activer dans Settings > Analytics
- Gratuit pour les projets hobby

### 3. Sentry (Optionnel)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🚨 Troubleshooting

### Erreur: "Firebase not initialized"
- Vérifier que toutes les variables d'environnement sont définies
- Redéployer après modification des variables

### Erreur: "Permission denied" Firestore
- Vérifier les règles de sécurité Firestore
- S'assurer que l'utilisateur est authentifié

### Erreur: Build failed
```bash
# Tester localement
npm run build

# Vérifier les erreurs TypeScript
npm run type-check
```

### Images ne s'affichent pas
- Vérifier `next.config.js` > `images.remotePatterns`
- Ajouter le domaine Firebase Storage

---

## 📈 Optimisations Post-Déploiement

### 1. Activer le cache CDN
- Vercel le fait automatiquement
- Pour autres plateformes, configurer les headers:
  ```javascript
  // next.config.js
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  }
  ```

### 2. Activer la compression
```javascript
// next.config.js
compress: true,
```

### 3. Configurer les redirections
```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/',
      destination: '/login',
      permanent: false,
      has: [
        {
          type: 'cookie',
          key: 'user',
          value: undefined,
        },
      ],
    },
  ];
}
```

---

## 🎉 Déploiement Réussi!

### Prochaines étapes:
1. ✅ Tester l'authentification
2. ✅ Créer le premier super admin via `/setup-admin`
3. ✅ Inviter les utilisateurs
4. ✅ Configurer le branding de l'agence
5. ✅ Commencer à créer des plans média

### URLs importantes:
- **App**: https://votre-app.vercel.app
- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📞 Support

- **Documentation**: Voir `SCALING_BEST_PRACTICES.md`
- **Audit**: Voir `AUDIT_FINAL.md`
- **Templates**: Voir `templates/README.md`

---

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024  
**Temps de déploiement estimé**: 5-30 minutes selon la plateforme
