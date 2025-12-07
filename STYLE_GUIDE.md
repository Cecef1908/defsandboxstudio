# 📐 GUIDE DE STYLE - RÈGLES OBLIGATOIRES

## ✍️ RÈGLE #1 : SENTENCE CASE (MAJUSCULES)

### ❌ INTERDIT

```tsx
// MAUVAIS - Title Case (anglo-saxon)
<h1>Gestion Des Utilisateurs</h1>
<th className="uppercase">EMAIL</th>
<button>Créer Un Client</button>

// MAUVAIS - ALL CAPS
<span>NOUVEAU</span>
<div className="uppercase">Actions</div>
```

### ✅ OBLIGATOIRE

```tsx
// BON - Sentence case (français)
<h1>Gestion des utilisateurs</h1>
<th>Email</th>
<button>Créer un client</button>
<span>Nouveau</span>
```

### 📋 RÈGLES PRÉCISES

1. **Majuscule UNIQUEMENT** au début de la phrase
2. **Pas de `uppercase` en CSS** (sauf cas exceptionnels)
3. **Pas de `tracking-wider`** avec uppercase
4. **Titres de cartes** : Sentence case
5. **En-têtes de tableau** : Sentence case
6. **Boutons** : Sentence case
7. **Labels de formulaire** : Sentence case

### 🎯 EXCEPTIONS

**Acronymes et sigles :**
```tsx
✅ <span>CRM</span>
✅ <span>API</span>
✅ <span>URL</span>
✅ <span>SEO</span>
```

**Noms propres :**
```tsx
✅ <span>Google</span>
✅ <span>Firebase</span>
✅ <span>Next.js</span>
```

---

## 🎨 RÈGLE #2 : DESIGN COHÉRENT

### Couleurs par module

```tsx
// Admin
className="text-indigo-400"

// Media
className="text-violet-400"

// Social
className="text-pink-400"
```

### Glassmorphism

```tsx
// Toujours utiliser backdrop-blur
className="bg-slate-900/50 backdrop-blur-sm border border-slate-800"
```

### Animations

```tsx
// Transitions fluides
className="transition-all duration-300"
className="hover:scale-[1.02]"
```

---

## 📝 RÈGLE #3 : COPYWRITING FRANÇAIS

### Formulations

```tsx
// ✅ BON
"Créer un nouveau client"
"Modifier le rôle"
"Supprimer l'utilisateur"
"Envoyer l'invitation"

// ❌ MAUVAIS
"Créer Un Nouveau Client"
"MODIFIER LE RÔLE"
"Supprimer L'Utilisateur"
```

### Ponctuation

```tsx
// ✅ BON
"Êtes-vous sûr ?"
"L'utilisateur a été supprimé"
"Impossible de charger les données"

// ❌ MAUVAIS
"Etes-vous sur ?"  // Manque accents
"L'utilisateur à été supprimé"  // Mauvais accent
```

---

## 🔧 RÈGLE #4 : COMPOSANTS RÉUTILISABLES

### Toujours utiliser les composants UI

```tsx
// ✅ BON
import { useToast, Modal, ConfirmDialog } from '@/components/ui';

toast.success('Enregistré', 'Le client a été créé');

// ❌ MAUVAIS
alert('Client créé'); // Pas de alert() natif
```

### Skeleton pour le chargement

```tsx
// ✅ BON
if (isLoading) {
  return <SkeletonTable rows={5} />;
}

// ❌ MAUVAIS
if (isLoading) {
  return <div>Chargement...</div>;
}
```

---

## 🔐 RÈGLE #5 : SÉCURITÉ & PERMISSIONS

### Toujours vérifier les permissions

```tsx
// ✅ BON
import { canPerformAction } from '@/lib/permissions/middleware';

const canCreate = canPerformAction(user, 'admin', 'create');
if (!canCreate.allowed) {
  return <AccessDenied />;
}

// ❌ MAUVAIS
if (user.role !== 'admin') { // Trop simpliste
  return <div>Accès refusé</div>;
}
```

### Validation Zod obligatoire

```tsx
// ✅ BON
import { clientSchema, validateData } from '@/lib/validation/schemas';

const result = validateData(clientSchema, formData);
if (!result.success) {
  // Afficher les erreurs
}

// ❌ MAUVAIS
if (!formData.name) { // Validation manuelle
  setError('Nom requis');
}
```

---

## 📊 RÈGLE #6 : TYPES & DONNÉES

### Types stricts partout

