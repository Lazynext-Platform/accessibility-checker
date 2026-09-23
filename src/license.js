// File: src/license.js
import { PLATFORM } from '../env.js';
import { kv } from '../platform/kv.js';
import { d1 } from '../platform/d1.js';

const FREE_TRIAL_DAYS = 14;

/**
 * Create a new free trial license for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} licenseId - The ID of the license.
 * @returns {Promise<void>} A promise that resolves when the license is created.
 */
async function createFreeTrialLicense(userId, licenseId) {
  try {
    // Get the current timestamp
    const now = new Date().getTime();

    // Calculate the expiration timestamp
    const expiresAt = now + (FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

    // Create a new license entry in KV
    await kv.put(`license:${licenseId}`, {
      userId,
      expiresAt,
      plan: 'pro',
    });

    // Update the user's quota in D1
    await d1.query(`UPDATE users SET quota = quota + 1 WHERE id = ${userId}`);

    // Send a welcome email to the user
    await sendWelcomeEmail(userId);
  } catch (error) {
    // Handle errors explicitly
    console.error(`Error creating free trial license: ${error}`);
    throw error;
  }
}

/**
 * Check if a license is still within its free trial period.
 * @param {string} licenseId - The ID of the license.
 * @returns {Promise<boolean>} A promise that resolves with true if the license is still within its free trial period, false otherwise.
 */
async function isFreeTrialActive(licenseId) {
  try {
    // Get the license entry from KV
    const license = await kv.get(`license:${licenseId}`);

    // Check if the license exists and is still within its free trial period
    if (license && license.expiresAt > new Date().getTime()) {
      return true;
    }

    return false;
  } catch (error) {
    // Handle errors explicitly
    console.error(`Error checking free trial status: ${error}`);
    throw error;
  }
}

/**
 * Send a welcome email to a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
async function sendWelcomeEmail(userId) {
  try {
    // Use the Brevo email service to send a welcome email
    await fetch(`${PLATFORM}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userId,
        subject: 'Welcome to Accessibility Checker!',
        text: 'Thank you for trying out Accessibility Checker!',
      }),
    });
  } catch (error) {
    // Handle errors explicitly
    console.error(`Error sending welcome email: ${error}`);
    throw error;
  }
}

export { createFreeTrialLicense, isFreeTrialActive };