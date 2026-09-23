// File: src/license.js
import { PLATFORM } from '../env.js';
import { KV } from '../platform/kv.js';
import { D1 } from '../platform/d1.js';

const LICENSES_KV = 'licenses';
const QUOTAS_KV = 'quotas';

/**
 * Creates a new Pro license with a 14-day free trial.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{ licenseId: string, expiresAt: number }>} - The license ID and expiration timestamp.
 */
async function createProLicenseWithFreeTrial(userId) {
  const licenseId = crypto.randomUUID();
  const expiresAt = Date.now() + (14 * 24 * 60 * 60 * 1000); // 14 days from now

  await KV.put(LICENSES_KV, licenseId, JSON.stringify({ userId, expiresAt }));
  await KV.put(QUOTAS_KV, userId, JSON.stringify({ pro: true, trial: true, expiresAt }));

  return { licenseId, expiresAt };
}

/**
 * Checks if a user's Pro license is still valid.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>} - True if the license is valid, false otherwise.
 */
async function isProLicenseValid(userId) {
  const quota = await KV.get(QUOTAS_KV, userId);
  if (!quota) return false;

  const { pro, trial, expiresAt } = JSON.parse(quota);
  if (!pro || !trial) return false;

  return expiresAt > Date.now();
}

/**
 * Upgrades a user's license to Pro.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<void>}
 */
async function upgradeToPro(userId) {
  const quota = await KV.get(QUOTAS_KV, userId);
  if (!quota) throw new Error('User has no quota');

  const { pro, trial, expiresAt } = JSON.parse(quota);
  if (!pro || !trial) throw new Error('User does not have a Pro trial license');

  await KV.put(QUOTAS_KV, userId, JSON.stringify({ pro: true, trial: false, expiresAt: null }));
}

export { createProLicenseWithFreeTrial, isProLicenseValid, upgradeToPro };