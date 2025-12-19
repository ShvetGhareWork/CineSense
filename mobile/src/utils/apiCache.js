/**
 * API Cache Utility using AsyncStorage (Expo Go compatible)
 * Provides simple caching for API responses
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'api_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Set a value in cache with TTL
 */
export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

/**
 * Get a value from cache if not expired
 */
export const getCache = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - cacheData.timestamp > cacheData.ttl) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return cacheData.value;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Clear a specific cache entry
 */
export const clearCache = async (key) => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Cache clear all error:', error);
  }
};

export default {
  setCache,
  getCache,
  clearCache,
  clearAllCache,
};
