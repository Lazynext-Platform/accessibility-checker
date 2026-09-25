// Error-path coverage for worker.js — the routes worker-routes.test.mjs
// doesn't reach: malformed bodies, bad schemes, upstream failures, CORS
// preflight, method mismatches, and monitor validation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';

function mockEnv(kv = {}, handlers = {}) {
  return {
    PLATFORM_TOKEN: 'test-token',
    PLATFORM: {
      fetch: async (req) => {
        const path = new URL(req.url).pathname;
        if (handlers[path]) return handlers[path](req);
        if (path === '/kv/get') {
          const b = await req.json();
          return Response.json({ value: kv[b.key] ?? null });
        }
        if (path === '/kv/list') {
          const b = await req.json();
          return Response.json({ keys: Object.keys(kv).filter((k) => k.startsWith(b.prefix ?? '')) });
        }
        return Response.json({ ok: true });
      },
    },
  };
}

const get = (path, opts = {}, env = mockEnv()) =>
  worker.fetch(new Request(`https://checker.test${path}`, { method: 'GET', ...opts }), env);
const post = (path, body, opts = {}, env = mockEnv()) =>
  worker.fetch(new Request(`https://checker.test${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), ...opts }), env);
const raw = (method, path, init = {}, env = mockEnv()) =>
  worker.fetch(new Request(`https://checker.test${path}`, { method, ...init }), env);

// ── Body parsing ─────────────────────────────────────────────────────────

test('POST /scan 400s on a malformed JSON body', async () => {
  const r = await raw('POST', '/scan', { headers: { 'content-type': 'application/json' }, body: '{not json' });
  assert.equal(r.status, 400);
});

test('POST /scan 400s on an empty JSON body', async () => {
  const r = await post('/scan', {});
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /url|html/i);
});

test('POST /scan rejects non-http URL schemes', async () => {
  for (const u of ['ftp://x.test/file', 'file:///etc/passwd', 'javascript:alert(1)']) {
    const r = await post('/scan', { url: u, license: 'pro@x.test' }, {}, mockEnv({ 'license:pro@x.test': 'pro' }));
    assert.equal(r.status, 400, u);
  }
});

test('POST /scan prefers url over html when both are present', async () => {
  const env = mockEnv({ 'license:pro@x.test': 'pro' }, {
    '/render': async () => Response.json({ html: '<html><body><h1>x</h1></body></html>', styles: [], facts: {}, focus: [], focusable: 1 }),
  });
  const r = await post('/scan', { url: 'https://x.test', html: '<img src=a>', license: 'pro@x.test' }, {}, env);
  const d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.rendered, true); // url path won — render stub was consumed
});

// ── Upstream failures ────────────────────────────────────────────────────

test('POST /scan falls back to a raw fetch and flags render_error when /render fails', async (t) => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('<html><body><p>fallback</p></body></html>');
  t.after(() => { globalThis.fetch = origFetch; });
  const env = mockEnv({ 'license:pro@x.test': 'pro' }, { '/render': async () => new Response('boom', { status: 500 }) });
  const r = await post('/scan', { url: 'https://x.test', license: 'pro@x.test' }, {}, env);
  const d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.rendered, false);
  assert.match(d.render_error, /render 500/);
});

test('POST /scan site scan 502s when the crawl yields no pages', async (t) => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('dns fail'); };
  t.after(() => { globalThis.fetch = origFetch; });
  const r = await post('/scan', { url: 'https://x.test', site: true, license: 'pro@x.test' }, {}, mockEnv({ 'license:pro@x.test': 'pro' }));
  assert.equal(r.status, 502);
});

test('GET /report/:id.pdf 502s when the platform render fails', async () => {
  const env = mockEnv(
    { 'report:r1': JSON.stringify({ url: 'https://x', ts: 0, score: 90, issues: [] }) },
    { '/pdf': async () => new Response('boom', { status: 500 }) },
  );
  const r = await get('/report/r1.pdf', {}, env);
  assert.equal(r.status, 502);
});

// ── Badge / rules / methods ──────────────────────────────────────────────

test('GET /badge/:id.svg 404s when the report is absent', async () => {
  const r = await get('/badge/nope.svg');
  assert.equal(r.status, 404);
});

test('OPTIONS preflight returns 204 with CORS headers', async () => {
  const r = await raw('OPTIONS', '/scan');
  assert.equal(r.status, 204);
  assert.ok(r.headers.get('access-control-allow-origin'));
  assert.match(r.headers.get('access-control-allow-methods'), /POST/);
});

test('POST on a read-only route 404s', async () => {
  const r = await post('/rules', {});
  assert.equal(r.status, 404);
});

// ── Monitor validation ───────────────────────────────────────────────────

test('POST /monitor 400s for a Pro license with no url', async () => {
  const r = await post('/monitor', { license: 'pro@x.test' }, {}, mockEnv({ 'license:pro@x.test': 'pro' }));
  assert.equal(r.status, 400);
});

test('DELETE /monitor 400s for a Pro license with no url', async () => {
  const env = mockEnv({ 'license:pro@x.test': 'pro' });
  const r = await raw('DELETE', '/monitor', { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ license: 'pro@x.test' }) }, env);
  assert.equal(r.status, 400);
});

test('GET /monitor 402s for a non-Pro license', async () => {
  const r = await get('/monitor?license=free@x.test');
  assert.equal(r.status, 402);
});

test('GET /monitor returns an empty list for a Pro license with no monitors', async () => {
  const r = await get('/monitor?license=pro@x.test', {}, mockEnv({ 'license:pro@x.test': 'pro' }));
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).monitors, []);
});

// ── Lead / cancel edge cases ─────────────────────────────────────────────

test('POST /lead 400s on a malformed JSON body', async () => {
  const r = await raw('POST', '/lead', { headers: { 'content-type': 'application/json' }, body: 'oops' });
  assert.equal(r.status, 400);
});

test('POST /cancel 404s for a well-formed but non-Pro email', async () => {
  const r = await post('/cancel', { license: 'nobody@x.test' });
  assert.equal(r.status, 404);
});
