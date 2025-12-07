# 📦 Templates de Modules

Ce dossier contient des templates réutilisables pour créer rapidement de nouveaux modules.

## 🎯 Utilisation

### 1. Copier les templates nécessaires

```bash
# Exemple: Créer un module "Projects"
cp templates/service.template.ts lib/services/projects.service.ts
cp templates/hook.template.ts lib/hooks/useProjects.ts
cp templates/page.template.tsx app/projects/page.tsx
```

### 2. Remplacer les placeholders

Utilisez la fonction "Rechercher et Remplacer" de votre éditeur:

| Placeholder | Remplacer par | Exemple |
|------------|---------------|---------|
| `[MODULE_NAME]` | Nom du module (PascalCase) | `Projects` |
| `[ENTITY]` | Nom de l'entité (PascalCase, singulier) | `Project` |
| `[entity]` | Nom de l'entité (camelCase, singulier) | `project` |
| `[entities]` | Nom de l'entité (camelCase, pluriel) | `projects` |
| `[COLLECTION_NAME]` | Constante de collection | `PROJECTS_COLLECTION` |
| `[module]` | Nom du module (kebab-case) | `projects` |

### 3. Exemple complet: Module "Projects"

#### Étape 1: Définir le type
```typescript
// types/projects.ts
export interface ProjectEntity {
  id: string;
  name: string;
  client_id: string;
  status: 'draft' | 'active' | 'archived';
  budget: number;
  start_date: string;
  end_date?: string;
  createdAt: any;
  updatedAt: any;
}
```

#### Étape 2: Ajouter la collection
```typescript
// lib/firebase/collections.ts
export const PROJECTS_COLLECTION = "projects";
```

#### Étape 3: Créer le service
```bash
cp templates/service.template.ts lib/services/projects.service.ts
```

Remplacer:
- `[MODULE_NAME]` → `Projects`
- `[ENTITY]` → `Project`
- `[entity]` → `project`
- `[entities]` → `projects`
- `[COLLECTION_NAME]` → `PROJECTS_COLLECTION`

#### Étape 4: Créer le hook
```bash
cp templates/hook.template.ts lib/hooks/useProjects.ts
```

Remplacer:
- `[ENTITY]` → `Project`
- `[entity]` → `project`
- `[entities]` → `projects`
- `[module]` → `projects`

#### Étape 5: Créer la page
```bash
mkdir app/projects
cp templates/page.template.tsx app/projects/page.tsx
```

Remplacer:
- `[MODULE_NAME]` → `Projects`
- `[ENTITY]` → `Project`
- `[entity]` → `project`
- `[entities]` → `projects`

#### Étape 6: Créer les composants spécifiques
```bash
mkdir app/projects/components
```

Créer:
- `ProjectCard.tsx` - Carte d'affichage
- `ProjectModal.tsx` - Modal de création/édition

## 📋 Checklist Post-Template

Après avoir créé votre module à partir des templates:

- [ ] Vérifier que tous les placeholders sont remplacés
- [ ] Adapter les champs de recherche dans `search[ENTITY]s()`
- [ ] Personnaliser les filtres dans la page
- [ ] Créer les composants UI spécifiques (Card, Modal, Form)
- [ ] Ajouter la route dans le menu de navigation
- [ ] Tester les opérations CRUD
- [ ] Ajouter les règles de sécurité Firestore si nécessaire

## 🎨 Personnalisation

Les templates sont des points de départ. N'hésitez pas à:

- Ajouter des méthodes spécifiques au service
- Créer des hooks personnalisés supplémentaires
- Adapter l'UI selon vos besoins
- Ajouter des validations Zod
- Implémenter des filtres avancés

## 📚 Ressources

- [Guide des Bonnes Pratiques](../SCALING_BEST_PRACTICES.md)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)

---

**Astuce**: Utilisez un script pour automatiser le remplacement des placeholders si vous créez beaucoup de modules.
