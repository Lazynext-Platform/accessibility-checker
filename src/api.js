// File: src/api.js
import { runWcagChecks } from './scanner.js';

// Define API endpoint for running WCAG 2.2 checks
export async function handleRequest(request) {
  const { html } = await request.json();
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const results = await runWcagChecks(dom);
  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}