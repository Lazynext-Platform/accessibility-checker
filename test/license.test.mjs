// File: test/license.test.mjs
import { createProLicenseWithFreeTrial, isProLicenseValid, upgradeToPro } from '../src/license.js';
import { KV } from '../src/platform/kv.js';

describe('License', () => {
  beforeEach(async () => {
    await KV.delete('licenses', 'test-license');
    await KV.delete('quotas', 'test-user');
  });

  it('creates a new Pro license with a 14-day free trial', async () => {
    const userId = 'test-user';
    const { licenseId, expiresAt } = await createProLicenseWithFreeTrial(userId);

    expect(licenseId).toBeInstanceOf(String);
    expect(expiresAt).toBeGreaterThan(Date.now());
    expect(expiresAt).toBeLessThan(Date.now() + (14 * 24 * 60 * 60 * 1000));
  });

  it('checks if a user\'s Pro license is still valid', async () => {
    const userId = 'test-user';
    await createProLicenseWithFreeTrial(userId);

    expect(await isProLicenseValid(userId)).toBe(true);
  });

  it('upgrades a user\'s license to Pro', async () => {
    const userId = 'test-user';
    await createProLicenseWithFreeTrial(userId);

    await upgradeToPro(userId);

    const quota = await KV.get('quotas', userId);
    expect(quota).toContain('pro:true');
    expect(quota).toContain('trial:false');
    expect(quota).toContain('expiresAt:null');
  });
});