// File: worker.js
import { scanner } from './src/scanner.js';

// Handle upgrade to Pro license API call
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/checkout')) {
    event.respondWith(handleCheckout(event.request));
  }
});

async function handleCheckout(request) {
  const { licenseKey, paymentMethod } = await request.json();
  // Call platform API to upgrade to Pro license
  const response = await fetch(env.PLATFORM + '/api/v1/billing/upgrade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      licenseKey: licenseKey,
      paymentMethod: paymentMethod
    })
  });
  return response;
}