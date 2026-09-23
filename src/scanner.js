/**
 * WCAG accessibility scanner — dependency-free ES module.
 * Runs in Cloudflare Workers, browsers, and Node: pure string/DOM-free checks
 * over HTML markup. Ported from accessibility_checker.py so the deployed
 * Worker and the Python engine share one rule set.
 */

export function scanHtml(html) {
  const issues = [];
  const src = String(html ?? "");
  if (!src.trim()) return [{ rule: "empty", message: "No HTML content to scan" }];
  const lower = src.toLowerCase();

  if (lower.includes("<html") && !/<html[^>]*\blang=/i.test(src)) {
    issues.push({ rule: "wcag-3.1.1", message: "<html> is missing a lang attribute" });
  }
  if (lower.includes("<head") && !lower.includes("<title")) {
    issues.push({ rule: "wcag-2.4.2", message: "page is missing a <title>" });
  }

  for (const m of src.matchAll(/<img\b[^>]*>/gi)) {
    if (!/alt\s*=/i.test(m[0])) {
      issues.push({ rule: "wcag-1.1.1", message: `<img> missing alt text: ${m[0].slice(0, 80)}` });
    }
  }

  const headings = [...src.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
  if (headings.length) {
    if (headings[0] !== 1) issues.push({ rule: "wcag-1.3.1", message: "first heading is not <h1>" });
    let prev = 0;
    for (const level of headings) {
      if (prev && level > prev + 1) issues.push({ rule: "wcag-1.3.1", message: `heading level skipped (h${level} after h${prev})` });
      prev = level;
    }
  } else {
    issues.push({ rule: "wcag-1.3.1", message: "no headings found on the page" });
  }

  for (const m of src.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    if (/type=["'](?:hidden|submit|button|image)/i.test(tag)) continue;
    const idm = tag.match(/\bid=["']([^"']+)/i);
    const labeled = idm && new RegExp(`<label[^>]*\\bfor=["']${idm[1]}["']`, "i").test(src);
    if (!labeled && !/aria-label/i.test(tag)) {
      issues.push({ rule: "wcag-3.3.2", message: `<input> has no associated label: ${tag.slice(0, 80)}` });
    }
  }

  for (const m of src.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = m[1].replace(/<[^>]+>/g, "").trim().toLowerCase();
    if (["click here", "here", "read more", "more", "link"].includes(text)) {
      issues.push({ rule: "wcag-2.4.4", message: `vague link text "${text}"` });
    }
  }

  if (/name=["']viewport["'][^>]*user-scalable=no/i.test(src)) {
    issues.push({ rule: "wcag-1.4.4", message: "viewport disables zoom (user-scalable=no)" });
  }
  if (!/role=["'](?:main|banner|navigation|contentinfo)/i.test(src) && !lower.includes("<main")) {
    issues.push({ rule: "wcag-1.3.1", message: "no landmark region (<main> or role) found" });
  }

  return issues;
}

export function score(issues) {
  return Math.max(0, 100 - issues.length * 10);
}
