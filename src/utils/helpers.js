// File: src/utils/helpers.js
/**
 * Helper functions for the scanner.
 * @module helpers
 */

/**
 * Checks if a string is empty or null.
 * @param {string} str - The input string.
 * @returns {boolean} True if the string is empty or null, false otherwise.
 */
export function isEmptyString(str) {
  return str === null || str === undefined || str.trim() === '';
}

/**
 * Checks if a value is a valid URL.
 * @param {string} url - The input URL.
 * @returns {boolean} True if the value is a valid URL, false otherwise.
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts the domain from a URL.
 * @param {string} url - The input URL.
 * @returns {string} The domain of the URL.
 */
export function extractDomain(url) {
  const urlObject = new URL(url);
  return urlObject.hostname;
}

/**
 * Checks if a value is a valid email address.
 * @param {string} email - The input email address.
 * @returns {boolean} True if the value is a valid email address, false otherwise.
 */
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}