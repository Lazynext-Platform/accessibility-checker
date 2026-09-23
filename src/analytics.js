// File: src/analytics.js
export class Analytics {
  constructor(serviceUrl) {
    this.serviceUrl = serviceUrl;
  }

  async trackEvent(eventName, eventData) {
    try {
      const response = await fetch(this.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: eventName, data: eventData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}