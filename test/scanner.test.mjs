// File: test/scanner.test.mjs
import { getScanningOptions, updateScanningOptions, validateScanningOptions } from '../src/scanner.js';

describe('Scanning options', () => {
  it('gets default scanning options', async () => {
    const options = await getScanningOptions();
    expect(options).toEqual({
      scanDepth: 5,
      scanFrequency: 'daily',
      ignoreUrls: [],
    });
  });

  it('updates scanning options', async () => {
    const newOptions = {
      scanDepth: 3,
      scanFrequency: 'weekly',
      ignoreUrls: ['https://example.com'],
    };
    const result = await updateScanningOptions(newOptions);
    expect(result).toBe(true);
  });

  it('validates scanning options', () => {
    const validOptions = {
      scanDepth: 5,
      scanFrequency: 'daily',
      ignoreUrls: [],
    };
    expect(() => validateScanningOptions(validOptions)).not.toThrow();

    const invalidOptions = {
      scanDepth: 15,
      scanFrequency: 'invalid',
      ignoreUrls: 'string',
    };
    expect(() => validateScanningOptions(invalidOptions)).toThrow();
  });
});