// File: test/analytics.test.mjs
import { test } from 'node:test';
import { trackTrialConversion } from '../src/analytics.js';
import { fetchMock } from 'fetch-mock';

test('trackTrialConversion sends analytics data', async () => {
  const userId = 'user-123';
  const licenseType = 'Pro';
  const converted = true;

  fetchMock.post(`${globalThis.PLATFORM}/api/v1/analytics`, {
    status: 200,
  });

  await trackTrialConversion(userId, licenseType, converted);

  expect(fetchMock.called()).toBe(true);
  expect(fetchMock.lastCall()[0]).toBe(`${globalThis.PLATFORM}/api/v1/analytics`);
  expect(fetchMock.lastCall()[1].method).toBe('POST');
  expect(fetchMock.lastCall()[1].body).toContain(userId);
  expect(fetchMock.lastCall()[1].body).toContain(licenseType);
  expect(fetchMock.lastCall()[1].body).toContain(String(converted));

  fetchMock.restore();
});

test('trackTrialConversion handles fetch errors', async () => {
  const userId = 'user-123';
  const licenseType = 'Pro';
  const converted = true;

  fetchMock.post(`${globalThis.PLATFORM}/api/v1/analytics`, {
    status: 500,
    throws: new Error('Mocked error'),
  });

  await trackTrialConversion(userId, licenseType, converted);

  expect(fetchMock.called()).toBe(true);
  expect(console.error).toHaveBeenCalledTimes(1);

  fetchMock.restore();
});