/**
 * WCAG 2.2 checks — same pure-function idiom as src/scanner.js and
 * src/rules/additional.js. Consumes the pipeline's extracted inputs
 * (html string); no DOM access.
 *
 * Deliberately not implemented here (need a rendered page or multi-page
 * crawl, not a single-page string scan — all now live in the rendered /
 * site-scan paths, see src/rules/focuscycle.js and src/rules/crosspage.js):
 *   - 2.5.8 target size — implemented via rendered box dimensions.
 *   - 2.4.11/2.4.13 focus obscured/appearance — implemented via rendered
 *     focus trace; 2.4.12 (AAA enhanced) remains deferred.
 *   - 3.2.6 consistent help — implemented via cross-page crawl.
 *   - 3.3.9 accessible authentication (enhanced) — AAA, needs interactive
 *     functional testing.
 */

export function scanWcag22(html) {
  const issues = [];
  const src = String(html ?? "");
  if (!src.trim()) return issues;

  // WCAG 3.3.8 — Accessible Authentication (Minimum): credential fields must
  // support password managers / copy-paste entry. Missing autocomplete on
  // credential inputs and paste blocking both defeat that support.
  for (const m of src.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/type=["']password["']/i.test(tag)) continue;
    if (!/autocomplete=["'](?:current-password|new-password)["']/i.test(tag)) {
      issues.push({
        rule: "wcag-3.3.8",
        message: `password input lacks autocomplete for credential managers: ${tag.slice(0, 80)}`,
      });
    }
  }
  for (const m of src.matchAll(/<input\b[^>]*type=["'](?:text|email|password|tel)["'][^>]*>/gi)) {
    if (/\sonpaste\s*=\s*["'][^"']*return\s+false/i.test(m[0]) || /\sonpaste\s*=\s*["'][^"']*preventDefault/i.test(m[0])) {
      issues.push({
        rule: "wcag-3.3.8",
        message: `paste is blocked on an input, defeating credential managers: ${m[0].slice(0, 80)}`,
      });
    }
  }

  // WCAG 3.3.7 — Redundant Entry: don't make users re-enter information
  // already provided. Within a single page the detectable case is duplicate
  // credential/contact fields in one form with no distinguishable purpose
  // (confirm/verify fields are acceptable).
  for (const form of src.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)) {
    const inner = form[1];
    const seen = new Map();
    for (const im of inner.matchAll(/<input\b[^>]*>/gi)) {
      const tag = im[0];
      const type = (tag.match(/type=["']([^"']+)["']/i)?.[1] ?? "text").toLowerCase();
      if (!["email", "password", "tel"].includes(type)) continue;
      // A field explicitly marked as confirmation is not redundant entry.
      if (/confirm|verify|repeat/i.test(tag)) continue;
      const count = (seen.get(type) ?? 0) + 1;
      seen.set(type, count);
      if (count > 1) {
        issues.push({
          rule: "wcag-3.3.7",
          message: `form asks for "${type}" ${count} times — redundant entry of the same data: ${tag.slice(0, 80)}`,
        });
      }
    }
  }

  // WCAG 2.5.7 — Dragging Movements: any dragging interaction must have a
  // single-pointer (non-drag) alternative. String scans can't prove an
  // alternative exists, so warn when drag affordances appear at all.
  for (const m of src.matchAll(/<[a-z][^>]*\bdraggable\s*=\s*["']?true["']?[^>]*>/gi)) {
    issues.push({
      rule: "wcag-2.5.7",
      message: `draggable element needs a non-dragging alternative control: ${m[0].slice(0, 80)}`,
    });
  }
  for (const m of src.matchAll(/<[a-z][^>]*\b(?:ondragstart|ondragover|ondrop)\s*=\s*["'][^"']*["'][^>]*>/gi)) {
    issues.push({
      rule: "wcag-2.5.7",
      message: `inline drag handler needs a non-dragging alternative control: ${m[0].slice(0, 80)}`,
    });
  }

  return issues;
}
