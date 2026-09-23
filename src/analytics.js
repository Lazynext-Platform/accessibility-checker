// File: src/analytics.js
import { platform } from 'platform';
import { sendEvent } from 'brevo';

// Define analytics events
const EVENTS = {
  TRIAL_STARTED: 'trial_started',
  PLAN_UPGRADED: 'plan_upgraded',
  SCAN_PERFORMED: 'scan_performed',
  REPORT_VIEWED: 'report_viewed',
};

// Initialize analytics
async function initAnalytics() {
  try {
    // Get the analytics tracking ID from the platform
    const trackingId = await platform.get('tracking_id');
    if (!trackingId) {
      throw new Error('Tracking ID not found');
    }
    // Initialize the analytics library
    await sendEvent('init', { trackingId });
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
}

// Track an event
async function trackEvent(event, data = {}) {
  try {
    await sendEvent(event, data);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Track trial started
async function trackTrialStarted() {
  await trackEvent(EVENTS.TRIAL_STARTED);
}

// Track plan upgraded
async function trackPlanUpgraded(plan) {
  await trackEvent(EVENTS.PLAN_UPGRADED, { plan });
}

// Track scan performed
async function trackScanPerformed() {
  await trackEvent(EVENTS.SCAN_PERFORMED);
}

// Track report viewed
async function trackReportViewed(reportId) {
  await trackEvent(EVENTS.REPORT_VIEWED, { reportId });
}

export {
  initAnalytics,
  trackEvent,
  trackTrialStarted,
  trackPlanUpgraded,
  trackScanPerformed,
  trackReportViewed,
};