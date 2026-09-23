// File: test/scanner.test.mjs
import {test} from 'node:test';
import {generateProLicenseTrial, hasValidProLicense} from '../src/scanner.js';
import {PLATFORM} from 'env';
import {KV} from '@cloudflare/kv';

const kv = new KV(PLATFORM.KV_NAMESPACE);

test('generateProLicenseTrial should create a new Pro license with a 14-day trial', async (t) => {
  const userId = 'test-user';
  const license = await generateProLicenseTrial(userId);
  t.ok(license, 'License should be generated');
  t.equal(license.licenseType, 'Pro', 'License type should be Pro');
  t.equal(license.trial, true, 'License should be a trial');
  t.ok(license.expiresAt, 'License should have an expiration time');
});

test('hasValidProLicense should return true for a user with a valid Pro license trial', async (t) => {
  const userId = 'test-user';
  await generateProLicenseTrial(userId);
  const hasLicense = await hasValidProLicense(userId);
  t.ok(hasLicense, 'User should have a valid Pro license');
});

test('hasValidProLicense should return false for a user without a Pro license', async (t) => {
  const userId = 'test-user-no-license';
  const hasLicense = await hasValidProLicense(userId);
  t.notOk(hasLicense, 'User should not have a valid Pro license');
});

test('hasValidProLicense should return false for a user with an expired Pro license trial', async (t) => {
  const userId = 'test-user-expired';
  // Manually set an expired license for testing
  const expiredLicense = {
    userId,
    licenseType: 'Pro',
    trial: true,
    expiresAt: Date.now() - 1000, // Expired 1 second ago
  };
  await kv.put(`license:${userId}`, JSON.stringify(expiredLicense));
  const hasLicense = await hasValidProLicense(userId);
  t.notOk(hasLicense, 'User should not have a valid Pro license due to expiration');
});