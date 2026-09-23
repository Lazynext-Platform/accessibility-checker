// File: test/dashboard.test.mjs
import { setupDashboard, getMetrics } from '../src/dashboard.js';
import { KV } from '@cloudflare/workers-kv';
import { D1 } from '@cloudflare/workers-d1';

describe('Dashboard', () => {
  beforeEach(() => {
    // Mock KV and D1 for testing
    globalThis.kv = new KV('TEST_CUSTOMER_METRICS');
    globalThis.d1 = new D1('TEST_CUSTOMER_METRICS');
  });

  afterEach(() => {
    // Clean up after each test
    globalThis.kv = undefined;
    globalThis.d1 = undefined;
  });

  it('sets up dashboard with key customer metrics', async () => {
    const metrics = { trialConversions: 10, retention: 0.5 };
    await setupDashboard(metrics);

    // Verify metrics are stored in KV
    const trialConversions = await globalThis.kv.get('trialConversions');
    const retention = await globalThis.kv.get('retention');
    expect(trialConversions).toBe('10');
    expect(retention).toBe('0.5');

    // Verify metrics are stored in D1
    const results = await globalThis.d1.query('SELECT * FROM customer_metrics');
    const storedMetrics = results.rows;
    expect(storedMetrics.length).toBe(1);
    expect(storedMetrics[0].trialConversions).toBe(10);
    expect(storedMetrics[0].retention).toBe(0.5);
  });

  it('gets key customer metrics from dashboard', async () => {
    const metrics = { trialConversions: 10, retention: 0.5 };
    await setupDashboard(metrics);

    // Get metrics from dashboard
    const retrievedMetrics = await getMetrics();
    expect(retrievedMetrics.trialConversions).toBe('10');
    expect(retrievedMetrics.retention).toBe('0.5');
    expect(retrievedMetrics.metrics.length).toBe(1);
    expect(retrievedMetrics.metrics[0].trialConversions).toBe(10);
    expect(retrievedMetrics.metrics[0].retention).toBe(0.5);
  });
});