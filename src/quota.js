// File: src/quota.js
import { PLATFORM } from '../env.js';
import { KV } from '../platform/kv.js';
import { D1 } from '../platform/d1.js';

const QUOTA_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const FREE_QUOTA_LIMIT = 100;
const PRO_QUOTA_LIMIT = 1000;

async function getQuota(userId, licenseType) {
  const kv = new KV(PLATFORM);
  const quotaKey = `quota:${userId}:${licenseType}`;
  const quota = await kv.get(quotaKey);
  if (quota) {
    return JSON.parse(quota);
  }
  return {
    limit: licenseType === 'free' ? FREE_QUOTA_LIMIT : PRO_QUOTA_LIMIT,
    remaining: licenseType === 'free' ? FREE_QUOTA_LIMIT : PRO_QUOTA_LIMIT,
    expiresAt: Date.now() + QUOTA_TTL * 1000,
  };
}

async function updateQuota(userId, licenseType, decrement = 1) {
  const kv = new KV(PLATFORM);
  const quotaKey = `quota:${userId}:${licenseType}`;
  const quota = await getQuota(userId, licenseType);
  quota.remaining -= decrement;
  if (quota.remaining < 0) {
    quota.remaining = 0;
  }
  await kv.put(quotaKey, JSON.stringify(quota), {
    expirationTtl: QUOTA_TTL,
  });
  return quota;
}

async function checkQuota(userId, licenseType) {
  const quota = await getQuota(userId, licenseType);
  if (quota.remaining <= 0) {
    throw new Error('Quota exceeded');
  }
  return quota;
}

export { getQuota, updateQuota, checkQuota };