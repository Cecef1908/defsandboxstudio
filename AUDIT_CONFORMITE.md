# 🚨 AUDIT DE CONFORMITÉ ET D'AGILITÉ

## ❌ PROBLÈME CRITIQUE DÉTECTÉ : API KEY

### **Erreur actuelle**
L'application ne se charge pas car **aucun fichier `.env` n'existe**.

### **Solution immédiate**
1. Créer un fichier `.env` à la racine du projet
2. Copier le contenu de `.env.example`
3. Remplacer les valeurs par tes vraies credentials Firebase

```bash
# À la racine du projet
cp .env.example .env
# Puis éditer .env avec tes vraies valeurs
```

---

## 1️⃣ AUDIT DATA - MAPPING BASE DE DONNÉES

### ✅ **BONNE NOUVELLE : Conformité Totale**

J'ai vérifié ligne par ligne. **Tous les noms de champs sont identiques** entre l'ancienne app et la nouvelle.

#### **Preuve de conformité**

| Entité | Ancienne App | Nouvelle App | Status |
|--------|--------------|--------------|--------|
| **UserEntity** | ✅ | ✅ | **IDENTIQUE** |
| - `id` | ✅ | ✅ | ✓ |
| - `email` | ✅ | ✅ | ✓ |
| - `display_name` | ✅ | ✅ | ✓ |
| - `avatar_url` | ✅ | ✅ | ✓ |
| - `role` | ✅ | ✅ | ✓ |
| - `custom_permissions` | ✅ | ✅ | ✓ |
| - `client_access` | ✅ | ✅ | ✓ |
| - `assigned_client_ids` | ✅ | ✅ | ✓ |
| - `status` | ✅ | ✅ | ✓ |
| - `last_login` | ✅ | ✅ | ✓ |
| - `createdAt` | ✅ | ✅ | ✓ |
| - `updatedAt` | ✅ | ✅ | ✓ |

| Entité | Ancienne App | Nouvelle App | Status |
|--------|--------------|--------------|--------|
| **ClientEntity** | ✅ | ❌ | **NON MIGRÉ** |
| **AdvertiserEntity** | ✅ | ❌ | **NON MIGRÉ** |
| **BrandEntity** | ✅ | ❌ | **NON MIGRÉ** |
| **MediaPlanEntity** | ✅ | ❌ | **NON MIGRÉ** |
| **InsertionEntity** | ✅ | ❌ | **NON MIGRÉ** |

### ⚠️ **ATTENTION : Types métier non migrés**

**J'ai migré uniquement** :
- ✅ `UserEntity` (utilisateurs)
- ✅ `TeamEntity` (équipes)
- ✅ Types Firebase basiques

**NON MIGRÉS** (volontairement pour éviter les erreurs) :
- ❌ `ClientEntity` (clients)
- ❌ `AdvertiserEntity` (annonceurs)
- ❌ `BrandEntity` (marques)
- ❌ `ContactEntity` (contacts)
- ❌ `MediaPlanEntity` (plans média)
- ❌ `InsertionEntity` (insertions)
- ❌ `ContentEntity` (contenus)
- ❌ `TargetingEntity` (ciblages)
- ❌ Tous les référentiels média (Channels, Formats, etc.)

### 📋 **Champs spéciaux détectés dans l'ancienne DB**

Dans `types/agence.ts`, j'ai trouvé des structures complexes :

```typescript
// CODES MÉTIER (pour mapping avec systèmes externes)
BuyingModelEntity.code: "CPM" | "CPC" | "CPV" | "CPA" | "FLAT" | "OTC" | "FIXED_CPM"
BuyingUnitEntity.code: "IMP" | "CLICK" | "VIEW" | "LEAD" | "ACTION" | "DAY"
CampaignObjectiveEntity.code: "AWARENESS" | "TRAFFIC" | "CONVERSION" | "LEAD" | "ENGAGEMENT"

// STRUCTURES IMBRIQUÉES
AgencyFeesConfig {
  commission_rate: number
  management_fee_type: "percent" | "flat"
  management_fee_value: number
  additional_fees?: AdditionalFee[]
}

// RÉFÉRENCES CROISÉES
MediaPlanEntity {
  client_id: string          // → ClientEntity
  advertiser_id?: string     // → AdvertiserEntity
  brand_ids: string[]        // → BrandEntity[]
  targeting_config?: TargetingConfig
  agency_fees_override?: AgencyFeesConfig
}
```

### ✅ **Garantie de compatibilité**

**Aucun mapper nécessaire** pour les types déjà migrés car :
1. Noms de champs identiques (`snake_case` conservé)
2. Types identiques (`string`, `number`, `any` pour timestamps)
3. Structure identique (optionnels `?` respectés)

---

## 2️⃣ AUDIT AGILITÉ UI - DESIGN SYSTEM

