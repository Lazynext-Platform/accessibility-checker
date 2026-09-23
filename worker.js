// File: worker.js
import { getScanningOptions, updateScanningOptions, validateScanningOptions } from './src/scanner.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'GET' && request.url.pathname === '/scan') {
    const scanningOptions = await getScanningOptions();
    return new Response(JSON.stringify(scanningOptions), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === 'POST' && request.url.pathname === '/scan') {
    const newOptions = await request.json();
    try {
      validateScanningOptions(newOptions);
      const result = await updateScanningOptions(newOptions);
      if (result) {
        return new Response('Scanning options updated successfully', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        return new Response('Failed to update scanning options', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    } catch (error) {
      return new Response('Invalid scanning options: ' + error.message, {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  } else {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}