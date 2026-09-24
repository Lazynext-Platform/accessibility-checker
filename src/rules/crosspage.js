/**
 * Cross-page WCAG checks — only meaningful on site scans (body.site).
 * Consumes crawl.pages: [{url, html, status}]. Same pure-function idiom
 * as scanner.js / additional.js — string checks over markup, no DOM.
 *
 *   - 3.2.3 consistent navigation: nav link order must match across pages
 *   - 3.2.4 consistent identification: same link target → same label text
 */

// Ordered hrefs inside the first <nav> (or role="navigation") block.
function navSequence(html) {
  const src = String(html ?? "");
  const nav = src.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0]
    ?? src.match(/<\w+\b[^>]*role=["']navigation["'][^>]*>[\s\S]*?<\/\w+>/i)?.[0];
  if (!nav) return null;
  const hrefs = [...nav.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  return hrefs.length ? hrefs : null;
}

// href → visible label text for every link on the page.
function linkLabels(html) {
  const map = new Map();
  for (const m of String(html ?? "").matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text) map.set(m[1], (map.get(m[1]) ? `${map.get(m[1])} ` : "") + text);
  }
  return map;
}

export function checkCrossPages(pages) {
  const issues = [];
  const list = (pages ?? []).filter((p) => typeof p?.html === "string" && p.html.trim());
  if (list.length < 2) return issues;

  // WCAG 3.2.3 — navs present on a majority of pages must keep the same
  // relative link order everywhere they appear.
  const seqs = list.map((p) => ({ url: p.url, seq: navSequence(p.html) })).filter((p) => p.seq);
  if (seqs.length >= 2) {
    const counts = new Map();
    for (const s of seqs) counts.set(s.seq.join("|"), (counts.get(s.seq.join("|")) ?? 0) + 1);
    const reference = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    for (const s of seqs) {
      if (s.seq.join("|") !== reference) {
        issues.push({
          rule: "wcag-3.2.3",
          url: s.url,
          message: `navigation link order differs from the rest of the site: ${s.seq.slice(0, 5).join(", ")}`,
        });
      }
    }
  }

  // WCAG 3.2.4 — the same link target must carry the same accessible
  // name on every page it appears on.
  const labels = new Map(); // href → Map<text, url>
  for (const p of list) {
    for (const [href, text] of linkLabels(p.html)) {
      if (!labels.has(href)) labels.set(href, new Map());
      labels.get(href).set(text, p.url);
    }
  }
  for (const [href, seen] of labels) {
    if (seen.size > 1) {
      const variants = [...seen.keys()].slice(0, 3).map((t) => `"${t.slice(0, 30)}"`).join(" vs ");
      issues.push({
        rule: "wcag-3.2.4",
        url: seen.values().next().value,
        message: `link to ${href.slice(0, 60)} is labelled inconsistently across pages: ${variants}`,
      });
    }
  }

  return issues;
}
