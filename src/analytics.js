// File: src/analytics.js
import { KV } from '@cloudflare/workers';
import {PLATFORM} from 'env';

const analyticsKV = new KV(PLATFORM.KV_NAMESPACE);

/**
 * Record user behavior data
 * @param {string} userId - Unique user ID
 * @param {string} action - User action (e.g., 'scan', 'report')
 */
export async function recordUserBehavior(userId, action) {
  try {
    const data = await analyticsKV.get(`user:${userId}:behavior`);
    if (data) {
      const behaviorData = JSON.parse(data);
      behaviorData[action] = (behaviorData[action] || 0) + 1;
      await analyticsKV.put(`user:${userId}:behavior`, JSON.stringify(behaviorData));
    } else {
      await analyticsKV.put(`user:${userId}:behavior`, JSON.stringify({ [action]: 1 }));
    }
  } catch (error) {
    console.error('Error recording user behavior:', error);
  }
}

/**
 * Record error data
 * @param {string} userId - Unique user ID
 * @param {string} errorType - Error type (e.g., 'scan', 'report')
 */
export async function recordError(userId, errorType) {
  try {
    const data = await analyticsKV.get(`user:${userId}:errors`);
    if (data) {
      const errorData = JSON.parse(data);
      errorData[errorType] = (errorData[errorType] || 0) + 1;
      await analyticsKV.put(`user:${userId}:errors`, JSON.stringify(errorData));
    } else {
      await analyticsKV.put(`user:${userId}:errors`, JSON.stringify({ [errorType]: 1 }));
    }
  } catch (error) {
    console.error('Error recording error:', error);
  }
}

/**
 * Get user behavior data
 * @param {string} userId - Unique user ID
 * @returns {object} User behavior data
 */
export async function getUserBehavior(userId) {
  try {
    const data = await analyticsKV.get(`user:${userId}:behavior`);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting user behavior:', error);
    return {};
  }
}

/**
 * Get error data
 * @param {string} userId - Unique user ID
 * @returns {object} Error data
 */
export async function getErrors(userId) {
  try {
    const data = await analyticsKV.get(`user:${userId}:errors`);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting errors:', error);
    return {};
  }
}