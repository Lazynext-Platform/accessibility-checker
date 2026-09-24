// File: src/platform/kv.js
import { PLATFORM } from '../env.js';

/**
 * KV store interface.
 */
export const kv = {
  async put(key, value) {
    try {
      const response = await fetch(`${PLATFORM}/kv/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error(`KV store put failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error putting value in KV store:', error);
      throw error;
    }
  },

  async get(key) {
    try {
      const response = await fetch(`${PLATFORM}/kv/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error(`KV store get failed: ${response.status}`);
      }

      const value = await response.json();
      return value;
    } catch (error) {
      console.error('Error getting value from KV store:', error);
      throw error;
    }
  },
};