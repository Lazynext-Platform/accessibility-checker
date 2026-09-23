// File: src/ui.js
import { Analytics } from './analytics.js';

const analyticsServiceUrl = 'https://example-analytics-service.com/track';
const analytics = new Analytics(analyticsServiceUrl);

const scanButton = document.getElementById('scan-button');

scanButton.addEventListener('click', async () => {
  try {
    await analytics.trackEvent('scan_initiated');
    // Perform scan logic here
  } catch (error) {
    console.error('Error tracking event:', error);
  }
});