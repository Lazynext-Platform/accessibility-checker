// File: src/d1.js
import { env } from './env.js';

export class D1 {
  static async query(query) {
    try {
      const response = await fetch(`${env.PLATFORM_D1_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute D1 query: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to execute D1 query: ${error.message}`);
    }
  }
}