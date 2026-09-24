/**
 * Same-origin multi-page crawler for site-wide accessibility scans.
 * Environment-agnostic: works in a Cloudflare Worker or Node — the caller
 * may inject fetchImpl for tests. BFS over same-origin links, asset and
 * scheme filtering, per-request timeout, and a polite crawl delay.
 */

const ASSET_EXT = /\.(?:png|jpe?g|gif|webp|svg|ico|css|js|mjs|map|json|xml|pdf|zip|gz|tar|mp[34]|webm|woff2?|ttf|eot|avif|mov|csv|docx?|xlsx?|pptx?)$/i;
const SKIP_SCHEMES = /^(?:mailto|tel|javascript|data|sms|ftp):/i;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Extract same-origin page links from an HTML document. */
export function extractLinks(html, baseUrl) {
  const out = [];
  const base = new URL(baseUrl);
  for (const m of String(html ?? "").matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const href = m[1].trim();
    if (!href || href.startsWith("#") || SKIP_SCHEMES.test(href)) continue;
    let u;
    try {
      u = new URL(href, base);
    } catch {
      continue;
    }
    if (u.origin !== base.origin) continue;
    if (!/^https?:$/.test(u.protocol)) continue;
    u.hash = "";
    const path = u.pathname;
    if (ASSET_EXT.test(path)) continue;
    out.push(u.toString());
  }
  return out;
}

/**
 * BFS-crawl a site starting at startUrl.
 * Returns { pages: [{url, html, status}], skipped, count }.
 * Options: maxPages, fetchImpl (defaults to global fetch), delayMs between
 * requests, timeoutMs per request.
 */
export async function crawlSite(startUrl, { maxPages = 10, fetchImpl = fetch, delayMs = 100, timeoutMs = 10000 } = {}) {
  const start = new URL(startUrl);
  start.hash = "";
  const queue = [start.toString()];
  const seen = new Set(queue);
  const pages = [];
  let skipped = 0;

  while (queue.length && pages.length < maxPages) {
    const url = queue.shift();
    let res;
    try {
      res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      skipped++;
      continue;
    }
    const status = res.status;
    const type = res.headers?.get?.("content-type") ?? "";
    if (status >= 400 || (type && !type.includes("text/html"))) {
      skipped++;
      continue;
    }
    const html = await res.text();
    pages.push({ url, html, status });

    for (const link of extractLinks(html, url)) {
      if (!seen.has(link)) {
        seen.add(link);
        queue.push(link);
      }
    }
    if (queue.length && pages.length < maxPages) await sleep(delayMs);
  }
  return { pages, skipped, count: pages.length };
}
