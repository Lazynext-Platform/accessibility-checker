// File: src/cache.js
import { CACHE_TTL } from '../constants.js';
import { platform } from '../platform.js';

class Cache {
  async get(key) {
    try {
      const cachedValue = await platform.kv.get(key);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    } catch (error) {
      console.error('Error getting cached value:', error);
    }
    return null;
  }

  async set(key, value) {
    try {
      await platform.kv.put(key, JSON.stringify(value), {
        expirationTtl: CACHE_TTL,
      });
    } catch (error) {
      console.error('Error setting cached value:', error);
    }
  }
}

export const cache = new Cache();