// File: src/metrics.js
export class Metrics {
  async getUsers() {
    // Fetch users from KV
    return await KV.get('users');
  }

  async getRevenue() {
    // Fetch revenue from KV
    return await KV.get('revenue');
  }

  async getMrr() {
    // Fetch MRR from KV
    return await KV.get('mrr');
  }

  async getUptimePct() {
    // Fetch uptime percentage from KV
    return await KV.get('uptime_pct');
  }

  async getErrorRate() {
    // Fetch error rate from KV
    return await KV.get('error_rate');
  }

  async getDeployCount() {
    // Fetch deploy count from KV
    return await KV.get('deploy_count');
  }
}