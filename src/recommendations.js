// Per-finding remediation guidance — the "how to fix" layer.
//
// Every scan issue carries {rule, message}; this module adds a `fix` string
// per rule so API consumers and report readers get actionable guidance, not
// bare violations. Unknown rules fall through with no fix field — an absent
// fix is honest, a generic "follow WCAG" is not.

const FIXES = {
  "wcag-1.1.1": "Add descriptive alt text to informative images; alt=\"\" for decorative ones.",
  "wcag-1.3.1": "Use semantic landmarks (main/nav/header/footer), headings in order, and real form labels — don't fake structure with divs.",
  "wcag-1.4.3": "Raise text contrast to at least 4.5:1 (3:1 for large text) — darken the text or lighten the background.",
  "wcag-1.4.4": "Allow text to resize to 200%: avoid maximum-scale=1 / user-scalable=no in the viewport meta.",
  "wcag-1.4.6": "Enhanced contrast needs 7:1 — darken foreground or lighten background further.",
  "wcag-1.4.10": "Support 320px reflow: avoid fixed widths and horizontal-only layouts; test zoomed to 400%.",
  "wcag-2.1.2": "Remove keydown/keypress handlers that preventDefault Tab; ensure modals and dialogs can be exited with keyboard (Escape or a focusable close control).",
  "wcag-2.4.1": "Add a skip link ('Skip to main content' → #main) as the first focusable element.",
  "wcag-2.4.3": "Remove positive tabindex values — use tabindex=0 or let DOM order carry focus.",
  "wcag-2.4.6": "Give every heading real text content — an empty or icon-only heading announces nothing.",
  "wcag-2.4.7": "Restore a visible focus indicator: outline, ring, or underline on :focus-visible.",
  "wcag-2.5.3": "Make the accessible name contain the visible text — aria-label must include (not replace) what the control shows.",
  "wcag-2.5.7": "Dragging needs a single-pointer alternative — a button, menu item, or keyboard path that does the same thing.",
  "wcag-3.1.1": "Set lang on <html> so assistive tech picks the right speech engine and hyphenation.",
  "wcag-3.1.2": "Mark content in another language with lang on the containing element.",
  "wcag-3.2.3": "Keep navigation links in the same order on every page of the site.",
  "wcag-3.2.4": "Use one label per destination site-wide — the same link target should read the same everywhere.",
  "wcag-3.3.2": "Give every input a label, aria-label, or aria-labelledby — placeholders are not labels.",
  "wcag-3.3.7": "Don't ask users to re-enter information already provided — reuse it or offer a selection.",
  "wcag-3.3.8": "Don't gate login on puzzles or memory tests — offer autocomplete, paste support, or an alternative auth path.",
  "wcag-4.1.2": "Custom controls need name, role, and value exposed — prefer native elements or complete the ARIA contract.",
  "wcag-4.1.3": "Status updates need role=status, role=alert, or aria-live so screen readers announce them.",
};

export function fixFor(rule) {
  return FIXES[rule] ?? null;
}

export function withRecommendations(issues) {
  return (issues ?? []).map((i) => {
    const fix = fixFor(i.rule);
    return fix ? { ...i, fix } : i;
  });
}
