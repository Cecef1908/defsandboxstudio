// ============================================================================
// use[ENTITY] Hook - Gestion d'état pour [entities]
// ============================================================================
// Template: Remplacer [ENTITY], [entity]
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  getAll[ENTITY]s,
  get[ENTITY]ById,
  create[ENTITY],
  update[ENTITY],
  delete[ENTITY],
} from '@/lib/services/[module].service';
import type { [ENTITY]Entity } from '@/types';

// ============================================================================
// Hook: Liste complète
// ============================================================================

export function use[ENTITY]s() {
  const [[entities], set[ENTITY]s] = useState<[ENTITY]Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAll[ENTITY]s();
      set[ENTITY]s(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading [entities]:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { [entities], loading, error, refresh };
}

// ============================================================================
// Hook: Entité unique
// ============================================================================

export function use[ENTITY](id: string | null) {
  const [[entity], set[ENTITY]] = useState<[ENTITY]Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    get[ENTITY]ById(id)
      .then(data => {
        if (mounted) {
          set[ENTITY](data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { [entity], loading, error };
}

// ============================================================================
// Hook: Actions CRUD
// ============================================================================

export function use[ENTITY]Actions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (data: Omit<[ENTITY]Entity, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await create[ENTITY](data);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, data: Partial<[ENTITY]Entity>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await update[ENTITY](id, data);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await delete[ENTITY](id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
}

// ============================================================================
// Hook: Recherche
// ============================================================================

export function use[ENTITY]Search() {
  const [[entities], set[ENTITY]s] = useState<[ENTITY]Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      set[ENTITY]s([]);
      return;
    }

    let mounted = true;
    setLoading(true);

    // Debounce
    const timer = setTimeout(async () => {
      try {
        const data = await getAll[ENTITY]s();
        const filtered = data.filter([entity] =>
          [entity].name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (mounted) {
          set[ENTITY]s(filtered);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return { [entities], searchTerm, setSearchTerm, loading };
}
