// File: src/billing.js
import { DodoPayments } from '../lib/dodo-payments.js';
import { PLATFORM } from '../lib/constants.js';
import { kv } from '../lib/platform-kv.js';

// Define the Dodo Payments webhook endpoint
export async function handleDodoPaymentsWebhook(event) {
  try {
    // Verify the webhook signature
    const signature = event.headers.get('Dodo-Signature');
    const expectedSignature = await DodoPayments.verifySignature(event.body, signature);
    if (!expectedSignature) {
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse the webhook event
    const eventData = await event.json();
    const eventType = eventData.type;

    // Handle subscription status updates
    if (eventType === 'subscription_updated') {
      const subscriptionId = eventData.data.id;
      const status = eventData.data.status;

      // Update the subscription status in KV
      await kv.put(`subscription:${subscriptionId}:status`, status);

      // Notify the platform about the subscription status update
      await PLATFORM.notifySubscriptionStatusUpdate(subscriptionId, status);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    // Handle errors explicitly
    console.error('Error handling Dodo Payments webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

// Define a test for the handleDodoPaymentsWebhook function
import { test, expect } from '../test/scanner.test.mjs';

test('handleDodoPaymentsWebhook', async () => {
  // Mock the Dodo Payments webhook event
  const event = {
    headers: {
      get: (header) => {
        if (header === 'Dodo-Signature') {
          return 'signature';
        }
        return null;
      },
    },
    body: JSON.stringify({
      type: 'subscription_updated',
      data: {
        id: 'subscription-id',
        status: 'active',
      },
    }),
  };

  // Mock the kv and PLATFORM dependencies
  const kvMock = {
    put: async (key, value) => {
      expect(key).toBe('subscription:subscription-id:status');
      expect(value).toBe('active');
    },
  };
  const platformMock = {
    notifySubscriptionStatusUpdate: async (subscriptionId, status) => {
      expect(subscriptionId).toBe('subscription-id');
      expect(status).toBe('active');
    },
  };

  // Call the handleDodoPaymentsWebhook function
  const response = await handleDodoPaymentsWebhook(event);

  // Assert the response status code
  expect(response.status).toBe(200);
});