```tsx
// ✅ BON
const [users, setUsers] = useState<UserEntity[]>([]);

function handleUpdate(userId: string, data: Partial<UserEntity>) {
  // ...
}

// ❌ MAUVAIS
const [users, setUsers] = useState([]); // any[]
function handleUpdate(userId, data) { // any
  // ...
}
```

### Pas de any

```tsx
// ✅ BON
catch (error: unknown) {
  const err = error as Error;
  console.error(err.message);
}

// ❌ MAUVAIS
catch (error: any) { // Éviter any
  console.error(error);
}
```

---

## 🌍 RÈGLE #7 : MULTILINGUE (Futur)

### Préparer pour i18n

```tsx
// ✅ BON (quand i18n sera activé)
import { useTranslations } from '@/lib/i18n';
const t = useTranslations();

<h1>{t.admin.users.title}</h1>

// ❌ MAUVAIS
<h1>Gestion des utilisateurs</h1> // Hardcodé
```

**Note :** Pour l'instant, les textes sont en dur en français, mais la structure i18n est prête.

---

## ✅ CHECKLIST AVANT COMMIT

Avant de commit une nouvelle page/composant, vérifier :

- [ ] **Sentence case** partout (pas de uppercase CSS)
- [ ] **Pas de Title Case** (Gestion Des Utilisateurs ❌)
- [ ] **Bouton retour à l'accueil** sur toutes les pages (ArrowLeft + Link)
- [ ] **Composants UI** utilisés (Toast, Modal, Skeleton)
- [ ] **Permissions** vérifiées
- [ ] **Types stricts** (pas de any)
- [ ] **Validation Zod** pour les formulaires
- [ ] **Glassmorphism** (backdrop-blur)
- [ ] **Transitions** fluides
- [ ] **Messages en français** avec accents corrects
- [ ] **Loading states** avec Skeleton
- [ ] **Pas de undefined** dans les updates Firestore

---

## 🏠 RÈGLE #8 : NAVIGATION

### Bouton retour obligatoire

**Toute page doit avoir un bouton retour à l'accueil**

```tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MyPage() {
  return (
    <div className="p-8">
      {/* ✅ Bouton retour OBLIGATOIRE */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span>Retour à l'accueil</span>
      </Link>

      <h1>Ma page</h1>
      {/* ... */}
    </div>
  );
}
```

### Exceptions

- Pages dans AppShell (admin/*, media/*) → Ont déjà la sidebar
- Page d'accueil (/) → Pas besoin de retour
- Page de login → Retour vers accueil si déjà connecté

---

## 🔥 RÈGLE #9 : FIRESTORE

### Jamais de undefined

**Firestore n'accepte pas `undefined` comme valeur**

```tsx
// ❌ MAUVAIS
const updates = {
  name: name,
  phone: phone || undefined,  // Erreur Firestore !
};

// ✅ BON
const updates = {
  name: name,
};

// Ajouter phone seulement si rempli
if (phone && phone.trim()) {
  updates.phone = phone;
}
```

---

## 🚀 COMMENT APPLIQUER CES RÈGLES

### 1. Lors de la création d'une page

```tsx
'use client';

import { useState } from 'react';
import { useToast, SkeletonTable } from '@/components/ui';
import { canAccessModule } from '@/lib/permissions/middleware';

export default function MyPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ Sentence case dans le titre
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Gestion des clients
      </h1>
      
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <table>
          <thead>
            <tr>
              {/* ✅ Pas de uppercase */}
              <th className="px-6 py-4 text-xs font-bold text-slate-300">
                Nom
              </th>
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
}
```

### 2. Lors de la création d'un composant

```tsx
interface MyComponentProps {
  title: string; // ✅ Type strict
  onSave: () => void;
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  const toast = useToast();
  
  const handleSave = () => {
    onSave();
    // ✅ Sentence case dans le message
    toast.success('Enregistré', 'Les modifications ont été sauvegardées');
  };
  
  return (
    <button onClick={handleSave}>
      {/* ✅ Sentence case */}
      Enregistrer les modifications
    </button>
  );
}
```

---

## 🔍 DÉTECTION AUTOMATIQUE

### ESLint Rule (À ajouter)

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='className'][value.value=/uppercase/]",
        "message": "Évitez uppercase en CSS. Utilisez Sentence case."
      }
    ]
  }
}
```

---

**CES RÈGLES SONT OBLIGATOIRES SUR TOUTES LES PAGES !**

Elles garantissent :
- ✅ Cohérence visuelle
- ✅ Élégance française
- ✅ Maintenabilité
- ✅ Qualité professionnelle
