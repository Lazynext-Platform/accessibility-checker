// File: test/quota.test.mjs
import { getQuota, updateQuota, checkQuota } from '../src/quota.js';
import { KV } from '../src/platform/kv.js';

describe('Quota', () => {
  beforeEach(async () => {
    const kv = new KV();
    await kv.put('quota:1:free', JSON.stringify({
      limit: 100,
      remaining: 100,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }));
  });

  afterEach(async () => {
    const kv = new KV();
    await kv.delete('quota:1:free');
  });

  it('should get quota', async () => {
    const quota = await getQuota(1, 'free');
    expect(quota.limit).toBe(100);
    expect(quota.remaining).toBe(100);
  });

  it('should update quota', async () => {
    const quota = await updateQuota(1, 'free');
    expect(quota.remaining).toBe(99);
  });

  it('should check quota', async () => {
    await updateQuota(1, 'free', 100);
    await expect(checkQuota(1, 'free')).rejects.toThrow('Quota exceeded');
  });

  it('should throw error if quota is exceeded', async () => {
    await updateQuota(1, 'free', 100);
    await expect(checkQuota(1, 'free')).rejects.toThrow('Quota exceeded');
  });
});