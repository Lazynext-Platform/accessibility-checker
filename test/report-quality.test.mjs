// Report-quality tests — the rendered report surface beyond the route basics
// covered in worker-routes.test.mjs: site-scan rendering, Section 508 block,
// CSV page attribution, badge thresholds, embed snippet, and the Pro
// email_report delivery leg.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';

// Same stub convention as worker-routes.test.mjs: kv* read/write the supplied
// map, everything else returns {ok:true} unless a test overrides the path.
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

const siteReport = JSON.stringify({
  url: 'https://x', ts: 0, score: 71, rendered: false, site: true,
  issues: [
    { rule: 'wcag-1.3.1', message: 'no main landmark', url: 'https://x/', fix: 'add <main>' },
    { rule: 'wcag-1.4.3', message: 'contrast 2.1:1', url: 'https://x/about', fix: 'darken text' },
  ],
  pages: [
    { url: 'https://x/', score: 80, count: 1 },
    { url: 'https://x/about', score: 62, count: 1 },
  ],
  section508: { conforms: false, criteria_failed: ['wcag-1.3.1', 'wcag-1.4.3'], clauses_implicated: ['302.1', '302.3'], clause_count: 2 },
});

test('site reports render the mean-score label and per-page table', async () => {
  const env = mockEnv({ 'report:site': siteReport });
  const html = await (await get('/report/site', {}, env)).text();
  assert.match(html, /site-wide \(mean of 2 pages\)/);
  assert.match(html, /https:\/\/x\/about/);
  assert.match(html, /<b>80<\/b>\/100/);
  assert.match(html, /<b>62<\/b>\/100/);
});

test('section 508 block shows failures with FPC clauses, or conforms', async () => {
  const env = mockEnv({ 'report:site': siteReport });
  const fail = await (await get('/report/site', {}, env)).text();
  assert.match(fail, /Section 508: 2 WCAG criteria failed — FPC 302\.1, 302\.3/);
  const ok = mockEnv({
    'report:ok': JSON.stringify({ url: 'https://x', ts: 0, score: 95, issues: [], section508: { conforms: true, criteria_failed: [], clauses_implicated: [] } }),
  });
  const pass = await (await get('/report/ok', {}, ok)).text();
  assert.match(pass, /Section 508: conforms/);
});

test('site report escapes crawled page URLs in the table', async () => {
  const env = mockEnv({
    'report:xss': JSON.stringify({
      url: 'https://x', ts: 0, score: 50, site: true, issues: [],
      pages: [{ url: 'https://x/"><img src=x onerror=alert(1)>', score: 50, count: 0 }],
    }),
  });
  const html = await (await get('/report/xss', {}, env)).text();
  assert.ok(!html.includes('<img src=x onerror'), 'raw injected markup must not render');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('CSV fills the page column from per-issue url attribution', async () => {
  const env = mockEnv({ 'report:site': siteReport });
  const csv = await (await get('/report/site.csv', {}, env)).text();
  const lines = csv.trim().split('\r\n');
  assert.equal(lines[0], 'rule,page,finding,fix');
  assert.ok(lines[1].startsWith('"wcag-1.3.1","https://x/",'));
  assert.ok(lines[2].startsWith('"wcag-1.4.3","https://x/about",'));
});

test('report page embeds a badge snippet ready to paste', async () => {
  const env = mockEnv({ 'report:site': siteReport });
  const html = await (await get('/report/site', {}, env)).text();
  assert.match(html, /Embed this badge:/);
  // The snippet is escaped inside <code> — it must be copyable, not live markup.
  assert.match(html, /&lt;a href=&quot;https:\/\/checker\.test\/report\/site&quot;&gt;/);
  assert.match(html, /&lt;img src=&quot;https:\/\/checker\.test\/badge\/site\.svg&quot;/);
});

test('badge colors follow the 80/50 thresholds', async () => {
  const rep = (score) => JSON.stringify({ url: 'https://x', ts: 0, score, issues: [] });
  const at = async (id, score) =>
    (await (await get(`/badge/${id}.svg`, {}, mockEnv({ [`report:${id}`]: rep(score) }))).text());
  assert.match(await at('a', 80), /#4c1/);
  assert.match(await at('b', 50), /#dfb317/);
  assert.match(await at('c', 49), /#e05d44/);
});

test('pro scan with email_report emails the report via the platform', async () => {
  let sent = null;
  const env = mockEnv(
    { 'license:pro@x.com': 'pro' },
    { '/email/send': async (req) => { sent = await req.json(); return Response.json({ ok: true }); } },
  );
  const r = await post('/scan', {
    html: '<html lang="en"><head><title>t</title></head><body><h1>hi</h1></body></html>',
    license: 'pro@x.com',
    email_report: true,
  }, {}, env);
  const d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.plan, 'pro');
  assert.ok(sent, 'platform /email/send was called');
  assert.equal(sent.to, 'pro@x.com');
  assert.match(sent.subject, /Accessibility report:/);
  assert.ok(sent.html.includes(d.report), 'email links the stored report URL');
});

test('email_report is ignored without a pro license', async () => {
  let called = false;
  const env = mockEnv(
    {},
    { '/email/send': async () => { called = true; return Response.json({ ok: true }); } },
  );
  const r = await post('/scan', {
    html: '<html lang="en"><head><title>t</title></head><body><h1>hi</h1></body></html>',
    license: 'free@x.com',
    email_report: true,
  });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).plan, 'free');
  assert.equal(called, false);
});
