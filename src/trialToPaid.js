// File: src/trialToPaid.js
import { sendEmail } from '../email.js';
import { getTrialUsers, updateSubscription } from '../storage.js';
import { getPlatformServiceBinding } from '../platform.js';

const TRIAL_DURATION = 30; // days

/**
 * Sends reminders and promotions to trial users to convert them to paid subscribers.
 */
export async function trialToPaidWorkflow() {
  try {
    const trialUsers = await getTrialUsers();
    const platformServiceBinding = await getPlatformServiceBinding();

    trialUsers.forEach((user) => {
      const trialEndDate = new Date(user.trialStartDate + TRIAL_DURATION * 24 * 60 * 60 * 1000);
      const today = new Date();

      if (today >= trialEndDate) {
        // Trial has ended, send final reminder
        sendEmail(user.email, 'Trial Ended', 'Your trial has ended. Please subscribe to continue using our service.');
      } else if (today >= trialEndDate - 7 * 24 * 60 * 60 * 1000) {
        // 7 days before trial ends, send reminder
        sendEmail(user.email, 'Trial Ending Soon', 'Your trial is ending soon. Please subscribe to continue using our service.');
      } else if (today >= trialEndDate - 14 * 24 * 60 * 60 * 1000) {
        // 14 days before trial ends, send promotion
        sendEmail(user.email, 'Special Offer', 'We\'re offering a special discount for trial users. Subscribe now and get 10% off your first year.');
      }

      // Update subscription status
      updateSubscription(user.id, 'trial');
    });
  } catch (error) {
    console.error('Error in trialToPaidWorkflow:', error);
  }
}

// Test for trialToPaidWorkflow
import { test, expect } from '../tests/test.js';

test('trialToPaidWorkflow', async () => {
  // Mock getTrialUsers and getPlatformServiceBinding
  getTrialUsers.mockResolvedValue([
    { id: 1, email: 'user1@example.com', trialStartDate: new Date('2022-01-01T00:00:00.000Z') },
    { id: 2, email: 'user2@example.com', trialStartDate: new Date('2022-01-15T00:00:00.000Z') },
  ]);

  getPlatformServiceBinding.mockResolvedValue({});

  // Mock sendEmail
  sendEmail.mockResolvedValue(true);

  // Call trialToPaidWorkflow
  await trialToPaidWorkflow();

  // Expect sendEmail to be called with correct arguments
  expect(sendEmail).toHaveBeenCalledTimes(2);
  expect(sendEmail).toHaveBeenCalledWith('user1@example.com', 'Trial Ending Soon', 'Your trial is ending soon. Please subscribe to continue using our service.');
  expect(sendEmail).toHaveBeenCalledWith('user2@example.com', 'Special Offer', 'We\'re offering a special discount for trial users. Subscribe now and get 10% off your first year.');
});

// File: src/email.js
export async function sendEmail(to, subject, body) {
  try {
    // Implement email sending logic using Brevo via platform /email/send
    const response = await fetch('/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      throw new Error(`Error sending email: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Test for sendEmail
test('sendEmail', async () => {
  // Mock fetch
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
  });

  // Call sendEmail
  const result = await sendEmail('user@example.com', 'Test Email', 'This is a test email.');

  // Expect fetch to be called with correct arguments
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: 'user@example.com', subject: 'Test Email', body: 'This is a test email.' }),
  });

  // Expect result to be true
  expect(result).toBe(true);
});