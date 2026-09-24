// File: src/metrics.js
import { KV } from '@cloudflare/workers-kv';
import { D1Database } from '@cloudflare/d1';

const kv = new KV('ACCESSIBILITY_CHECKER_METRICS');
const d1 = new D1Database('ACCESSIBILITY_CHECKER_ANALYTICS');

async function getMetrics() {
  try {
    const metrics = await kv.get('metrics');
    return metrics ? JSON.parse(metrics) : {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function getAnalytics() {
  try {
    const analytics = await d1.query('SELECT * FROM analytics');
    return analytics ? analytics.rows : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export { getMetrics, getAnalytics };