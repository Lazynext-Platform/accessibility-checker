import { scanHtml, checkContrast, checkFacts, checkFocus, score } from './src/scanner.js';
import { scanAdditionalHtml, checkContrastAAA, checkUseOfColor, scanKeyboardStatics } from './src/rules/additional.js';
import { scanWcag22 } from './src/rules/wcag22.js';
import { section508Report } from './src/rules/section508.js';
import { withRecommendations } from './src/recommendations.js';
import { checkCrossPages } from './src/rules/crosspage.js';
import { crawlSite } from './src/crawl.js';
import { monitorKey, buildMonitorRecord } from './src/monitor.js';
import { checkFocusDepth } from './src/rules/focuscycle.js';
import { isEmail, isHttpUrl, isToken, withinBytes } from './src/validator.js';
import { PAGE_HTML } from './src/page.js';
import { STATIC_FILES } from './src/static.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};
const FREE_LIMIT = 3; // rendered scans per IP per day

// Append a throwaway query param so edge caches (cf-cache-status HIT serves
// stale HTML for hours on cached sites) can't feed a scan yesterday's page —
// a scanner must measure the page as it is now. Wire URL only; stored/report
// URLs stay clean. Fragment-safe.
const cacheBust = (u) => {
  const h = u.indexOf("#");
  const base = h === -1 ? u : u.slice(0, h);
  return `${base}${base.includes("?") ? "&" : "?"}_lz=${Date.now()}${h === -1 ? "" : u.slice(h)}`;
};

// Escape user- and scanned-page-controlled text before it lands in report HTML
// or email bodies — report URLs are shareable, so raw interpolation is stored XSS.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });
}

// Single-file UI: everything is inline, and API calls stay same-origin on both
// hosts (workers.dev fetches resolve to this same script).
const UI_HEADERS = {
  'content-security-policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

async function platform(env, path, init = {}) {
  const r = await env.PLATFORM.fetch(new Request(`https://platform.internal${path}`, {
    ...init,
    headers: { authorization: `Bearer ${env.PLATFORM_TOKEN}`, 'content-type': 'application/json', ...(init.headers || {}) },
  }));
  return r;
}

async function kvGet(env, key) {
  const r = await platform(env, '/kv/get', { method: 'POST', body: JSON.stringify({ key }) });
  if (!r.ok) return null;
  const d = await r.json().catch(() => null);
  return d?.value ?? null;
}

async function kvPut(env, key, value, ttl) {
  await platform(env, '/kv/put', { method: 'POST', body: JSON.stringify({ key, value, ttl }) });
}

async function isPro(env, license) {
  if (!license) return false;
  const v = await kvGet(env, `license:${String(license).toLowerCase()}`);
  return v === 'pro';
}

// License = buyer email, which is guessable, so mutating license actions
// (cancel / monitor add/remove) require mailbox proof: POST creates a
// pending:<token> record and emails a confirmation link; GET /confirm
// executes it once (the token is deleted on use). 15-minute expiry.
async function requestConfirm(env, origin, email, action, extra = {}) {
  const token = crypto.randomUUID();
  await kvPut(env, `pending:${token}`, JSON.stringify({ action, email: String(email).toLowerCase(), ...extra }), 900);
  const link = `${origin}/confirm?token=${token}`;
  const label = { cancel: `cancel the Pro subscription for ${email}`, monitor_add: `start daily monitoring for ${extra.url}`, monitor_del: `stop monitoring ${extra.url}` }[action];
  await platform(env, '/email/send', {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: `Confirm: ${label}`,
      html: `<p>Someone (hopefully you) asked to ${esc(label)}.</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes. If this wasn't you, ignore this email.</p>`,
    }),
  });
}

