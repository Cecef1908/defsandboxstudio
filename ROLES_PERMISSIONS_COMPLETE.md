# 🔐 SYSTÈME COMPLET DE RÔLES & PERMISSIONS

## ✅ TOUT EST OPÉRATIONNEL !

### **1. Page Gestion des Rôles** ✅
**URL :** `/admin/roles`

**Fonctionnalités :**
- ✅ **Visualisation de tous les rôles** avec leurs permissions
- ✅ **Invitation d'utilisateurs Gmail** directement
- ✅ **Liste des invitations en attente**
- ✅ **Suppression d'invitations**
- ✅ **Expiration automatique** (7 jours)

### **2. Système d'Invitation Gmail** ✅
**Comment ça marche :**
1. Admin va sur `/admin/roles`
2. Clique sur "Inviter un utilisateur"
3. Entre l'email Gmail de la personne
4. Sélectionne le rôle
5. ✅ L'invitation est créée

**Quand la personne se connecte :**
1. Elle clique sur "Continuer avec Google"
2. Le système vérifie si elle a une invitation
3. ✅ Son rôle est automatiquement assigné
4. ✅ L'invitation est marquée comme acceptée

### **3. Layer de Contrôle des Permissions** ✅
**Fichier :** `lib/permissions/middleware.ts`

**Fonctions disponibles :**
- `canAccessModule(user, module)` - Vérifier l'accès à un module
- `canPerformAction(user, module, action)` - Vérifier une action
- `isAdmin(user)` - Vérifier si admin
- `isSuperAdmin(user)` - Vérifier si super admin
- `filterByPermission(items, getPermission)` - Filtrer selon permissions

---

## 🎯 UTILISATION

### **Inviter un utilisateur**

```typescript
// 1. Admin va sur /admin/roles
// 2. Clique "Inviter un utilisateur"
// 3. Entre: utilisateur@gmail.com
// 4. Sélectionne: "Manager" (par exemple)
// 5. Clique "Envoyer l'invitation"
```

**Résultat :**
- ✅ Invitation créée dans Firestore
- ✅ Expire dans 7 jours
- ✅ Quand l'utilisateur se connecte avec Google, il aura le rôle "Manager"

### **Contrôler les permissions dans un composant**

```typescript
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { canPerformAction } from '@/lib/permissions/middleware';

export default function MyComponent() {
  const { user } = useAuth();
  
  // Vérifier si l'utilisateur peut créer
  const canCreate = canPerformAction(user, 'studio', 'create');
  
  if (!canCreate.allowed) {
    return <div>Accès refusé: {canCreate.reason}</div>;
  }
  
  return (
    <button onClick={handleCreate}>
      Créer un plan média
    </button>
  );
}
```

### **Protéger une route**

```typescript
// app/admin/settings/page.tsx
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { canAccessModule } from '@/lib/permissions/middleware';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && user) {
      const access = canAccessModule(user, 'admin');
      if (!access.allowed) {
        router.push('/');
      }
    }
  }, [user, loading, router]);
  
  // ... rest of component
}
```

---

## 📊 FLUX COMPLET

### **Scénario : Inviter un nouveau collaborateur**

**1. Admin invite**
```
Admin → /admin/roles → "Inviter" → email + rôle → Créer
```

**2. Invitation créée**
```
Firestore: invitations/
{
  email: "nouveau@gmail.com",
  role: "media_buyer",
  status: "pending",
  expires_at: "2025-12-14",
  invited_by: "admin_id"
}
```

**3. Collaborateur se connecte**
```
/login → "Continuer avec Google" → Sélectionne compte Gmail
```

**4. Système vérifie**
```typescript
// Dans auth.service.ts
const invitedRole = await checkAndAcceptInvitation(user.email);
// → Trouve l'invitation
// → Retourne "media_buyer"
```

**5. Compte créé avec le bon rôle**
```
Firestore: users/
{
  email: "nouveau@gmail.com",
  role: "media_buyer",  // ✅ Rôle de l'invitation
  status: "active"
}
```

**6. Invitation marquée acceptée**
```
Firestore: invitations/
{
  status: "accepted"  // ✅ Mise à jour
}
```

---

## 🔒 SÉCURITÉ

### **Vérifications automatiques**
- ✅ Email déjà utilisé → Erreur
- ✅ Invitation déjà existante → Erreur
- ✅ Invitation expirée → Ignorée
- ✅ Compte inactif → Accès refusé
- ✅ Permission manquante → Accès refusé

### **Logs de sécurité**
```typescript
// Tentatives d'accès non autorisées sont loggées
logUnauthorizedAccess(user, 'admin', 'delete', 'client_123');
// → Console warning + TODO: Firestore activity_logs
```

---

## 🎨 INTERFACE

### **Page /admin/roles**

**Section 1 : Rôles disponibles**
- Grid de cartes avec tous les rôles
- Permissions affichées par module
- Couleurs par rôle

**Section 2 : Invitations en attente**
- Tableau avec email, rôle, invité par, expiration
- Bouton supprimer par invitation
- Badge de statut

**Bouton "Inviter un utilisateur"**
- Modal avec formulaire
- Sélection du rôle (cartes cliquables)
- Validation email Gmail

---

## 📝 COLLECTIONS FIRESTORE

### **invitations**
```typescript
{
  id: string,
  email: string,
  role: UserRole,
  invited_by: string,
  invited_by_name: string,
  status: 'pending' | 'accepted' | 'expired',
  expires_at: string,
  created_at: Timestamp
}
```

### **users** (avec invitation)
```typescript
{
  id: string,
  email: string,
  role: UserRole,  // ← Assigné depuis l'invitation
  status: 'active',
  // ... autres champs
}
```

---

## ✨ FONCTIONNALITÉS AVANCÉES

### **Expiration automatique**
- Invitations expirent après 7 jours
- Vérification automatique lors de la connexion
- Statut mis à jour en "expired"

### **Protection contre les doublons**
- Impossible d'inviter un email déjà utilisé
- Impossible de créer 2 invitations pour le même email

### **Rôle par défaut**
- Si pas d'invitation : `analyst` (lecture seule)
- Si invitation : rôle de l'invitation

---

## 🚀 PROCHAINES ÉTAPES

### **Améliorations possibles**
1. **Email de notification** - Envoyer un email lors de l'invitation
2. **Lien d'invitation** - Générer un lien unique
3. **Logs d'activité** - Enregistrer dans Firestore
4. **Gestion des équipes** - Assigner des utilisateurs à des équipes
5. **Permissions personnalisées** - Overrides par utilisateur

---

**SYSTÈME COMPLET ET OPÉRATIONNEL !** 🎉

**Teste maintenant :**
1. Va sur `/admin/roles`
2. Clique "Inviter un utilisateur"
3. Entre un email Gmail
4. Sélectionne un rôle
5. Envoie l'invitation
6. Demande à la personne de se connecter avec Google
7. ✅ Son rôle sera automatiquement assigné !
