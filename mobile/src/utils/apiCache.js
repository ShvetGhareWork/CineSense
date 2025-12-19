/**
 * API Cache Utility using MMKV
 * 
 * Provides fast, efficient caching for API responses to improve performance
 * and enable offline support.
 */

import { MMKV } from 'react-native-mmkv';
import logger from './logger';

// Initialize MMKV storage
const storage = new MMKV({
  id: 'api-cache',
  encryptionKey: 'cinesense-cache-key-2024'
});

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 60 * 60 * 1000,      // 1 hour
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
};

class APICache {
  /**
   * Set cache with TTL
   */
  set(key, data, ttl = CACHE_TTL.MEDIUM) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      storage.set(key, JSON.stringify(cacheItem));
      logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      logger.error('Cache SET error:', error);
    }
  }

  /**
   * Get cache if not expired
   */
  get(key) {
    try {
      const cached = storage.getString(key);
      if (!cached) {
        logger.debug(`Cache MISS: ${key}`);
        return null;
      }

      const cacheItem = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;

      // Check if cache is expired
      if (age > cacheItem.ttl) {
        logger.debug(`Cache EXPIRED: ${key} (age: ${Math.round(age / 1000)}s)`);
        this.delete(key);
        return null;
      }

      logger.debug(`Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
      return cacheItem.data;
    } catch (error) {
      logger.error('Cache GET error:', error);
      return null;
    }
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    try {
      storage.delete(key);
      logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      logger.error('Cache DELETE error:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll() {
    try {
      storage.clearAll();
      logger.info('Cache CLEARED ALL');
    } catch (error) {
      logger.error('Cache CLEAR ALL error:', error);
    }
  }

  /**
   * Get all cache keys
   */
  getAllKeys() {
    try {
      return storage.getAllKeys();
    } catch (error) {
      logger.error('Cache GET ALL KEYS error:', error);
      return [];
    }
  }

  /**
   * Get cache size
   */
  getSize() {
    try {
      const keys = this.getAllKeys();
      return keys.length;
    } catch (error) {
      logger.error('Cache GET SIZE error:', error);
      return 0;
    }
  }
}

// Export singleton instance
const apiCache = new APICache();
export default apiCache;

// Export cache TTL constants
export { CACHE_TTL };
