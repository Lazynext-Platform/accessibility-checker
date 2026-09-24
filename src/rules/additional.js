/**
 * Additional WCAG checks — same pure-function idiom as src/scanner.js.
 * Consumes the pipeline's extracted inputs (html string, styles array);
 * no DOM access. Wired in worker.js next to scanHtml/checkContrast.
 *
 * Deliberately not implemented here:
 *   - 3.2.3 consistent-navigation / 3.2.4 consistent-identification —
 *     live in src/rules/crosspage.js (need multi-page data, wired into
 *     the site-scan path only).
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
  // Stylesheet-level suppression is the common real-world failure: a <style>
  // block kills the focus outline globally with no :focus/:focus-visible
  // alternative providing a replacement indicator (outline/box-shadow/border).
  const css = [...src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  if (css) {
    const suppresses =
      /:focus(?:-visible|-within)?\s*[^{}]*\{[^}]*\boutline\s*:\s*(?:none|0)\b/i.test(css) ||
      /(?:^|[};]\s*)(?:\*|a|button|input|select|textarea)\s*\{[^}]*\boutline\s*:\s*(?:none|0)\b/i.test(css);
    const alternative =
      /:focus(?:-visible|-within)?\s*[^{}]*\{[^}]*\b(?:outline\s*:\s*(?!none\b|0\b)|box-shadow|border)/i.test(css);
    if (suppresses && !alternative) {
      issues.push({
        rule: "wcag-2.4.7",
        message: "stylesheet suppresses the focus outline with no :focus/:focus-visible replacement indicator",
      });
    }
  }

  // WCAG 3.2.1 — focusing a control must not trigger a context change
  // (navigation, form submit, window.open). The onfocus handler attribute
  // is the literal mechanism.
  for (const m of src.matchAll(/\bonfocus\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    if (/(?:window\.)?location\s*(?:\.|=\s*)|\.submit\s*\(|\.click\s*\(|window\.open\s*\(/i.test(m[2])) {
      issues.push({
        rule: "wcag-3.2.1",
        message: `onfocus handler navigates or submits — receiving focus must not change context: ${m[0].slice(0, 80)}`,
      });
      break;
    }
  }

  // WCAG 3.2.2 — changing a control's value must not auto-submit or
  // navigate (the classic <select> jump-menu violation).
  for (const m of src.matchAll(/\bon(?:change|input|select)\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    if (/\.submit\s*\(|(?:window\.)?location\s*(?:\.|=\s*)|window\.open\s*\(/i.test(m[2])) {
      issues.push({
        rule: "wcag-3.2.2",
        message: `onchange/oninput handler submits or navigates on value change — users must be able to review input: ${m[0].slice(0, 80)}`,
      });
      break;
    }
  }

  // WCAG 2.2.1 — timed refresh/redirect the user can't control.
  if (/<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i.test(src)) {
    issues.push({ rule: "wcag-2.2.1", message: "<meta http-equiv=refresh> reloads or redirects on a timer without user control" });
  }

  // WCAG 1.4.2 / 2.2.2 — audio that auto-plays, or moving content with no
  // pause/stop control. Muted video has no audio track to control, so it is
  // skipped (a hero-video pattern, not a violation in practice).
  for (const m of src.matchAll(/<audio\b[^>]*\bautoplay\b[^>]*>/gi)) {
    issues.push({ rule: "wcag-1.4.2", message: `autoplaying <audio> needs a pause/stop control: ${m[0].slice(0, 70)}` });
    break;
  }
  for (const m of src.matchAll(/<video\b([^>]*)\bautoplay\b([^>]*)>/gi)) {
    if (/\bmuted\b/i.test(m[1] + m[2])) continue;
    issues.push({ rule: "wcag-1.4.2", message: `autoplaying <video> (not muted) needs a pause/stop control: ${m[0].slice(0, 70)}` });
    break;
  }
  if (/<marquee\b/i.test(src)) {
    issues.push({ rule: "wcag-2.2.2", message: "<marquee> scrolls without a way to pause or stop it" });
  }

  // WCAG 1.3.5 — inputs collecting the user's personal data need an
  // autocomplete token so browsers and AT can fill them programmatically.
  // (Password fields are covered separately by wcag-3.3.8.)
  const PERSONAL = /name|e-?mail|phone|\btel\b|addr|street|\bcity\b|\bzip\b|postal|country|\borg\b|company|cc-|card|\bbirth|dob|\bage\b|gender|user|login/i;
  for (const m of src.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    const type = (tag.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1] ?? "text").toLowerCase();
    if (["hidden", "submit", "button", "checkbox", "radio", "file", "image", "reset", "password", "search", "range", "number", "date", "time", "color"].includes(type)) continue;
    if (/\bautocomplete\s*=/i.test(tag)) continue;
    // Match the field's own identifier (name/id value), not the raw tag —
    // "name=" as an attribute name would otherwise match the PERSONAL regex.
    const fieldId = tag.match(/\b(?:name|id)\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (type === "email" || type === "tel" || PERSONAL.test(fieldId)) {
      issues.push({
        rule: "wcag-1.3.5",
        message: `input collecting personal data lacks autocomplete: ${tag.slice(0, 80)}`,
      });
    }
  }

  // WCAG 2.1.4 (A) — Character Key Shortcuts: single-key shortcuts must be
  // turn-offable, remappable, or active only on focus. `accesskey` creates
  // exactly that kind of shortcut, and inline key handlers that act on a
  // bare e.key/keyCode with no modifier guard do the same.
  for (const m of src.matchAll(/<[a-z][^>]*\baccesskey\s*=\s*["'][^"']*["'][^>]*>/gi)) {
    issues.push({
      rule: "wcag-2.1.4",
      message: `accesskey creates a single-key shortcut with no off switch or remapping: ${m[0].slice(0, 80)}`,
    });
  }
  for (const m of src.matchAll(/<[a-z][^>]*\bonkey(?:down|press|up)\s*=\s*(["'])([\s\S]*?)\1[^>]*>/gi)) {
    const code = m[2];
    if (!/(?:\bkey\b|keyCode|which)\b/.test(code)) continue;
    if (/(ctrlKey|altKey|metaKey|shiftKey)/.test(code)) continue; // modified shortcut is allowed
    if (/(location|href|submit\s*\(|\.click\s*\(|window\.open|dispatch)/.test(code)) {
      issues.push({
        rule: "wcag-2.1.4",
        message: `single-character key handler triggers an action with no modifier requirement: ${m[0].slice(0, 80)}`,
      });
    }
  }

  // WCAG 1.4.5 (AA) — Images of Text: a long sentence-like alt on an <img>
  // means the image is really presenting text — screen magnification and
  // user font/color overrides can't reach rasterized text.
  for (const m of src.matchAll(/<img\b[^>]*>/gi)) {
    const alt = m[0].match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (alt.length >= 40 && alt.trim().split(/\s+/).length >= 4) {
      issues.push({
        rule: "wcag-1.4.5",
        message: `image appears to present text — use real text instead of an image of text: alt="${alt.slice(0, 60)}"`,
      });
    }
  }

  // WCAG 2.4.5 (AA) — Multiple Ways: a content page should offer more than
  // the nav menu alone (site search or a sitemap link). Flagged only when a
  // link-heavy page has a nav but no second mechanism — small pages and
  // process steps are out of scope by the criterion itself.
  {
    const linkCount = src.match(/<a\b[^>]*\bhref\s*=/gi)?.length ?? 0;
    const hasNav = /<nav\b|role\s*=\s*["']navigation["']/i.test(src);
    const hasSearch = /type\s*=\s*["']search["']|role\s*=\s*["']search["']/i.test(src);
    const hasSitemapLink = /<a\b[^>]*href\s*=\s*["'][^"']*sitemap[^"']*["']/i.test(src);
    if (linkCount > 15 && hasNav && !hasSearch && !hasSitemapLink) {
      issues.push({
        rule: "wcag-2.4.5",
        message: "this page offers only one way to navigate (the nav menu) — provide a second mechanism such as search or a sitemap link",
      });
    }
  }

  // WCAG 1.4.8 (AAA) — Visual Presentation: justified text without
  // hyphenation creates uneven "rivers" that impair readability.
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (/text-align\s*:\s*justify/i.test(m[1]) && !/hyphens\s*:\s*(?:auto|manual)/i.test(m[1])) {
      issues.push({
        rule: "wcag-1.4.8",
        message: "stylesheet uses text-align:justify without hyphenation — uneven word spacing harms readability",
      });
      break;
    }
  }
  for (const m of src.matchAll(/<[a-z][^>]*\bstyle\s*=\s*["'][^"']*text-align\s*:\s*justify[^"']*["'][^>]*>/gi)) {
    if (!/hyphens\s*:\s*(?:auto|manual)/i.test(m[0])) {
      issues.push({
        rule: "wcag-1.4.8",
        message: `justified text without hyphenation: ${m[0].slice(0, 80)}`,
      });
      break;
    }
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

// --- keyboard trap statics (WCAG 2.1.2) + focus order (2.4.3) -------------
// checkFocus catches traps dynamically on rendered scans via the focus trace;
// these catch the same mechanisms statically so pasted HTML and crawled pages
// get coverage too. Deliberately narrow: only patterns that cannot false-
// positive on ordinary markup.
export function scanKeyboardStatics(html) {
  const issues = [];
  if (typeof html !== "string" || !html) return issues;

  // Inline key handlers that preventDefault() a Tab key event — the literal
  // mechanism of a keyboard trap.
  for (const h of html.matchAll(/\bonkey(?:down|press|up)\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    const body = h[2];
    const swallowsTab =
      /preventDefault\s*\(/.test(body) &&
      /keyCode\s*[=!]=+\s*9\b|\.which\s*[=!]=+\s*9\b|key\s*===?\s*['"]Tab['"]|code\s*===?\s*['"]Tab['"]/i.test(body);
    if (swallowsTab) {
      issues.push({
        rule: "wcag-2.1.2",
        message: "key handler calls preventDefault() on Tab — keyboard focus can become trapped",
      });
      break;
    }
  }

  // A modal <dialog open> with no keyboard-reachable way to leave it. Scoped
  // to <dialog> only: its </dialog> close tag is unambiguous (role="dialog"
  // regions can't be reliably bounded without a full parser).
  for (const m of html.matchAll(/<dialog\b([^>]*)>([\s\S]*?)<\/dialog>/gi)) {
    if (!/\bopen\b/i.test(m[1])) continue;
    const region = m[2];
    const focusable = /<(?:button|a\b[^>]*\bhref|input|select|textarea)\b|\btabindex\s*=/i.test(region);
    const escapeHatch =
      /\boncancel\s*=/i.test(m[1]) ||
      /\bonkey\w+\s*=\s*(["'])[\s\S]*?\1/i.test(m[0]) && /Escape|keyCode\s*[=!]=+\s*27|key\s*===?\s*['"]Escape/i.test(region + m[0]);
    if (!focusable && !escapeHatch) {
      issues.push({
        rule: "wcag-2.1.2",
        message: "open <dialog> has no keyboard-reachable dismiss control — focus can enter but not leave",
      });
      break;
    }
  }

  // Positive tabindex is WCAG failure technique F44 — it overrides the
  // natural focus order and desyncs it from the visual order.
  const posTab = html.match(/\btabindex\s*=\s*["']?([1-9]\d*)/i);
  if (posTab) {
    issues.push({
      rule: "wcag-2.4.3",
      message: `tabindex="${posTab[1]}" overrides natural focus order — use document order instead`,
    });
  }

  return issues;
}
