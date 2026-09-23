// File: src/scanner.js
import {PLATFORM} from 'env';
import {KV} from '@cloudflare/kv';

const kv = new KV(PLATFORM.KV_NAMESPACE);

// Function to generate a new Pro license with a free trial period
async function generateProLicenseTrial(userId) {
  try {
    // Set the trial period to 14 days
    const trialPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    const expiresAt = Date.now() + trialPeriod;

    // Generate the license
    const license = {
      userId,
      licenseType: 'Pro',
      trial: true,
      expiresAt,
    };

    // Store the license in KV
    await kv.put(`license:${userId}`, JSON.stringify(license));

    return license;
  } catch (error) {
    throw new Error(`Failed to generate Pro license trial: ${error.message}`);
  }
}

// Function to check if a user has a valid Pro license
async function hasValidProLicense(userId) {
  try {
    const license = await kv.get(`license:${userId}`);
    if (!license) return false;

    const licenseData = JSON.parse(license);
    if (!licenseData || !licenseData.licenseType || licenseData.licenseType !== 'Pro') return false;

    // Check if the license is still within the trial period
    if (licenseData.trial && licenseData.expiresAt > Date.now()) return true;

    // If not a trial or trial has expired, consider the license invalid for this context
    return false;
  } catch (error) {
    throw new Error(`Failed to check for valid Pro license: ${error.message}`);
  }
}

export {generateProLicenseTrial, hasValidProLicense};