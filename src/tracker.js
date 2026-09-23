// File: src/tracker.js
import { KV } from '@cloudflare/workers';
import { D1Database } from '@cloudflare/workers-d1';

// Initialize KV and D1 instances
const kv = new KV('TRACKER_KV');
const d1 = new D1Database('TRACKER_D1');

// Function to track user behavior
export async function trackUserBehavior(event) {
  try {
    // Increment user behavior counter in KV
    await kv.put(`user_behavior:${event}`, (await kv.get(`user_behavior:${event}`)) || 0, { expirationTtl: 60 * 60 * 24 }); // 1 day TTL

    // Log event to D1
    await d1.exec(`INSERT INTO user_behavior (event) VALUES (${event})`);
  } catch (error) {
    console.error('Error tracking user behavior:', error);
  }
}

// Function to track error rates
export async function trackErrorRate(error) {
  try {
    // Increment error rate counter in KV
    await kv.put(`error_rate:${error}`, (await kv.get(`error_rate:${error}`)) || 0, { expirationTtl: 60 * 60 * 24 }); // 1 day TTL

    // Log error to D1
    await d1.exec(`INSERT INTO error_rate (error) VALUES (${error})`);
  } catch (error) {
    console.error('Error tracking error rate:', error);
  }
}