function confirmPage(title, inner) {
  return new Response(`<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:system-ui;max-width:640px;margin:4rem auto;padding:0 1rem">
<h1>${title}</h1>${inner}
<p><a href="/">Back to Accessibility Checker</a></p>`,
    { headers: { 'content-type': 'text/html', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'GET' && url.pathname === '/health') {
      return respond({ ok: true, service: 'accessibility-checker' });
    }

    if (request.method === 'GET' && url.pathname === '/') {
      // Browsers (and the branded domain) get the product UI; API callers get
      // the usage doc. Same worker serves both — checker.lazynext.com is the
      // canonical surface, workers.dev/github.io stay working.
      const wantsHtml = (request.headers.get('accept') ?? '').includes('text/html') || url.hostname === 'checker.lazynext.com';
      if (wantsHtml) {
        return new Response(PAGE_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', ...UI_HEADERS } });
      }
      return respond({
        name: 'Accessibility Checker API',
        scan: 'POST /scan {"url"|"html", "site"?: bool, "license"?: email, "email_report"?: bool}',
        checkout: 'GET /checkout', cancel: 'POST /cancel {"license": email}',
        confirm: 'GET /confirm?token=…', monitor: 'GET|POST|DELETE /monitor (Pro)',
        lead: 'POST /lead {"email"}', report: 'GET /report/:id',
        site: 'https://checker.lazynext.com/',
      });
    }

    // Discovery/static files — the branded domain is canonical, so crawlers
    // and security tools must find robots/sitemap/llms/security.txt here too.
    if (request.method === 'GET') {
      const sf = STATIC_FILES[url.pathname];
      if (sf) {
        // Binary entries embed as base64 (b64:true) — decode to bytes.
        const body = sf.b64 ? Uint8Array.from(atob(sf.body), c => c.charCodeAt(0)) : sf.body;
        return new Response(body, { headers: { 'content-type': sf.type } });
      }
    }

    // Lead capture → platform /leads → Brevo contact + D1 event.
    if (request.method === 'POST' && url.pathname === '/lead') {
      const b = await request.json().catch(() => ({}));
      if (!isEmail(b.email)) return respond({ error: 'valid email required' }, 400);
      // Per-IP daily cap: unauthenticated lead submission would otherwise let a
      // bot burn Brevo quota and fire an unsolicited sequence email per victim.
      const day = new Date().toISOString().slice(0, 10);
      const ip = request.headers.get('cf-connecting-ip') ?? 'anon';
      const rlKey = `rl:lead:${ip}:${day}`;
      const used = parseInt((await kvGet(env, rlKey)) ?? '0', 10);
      if (used >= 10) return respond({ error: 'rate limit — try again later' }, 429);
      await kvPut(env, rlKey, String(used + 1), 90000);
      const r = await platform(env, '/leads', { method: 'POST', body: JSON.stringify({ email: b.email, source: 'accessibility-checker' }) });
      const d = await r.json().catch(() => ({}));
      return respond({ ok: r.ok, ...(r.ok ? {} : { detail: d }) }, r.ok ? 200 : 502);
    }

    // Shareable report — scans persist here for 30 days.
    // Suffixes: /report/:id.csv → CSV export, /report/:id.pdf → PDF via platform /pdf.
    if (request.method === 'GET' && url.pathname.startsWith('/report/')) {
      const seg = url.pathname.slice(8);
      const fmt = seg.endsWith('.csv') ? 'csv' : seg.endsWith('.pdf') ? 'pdf' : 'html';
      const id = fmt === 'html' ? seg : seg.slice(0, -4);
      const raw = await kvGet(env, `report:${id}`);
      if (!raw) return respond({ error: 'report not found or expired' }, 404);
      const rep = JSON.parse(raw);
      if (fmt === 'csv') {
        const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
        const csv = ['rule,page,finding,fix', ...rep.issues.map((i) => [i.rule, i.url ?? '', i.message, i.fix ?? ''].map(cell).join(','))].join('\r\n');
        return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="accessibility-report-${id}.csv"` } });
      }
      if (fmt === 'pdf') {
        const r = await platform(env, '/pdf', { method: 'POST', body: JSON.stringify({ url: `${url.origin}/report/${id}` }) });
        if (!r.ok) return respond({ error: 'pdf export unavailable' }, 502);
        return new Response(r.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="accessibility-report-${id}.pdf"` } });
      }
      const rows = rep.issues.map((i) => `<tr><td style="font-family:monospace">${esc(i.rule)}</td><td>${esc(i.message)}${i.fix ? `<br><span style="color:#555;font-size:0.9em">Fix: ${esc(i.fix)}</span>` : ''}</td></tr>`).join('');
      return new Response(`<!doctype html><meta charset="utf-8"><title>Accessibility report — ${esc(rep.url ?? 'paste')}</title>
<body style="font-family:system-ui;max-width:800px;margin:2rem auto;padding:0 1rem">
<h1>Accessibility report</h1><p><b>${esc(rep.url ?? 'pasted HTML')}</b> · ${new Date(rep.ts).toUTCString()} · rendered: ${rep.rendered}</p>
<p style="font-size:3rem;margin:0"><b>${rep.score}</b>/100</p>
${rep.section508 ? `<p style="color:#555">Section 508: ${rep.section508.conforms ? 'conforms' : `${rep.section508.criteria_failed.length} WCAG criteria failed — FPC ${esc(rep.section508.clauses_implicated.join(', '))}`}</p>` : ''}
<p><a href="/report/${esc(id)}.csv">Download CSV</a> · <a href="/report/${esc(id)}.pdf">Download PDF</a></p>
<table style="width:100%;border-collapse:collapse">${rows || '<tr><td>No issues found.</td></tr>'}</table>
<p><a href="/">Run your own scan →</a></p>`,
        { headers: { 'content-type': 'text/html', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } });
    }

    // Redirect to a real Dodo checkout for the Pro plan via the platform.
    if (request.method === 'GET' && url.pathname === '/checkout') {
      const r = await platform(env, '/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'pdt_0NoEqD9VCMUZnIogq4Epy', plan: 'pro', trial_days: 14 }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.checkout_url) return respond({ error: 'checkout unavailable', detail: d }, 502);
      return Response.redirect(d.checkout_url, 302);
    }

    // Self-service cancellation — step 1 of 2. The license is the purchase
    // email (not a secret), so the actual cancel happens only after the
    // customer clicks the confirmation link we email them (/confirm).
    if (request.method === 'POST' && url.pathname === '/cancel') {
      const b = await request.json().catch(() => ({}));
      if (!isEmail(b.license)) return respond({ error: 'purchase email required' }, 400);
      if (!(await isPro(env, b.license))) return respond({ error: 'no active Pro license for that email' }, 404);
      await requestConfirm(env, url.origin, b.license, 'cancel');
      return respond({ ok: true, confirm: 'email' });
    }

    // Executes a pending license action once the emailed link is clicked.
    if (request.method === 'GET' && url.pathname === '/confirm') {
      const token = url.searchParams.get('token') ?? '';
      const raw = isToken(token) ? await kvGet(env, `pending:${token}`) : null;
      const pend = raw ? JSON.parse(raw) : null;
      if (!pend) return confirmPage('Link expired', '<p>This confirmation link is invalid or has expired.</p>');
      await platform(env, '/kv/delete', { method: 'POST', body: JSON.stringify({ key: `pending:${token}` }) });

      if (pend.action === 'cancel') {
        const r = await platform(env, '/api/v1/billing/cancel', { method: 'POST', body: JSON.stringify({ email: pend.email }) });
        if (!r.ok) return confirmPage('Cancellation failed', '<p>Something went wrong on our side — please try again or reply to your receipt email.</p>');
        return confirmPage('Subscription cancelled', `<p>The Pro subscription for <b>${esc(pend.email)}</b> has been cancelled. Your license stays active until the end of the current billing period.</p>`);
      }
      if (pend.action === 'monitor_add') {
        await kvPut(env, monitorKey(pend.email, pend.url), JSON.stringify(buildMonitorRecord({ email: pend.email, url: pend.url })), 0);
        return confirmPage('Monitoring on', `<p><b>${esc(pend.url)}</b> will be rescanned daily — we email <b>${esc(pend.email)}</b> if the score drops.</p>`);
      }
      if (pend.action === 'monitor_del') {
        await platform(env, '/kv/delete', { method: 'POST', body: JSON.stringify({ key: monitorKey(pend.email, pend.url) }) });
        return confirmPage('Monitoring stopped', `<p><b>${esc(pend.url)}</b> is no longer being monitored.</p>`);
      }
      return confirmPage('Link expired', '<p>This confirmation link is invalid or has expired.</p>');
    }

    if (request.method === 'POST' && url.pathname === '/scan') {
      const body = await request.json().catch(() => ({}));

      // Paid tier: license = buyer email, validated via platform KV. Free tier:
      // 3 rendered scans per IP per day, tracked in platform KV.
      const pro = await isPro(env, body.license);
      const day = new Date().toISOString().slice(0, 10);
      const ip = request.headers.get('cf-connecting-ip') ?? 'anon';
      const rlKey = `rl:scan:${ip}:${day}`;
      if (!pro && body.url) {
        const used = parseInt((await kvGet(env, rlKey)) ?? '0', 10);
        if (used >= FREE_LIMIT) {
          return respond({ error: 'free limit reached (3/day)', upgrade: '/checkout' }, 402);
        }
        await kvPut(env, rlKey, String(used + 1), 90000);
      }

      let issues = [];
      let rendered = false;
      let renderError = null;
      let sitePages = null;

      if (isHttpUrl(body.url) && body.site === true) {
        // Site-wide scan: BFS same-origin pages, apply the HTML ruleset to
        // each, aggregate with per-page attribution. Free: 3 pages, Pro: 10.
        const maxPages = pro ? 10 : 3;
        try {
          const crawl = await crawlSite(body.url, { maxPages, delayMs: 150 });
          sitePages = crawl.pages.map((p) => {
            const pageIssues = scanHtml(p.html)
              .concat(scanAdditionalHtml(p.html))
              .concat(scanWcag22(p.html))
              .concat(scanKeyboardStatics(p.html));
            return { url: p.url, score: score(pageIssues), issues: pageIssues };
          });
          issues = sitePages.flatMap((p) => p.issues.map((i) => ({ ...i, url: p.url })))
            .concat(checkCrossPages(crawl.pages));
          if (!sitePages.length) return respond({ error: 'no pages could be crawled', skipped: crawl.skipped }, 502);
        } catch (e) {
          return respond({ error: 'site crawl failed', detail: String(e?.message ?? e) }, 502);
        }
      } else if (isHttpUrl(body.url)) {
        try {
          const r = await platform(env, '/render', { method: 'POST', body: JSON.stringify({ url: cacheBust(body.url) }) });
          if (!r.ok) throw new Error(`render ${r.status}`);
          const page = await r.json();
          issues = scanHtml(page.html)
            .concat(scanAdditionalHtml(page.html))
            .concat(scanWcag22(page.html))
            .concat(checkContrast(page.styles))
            .concat(checkContrastAAA(page.styles))
            .concat(checkUseOfColor(page.styles))
            .concat(checkFacts(page.facts))
            .concat(checkFocus(page.focus))
            .concat(checkFocusDepth(page.focus, page.focusable, page.escape, { undersized: page.undersized, obscured: page.obscured, noFocusInd: page.noFocusInd, nontextContrast: page.nontextContrast, spacingClip: page.spacingClip }))
            .concat(scanKeyboardStatics(page.html));
          rendered = true;
        } catch (e) {
          renderError = String(e?.message ?? e);
          const page = await fetch(cacheBust(body.url)).then((x) => x.text()).catch(() => '');
          issues = scanHtml(page).concat(scanAdditionalHtml(page)).concat(scanWcag22(page)).concat(scanKeyboardStatics(page));
        }
      } else if (typeof body.html === 'string' && body.html.trim()) {
        if (!withinBytes(body.html, 512_000)) return respond({ error: 'html too large (512KB max)' }, 413);
        issues = scanHtml(body.html).concat(scanAdditionalHtml(body.html)).concat(scanWcag22(body.html)).concat(scanKeyboardStatics(body.html));
      } else {
        return respond({ error: 'provide {"url"} or {"html"}' }, 400);
      }

      issues = withRecommendations(issues);
      const result = { score: sitePages ? Math.round(sitePages.reduce((t, p) => t + p.score, 0) / sitePages.length) : score(issues), issues, rendered, plan: pro ? 'pro' : 'free', section508: section508Report(issues), ...(renderError ? { render_error: renderError } : {}), ...(sitePages ? { site: true, pages: sitePages.map(({ url, score: s, issues: i }) => ({ url, score: s, count: i.length })) } : {}) };

      // Persist a shareable report (30d) and optionally email it for Pro.
      const id = crypto.randomUUID().slice(0, 12);
      await kvPut(env, `report:${id}`, JSON.stringify({ ...result, url: body.url ?? null, ts: Date.now() }), 2592000);
      result.report = `${url.origin}/report/${id}`;
      if (pro && body.email_report) {
        await platform(env, '/email/send', {
          method: 'POST',
          body: JSON.stringify({
            to: body.license,
            subject: `Accessibility report: ${String(body.url ?? 'pasted HTML').slice(0, 120)} — score ${result.score}/100`,
            html: `<p>Score: <b>${result.score}/100</b> (${result.issues.length} issues, rendered: ${rendered})</p><p>Full report: <a href="${result.report}">${result.report}</a></p>`,
          }),
        });
      }

      return respond(result);
    }

    // Pro site monitoring — register/unregister URLs for the platform's
    // daily rescan sweep; Brevo alerts when a page's score drops >= 10.
    // Both mutations are email-confirmed like /cancel — the license is an
    // email address, so registering under someone's email would otherwise
    // let strangers send them alerts or manage their list.
    if (url.pathname === '/monitor' && request.method === 'POST') {
      const b = await request.json().catch(() => ({}));
      if (!(await isPro(env, b.license))) return respond({ error: 'pro license required', upgrade: '/checkout' }, 402);
      if (!isHttpUrl(b.url)) return respond({ error: 'provide {"url"}' }, 400);
      await requestConfirm(env, url.origin, b.license, 'monitor_add', { url: b.url });
      return respond({ ok: true, confirm: 'email' });
    }
    if (url.pathname === '/monitor' && request.method === 'DELETE') {
      const b = await request.json().catch(() => ({}));
      if (!(await isPro(env, b.license))) return respond({ error: 'pro license required' }, 402);
      if (!b.url) return respond({ error: 'provide {"url"}' }, 400);
      await requestConfirm(env, url.origin, b.license, 'monitor_del', { url: b.url });
      return respond({ ok: true, confirm: 'email' });
    }
    if (url.pathname === '/monitor' && request.method === 'GET') {
      const license = url.searchParams.get('license');
      if (!(await isPro(env, license))) return respond({ error: 'pro license required' }, 402);
      const r = await platform(env, '/kv/list', { method: 'POST', body: JSON.stringify({ prefix: `mon:${String(license).toLowerCase()}:` }) });
      const { keys = [] } = await r.json().catch(() => ({}));
      const monitors = [];
      for (const k of keys) {
        const v = await kvGet(env, k);
        if (v) monitors.push(JSON.parse(v));
      }
      return respond({ monitors });
    }

    return respond({ error: 'not found' }, 404);
  },
};
