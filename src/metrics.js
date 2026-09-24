// File: src/metrics.js
import { KV } from '@cloudflare/workers';

const METRICS_KEY = 'metrics';

export class Metrics {
  static async get() {
    const metrics = await KV.get(METRICS_KEY);
    return metrics ? JSON.parse(metrics) : { users: 0, revenue: 0.0, mrr: 0.0, uptime_pct: 100.0, error_rate: 0.0, deploy_count: 0 };
  }

  static async update(metrics) {
    await KV.put(METRICS_KEY, JSON.stringify(metrics));
  }
}