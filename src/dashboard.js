// File: src/dashboard.js
import { Metrics } from './metrics.js';
import { KV } from './kv.js';
import { D1 } from './d1.js';

export async function getDashboardData() {
  try {
    const metrics = new Metrics();
    const kv = new KV();
    const d1 = new D1();

    const users = await kv.get('users');
    const revenue = await kv.get('revenue');
    const mrr = await kv.get('mrr');
    const uptimePct = await kv.get('uptime_pct');
    const errorRate = await kv.get('error_rate');
    const deployCount = await kv.get('deploy_count');

    const openBugs = await d1.query('SELECT COUNT(*) FROM bugs WHERE status = "open"');

    return {
      users,
      revenue,
      mrr,
      uptimePct,
      errorRate,
      deployCount,
      openBugs,
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
}