// File: src/cache.js
import { Cache } from '@cloudflare/cache';

const cache = new Cache('accessibility-checker');

async function get(url) {
  try {
    const result = await cache.get(url);
    return result;
  } catch (error) {
    // Handle error explicitly
    console.error('Error getting from cache:', error);
    throw error;
  }
}

async function set(url, result) {
  try {
    await cache.set(url, result);
  } catch (error) {
    // Handle error explicitly
    console.error('Error setting cache:', error);
    throw error;
  }
}