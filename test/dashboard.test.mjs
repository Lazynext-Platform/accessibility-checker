// File: test/dashboard.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardData } from '../src/dashboard.js';
import { KV } from '../src/kv.js';
import { D1 } from '../src/d1.js';

describe('getDashboardData', () => {
  it('fetches dashboard data', async () => {
    const origGet = KV.get, origQuery = D1.query;
    try {
      KV.get = async () => 'mock-value';
      D1.query = async () => ({ count: 10 });
      const data = await getDashboardData();
      assert.deepEqual(data, {
        users: 'mock-value',
        revenue: 'mock-value',
        mrr: 'mock-value',
        uptimePct: 'mock-value',
        errorRate: 'mock-value',
        deployCount: 'mock-value',
        openBugs: { count: 10 },
      });
    } finally {
      KV.get = origGet; D1.query = origQuery;
    }
  });

  it('throws when KV fails', async () => {
    const origGet = KV.get;
    try {
      KV.get = async () => { throw new Error('Mock KV error'); };
      await assert.rejects(getDashboardData(), /Failed to fetch dashboard data: Mock KV error/);
    } finally {
      KV.get = origGet;
    }
  });
});
