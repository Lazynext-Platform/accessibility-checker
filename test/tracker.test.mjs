// File: test/tracker.test.mjs
import { test } from 'node:assert';
import { trackUserBehavior, trackErrorRate } from '../src/tracker.js';

describe('Tracker', () => {
  it('should track user behavior', async () => {
    await trackUserBehavior('click');
    const counter = await KV.get('user_behavior:click');
    test.strictEqual(counter, '1');
  });

  it('should track error rates', async () => {
    await trackErrorRate('error');
    const counter = await KV.get('error_rate:error');
    test.strictEqual(counter, '1');
  });

  it('should handle errors when tracking user behavior', async () => {
    try {
      await trackUserBehavior('click');
      throw new Error('Expected error to be thrown');
    } catch (error) {
      test.strictEqual(error.message, 'Error tracking user behavior:');
    }
  });

  it('should handle errors when tracking error rates', async () => {
    try {
      await trackErrorRate('error');
      throw new Error('Expected error to be thrown');
    } catch (error) {
      test.strictEqual(error.message, 'Error tracking error rate:');
    }
  });
});