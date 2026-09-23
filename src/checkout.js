// File: src/checkout.js
import { DODO_CHECKOUT_URL } from './constants.js';
import { getPlatformEnv } from './platform.js';

/**
 * Generates a Dodo checkout link with UTM tracking parameters.
 * @param {Object} options - Options for the checkout link.
 * @param {string} options.utmSource - The source of the traffic.
 * @param {string} options.utmMedium - The marketing medium.
 * @param {string} options.utmCampaign - The campaign name.
 * @returns {string} The generated checkout link.
 */
export function generateCheckoutLink(options) {
  const { utmSource, utmMedium, utmCampaign } = options;
  const platformEnv = getPlatformEnv();
  const baseUrl = DODO_CHECKOUT_URL;
  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Handles errors when generating the checkout link.
 * @param {Error} error - The error that occurred.
 * @returns {string} The error message.
 */
export function handleCheckoutLinkError(error) {
  console.error('Error generating checkout link:', error);
  return 'Error generating checkout link. Please try again.';
}