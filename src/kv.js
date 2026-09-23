// File: src/kv.js
import { env } from './env.js';

export class KV {
  static async get(key) {
    try {
      const response = await fetch(`${env.PLATFORM_KV_URL}/kv/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch KV value: ${response.status}`);
      }

      const value = await response.json();
      return value;
    } catch (error) {
      throw new Error(`Failed to fetch KV value: ${error.message}`);
    }
  }
}