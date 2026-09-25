// File: src/worker.js
import { scanner } from './scanner.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST' && request.url.includes('/scan')) {
    const url = await request.json();
    const scannerResult = await scanner.scan(url);
    return new Response(JSON.stringify(scannerResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === 'POST' && request.url.includes('/scanMultiple')) {
    const urls = await request.json();
    const scannerResult = await scanner.scanMultiple(urls);
    return new Response(JSON.stringify(scannerResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response('Not Found', { status: 404 });
  }
}