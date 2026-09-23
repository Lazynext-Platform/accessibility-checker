// File: src/checkout.js
import { trackTrialConversion } from './analytics.js';

/**
 * Handle checkout completion.
 * @param {string} userId - The ID of the user.
 * @param {string} licenseType - The type of license (e.g., Pro).
 */
export async function handleCheckoutCompletion(userId, licenseType) {
  // Existing checkout logic...

  // Track trial conversion
  await trackTrialConversion(userId, licenseType, true);
}