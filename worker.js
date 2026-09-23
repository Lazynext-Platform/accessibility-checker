import { scanHtml, checkContrast, score } from './src/scanner.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'GET' && url.pathname === '/') {
      return respond({
        name: 'Accessibility Checker API',
        usage: 'POST /scan {"url": "https://..."} or {"html": "..."}',
        site: 'https://lazynext-platform.github.io/accessibility-checker/',
      });
    }

    if (request.method === 'POST' && url.pathname === '/scan') {
      const body = await request.json().catch(() => ({}));
      let issues = [];
      let rendered = false;
      let renderError = null;

      if (body.url && /^https?:\/\//i.test(body.url)) {
        try {
          const r = await env.PLATFORM.fetch(new Request('https://platform.internal/render', {
            method: 'POST',
            headers: { authorization: `Bearer ${env.PLATFORM_TOKEN}`, 'content-type': 'application/json' },
            body: JSON.stringify({ url: body.url }),
          }));
          if (!r.ok) throw new Error(`render ${r.status}`);
          const renderedPage = await r.json();
          issues = scanHtml(renderedPage.html).concat(checkContrast(renderedPage.styles));
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

      return respond({ score: score(issues), issues, rendered, ...(renderError ? { render_error: renderError } : {}) });
    }

    return respond({ error: 'not found' }, 404);
  },
};
