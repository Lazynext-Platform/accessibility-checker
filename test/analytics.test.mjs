// File: test/analytics.test.mjs
import { recordUserBehavior, recordError, getUserBehavior, getErrors } from '../src/analytics.js';
import { KV } from '@cloudflare/workers';

describe('Analytics', () => {
  let analyticsKV;

  beforeEach(() => {
    analyticsKV = new KV('test-namespace');
  });

  afterEach(async () => {
    await analyticsKV.delete('user:test:behavior');
    await analyticsKV.delete('user:test:errors');
  });

  it('records user behavior', async () => {
    await recordUserBehavior('test', 'scan');
    const data = await analyticsKV.get('user:test:behavior');
    expect(JSON.parse(data)).toEqual({ scan: 1 });
  });

  it('records error', async () => {
    await recordError('test', 'scan');
    const data = await analyticsKV.get('user:test:errors');
    expect(JSON.parse(data)).toEqual({ scan: 1 });
  });

  it('gets user behavior', async () => {
    await analyticsKV.put('user:test:behavior', JSON.stringify({ scan: 1, report: 2 }));
    const data = await getUserBehavior('test');
    expect(data).toEqual({ scan: 1, report: 2 });
  });

  it('gets errors', async () => {
    await analyticsKV.put('user:test:errors', JSON.stringify({ scan: 1, report: 2 }));
    const data = await getErrors('test');
    expect(data).toEqual({ scan: 1, report: 2 });
  });
});