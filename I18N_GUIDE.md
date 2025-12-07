# 🌍 GUIDE MULTILINGUE (i18n)

## ✅ SYSTÈME PRÊT

Le système de traduction est **prêt** mais **pas encore activé** dans l'interface.

### **Langues Disponibles**
- ✅ **Français** (par défaut)
- ✅ **Anglais** (prêt, pas encore utilisé)

---

## 📁 STRUCTURE

```
lib/i18n/
├── locales/
│   ├── fr.ts          # Traductions françaises
│   └── en.ts          # Traductions anglaises
└── index.ts           # Provider & Hook
```

---

## 🎯 COMMENT UTILISER

### **1. Ajouter le Provider dans le layout**

```typescript
// app/layout.tsx
import { I18nProvider } from '@/lib/i18n';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
```

### **2. Utiliser les traductions dans un composant**

```typescript
'use client';

import { useTranslations } from '@/lib/i18n';

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t.nav.home}</h1>
      <button>{t.common.save}</button>
      <p>{t.modules.media.description}</p>
    </div>
  );
}
```

### **3. Changer de langue**

```typescript
'use client';

import { useI18n } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  
  return (
    <button onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}>
      {locale === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
    </button>
  );
}
```

---

## 📝 AJOUTER UNE TRADUCTION

### **Français** (`lib/i18n/locales/fr.ts`)

```typescript
export const fr = {
  mySection: {
    title: 'Mon Titre',
    description: 'Ma description',
  },
} as const;
```

### **Anglais** (`lib/i18n/locales/en.ts`)

```typescript
export const en = {
  mySection: {
    title: 'My Title',
    description: 'My description',
  },
};
```

---

## 🔧 PROCHAINES ÉTAPES

Pour activer complètement le système :

1. ✅ Ajouter `I18nProvider` dans `app/layout.tsx`
2. ✅ Créer un composant `LanguageSwitcher`
3. ✅ Remplacer les textes hardcodés par `t.section.key`
4. ✅ Tester le changement de langue

---

## 📦 TRADUCTIONS DISPONIBLES

Toutes les traductions sont déjà prêtes pour :
- Navigation
- Modules (Admin, Media, Social, Web, Projects)
- Actions communes (Save, Cancel, Delete, etc.)
- Authentification
- Dashboard
- Stats
- Rôles
- Messages

**Total : ~150 traductions prêtes** 🎉

---

## 🌐 AJOUTER UNE NOUVELLE LANGUE

Pour ajouter l'arabe par exemple :

1. Créer `lib/i18n/locales/ar.ts`
2. Copier la structure de `fr.ts`
3. Traduire tous les textes
4. Ajouter dans `lib/i18n/index.ts` :

```typescript
import { ar } from './locales/ar';

export type Locale = 'fr' | 'en' | 'ar';

const translations: Record<Locale, any> = {
  fr,
  en,
  ar,
};
```

---

**SYSTÈME MULTILINGUE PRÊT !** 🌍
