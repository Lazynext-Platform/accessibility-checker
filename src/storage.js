// File: src/storage.js
import { D1 } from '@cloudflare/d1';

const d1 = new D1('accessibility-checker');

async function getQuota(userId) {
  try {
    const quota = await d1.get(`quotas/${userId}`);
    return quota;
  } catch (error) {
    // Handle error explicitly
    console.error('Error getting quota:', error);
    throw error;
  }
}

async function updateQuota(userId, newQuota) {
  try {
    await d1.put(`quotas/${userId}`, newQuota);
  } catch (error) {
    // Handle error explicitly
    console.error('Error updating quota:', error);
    throw error;
  }
}