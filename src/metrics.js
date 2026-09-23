import { env } from './env.js';

const metrics = {
  trackEvent: (category, action, label) => {
    if (env.analyticsEnabled) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  },

  trackPageView: (path) => {
    if (env.analyticsEnabled) {
      window.gtag('config', env.gaTrackingId, {
        page_path: path,
      });
    }
  },

  init: () => {
    if (env.analyticsEnabled) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${env.gaTrackingId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', env.gaTrackingId);
    }
  },
};

export { metrics };