// File: src/license.js
import { PLATFORM } from '../env.js';
import { getLicense, updateLicense } from '../kv.js';

const PRO_LICENSE_FEATURES = {
  // List of features available in Pro license
  feature1: true,
  feature2: true,
  feature3: true,
};

const TRIAL_LICENSE_FEATURES = {
  // List of features available in trial license
  feature1: true,
  feature2: false,
  feature3: false,
};

async function startTrial(userId) {
  try {
    const license = await getLicense(userId);
    if (license && license.type === 'pro') {
      throw new Error('User already has a Pro license');
    }

    const trialLicense = {
      type: 'trial',
      features: TRIAL_LICENSE_FEATURES,
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
    };

    await updateLicense(userId, trialLicense);
    return trialLicense;
  } catch (error) {
    throw new Error(`Failed to start trial: ${error.message}`);
  }
}

async function getLicenseFeatures(userId) {
  try {
    const license = await getLicense(userId);
    if (license && license.type === 'pro') {
      return PRO_LICENSE_FEATURES;
    } else if (license && license.type === 'trial') {
      return TRIAL_LICENSE_FEATURES;
    } else {
      throw new Error('User does not have a license');
    }
  } catch (error) {
    throw new Error(`Failed to get license features: ${error.message}`);
  }
}

export { startTrial, getLicenseFeatures };