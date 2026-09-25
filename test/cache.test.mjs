// File: test/cache.test.mjs
import { cache } from '../src/cache.js';
import { platform } from '../platform.js';

describe('Cache', () => {
  beforeEach(async () => {
    await platform.kv.put('test-cache-key', 'test-cache-value');
  });

  afterEach(async () => {
    await platform.kv.delete('test-cache-key');
  });

  it('gets cached value', async () => {
    const cachedValue = await cache.get('test-cache-key');
    expect(cachedValue).toBe('test-cache-value');
  });

  it('sets cached value', async () => {
    await cache.set('test-cache-key', 'new-test-cache-value');
    const cachedValue = await cache.get('test-cache-key');
    expect(cachedValue).toBe('new-test-cache-value');
  });

  it('handles error getting cached value', async () => {
    await platform.kv.delete('test-cache-key');
    const cachedValue = await cache.get('test-cache-key');
    expect(cachedValue).toBeNull();
  });

  it('handles error setting cached value', async () => {
    await expect(cache.set('test-cache-key', 'new-test-cache-value')).not.toThrow();
  });
});