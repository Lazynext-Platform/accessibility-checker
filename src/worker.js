// File: src/worker.js
import { startTrial } from './license.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST' && request.url.includes('/start-trial')) {
    const userId = await request.json().then((data) => data.userId);
    try {
      const trialLicense = await startTrial(userId);
      return new Response(JSON.stringify(trialLicense), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(error.message, { status: 400 });
    }
  } else {
    return new Response('Not Found', { status: 404 });
  }
}