// File: src/worker.js
import { recordUserBehavior, recordError, getUserBehavior, getErrors } from './analytics.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST' && request.url.includes('/analytics')) {
    const { userId, action } = await request.json();
    if (action === 'record-behavior') {
      await recordUserBehavior(userId, request.headers.get('action'));
      return new Response('Behavior recorded', { status: 200 });
    } else if (action === 'record-error') {
      await recordError(userId, request.headers.get('error-type'));
      return new Response('Error recorded', { status: 200 });
    }
  } else if (request.method === 'GET' && request.url.includes('/analytics')) {
    const userId = request.url.split('/').pop();
    if (request.url.includes('/behavior')) {
      const data = await getUserBehavior(userId);
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else if (request.url.includes('/errors')) {
      const data = await getErrors(userId);
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }
  return new Response('Not Found', { status: 404 });
}