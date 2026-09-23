// File: worker.js
import { D1Storage } from './src/d1Storage.js';
import { platform } from '../platform.js';

const storage = new D1Storage(platform);

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST' && request.url.includes('/store')) {
    const key = request.headers.get('key');
    const value = await request.text();

    try {
      await storage.put(key, value);
      return new Response('Data stored successfully', { status: 201 });
    } catch (error) {
      return new Response(`Error storing data: ${error.message}`, { status: 500 });
    }
  } else if (request.method === 'GET' && request.url.includes('/retrieve')) {
    const key = request.headers.get('key');

    try {
      const value = await storage.get(key);
      return new Response(value, { status: 200 });
    } catch (error) {
      return new Response(`Error retrieving data: ${error.message}`, { status: 500 });
    }
  } else {
    return new Response('Invalid request', { status: 400 });
  }
}