// File: src/worker.js
import { trackUserBehavior, trackErrorRate } from './tracker.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Track user behavior
    await trackUserBehavior('request');

    // Handle request
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Track error rate
    await trackErrorRate('error');

    // Return error response
    return new Response('Error occurred', { status: 500 });
  }
}