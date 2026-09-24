// File: src/dodo-payments-webhook.js
import { PLATFORM } from '../env.js';
import { kv } from '../platform/kv.js';
import { sendEmail } from '../platform/email.js';

/**
 * Handles Dodo Payments webhook events.
 *
 * @param {Object} event - The webhook event data.
 * @param {string} event.type - The type of event (e.g., 'subscription_created', 'subscription_updated', etc.).
 * @param {string} event.data.customer_id - The ID of the customer.
 * @param {string} event.data.subscription_id - The ID of the subscription.
 */
export async function handleDodoPaymentsWebhook(event) {
  try {
    const { type, data } = event;
    const { customer_id, subscription_id } = data;

    // Update customer record in KV store
    await kv.put(`customer:${customer_id}`, {
      subscription_id,
      status: type === 'subscription_created' ? 'active' : 'inactive',
    });

    // Send email notification to customer
    if (type === 'subscription_created') {
      await sendEmail({
        to: await kv.get(`customer:${customer_id}:email`),
        subject: 'Subscription Created',
        body: 'Your subscription has been created successfully.',
      });
    } else if (type === 'subscription_updated') {
      await sendEmail({
        to: await kv.get(`customer:${customer_id}:email`),
        subject: 'Subscription Updated',
        body: 'Your subscription has been updated successfully.',
      });
    }
  } catch (error) {
    // Log error and return 500 response
    console.error('Error handling Dodo Payments webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Test suite
import { test, expect } from '../test/scanner.test.mjs';

test('handleDodoPaymentsWebhook', async () => {
  const event = {
    type: 'subscription_created',
    data: {
      customer_id: 'customer-123',
      subscription_id: 'subscription-123',
    },
  };

  const kvPutSpy = jest.spyOn(kv, 'put');
  const sendEmailSpy = jest.spyOn(sendEmail, 'default');

  await handleDodoPaymentsWebhook(event);

  expect(kvPutSpy).toHaveBeenCalledTimes(1);
  expect(kvPutSpy).toHaveBeenCalledWith('customer:customer-123', {
    subscription_id: 'subscription-123',
    status: 'active',
  });

  expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  expect(sendEmailSpy).toHaveBeenCalledWith({
    to: await kv.get('customer:customer-123:email'),
    subject: 'Subscription Created',
    body: 'Your subscription has been created successfully.',
  });
});