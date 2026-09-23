// File: src/license.js
import {PLATFORM} from '../env.js';
import {kv} from '../platform/kv.js';

/**
 * License types
 * @enum {string}
 */
const LICENSE_TYPE = {
  FREE: 'free',
  PRO: 'pro',
};

/**
 * License status
 * @enum {string}
 */
const LICENSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRIAL: 'trial',
};

/**
 * Maximum number of scans for free trial
 * @const {number}
 */
const MAX_TRIAL_SCANS = 10;

/**
 * Get license information for a user
 * @param {string} userId - User ID
 * @returns {Promise<{licenseType: string, licenseStatus: string, scansRemaining: number}>}
 */
async function getLicenseInfo(userId) {
  try {
    const licenseInfo = await kv.get(`license:${userId}`);
    if (!licenseInfo) {
      // If no license info is found, create a new free trial license
      await createFreeTrialLicense(userId);
      return getLicenseInfo(userId);
    }
    return JSON.parse(licenseInfo);
  } catch (error) {
    throw new Error(`Failed to get license info: ${error.message}`);
  }
}

/**
 * Create a new free trial license for a user
 * @param {string} userId - User ID
 */
async function createFreeTrialLicense(userId) {
  try {
    const licenseInfo = {
      licenseType: LICENSE_TYPE.PRO,
      licenseStatus: LICENSE_STATUS.TRIAL,
      scansRemaining: MAX_TRIAL_SCANS,
    };
    await kv.put(`license:${userId}`, JSON.stringify(licenseInfo));
  } catch (error) {
    throw new Error(`Failed to create free trial license: ${error.message}`);
  }
}

/**
 * Update license information for a user
 * @param {string} userId - User ID
 * @param {object} updates - License updates
 */
async function updateLicenseInfo(userId, updates) {
  try {
    const licenseInfo = await getLicenseInfo(userId);
    Object.assign(licenseInfo, updates);
    await kv.put(`license:${userId}`, JSON.stringify(licenseInfo));
  } catch (error) {
    throw new Error(`Failed to update license info: ${error.message}`);
  }
}

/**
 * Check if a user has a valid license for a scan
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function hasValidLicense(userId) {
  try {
    const licenseInfo = await getLicenseInfo(userId);
    if (licenseInfo.licenseStatus === LICENSE_STATUS.ACTIVE) {
      return true;
    }
    if (licenseInfo.licenseStatus === LICENSE_STATUS.TRIAL && licenseInfo.scansRemaining > 0) {
      // Decrement scans remaining for trial license
      await updateLicenseInfo(userId, {scansRemaining: licenseInfo.scansRemaining - 1});
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Failed to check license validity: ${error.message}`);
  }
}

export {getLicenseInfo, createFreeTrialLicense, updateLicenseInfo, hasValidLicense};