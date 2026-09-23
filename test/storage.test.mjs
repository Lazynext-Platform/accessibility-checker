// File: test/storage.test.mjs
import { describe, expect, it } from '@jest/globals';
import { storeReport, getReport, storeLicense, getLicense } from '../src/storage';

describe('storage', () => {
  it('stores and retrieves a report', async () => {
    const userId = 'test-user';
    const report = { foo: 'bar' };
    await storeReport(userId, report);
    const retrievedReport = await getReport(userId);
    expect(retrievedReport).toEqual(report);
  });

  it('stores and retrieves a license', async () => {
    const userId = 'test-user';
    const license = { foo: 'bar' };
    await storeLicense(userId, license);
    const retrievedLicense = await getLicense(userId);
    expect(retrievedLicense).toEqual(license);
  });

  it('returns null for non-existent report', async () => {
    const userId = 'non-existent-user';
    const report = await getReport(userId);
    expect(report).toBeNull();
  });

  it('returns null for non-existent license', async () => {
    const userId = 'non-existent-user';
    const license = await getLicense(userId);
    expect(license).toBeNull();
  });

  it('throws an error on store failure', async () => {
    const userId = 'test-user';
    const report = { foo: 'bar' };
    jest.spyOn(d1, 'put').mockRejectedValue(new Error('Mocked error'));
    await expect(storeReport(userId, report)).rejects.toThrowError('Failed to store report: Mocked error');
  });

  it('throws an error on retrieve failure', async () => {
    const userId = 'test-user';
    jest.spyOn(d1, 'get').mockRejectedValue(new Error('Mocked error'));
    await expect(getReport(userId)).rejects.toThrowError('Failed to retrieve report: Mocked error');
  });
});