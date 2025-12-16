import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: this.cache.size
    };
  }
}

export const cacheManager = new CacheManager();

// Hook para usar cache com queries
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    dependencies?: any[];
  } = {}
) => {
  const { ttl = 5 * 60 * 1000, enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Verificar cache primeiro
    const cachedData = cacheManager.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cacheManager.invalidate(key);
    fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    cacheManager.invalidate(key);
    setData(null);
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
};

// Hook para invalidar cache relacionado
export const useCacheInvalidation = () => {
  const invalidateEquipamentos = useCallback(() => {
    cacheManager.invalidatePattern('equipamentos_.*');
  }, []);

  const invalidateAnimais = useCallback(() => {
    cacheManager.invalidatePattern('animais_.*');
  }, []);

  const invalidateVoluntarios = useCallback(() => {
    cacheManager.invalidatePattern('voluntarios_.*');
  }, []);

  const invalidateNotificacoes = useCallback(() => {
    cacheManager.invalidatePattern('notificacoes_.*');
  }, []);

  const invalidateAll = useCallback(() => {
    cacheManager.clear();
  }, []);

  return {
    invalidateEquipamentos,
    invalidateAnimais,
    invalidateVoluntarios,
    invalidateNotificacoes,
    invalidateAll
  };
};

export default cacheManager;