// File: src/routes/accessibility.js
import { Router } from 'cloudflare-worker-router';
import { validate } from 'src/validation';
import { KV } from '@cloudflare/kv';
import { D1 } from '@cloudflare/d1';
import { sendEmail } from 'src/email';

const router = new Router();
const kv = new KV('ACCESSIBILITY_CHECKER_KV');
const d1 = new D1('ACCESSIBILITY_CHECKER_D1');

// MCP Endpoint
router.post('/mcp', async (request, context) => {
  try {
    const { metadata, content } = await request.json();
    validate(metadata, 'object');
    validate(content, 'string');

    // Process metadata and content
    const result = await processMetadataAndContent(metadata, content);

    // Store result in KV
    await kv.put('mcp_result', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(error.message, { status: 400 });
  }
});

// A2A Endpoint
router.post('/a2a', async (request, context) => {
  try {
    const { url } = await request.json();
    validate(url, 'string');

    // Check accessibility
    const result = await checkAccessibility(url);

    // Store result in D1
    await d1.query(`INSERT INTO accessibility_results (url, result) VALUES (${url}, ${result})`);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(error.message, { status: 400 });
  }
});

// Widget Endpoint
router.get('/widget', async (request, context) => {
  try {
    const { url } = request.url.searchParams;
    validate(url, 'string');

    // Get accessibility result from D1
    const result = await d1.query(`SELECT result FROM accessibility_results WHERE url = ${url}`);

    // Return widget HTML with accessibility result
    return new Response(`
      <div>
        <h1>Accessibility Result</h1>
        <p>${result}</p>
      </div>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response(error.message, { status: 400 });
  }
});

// Process metadata and content
async function processMetadataAndContent(metadata, content) {
  // TO DO: Implement metadata and content processing logic
  return { metadata, content };
}

// Check accessibility
async function checkAccessibility(url) {
  // TO DO: Implement accessibility checking logic
  return 'accessible';
}

// Tests
import { test } from 'src/test';

test('MCP endpoint', async () => {
  const request = new Request('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {}, content: 'example content' }),
  });

  const response = await router.handle(request);
  expect(response.status).toBe(200);
});

test('A2A endpoint', async () => {
  const request = new Request('/a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });

  const response = await router.handle(request);
  expect(response.status).toBe(200);
});

test('Widget endpoint', async () => {
  const request = new Request('/widget?url=https://example.com', {
    method: 'GET',
  });

  const response = await router.handle(request);
  expect(response.status).toBe(200);
});