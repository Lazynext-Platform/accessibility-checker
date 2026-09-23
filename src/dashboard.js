// File: src/dashboard.js
import { Metrics } from './metrics.js';
import { KV } from '@cloudflare/workers-kv';
import { D1 } from '@cloudflare/workers-d1';

const kv = new KV('CUSTOMER_METRICS');
const d1 = new D1('CUSTOMER_METRICS');

/**
 * Set up a dashboard to track key customer metrics.
 * @param {Object} metrics - Key customer metrics.
 * @param {string} metrics.trialConversions - Number of trial conversions.
 * @param {string} metrics.retention - Customer retention rate.
 */
export async function setupDashboard(metrics) {
  try {
    // Store metrics in KV for fast retrieval
    await kv.put('trialConversions', metrics.trialConversions);
    await kv.put('retention', metrics.retention);

    // Store metrics in D1 for long-term storage and analysis
    await d1.query(`INSERT INTO customer_metrics (trialConversions, retention) VALUES (${metrics.trialConversions}, ${metrics.retention})`);
  } catch (error) {
    console.error('Error setting up dashboard:', error);
    throw error;
  }
}

/**
 * Get key customer metrics from the dashboard.
 * @returns {Object} Key customer metrics.
 */
export async function getMetrics() {
  try {
    // Retrieve metrics from KV
    const trialConversions = await kv.get('trialConversions');
    const retention = await kv.get('retention');

    // Retrieve metrics from D1 for long-term analysis
    const results = await d1.query('SELECT * FROM customer_metrics');
    const metrics = results.rows;

    return { trialConversions, retention, metrics };
  } catch (error) {
    console.error('Error getting metrics:', error);
    throw error;
  }
}