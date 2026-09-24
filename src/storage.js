// File: src/storage.js
import { KV } from '@cloudflare/kv';

const kv = new KV('REPORTS_KV');

async function getReport(url) {
  const report = await kv.get(url);
  return report ? JSON.parse(report) : null;
}

async function saveReport(report) {
  await kv.put(report.url, JSON.stringify(report));
}

export { getReport, saveReport };