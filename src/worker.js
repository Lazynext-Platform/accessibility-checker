// File: src/worker.js
import { handleScanRequest } from './scanner.js';

addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('/scan')) {
    event.respondWith(handleScanRequest(event.request));
  }
});