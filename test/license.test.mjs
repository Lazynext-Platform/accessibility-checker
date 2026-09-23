// File: test/license.test.mjs
import { createFreeTrialLicense, isFreeTrialActive } from '../src/license.js';
import { kv } from '../src/platform/kv.js';
import { d1 } from '../src/platform/d1.js';

describe('license', () => {
  beforeEach(async () => {
    // Clear the KV store before each test
    await kv.delete('license:123');
  });

  afterEach(async () => {
    // Clear the KV store after each test
    await kv.delete('license:123');
  });

  it('creates a new free trial license', async () => {
    await createFreeTrialLicense('user123', 'license123');
    const license = await kv.get('license:license123');
    expect(license).toEqual({
      userId: 'user123',
      expiresAt: expect.any(Number),
      plan: 'pro',
    });
  });

  it('checks if a license is still within its free trial period', async () => {
    await createFreeTrialLicense('user123', 'license123');
    const isActive = await isFreeTrialActive('license123');
    expect(isActive).toBe(true);
  });

  it('sends a welcome email to a user', async () => {
    const sendEmailSpy = jest.spyOn(global, 'fetch');
    await sendWelcomeEmail('user123');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith(expect.stringContaining('/email/send'), expect.any(Object));
  });
});