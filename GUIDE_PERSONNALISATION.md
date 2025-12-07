# 🎨 GUIDE DE PERSONNALISATION - AGENCE HUB

## ✅ MODIFIER L'APPARENCE EN UN SEUL ENDROIT

Tout est centralisé dans **`lib/config/branding.ts`**

---

## 📝 COMMENT PERSONNALISER

### 1️⃣ **CHANGER LE LOGO**

**Fichier** : `lib/config/branding.ts`

```typescript
export const BRANDING_LOGOS = {
  // Logo principal (mode sombre)
  main: '/logos/logo-dark.svg',  // ← MODIFIER ICI
  
  // Logo mode clair (optionnel)
  light: '/logos/logo-light.svg', // ← MODIFIER ICI
  
  // Icône seule (pour sidebar collapsed)
  icon: '/logos/icon.svg',        // ← MODIFIER ICI
  
  // Fallback si pas de logo
  fallback: {
    text: 'AH',                   // ← MODIFIER ICI (2 lettres max)
    showFullName: true            // ← true = affiche "Agence Hub" à côté
  }
};
```

**Où mettre les fichiers logo ?**
- Créer un dossier `public/logos/`
- Y placer tes fichiers : `logo-dark.svg`, `logo-light.svg`, `icon.svg`
- Ou utiliser des URLs absolues (ex: `https://monsite.com/logo.svg`)

---

### 2️⃣ **CHANGER LES COULEURS**

**Fichier** : `lib/config/branding.ts`

```typescript
export const BRANDING_COLORS = {
  // Module Admin
  admin: {
    primary: 'rose',      // ← CHANGER (ex: 'blue', 'green', 'purple')
    secondary: 'pink',    // ← CHANGER
    accent: 'rose',
    gradient: {
      from: 'rose-500',   // ← CHANGER (ex: 'blue-500')
      to: 'pink-600'      // ← CHANGER (ex: 'cyan-600')
    }
  },
  
  // Module Média
  media: {
    primary: 'indigo',    // ← CHANGER
    secondary: 'violet',  // ← CHANGER
    accent: 'indigo',
    gradient: {
      from: 'indigo-500', // ← CHANGER
      to: 'violet-600'    // ← CHANGER
    }
  },
  
  // Ajouter d'autres modules ici...
};
```

**Couleurs Tailwind disponibles** :
- `slate`, `gray`, `zinc`, `neutral`, `stone`
- `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`
- `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

---

### 3️⃣ **CHANGER LES POLICES**

**Fichier** : `lib/config/branding.ts`

```typescript
export const BRANDING_FONTS = {
  // Police principale
  sans: {
    name: 'Inter',        // ← CHANGER (ex: 'Roboto', 'Poppins')
    fallback: 'system-ui, -apple-system, sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    // ↑ CHANGER l'URL Google Fonts
  },
  
  // Police monospace (code, données)
  mono: {
    name: 'JetBrains Mono', // ← CHANGER (ex: 'Fira Code')
    fallback: 'Consolas, Monaco, monospace',
    googleFontsUrl: '...'   // ← CHANGER
  }
};
```

**Polices populaires** :
- Sans-serif : `Inter`, `Roboto`, `Poppins`, `Montserrat`, `Open Sans`
- Monospace : `JetBrains Mono`, `Fira Code`, `Source Code Pro`

**Où trouver l'URL Google Fonts ?**
1. Va sur [Google Fonts](https://fonts.google.com/)
2. Sélectionne ta police
3. Copie le lien `<link>` fourni

---

### 4️⃣ **CHANGER LES INFORMATIONS AGENCE**

**Fichier** : `lib/config/branding.ts`

```typescript
export const BRANDING_INFO = {
  // Nom de l'agence
  name: 'Agence Hub',     // ← CHANGER
  
  // Slogan
  tagline: 'Votre partenaire digital', // ← CHANGER
  
  // Coordonnées
  contact: {
    email: 'contact@agencehub.com',    // ← CHANGER
    phone: '+212 XXX XXX XXX',         // ← CHANGER
    address: 'Casablanca, Maroc'       // ← CHANGER
  },
  
  // Réseaux sociaux
  social: {
    linkedin: 'https://linkedin.com/company/agencehub',  // ← CHANGER
    twitter: 'https://twitter.com/agencehub',            // ← CHANGER
    instagram: 'https://instagram.com/agencehub'         // ← CHANGER
  }
};
```

---

## 🔄 APPLIQUER LES CHANGEMENTS

1. **Modifier** `lib/config/branding.ts`
2. **Sauvegarder** le fichier
3. **Recharger** la page dans le navigateur (F5)

✅ **C'est tout !** Les changements sont automatiquement appliqués partout.

---

## 🎯 EXEMPLES DE PERSONNALISATION

### Exemple 1 : Thème Bleu/Cyan
```typescript
media: {
  primary: 'blue',
  secondary: 'cyan',
  accent: 'blue',
  gradient: {
    from: 'blue-500',
    to: 'cyan-600'
  }
}
```

### Exemple 2 : Thème Vert/Emerald
```typescript
media: {
  primary: 'emerald',
  secondary: 'teal',
  accent: 'emerald',
  gradient: {
    from: 'emerald-500',
    to: 'teal-600'
  }
}
```

### Exemple 3 : Thème Purple/Pink
```typescript
media: {
  primary: 'purple',
  secondary: 'pink',
  accent: 'purple',
  gradient: {
    from: 'purple-500',
    to: 'pink-600'
  }
}
```

---

## 📂 STRUCTURE DES FICHIERS

```
lib/config/
├── branding.ts     ← MODIFIER ICI (logo, couleurs, polices)
├── theme.ts        ← Ne pas toucher (génère les thèmes depuis branding.ts)
└── menus.ts        ← Modifier pour ajouter/retirer des menus

public/
└── logos/          ← PLACER TES LOGOS ICI
    ├── logo-dark.svg
    ├── logo-light.svg
    └── icon.svg
```

---

## ⚠️ IMPORTANT

- **Ne jamais modifier** `lib/config/theme.ts` directement
- **Toujours passer par** `lib/config/branding.ts`
- Les changements sont **automatiquement propagés** à toute l'app
- Pas besoin de redémarrer le serveur, juste recharger la page

---

## 🆘 BESOIN D'AIDE ?

Si tu veux :
- Ajouter un nouveau module → Ajouter une entrée dans `BRANDING_COLORS`
- Changer le menu → Modifier `lib/config/menus.ts`
- Ajouter une page → Créer un fichier dans `app/media/` ou `app/admin/`

**Tout est centralisé et facile à modifier !** 🎉
