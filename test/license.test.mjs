// File: test/license.test.mjs
import { integrateFreeTrialProLicense } from '../src/license';
import { KV } from '../src/platform/kv';
import { sendEmail } from '../src/api/brevo';
import { DodoCheckout } from '../src/api/dodoCheckout';

jest.mock('../src/platform/kv');
jest.mock('../src/api/brevo');
jest.mock('../src/api/dodoCheckout');

describe('integrateFreeTrialProLicense', () => {
  it('should integrate free trial Pro license', async () => {
    const userId = 'test-user';
    KV.get.mockResolvedValue(null);
    KV.put.mockResolvedValue();
    sendEmail.mockResolvedValue();
    DodoCheckout.prototype.createSubscription.mockResolvedValue();

    await integrateFreeTrialProLicense(userId);

    expect(KV.get).toHaveBeenCalledTimes(1);
    expect(KV.get).toHaveBeenCalledWith(`license:${userId}`);
    expect(KV.put).toHaveBeenCalledTimes(1);
    expect(KV.put).toHaveBeenCalledWith(`license:${userId}`, expect.objectContaining({
      pro: true,
      trial: true,
      expiresAt: expect.any(Number),
    }));
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: userId,
      subject: 'Free Trial of Pro License',
      body: expect.stringContaining('free trial'),
    }));
    expect(DodoCheckout.prototype.createSubscription).toHaveBeenCalledTimes(1);
    expect(DodoCheckout.prototype.createSubscription).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      plan: 'pro',
      trialDays: 30,
    }));
  });

  it('should handle error explicitly', async () => {
    const userId = 'test-user';
    KV.get.mockRejectedValue(new Error('Mocked error'));

    try {
      await integrateFreeTrialProLicense(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Mocked error');
    }
  });
});