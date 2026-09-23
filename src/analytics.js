// File: src/analytics.js
import { PLATFORM } from '../env.js';
import { fetch } from 'node-fetch';

/**
 * Track trial user conversion rates.
 * @param {string} userId - The ID of the user.
 * @param {string} licenseType - The type of license (e.g., Pro).
 * @param {boolean} converted - Whether the user converted to a paid plan.
 */
export async function trackTrialConversion(userId, licenseType, converted) {
  try {
    const analyticsData = {
      userId,
      licenseType,
      converted,
    };

    const response = await fetch(`${PLATFORM}/api/v1/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    });

    if (!response.ok) {
      throw new Error(`Failed to track trial conversion: ${response.status}`);
    }
  } catch (error) {
    // Log the error and continue
    console.error('Error tracking trial conversion:', error);
  }
}