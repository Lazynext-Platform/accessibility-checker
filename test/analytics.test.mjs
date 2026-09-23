// File: test/analytics.test.mjs
import { initAnalytics, trackEvent, trackTrialStarted, trackPlanUpgraded, trackScanPerformed, trackReportViewed } from '../src/analytics.js';
import { platform } from 'platform';
import { sendEvent } from 'brevo';

jest.mock('platform', () => ({
  get: jest.fn(),
}));

jest.mock('brevo', () => ({
  sendEvent: jest.fn(),
}));

describe('Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes analytics with tracking ID', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('init', { trackingId: 'tracking-id' });
  });

  it('tracks an event', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    await trackEvent('test_event');
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent).toHaveBeenCalledWith('test_event', {});
  });

  it('tracks trial started', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    await trackTrialStarted();
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent).toHaveBeenCalledWith('trial_started', {});
  });

  it('tracks plan upgraded', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    await trackPlanUpgraded('pro');
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent).toHaveBeenCalledWith('plan_upgraded', { plan: 'pro' });
  });

  it('tracks scan performed', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    await trackScanPerformed();
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent).toHaveBeenCalledWith('scan_performed', {});
  });

  it('tracks report viewed', async () => {
    platform.get.mockResolvedValue('tracking-id');
    await initAnalytics();
    await trackReportViewed('report-1');
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent).toHaveBeenCalledWith('report_viewed', { reportId: 'report-1' });
  });
});