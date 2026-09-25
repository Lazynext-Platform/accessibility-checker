// Agent-surface coverage: /.well-known/agent.json, /mcp (JSON-RPC tools),
// /a2a (message/send + tasks/get), /widget.js, /sw.js — and the shared-quota
// invariant that agent scans consume the same free tier as POST /scan.
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
        if (path === '/render') {
          return Response.json({
            html: '<html lang="en"><body><main><h1>Hi</h1><a href="/x">x</a></main></body></html>',
            styles: [], facts: {}, focus: ['a'], focusable: 1, escape: true,
          });
        }
        return Response.json({ ok: true });
      },
    },
  };
}

const get = (path, env = mockEnv()) =>
  worker.fetch(new Request(`https://checker.test${path}`, { method: 'GET' }), env);
const rpc = (path, msg, env = mockEnv()) =>
  worker.fetch(new Request(`https://checker.test${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, ...msg }),
  }), env);
const day = new Date().toISOString().slice(0, 10);

// ── Agent card ──────────────────────────────────────────────────────────

test('GET /.well-known/agent.json advertises the scan skills', async () => {
  const r = await get('/.well-known/agent.json');
  assert.equal(r.status, 200);
  const card = await r.json();
  assert.equal(card.name, 'Accessibility Checker');
  assert.ok(card.skills.some((s) => s.id === 'scan_url'));
  assert.ok(card.url.endsWith('/a2a'));
});

// ── MCP ─────────────────────────────────────────────────────────────────

test('GET /mcp is 405 (no SSE stream)', async () => {
  const r = await get('/mcp');
  assert.equal(r.status, 405);
});

test('POST /mcp rejects malformed JSON-RPC', async () => {
  const r = await rpc('/mcp', { method: 'tools/list', jsonrpc: '1.0' });
  assert.equal(r.status, 400);
});

test('MCP initialize returns serverInfo + protocolVersion', async () => {
  const r = await rpc('/mcp', { method: 'initialize', params: {} });
  const d = await r.json();
  assert.equal(d.result.serverInfo.name, 'accessibility-checker');
  assert.ok(d.result.protocolVersion);
});

test('MCP tools/list exposes the four product tools', async () => {
  const r = await rpc('/mcp', { method: 'tools/list' });
  const { tools } = (await r.json()).result;
  const names = tools.map((t) => t.name);
  for (const n of ['scan_url', 'scan_html', 'get_report', 'list_rules']) assert.ok(names.includes(n), n);
});

test('MCP tools/call scan_html returns real findings', async () => {
  const r = await rpc('/mcp', {
    method: 'tools/call',
    params: { name: 'scan_html', arguments: { html: '<html><body><img src="x.png"></body></html>' } },
  });
  const d = await r.json();
  const data = d.result.structuredContent;
  assert.ok(data.score < 100);
  assert.ok(data.issues.some((i) => i.rule === 'wcag-1.1.1'));
  assert.ok(data.report.includes('/report/'));
});

test('MCP tools/call rejects unknown tools with -32602', async () => {
  const r = await rpc('/mcp', { method: 'tools/call', params: { name: 'nope' } });
  assert.equal((await r.json()).error.code, -32602);
});

test('MCP unknown method returns -32601', async () => {
  const r = await rpc('/mcp', { method: 'resources/list' });
  assert.equal((await r.json()).error.code, -32601);
});

test('MCP notification (no id) is acknowledged with 202', async () => {
  const r = await worker.fetch(new Request('https://checker.test/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  }), mockEnv());
  assert.equal(r.status, 202);
});

test('MCP get_report fetches a persisted scan by id', async () => {
  const env = mockEnv({ 'report:abc123': JSON.stringify({ score: 88, issues: [] }) });
  const r = await rpc('/mcp', { method: 'tools/call', params: { name: 'get_report', arguments: { id: 'abc123' } } }, env);
  assert.equal((await r.json()).result.structuredContent.score, 88);
});

test('MCP scan_url shares the free /scan quota', async () => {
  // Pre-fill the daily counter — a caller who burned 3 scans on /scan gets
  // the same 402 here; the agent protocol can't bypass the free tier.
  const env = mockEnv({ [`rl:scan:anon:${day}`]: '3' });
  const r = await rpc('/mcp', {
    method: 'tools/call',
    params: { name: 'scan_url', arguments: { url: 'https://example.com' } },
  }, env);
  const data = (await r.json()).result.structuredContent;
  assert.equal(data.status, 402);
  assert.match(data.error, /free limit/);
});

// ── A2A ─────────────────────────────────────────────────────────────────

test('A2A message/send with a URL completes a task with a report artifact', async () => {
  const r = await rpc('/a2a', {
    method: 'message/send',
    params: { message: { parts: [{ type: 'text', text: 'scan https://example.com please' }] } },
  });
  const d = await r.json();
  assert.equal(d.result.task.status.state, 'completed');
  const data = d.result.task.artifacts[0].parts[0].data;
  assert.ok(typeof data.score === 'number');
  assert.ok(data.report.includes(d.result.task.id));
});

test('A2A message/send with HTML markup scans it', async () => {
  const r = await rpc('/a2a', {
    method: 'tasks/send',
    params: { message: { parts: [{ type: 'text', text: '<html><body><img src="x.png"></body></html>' }] } },
  });
  const d = await r.json();
  const data = d.result.task.artifacts[0].parts[0].data;
  assert.ok(data.issues.some((i) => i.rule === 'wcag-1.1.1'));
});

test('A2A tasks/get replays a completed task from its report id', async () => {
  const env = mockEnv({ 'report:task9': JSON.stringify({ score: 91, issues: [], url: 'https://x.test' }) });
  const r = await rpc('/a2a', { method: 'tasks/get', params: { id: 'task9' } }, env);
  const d = await r.json();
  assert.equal(d.result.task.id, 'task9');
  assert.equal(d.result.task.artifacts[0].parts[0].data.score, 91);
});

test('A2A message/send without a URL or HTML is a -32602', async () => {
  const r = await rpc('/a2a', { method: 'message/send', params: { message: { parts: [{ type: 'text', text: 'hello there' }] } } });
  assert.equal((await r.json()).error.code, -32602);
});

// ── Widget + service worker ─────────────────────────────────────────────

test('GET /widget.js serves the embeddable scan widget', async () => {
  const r = await get('/widget.js');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /javascript/);
  const body = await r.text();
  assert.match(body, /\/scan/);
  assert.match(body, /attachShadow/);
});

test('GET /sw.js serves the service worker from static files', async () => {
  const r = await get('/sw.js');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /serviceWorker|addEventListener\('fetch'/);
});
