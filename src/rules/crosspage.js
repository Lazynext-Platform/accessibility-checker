/**
 * Cross-page WCAG checks — only meaningful on site scans (body.site).
 * Consumes crawl.pages: [{url, html, status}]. Same pure-function idiom
 * as scanner.js / additional.js — string checks over markup, no DOM.
 *
 *   - 3.2.3 consistent navigation: links shared by navs must keep the
 *     same relative order on every page they appear on
 *   - 3.2.4 consistent identification: same link target → same accessible
 *     name (aria-label wins over innerText) site-wide
 */

// Ordered hrefs inside the first <nav> (or role="navigation") block.
function navSequence(html) {
  const src = String(html ?? "");
  let nav = src.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0];
  if (!nav) {
    // Close on the tagged element's own closing tag, not the first </a>.
    const open = src.match(/<(\w+)\b[^>]*role=["']navigation["'][^>]*>/i);
    if (open) nav = src.slice(open.index).match(new RegExp(`[\\s\\S]*?<\\/${open[1]}>`, "i"))?.[0];
  }
  if (!nav) return null;
  const hrefs = [...nav.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  return hrefs.length ? hrefs : null;
}

// href → accessible name for every link on the page. aria-label beats
// innerText (that's the name assistive tech actually announces).
function linkNames(html) {
  const map = new Map();
  for (const m of String(html ?? "").matchAll(/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const aria = (m[1] + m[3]).match(/aria-label=["']([^"']+)["']/i)?.[1].trim();
    const text = m[4].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const name = aria || text;
    if (name) {
      if (!map.has(m[2])) map.set(m[2], new Set());
      map.get(m[2]).add(name);
    }
  }
  return map;
}

export function checkCrossPages(pages) {
  const issues = [];
  const list = (pages ?? []).filter((p) => typeof p?.html === "string" && p.html.trim());
  if (list.length < 2) return issues;

  // WCAG 3.2.3 — links shared between a page's nav and the site's
  // reference nav must appear in the same relative order.
  const seqs = list.map((p) => ({ url: p.url, seq: navSequence(p.html) })).filter((p) => p.seq);
  if (seqs.length >= 2) {
    const counts = new Map();
    for (const s of seqs) counts.set(s.seq.join("|"), (counts.get(s.seq.join("|")) ?? 0) + 1);
    const reference = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split("|");
    const refSet = new Set(reference);
    for (const s of seqs) {
      const seqSet = new Set(s.seq);
      const sharedInRef = reference.filter((h) => seqSet.has(h));
      const sharedInPage = s.seq.filter((h) => refSet.has(h));
      if (sharedInPage.join("|") !== sharedInRef.join("|")) {
        issues.push({
          rule: "wcag-3.2.3",
          url: s.url,
          message: `navigation links shared with the rest of the site appear in a different order: ${sharedInPage.slice(0, 5).join(", ")}`,
        });
      }
    }
  }

  // WCAG 3.2.4 — the same link target must carry the same accessible
  // name everywhere it appears (across pages and within a page).
  const names = new Map(); // href → Map<name, url>
  for (const p of list) {
    for (const [href, set] of linkNames(p.html)) {
      if (!names.has(href)) names.set(href, new Map());
      for (const n of set) if (!names.get(href).has(n)) names.get(href).set(n, p.url);
    }
  }
  for (const [href, seen] of names) {
    if (seen.size > 1) {
      const variants = [...seen.keys()].slice(0, 3).map((t) => `"${t.slice(0, 30)}"`).join(" vs ");
      issues.push({
        rule: "wcag-3.2.4",
        url: seen.values().next().value,
        message: `link to ${href.slice(0, 60)} is labelled inconsistently: ${variants}`,
      });
    }
  }

  return issues;
}
