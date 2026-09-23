import { scanHtml, checkContrast, checkFacts, checkFocus, score } from './src/scanner.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};
const FREE_LIMIT = 3; // rendered scans per IP per day

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });
}

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'GET' && url.pathname === '/') {
      return respond({
        name: 'Accessibility Checker API',
        usage: 'POST /scan {"url"|"html", "license"?: email}',
        checkout: '/checkout',
        site: 'https://lazynext-platform.github.io/accessibility-checker/',
      });
    }

    // Redirect to a real Dodo checkout for the Pro plan via the platform.
    if (request.method === 'GET' && url.pathname === '/checkout') {
      const r = await platform(env, '/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'pdt_0NoEqD9VCMUZnIogq4Epy', plan: 'pro' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.checkout_url) return respond({ error: 'checkout unavailable', detail: d }, 502);
      return Response.redirect(d.checkout_url, 302);
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

      if (body.url && /^https?:\/\//i.test(body.url)) {
        try {
          const r = await platform(env, '/render', { method: 'POST', body: JSON.stringify({ url: body.url }) });
          if (!r.ok) throw new Error(`render ${r.status}`);
          const page = await r.json();
          issues = scanHtml(page.html)
            .concat(checkContrast(page.styles))
            .concat(checkFacts(page.facts))
            .concat(checkFocus(page.focus));
          rendered = true;
        } catch (e) {
          renderError = String(e?.message ?? e);
          const page = await fetch(body.url).then((x) => x.text()).catch(() => '');
          issues = scanHtml(page);
        }
      } else if (typeof body.html === 'string' && body.html.trim()) {
        issues = scanHtml(body.html);
      } else {
        return respond({ error: 'provide {"url"} or {"html"}' }, 400);
      }

      return respond({ score: score(issues), issues, rendered, plan: pro ? 'pro' : 'free', ...(renderError ? { render_error: renderError } : {}) });
    }

    return respond({ error: 'not found' }, 404);
  },
};
