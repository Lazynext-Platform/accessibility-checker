// File: test/payment-processing.test.mjs
import { describe, it, expect, beforeEach } from 'node:test';
import { initPaymentProcessing, processPayment, manageSubscription } from '../src/payment-processing.js';
import { setupPlatformMock } from './platform-mock.js';

describe('Payment Processing', () => {
  let platformMock;

  beforeEach(async () => {
    platformMock = await setupPlatformMock();
  });

  it('should process payment successfully', async () => {
    const paymentData = { amount: 10.99, currency: 'USD' };
    const result = await processPayment(paymentData, platformMock);
    expect(result.success).toBe(true);
  });

  it('should handle payment processing error', async () => {
    const paymentData = { amount: 10.99, currency: 'USD' };
    platformMock.paymentProcessingMock.reject('Error processing payment');
    const result = await processPayment(paymentData, platformMock);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error processing payment');
  });
});

describe('Subscription Management', () => {
  let platformMock;

  beforeEach(async () => {
    platformMock = await setupPlatformMock();
  });

  it('should manage subscription successfully', async () => {
    const subscriptionData = { plan: 'monthly', customer: 'John Doe' };
    const result = await manageSubscription(subscriptionData, platformMock);
    expect(result.success).toBe(true);
  });

  it('should handle subscription management error', async () => {
    const subscriptionData = { plan: 'monthly', customer: 'John Doe' };
    platformMock.subscriptionManagementMock.reject('Error managing subscription');
    const result = await manageSubscription(subscriptionData, platformMock);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error managing subscription');
  });
});