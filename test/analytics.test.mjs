// File: test/analytics.test.mjs
import { Analytics } from '../src/analytics.js';

describe('Analytics', () => {
  it('tracks events successfully', async () => {
    const serviceUrl = 'https://example-analytics-service.com/track';
    const analytics = new Analytics(serviceUrl);
    const eventName = 'test_event';
    const eventData = { test: 'data' };

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
    });

    await analytics.trackEvent(eventName, eventData);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: eventName, data: eventData }),
    });
  });

  it('handles tracking errors', async () => {
    const serviceUrl = 'https://example-analytics-service.com/track';
    const analytics = new Analytics(serviceUrl);
    const eventName = 'test_event';
    const eventData = { test: 'data' };

    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(
      new Error('Test error')
    );

    await analytics.trackEvent(eventName, eventData);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});