/**
 * Additional WCAG checks — same pure-function idiom as src/scanner.js.
 * Consumes the pipeline's extracted inputs (html string, styles array);
 * no DOM access. Wired in worker.js next to scanHtml/checkContrast.
 *
 * Deliberately not implemented here:
 *   - 3.2.3 consistent-navigation — needs a multi-page crawl, not a
 *     single-page scan.
 *   - 3.3.2 labels-or-instructions — already covered by scanHtml's
 *     input/label association check.
 *   - 1.4.4 resize-text — scanHtml already flags user-scalable=no; this
 *     module adds the maximum-scale companion check.
 */

import { parseColor, luminance } from "../scanner.js";

const FOCUSABLE = "(?:a\\b|button\\b|input\\b|select\\b|textarea\\b|\\w+\\s[^>]*tabindex)";

export function scanAdditionalHtml(html) {
  const issues = [];
  const src = String(html ?? "");
  if (!src.trim()) return issues;

  // WCAG 2.4.6 — empty headings and labels describe nothing.
  for (const m of src.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)) {
    const inner = m[1].replace(/<[^>]+>/g, "").trim();
    if (!inner) {
      issues.push({ rule: "wcag-2.4.6", message: `empty heading: ${m[0].slice(0, 60)}` });
    }
  }
  for (const m of src.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) {
    const inner = m[1].replace(/<[^>]+>/g, "").trim();
    if (!inner && !/<(input|select|textarea)\b/i.test(m[1])) {
      issues.push({ rule: "wcag-2.4.6", message: `empty <label> wraps no control: ${m[0].slice(0, 60)}` });
    }
  }

  // WCAG 2.5.3 — accessible name must contain the visible label text.
  for (const m of src.matchAll(/<(a|button)\b([^>]*aria-label=["']([^"']*)["'][^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const aria = m[3].trim().toLowerCase();
    const visible = m[4].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (visible && aria && !aria.includes(visible)) {
      issues.push({
        rule: "wcag-2.5.3",
        message: `aria-label "${m[3].slice(0, 40)}" does not contain visible text "${visible.slice(0, 40)}"`,
      });
    }
  }

  // WCAG 1.4.4 / 1.4.10 — viewport maximum-scale caps zoom and blocks reflow.
  const vp = src.match(/<meta\b[^>]*name=["']viewport["'][^>]*>/i)?.[0] ?? "";
  const maxScale = vp.match(/maximum-scale\s*=\s*([\d.]+)/i);
  if (maxScale && parseFloat(maxScale[1]) < 2) {
    issues.push({ rule: "wcag-1.4.4", message: `viewport maximum-scale=${maxScale[1]} limits zoom below 200%` });
  }
  // Fixed pixel widths on layout containers prevent reflow at 320px.
  for (const m of src.matchAll(/<(body|main|section|div)\b[^>]*style=["'][^"']*width\s*:\s*(\d{4,})px/gi)) {
    issues.push({ rule: "wcag-1.4.10", message: `<${m[1].toLowerCase()}> has fixed ${m[2]}px width — cannot reflow at 320px` });
    break; // one representative finding is enough
  }

  // WCAG 3.1.2 — runs of non-Latin script without a lang attribute.
  const NONLATIN = /[一-鿿぀-ヿ가-힯Ѐ-ӿ֐-׿؀-ۿऀ-ॿ]/;
  for (const m of src.matchAll(/<(\w+)\b([^>]*)>([^<>]{8,}?)<\/\1>/g)) {
    if (/\blang\s*=/i.test(m[2])) continue;
    if (NONLATIN.test(m[3])) {
      issues.push({
        rule: "wcag-3.1.2",
        message: `<${m[1].toLowerCase()}> contains non-Latin text without a lang attribute: "${m[3].trim().slice(0, 40)}"`,
      });
      break;
    }
  }

  // WCAG 4.1.3 — status/toast regions that assistive tech can't announce.
  for (const m of src.matchAll(/<(\w+)\b([^>]*(?:class|id)=["'][^"']*(?:toast|notification|snackbar|alert|status)[^"']*["'][^>]*)>/gi)) {
    const attrs = m[2];
    if (/role=["'](?:status|alert|log|marquee|timer)["']/i.test(attrs)) continue;
    if (/aria-live\s*=/i.test(attrs)) continue;
    issues.push({
      rule: "wcag-4.1.3",
      message: `<${m[1].toLowerCase()}> looks like a status region but has no role/aria-live: ${m[0].slice(0, 70)}`,
    });
    break;
  }

  // WCAG 2.4.7 — inline outline suppression on focusable elements.
  const outlineNone = new RegExp(`<${FOCUSABLE}[^>]*style=["'][^"']*outline\\s*:\\s*(?:none|0)[^"']*["']`, "i");
  if (outlineNone.test(src)) {
    issues.push({ rule: "wcag-2.4.7", message: "focusable element has inline outline:none — focus indicator may be invisible" });
  }

  return issues;
}

// WCAG 1.4.6 Contrast (Enhanced) — 7:1 normal text, 4.5:1 large text.
// Companion to checkContrast's AA thresholds (1.4.3); reports stricter
// shortfalls as enhanced-tier findings on the same styles input.
export function checkContrastAAA(styles) {
  const issues = [];
  for (const el of styles ?? []) {
    const fg = parseColor(el.color);
    const bg = parseColor(el.bg);
    if (!fg || !bg || fg.a === 0 || bg.a === 0) continue;
    const l1 = luminance(fg), l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const large = el.size >= 24 || (el.size >= 18.66 && parseInt(el.weight, 10) >= 700);
    const aaaMin = large ? 4.5 : 7;
    const aaMin = large ? 3 : 4.5;
    if (ratio < aaaMin && ratio >= aaMin) {
      issues.push({
        rule: "wcag-1.4.6",
        message: `contrast ${ratio.toFixed(2)}:1 passes AA but below enhanced ${aaaMin}:1 on <${el.tag}> "${String(el.text).slice(0, 40)}"`,
      });
    }
  }
  return issues;
}
