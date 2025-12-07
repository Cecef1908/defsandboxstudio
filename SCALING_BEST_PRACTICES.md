# 🚀 Guide des Bonnes Pratiques de Scaling

## 📋 Table des Matières
1. [Architecture Modulaire](#architecture-modulaire)
2. [Services & Data Layer](#services--data-layer)
3. [Performance & Optimisation](#performance--optimisation)
4. [Sécurité](#sécurité)
5. [Patterns de Code](#patterns-de-code)
6. [Checklist Nouveau Module](#checklist-nouveau-module)

---

## 🏗️ Architecture Modulaire

### Principe de Séparation des Responsabilités

```
app/
├── [module]/              # Route Next.js
│   ├── page.tsx          # Page principale (Server Component)
│   ├── layout.tsx        # Layout spécifique au module
│   └── components/       # Composants spécifiques au module
│
lib/
├── services/             # Logique métier & accès données
│   └── [module].service.ts
├── hooks/                # Hooks React réutilisables
│   └── use[Module].ts
├── contexts/             # Contexts React pour état global
│   └── [Module]Context.tsx
└── validation/           # Schémas de validation Zod
    └── [module].schemas.ts
```

### ✅ Bonnes Pratiques
- **Un module = Un dossier** dans `app/`
- **Services centralisés** dans `lib/services/`
- **Pas de logique métier dans les composants** - uniquement présentation
- **Validation côté client ET serveur** avec Zod

### ❌ À Éviter
- Logique Firebase directement dans les composants
- Duplication de code entre modules
- Imports circulaires
- Mélange de logique métier et UI

---

## 📊 Services & Data Layer

### Structure d'un Service Type

```typescript
// lib/services/example.service.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTION_NAME } from '@/lib/firebase/collections';

// ============================================================================
// CREATE
// ============================================================================

export async function createEntity(data: CreateEntityDTO) {
  try {
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
}

// ============================================================================
// READ
// ============================================================================

export async function getAllEntities(): Promise<Entity[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Entity[];
  } catch (error) {
    console.error('Error fetching entities:', error);
    throw error;
  }
}

export async function getEntityById(id: string): Promise<Entity | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Entity;
  } catch (error) {
    console.error('Error fetching entity:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateEntity(id: string, data: Partial<Entity>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Exclure les champs non modifiables
    const { id: _, createdAt: __, ...updateData } = data as any;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    
    return await getEntityById(id);
  } catch (error) {
    console.error('Error updating entity:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteEntity(id: string) {
  try {
    // TODO: Vérifier les contraintes d'intégrité référentielle
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting entity:', error);
    throw error;
  }
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export async function searchEntities(searchTerm: string): Promise<Entity[]> {
  try {
    const allEntities = await getAllEntities();
    const term = searchTerm.toLowerCase();
    
    return allEntities.filter(entity =>
      entity.name.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching entities:', error);
    throw error;
  }
}
```

### ✅ Bonnes Pratiques Services
1. **Toujours utiliser `serverTimestamp()`** pour createdAt/updatedAt
2. **Gestion d'erreurs systématique** avec try/catch
3. **Logs explicites** pour debugging
4. **Retourner des objets typés** (TypeScript)
5. **Validation des données** avant écriture
6. **Utiliser les collections de `collections.ts`** (single source of truth)

### 🔥 Optimisations Firestore
```typescript
// ❌ MAUVAIS - Récupère tout puis filtre
const allDocs = await getDocs(collection(db, 'users'));
const filtered = allDocs.filter(doc => doc.data().role === 'admin');

// ✅ BON - Filtre côté serveur
const q = query(
  collection(db, 'users'),
  where('role', '==', 'admin')
);
const snapshot = await getDocs(q);
```

---

## ⚡ Performance & Optimisation

### 1. Lazy Loading des Composants

```typescript
// ❌ MAUVAIS
import HeavyComponent from './HeavyComponent';

// ✅ BON
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Si pas besoin de SSR
});
```

### 2. Memoization

```typescript
import { useMemo, useCallback } from 'react';

function MyComponent({ data }) {
  // Calculs coûteux
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  // Callbacks stables
  const handleClick = useCallback(() => {
    doSomething();
  }, []);
  
  return <div onClick={handleClick}>{processedData}</div>;
}
```

### 3. Pagination Firestore

```typescript
export async function getEntitiesPaginated(
  pageSize: number = 20,
  lastDoc?: any
) {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    return {
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastDoc: lastVisible,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error('Error fetching paginated entities:', error);
    throw error;
  }
}
```

### 4. Caching avec React Query (Recommandé)

```typescript
// lib/hooks/useEntities.ts
import { useQuery } from '@tanstack/react-query';
import { getAllEntities } from '@/lib/services/entities.service';

export function useEntities() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: getAllEntities,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## 🔒 Sécurité

### 1. Validation des Données (Zod)

```typescript
// lib/validation/entity.schemas.ts
import { z } from 'zod';

export const createEntitySchema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères').max(100),
  email: z.string().email('Email invalide'),
  type: z.enum(['type1', 'type2']),
  metadata: z.object({
    key: z.string(),
  }).optional(),
});

export type CreateEntityDTO = z.infer<typeof createEntitySchema>;

// Utilisation
export async function createEntity(data: unknown) {
  // Validation
  const validated = createEntitySchema.parse(data);
  
  // Logique métier
  return await addDoc(collection(db, COLLECTION_NAME), validated);
}
```

### 2. Protection des Routes

```typescript
// app/admin/layout.tsx
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      redirect('/login');
    }
  }, [user, loading]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <>{children}</>;
}
```

### 3. API Routes Sécurisées

```typescript
// app/api/entities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { createEntity } from '@/lib/services/entities.service';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Vérifier les permissions
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Traiter la requête
    const body = await request.json();
    const result = await createEntity(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Patterns de Code

### 1. Custom Hooks

```typescript
// lib/hooks/useEntity.ts
import { useState, useEffect } from 'react';
import { getEntityById } from '@/lib/services/entities.service';

export function useEntity(id: string) {
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    let mounted = true;
    
    getEntityById(id)
      .then(data => {
        if (mounted) {
          setEntity(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => { mounted = false; };
  }, [id]);
  
  return { entity, loading, error };
}
```

### 2. Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Une erreur est survenue</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 3. Loading States

```typescript
// components/LoadingState.tsx
export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

// Utilisation
function MyComponent() {
  const { data, loading } = useEntities();
  
  if (loading) return <LoadingState />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

---

## ✅ Checklist Nouveau Module

### Phase 1: Planification
- [ ] Définir les entités et leur schéma
- [ ] Créer les types TypeScript dans `types/`
- [ ] Ajouter les collections dans `lib/firebase/collections.ts`
- [ ] Définir les permissions nécessaires

### Phase 2: Backend
- [ ] Créer le service dans `lib/services/[module].service.ts`
- [ ] Implémenter CRUD complet
- [ ] Ajouter validation Zod dans `lib/validation/`
- [ ] Créer les hooks personnalisés dans `lib/hooks/`
- [ ] Tester les opérations Firestore

### Phase 3: Frontend
- [ ] Créer la route dans `app/[module]/`
- [ ] Implémenter le layout si nécessaire
- [ ] Créer les composants UI dans `app/[module]/components/`
- [ ] Ajouter la navigation dans les menus
- [ ] Implémenter les états de chargement/erreur

### Phase 4: Sécurité & Performance
- [ ] Ajouter la protection de route (permissions)
- [ ] Implémenter le lazy loading si nécessaire
- [ ] Optimiser les requêtes Firestore
- [ ] Ajouter la pagination si liste longue
- [ ] Tester les cas d'erreur

### Phase 5: Documentation
- [ ] Documenter l'API du service
- [ ] Ajouter des commentaires JSDoc
- [ ] Mettre à jour le README si nécessaire
- [ ] Créer des exemples d'utilisation

---

## 📝 Exemple Complet: Module "Projets"

### 1. Types
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

### 2. Service
```typescript
// lib/services/projects.service.ts
// [Voir template service ci-dessus]
```

### 3. Hook
```typescript
// lib/hooks/useProjects.ts
export function useProjects() {
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);
  
  return { projects, loading };
}
```

### 4. Page
```typescript
// app/projects/page.tsx
'use client';

import { useProjects } from '@/lib/hooks/useProjects';
import { ProjectCard } from './components/ProjectCard';

export default function ProjectsPage() {
  const { projects, loading } = useProjects();
  
  if (loading) return <LoadingState />;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Projets</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Principes Clés à Retenir

1. **DRY (Don't Repeat Yourself)** - Réutiliser le code via services et hooks
2. **SOLID** - Séparation des responsabilités
3. **Type Safety** - TypeScript partout
4. **Error Handling** - Toujours gérer les erreurs
5. **Performance First** - Optimiser dès le départ
6. **Security by Design** - Validation et permissions systématiques
7. **Scalability** - Architecture modulaire et extensible

---

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024
