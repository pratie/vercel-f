'use client';

/**
 * Utility functions for handling client-side caching
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Store data in localStorage with expiration
 * @param key Cache key
 * @param data Data to store
 * @param expirationMs Expiration time in milliseconds
 */
export function setCache<T>(key: string, data: T, expirationMs: number = 3600000): void {
  try {
    const item: CachedData<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting cache:', error);
    // If localStorage is full or unavailable, clear some space
    try {
      clearOldCache(0.5); // Clear 50% of old cache entries
      // Try again
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Failed to set cache even after clearing:', e);
    }
  }
}

/**
 * Get data from localStorage if not expired
 * @param key Cache key
 * @param expirationMs Expiration time in milliseconds
 * @returns The cached data or null if expired or not found
 */
export function getCache<T>(key: string, expirationMs: number = 3600000): T | null {
  try {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) return null;
    
    const item: CachedData<T> = JSON.parse(cachedItem);
    const isExpired = Date.now() - item.timestamp > expirationMs;
    
    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Clear all cached items that match a prefix
 * @param prefix Prefix to match cache keys
 */
export function clearCacheByPrefix(prefix: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache by prefix:', error);
  }
}

/**
 * Clear old cache entries to free up space
 * @param percentage Percentage of cache entries to clear (0-1)
 */
export function clearOldCache(percentage: number = 0.25): void {
  try {
    const keys = Object.keys(localStorage);
    if (keys.length === 0) return;
    
    // Get all cache items with their timestamps
    const cacheItems = keys.map(key => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return { key, timestamp: 0 };
        
        const parsed = JSON.parse(item);
        return {
          key,
          timestamp: parsed.timestamp || 0
        };
      } catch {
        return { key, timestamp: 0 };
      }
    });
    
    // Sort by timestamp (oldest first)
    cacheItems.sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate how many items to remove
    const removeCount = Math.floor(keys.length * percentage);
    
    // Remove oldest items
    cacheItems.slice(0, removeCount).forEach(item => {
      localStorage.removeItem(item.key);
    });
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}
