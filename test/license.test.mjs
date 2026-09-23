// File: test/license.test.mjs
import { startTrial, getLicenseFeatures } from '../src/license.js';
import { getLicense, updateLicense } from '../src/kv.js';

describe('License System', () => {
  it('should start a trial license', async () => {
    const userId = 'test-user';
    const trialLicense = await startTrial(userId);
    expect(trialLicense.type).toBe('trial');
    expect(trialLicense.features).toEqual({
      feature1: true,
      feature2: false,
      feature3: false,
    });
  });

  it('should get license features', async () => {
    const userId = 'test-user';
    await startTrial(userId);
    const features = await getLicenseFeatures(userId);
    expect(features).toEqual({
      feature1: true,
      feature2: false,
      feature3: false,
    });
  });

  it('should throw an error if user already has a Pro license', async () => {
    const userId = 'test-user';
    await updateLicense(userId, { type: 'pro', features: {} });
    await expect(startTrial(userId)).rejects.toThrow(
      'User already has a Pro license'
    );
  });

  it('should throw an error if user does not have a license', async () => {
    const userId = 'test-user';
    await expect(getLicenseFeatures(userId)).rejects.toThrow(
      'User does not have a license'
    );
  });
});