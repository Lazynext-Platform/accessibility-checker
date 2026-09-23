// File: test/checkout.test.mjs
import { test } from 'node:test';
import { handleCheckoutCompletion } from '../src/checkout.js';
import { trackTrialConversion } from '../src/analytics.js';

test('handleCheckoutCompletion tracks trial conversion', async () => {
  const userId = 'user-123';
  const licenseType = 'Pro';

  const trackTrialConversionMock = jest.fn();
  jest.mock('../src/analytics.js', () => ({
    trackTrialConversion: trackTrialConversionMock,
  }));

  await handleCheckoutCompletion(userId, licenseType);

  expect(trackTrialConversionMock).toHaveBeenCalledTimes(1);
  expect(trackTrialConversionMock).toHaveBeenCalledWith(userId, licenseType, true);
});