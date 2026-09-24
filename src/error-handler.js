// File: src/error-handler.js
import { Error } from '@cloudflare/error';

async function handleError(error) {
  try {
    // Handle error explicitly
    console.error('Error:', error);
    throw error;
  } catch (error) {
    // Handle error explicitly
    console.error('Error handling error:', error);
    throw error;
  }
}