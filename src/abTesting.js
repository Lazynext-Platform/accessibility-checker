// File: src/abTesting.js
import { KV } from '@cloudflare/kv';
import { describe, expect, it } from 'node:assert/strict';
import { Worker } from 'worker:worker';
import { platform } from 'worker:platform';

// Initialize KV store
const kv = new KV('ACCESSIBILITY_CHECKER_KV');

// Function to get feature flag from KV store
async function getFeatureFlag(featureName) {
  try {
    const featureFlag = await kv.get(featureName);
    return featureFlag === 'true';
  } catch (error) {
    console.error(`Error getting feature flag: ${error}`);
    return false;
  }
}

// Function to set feature flag in KV store
async function setFeatureFlag(featureName, isEnabled) {
  try {
    await kv.put(featureName, isEnabled.toString());
  } catch (error) {
    console.error(`Error setting feature flag: ${error}`);
  }
}

// A/B testing function
async function abTest(featureName, userId) {
  const featureEnabled = await getFeatureFlag(featureName);
  const userVariant = await getUserVariant(userId);

  if (featureEnabled && userVariant === 'A') {
    return 'A';
  } else if (featureEnabled && userVariant === 'B') {
    return 'B';
  } else {
    return 'Control';
  }
}

// Function to get user variant
async function getUserVariant(userId) {
  // Simple implementation: assign users to variant A or B based on userId
  return userId % 2 === 0 ? 'A' : 'B';
}

// Test suite
describe('A/B testing', () => {
  it('should get feature flag from KV store', async () => {
    await setFeatureFlag('testFeature', true);
    const featureFlag = await getFeatureFlag('testFeature');
    expect(featureFlag).toBe(true);
  });

  it('should set feature flag in KV store', async () => {
    await setFeatureFlag('testFeature', false);
    const featureFlag = await getFeatureFlag('testFeature');
    expect(featureFlag).toBe(false);
  });

  it('should assign user to variant A or B', async () => {
    const userId = 1;
    const userVariant = await getUserVariant(userId);
    expect(userVariant).toBe('B');
  });

  it('should return variant A or B based on feature flag and user variant', async () => {
    await setFeatureFlag('testFeature', true);
    const userId = 1;
    const variant = await abTest('testFeature', userId);
    expect(variant).toBe('B');
  });
});