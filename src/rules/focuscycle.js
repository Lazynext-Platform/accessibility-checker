// Deep keyboard-trace analysis — runs on rendered scans where the browser
// pressed real keys. Goes beyond the stall check in scanner.js: detects
// focus *cycles* (Tab ping-pongs inside a trapped region), *coverage gaps*
// (focusable elements Tab never reaches), and dialogs that ignore Escape.
//
// trace:     array of "tag#id:text" strings, one per Tab press ("body" when
//            focus is on the page itself)
// focusable: total count of visible focusable elements on the page
// escape:    { inDialog, responds } from the Escape probe, or null
// rendered:  { undersized: [{d,w,h}], obscured: [trace-entry strings] } —
//            geometry facts captured during the render pass

export function checkFocusDepth(trace, focusable, escape, rendered = {}) {
  const issues = [];
  if (!Array.isArray(trace) || trace.length === 0) return issues;

  const visited = new Set(trace.filter((t) => t && t !== 'body'));

  // Coverage — only meaningful when we pressed Tab at least as many times as
  // focusable elements exist; otherwise "unreached" just means we stopped early.
  if (Number.isInteger(focusable) && focusable > 0 && trace.length >= focusable) {
    const unreached = focusable - visited.size;
    if (unreached >= 1 && visited.size > 0) {
      issues.push({
        rule: 'wcag-2.4.3',
        message: `${unreached} of ${focusable} focusable element(s) were never reached — Tab order skips or traps before them`,
      });
    }
  }

  // Cycle — a strict repeating sequence at the tail of the trace means Tab is
  // looping inside a region instead of progressing through the page.
  const cycle = findTailCycle(trace);
  if (cycle && Number.isInteger(focusable) && cycle.size < focusable) {
    issues.push({
      rule: 'wcag-2.1.2',
      message: `possible keyboard trap — focus is stuck cycling among ${cycle.size} element(s); ${focusable - cycle.size} other focusable element(s) lie outside the loop`,
    });
  } else if (cycle && !Number.isInteger(focusable)) {
    issues.push({
      rule: 'wcag-2.1.2',
      message: `possible keyboard trap — focus is stuck cycling among ${cycle.size} element(s)`,
    });
  }

  // Escape probe — focus inside a dialog whose Escape key does nothing is a
  // hard trap for keyboard users.
  if (escape && escape.inDialog === true && escape.responds === false) {
    issues.push({
      rule: 'wcag-2.1.2',
      message: 'focus is inside a dialog and Escape does not close or move it — keyboard users cannot exit',
    });
  }

  // WCAG 2.5.8 (2.2 AA) — pointer targets under 24x24 CSS px. The render
  // census already exempts inline links and UA-default checkbox/radio sizes.
  const under = rendered.undersized ?? [];
  if (under.length > 0) {
    const examples = under.slice(0, 3).map((t) => `${t.d} ${t.w}×${t.h}px`).join(', ');
    issues.push({
      rule: 'wcag-2.5.8',
      message: `${under.length} interactive target(s) smaller than 24×24 CSS px: ${examples}`,
    });
  }

  // WCAG 2.4.11 (2.2 AA) — a focused element covered by author content
  // (sticky header, overlay) is hidden from the keyboard user.
  const obsc = [...new Set(rendered.obscured ?? [])];
  if (obsc.length > 0) {
    issues.push({
      rule: 'wcag-2.4.11',
      message: `Tab focus landed on element(s) hidden behind other content: ${obsc.slice(0, 3).join(', ')}`,
    });
  }

  // WCAG 2.4.13 (2.2 AAA) — Focus Appearance: a focused element with no
  // outline and no box-shadow gives keyboard users no visible indicator.
  // (Warn-class: background/border swaps can't be detected without a
  // pre-focus baseline.)
  const noInd = [...new Set(rendered.noFocusInd ?? [])];
  if (noInd.length > 0) {
    issues.push({
      rule: 'wcag-2.4.13',
      message: `${noInd.length} focused element(s) show no visible indicator (no outline or shadow): ${noInd.slice(0, 3).join(', ')}`,
    });
  }

  // WCAG 1.4.11 (2.1 AA) — Non-text Contrast: an interactive component's
  // boundary (border, outline, or fill) must reach 3:1 vs adjacent colors.
  const ntc = rendered.nontextContrast ?? [];
  if (ntc.length > 0) {
    const examples = ntc.slice(0, 3).map((t) => `${t.d} at ${t.ratio}:1`).join(', ');
    issues.push({
      rule: 'wcag-1.4.11',
      message: `${ntc.length} control(s) have a visual boundary below 3:1 contrast: ${examples}`,
    });
  }

  // WCAG 1.4.12 (2.1 AA) — Text Spacing: applying the criterion's spacing
  // overrides must not clip content. Delta-only — pre-existing clipped
  // overflow is the author's own, not a spacing failure.
  const clip = rendered.spacingClip ?? [];
  if (clip.length > 0) {
    issues.push({
      rule: 'wcag-1.4.12',
      message: `content clips when WCAG text-spacing overrides apply: ${clip.slice(0, 3).join(', ')}`,
    });
  }

  return issues;
}

// A tail cycle is the last trace entries repeating the same period-p block at
// least three times (p>=2 — period 1 is a stall, already flagged upstream).
function findTailCycle(trace) {
  for (let p = 2; p <= 8; p++) {
    const need = p * 3;
    if (trace.length < need) continue;
    let ok = true;
    // Each of the last 2p entries must equal the entry p positions back —
    // that's 3 full repeats of the period-p block inside the tail window.
    for (let i = 0; i < need - p; i++) {
      if (trace[trace.length - 1 - i] !== trace[trace.length - 1 - i - p]) {
        ok = false;
        break;
      }
    }
    if (ok) return new Set(trace.slice(-p));
  }
  return null;
}
