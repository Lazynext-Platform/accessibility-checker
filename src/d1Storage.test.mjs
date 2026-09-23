// File: src/d1Storage.test.mjs
import { describe, it, expect } from 'node:test';
import { D1Storage } from './d1Storage.js';
import { platform } from '../platform.js';

describe('D1Storage', () => {
  it('should store and retrieve data', async () => {
    const storage = new D1Storage(platform);
    const key = 'test-key';
    const value = 'test-value';

    await storage.put(key, value);
    const retrievedValue = await storage.get(key);

    expect(retrievedValue).toBe(value);
  });

  it('should handle errors on put', async () => {
    const storage = new D1Storage(platform);
    const key = 'test-key';
    const value = 'test-value';

    // Simulate an error on put
    platform.put = async () => {
      throw new Error('Mocked error on put');
    };

    try {
      await storage.put(key, value);
      expect(false).toBe(true); // Should not reach this point
    } catch (error) {
      expect(error.message).toBe('Mocked error on put');
    }
  });

  it('should handle errors on get', async () => {
    const storage = new D1Storage(platform);
    const key = 'test-key';

    // Simulate an error on get
    platform.get = async () => {
      throw new Error('Mocked error on get');
    };

    try {
      await storage.get(key);
      expect(false).toBe(true); // Should not reach this point
    } catch (error) {
      expect(error.message).toBe('Mocked error on get');
    }
  });
});