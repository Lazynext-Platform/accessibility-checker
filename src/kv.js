// File: src/kv.js
import { PLATFORM } from '../env.js';

/**
 * Gets a license from the KV store.
 * @param {string} licenseId - The ID of the license.
 */
export async function getLicense(licenseId) {
  try {
    const response = await fetch(`${PLATFORM}/kv/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: licenseId }),
    });
    if (!response.ok) {
      throw new Error(`Error getting license: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting license:', error);
  }
}

/**
 * Updates a license in the KV store.
 * @param {string} licenseId - The ID of the license.
 * @param {object} updates - The updates to apply to the license.
 */
export async function updateLicense(licenseId, updates) {
  try {
    const response = await fetch(`${PLATFORM}/kv/put`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: licenseId, value: updates }),
    });
    if (!response.ok) {
      throw new Error(`Error updating license: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating license:', error);
  }
}