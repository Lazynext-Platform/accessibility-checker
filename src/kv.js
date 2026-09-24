// File: src/kv.js
import { PLATFORM } from '../platform.js';

/**
 * Gets the quota for a user from the KV store.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number|null>} The quota for the user, or null if not set.
 */
export async function getQuota(userId) {
  try {
    const quota = await PLATFORM.kv.get(`quota:${userId}`);
    return quota === null ? null : parseInt(quota);
  } catch (error) {
    console.error(`Error getting quota: ${error}`);
    throw error;
  }
}

/**
 * Updates the quota for a user in the KV store.
 * @param {string} userId - The ID of the user.
 * @param {number|null} quota - The new quota for the user, or null to remove the quota.
 * @returns {Promise<void>} A promise that resolves when the quota has been updated.
 */
export async function updateQuota(userId, quota) {
  try {
    if (quota === null) {
      await PLATFORM.kv.delete(`quota:${userId}`);
    } else {
      await PLATFORM.kv.put(`quota:${userId}`, quota.toString());
    }
  } catch (error) {
    console.error(`Error updating quota: ${error}`);
    throw error;
  }
}