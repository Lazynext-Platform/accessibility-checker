// File: src/storage.js
import { D1Database } from '@platform/d1';
import { env } from '@platform/env';

const d1 = new D1Database(env.D1_DATABASE);

/**
 * Stores a user report in the D1 database.
 * 
 * @param {string} userId - The ID of the user.
 * @param {object} report - The report to store.
 * @returns {Promise<void>}
 */
export async function storeReport(userId, report) {
  try {
    await d1.put(`reports/${userId}`, report);
  } catch (error) {
    throw new Error(`Failed to store report: ${error.message}`);
  }
}

/**
 * Retrieves a user report from the D1 database.
 * 
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>}
 */
export async function getReport(userId) {
  try {
    const report = await d1.get(`reports/${userId}`);
    return report ? JSON.parse(report) : null;
  } catch (error) {
    throw new Error(`Failed to retrieve report: ${error.message}`);
  }
}

/**
 * Stores a user license in the D1 database.
 * 
 * @param {string} userId - The ID of the user.
 * @param {object} license - The license to store.
 * @returns {Promise<void>}
 */
export async function storeLicense(userId, license) {
  try {
    await d1.put(`licenses/${userId}`, license);
  } catch (error) {
    throw new Error(`Failed to store license: ${error.message}`);
  }
}

/**
 * Retrieves a user license from the D1 database.
 * 
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>}
 */
export async function getLicense(userId) {
  try {
    const license = await d1.get(`licenses/${userId}`);
    return license ? JSON.parse(license) : null;
  } catch (error) {
    throw new Error(`Failed to retrieve license: ${error.message}`);
  }
}