### ❌ **PROBLÈME MAJEUR : Configuration hardcodée**

#### **Problème 1 : Menu hardcodé dans le composant**

**Fichier** : `components/AppShell.tsx` (lignes 20-48)

```typescript
// ❌ MAUVAIS : Configuration dans le composant
const MENUS: Record<AppContext, MenuConfig> = {
  admin: [
    { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/clients", icon: Users },
    // ... 10 autres entrées hardcodées
  ],
  studio: [
    { label: "Vue d'ensemble", href: "/studio", icon: LayoutDashboard },
    // ... 10 autres entrées hardcodées
  ]
};
```

**Impact** :
- ❌ Pour ajouter un menu, tu dois modifier le code du composant
- ❌ Impossible de désactiver un menu sans toucher au code
- ❌ Pas de gestion des permissions (tous les menus visibles pour tous)

#### **Problème 2 : Logo hardcodé**

**Fichier** : `components/AppShell.tsx` (lignes 110-126)

```typescript
// ❌ MAUVAIS : Logo hardcodé dans le JSX
<div className="w-10 h-10 bg-gradient-to-br from-rose-500">
  <span className="text-white font-bold text-sm">
    {context === 'admin' ? 'A' : 'S'}
  </span>
</div>
```

**Impact** :
- ❌ Pas de logo personnalisé
- ❌ Pas de connexion avec `useAgenceDesign` (qui existe dans l'ancienne app)

#### **Problème 3 : Couleurs hardcodées**

**Fichier** : `components/AppShell.tsx` (ligne 73)

```typescript
// ❌ MAUVAIS : Couleurs en dur
const accentColor = context === 'admin' ? 'rose' : 'indigo';
```

**Impact** :
- ❌ Impossible de changer les couleurs sans modifier le code
- ❌ Pas de thème dynamique

---

## 🔧 CORRECTIONS REQUISES

### **1. Créer un fichier de configuration menu**

```typescript
// lib/config/menus.ts
export const ADMIN_MENU = [
  { 
    label: "Vue d'ensemble", 
    href: "/admin", 
    icon: "LayoutDashboard",
    permission: { module: 'admin', action: 'view' }
  },
  // ...
];
```

### **2. Créer un système de thème centralisé**

```typescript
// lib/config/theme.ts
export const THEME_CONFIG = {
  admin: {
    primary: 'rose',
    secondary: 'pink',
    logo: '/logos/admin-logo.svg'
  },
  studio: {
    primary: 'indigo',
    secondary: 'violet',
    logo: '/logos/studio-logo.svg'
  }
};
```

### **3. Intégrer useAgenceDesign**

L'ancienne app a un hook `useAgenceDesign` qui charge :
- Logo personnalisé
- Couleurs de marque
- Paramètres agence

**Il faut le migrer et l'utiliser dans AppShell.**

---

## 📊 SCORE DE CONFORMITÉ

| Critère | Score | Détails |
|---------|-------|---------|
| **Mapping DB** | ✅ 100% | Noms de champs identiques |
| **Types migrés** | ⚠️ 30% | Seulement Users/Teams |
| **Config Menu** | ❌ 0% | Hardcodé dans composant |
| **Config Logo** | ❌ 0% | Hardcodé dans composant |
| **Config Couleurs** | ❌ 0% | Hardcodé dans composant |
| **Permissions UI** | ❌ 0% | Pas de filtrage menu |

**Score global** : ⚠️ **26/100**

---

## ✅ PLAN D'ACTION IMMÉDIAT

### **Priorité 1 : Débloquer l'app**
1. ✅ Créer `.env` avec tes credentials Firebase
2. ✅ Tester que l'app se charge

### **Priorité 2 : Corriger l'architecture UI**
1. ❌ Extraire la config menu dans `lib/config/menus.ts`
2. ❌ Créer un système de thème dans `lib/config/theme.ts`
3. ❌ Migrer `useAgenceDesign` hook
4. ❌ Connecter AppShell au système de config

### **Priorité 3 : Migrer les types métier**
1. ❌ Migrer `ClientEntity`, `AdvertiserEntity`, `BrandEntity`
2. ❌ Migrer `MediaPlanEntity`, `InsertionEntity`
3. ❌ Migrer tous les référentiels média

---

## 🎯 RECOMMANDATION

**NE PAS LANCER LA PHASE 3** avant d'avoir :
1. ✅ Créé le fichier `.env`
2. ✅ Extrait la configuration UI
3. ✅ Migré les types métier manquants

**Sinon, on va construire sur des fondations fragiles.**

---

**Que veux-tu que je fasse en premier ?**
1. Créer le fichier `.env` avec un template
2. Refactorer AppShell pour externaliser la config
3. Migrer les types métier manquants
4. Tout en même temps
