// File: test/scanner.test.mjs
import { scan } from '../src/scanner.js';
import { Analytics } from '../src/analytics.js';

describe('Scanner', () => {
  it('tracks scan results successfully', async () => {
    const url = 'https://example.com';
    const scanResult = { url, result: 'passed' };

    const analyticsMock = jest.spyOn(Analytics.prototype, 'trackEvent').mockResolvedValue();

    const result = await scan(url);

    expect(analyticsMock).toHaveBeenCalledTimes(1);
    expect(analyticsMock).toHaveBeenCalledWith('scan_result', {
      url,
      result: scanResult,
    });
  });

  it('tracks scan errors', async () => {
    const url = 'https://example.com';
    const error = new Error('Test error');

    const analyticsMock = jest.spyOn(Analytics.prototype, 'trackEvent').mockResolvedValue();

    try {
      await scan(url);
      throw error;
    } catch (caughtError) {
      expect(caughtError).toBe(error);
      expect(analyticsMock).toHaveBeenCalledTimes(1);
      expect(analyticsMock).toHaveBeenCalledWith('scan_error', {
        url,
        error: error.message,
      });
    }
  });
});