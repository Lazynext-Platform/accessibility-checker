// File: test/license.test.mjs
import {getLicenseInfo, createFreeTrialLicense, updateLicenseInfo, hasValidLicense} from '../src/license.js';
import {kv} from '../platform/kv.js';

describe('License', () => {
  beforeEach(async () => {
    // Clear KV store before each test
    await kv.delete('license:test-user');
  });

  it('should create a new free trial license', async () => {
    await createFreeTrialLicense('test-user');
    const licenseInfo = await getLicenseInfo('test-user');
    expect(licenseInfo.licenseType).toBe('pro');
    expect(licenseInfo.licenseStatus).toBe('trial');
    expect(licenseInfo.scansRemaining).toBe(10);
  });

  it('should update license information', async () => {
    await createFreeTrialLicense('test-user');
    await updateLicenseInfo('test-user', {scansRemaining: 5});
    const licenseInfo = await getLicenseInfo('test-user');
    expect(licenseInfo.scansRemaining).toBe(5);
  });

  it('should check if a user has a valid license', async () => {
    await createFreeTrialLicense('test-user');
    expect(await hasValidLicense('test-user')).toBe(true);
    await updateLicenseInfo('test-user', {scansRemaining: 0});
    expect(await hasValidLicense('test-user')).toBe(false);
  });

  it('should handle errors', async () => {
    try {
      await getLicenseInfo('non-existent-user');
    } catch (error) {
      expect(error.message).toBe('Failed to get license info: ');
    }
  });
});