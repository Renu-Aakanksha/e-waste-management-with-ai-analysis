import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface APICacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

/**
 * Custom hook for API response caching
 * Reduces redundant API calls and improves performance
 */
export const useAPICache = <T>(options: APICacheOptions = {}) => {
  const { ttl = 30000, maxSize = 100 } = options; // Default 30 seconds TTL
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    // Remove oldest entries if cache is full
    if (cacheRef.current.size >= maxSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    });
  }, [ttl, maxSize]);

  const invalidate = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  const getStats = useCallback(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    // Convert Map.values() to array for compatibility
    const entries = Array.from(cacheRef.current.values());
    for (const entry of entries) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: cacheRef.current.size,
      validEntries,
      expiredEntries,
      hitRate: 0 // This would need to be tracked separately
    };
  }, []);

  return {
    get,
    set,
    invalidate,
    clear,
    getStats
  };
};

/**
 * Create a cache instance for API calls
 */
export const createAPICache = <R>(options: APICacheOptions = {}) => {
  const cache = new Map<string, CacheEntry<R>>();
  const { ttl = 30000, maxSize = 100 } = options;

  const get = (key: string): R | null => {
    const entry = cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  };

  const set = (key: string, data: R, customTtl?: number): void => {
    // Remove oldest entries if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    });
  };

  return { get, set };
};

/**
 * Higher-order function to wrap API calls with caching
 */
export const withCaching = <T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  options: APICacheOptions = {}
) => {
  const cache = createAPICache<R>(options);

  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cachedData = cache.get(key);
    if (cachedData !== null) {
      console.log(`🎯 Cache hit for key: ${key}`);
      return cachedData;
    }

    // Make API call if not in cache
    console.log(`🌐 API call for key: ${key}`);
    const data = await apiCall(...args);
    
    // Store in cache
    cache.set(key, data);
    
    return data;
  };
};
