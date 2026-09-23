// File: src/dashboard.js
import { KV } from './kv.js';
import { D1 } from './d1.js';

export async function getDashboardData() {
  try {
    const users = await KV.get('users');
    const revenue = await KV.get('revenue');
    const mrr = await KV.get('mrr');
    const uptimePct = await KV.get('uptime_pct');
    const errorRate = await KV.get('error_rate');
    const deployCount = await KV.get('deploy_count');

    const openBugs = await D1.query('SELECT COUNT(*) FROM bugs WHERE status = "open"');

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
